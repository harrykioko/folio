
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Upload,
  Sparkles,
  BarChart3,
  FileText,
  History,
  Clock,
  ChevronDown,
  Code,
  List,
  LayoutList,
  Copy,
  Info,
  X,
  Plus,
  MessageSquare,
  ImagePlus,
  ExternalLink,
  Calendar,
  Briefcase,
  CheckSquare,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

type SuggestionChip = {
  id: string;
  text: string;
};

type CommandHistoryItem = {
  id: string;
  query: string;
  date: Date;
};

type ContextItem = {
  id: string;
  title: string;
  type: 'document' | 'project' | 'task' | 'asset';
  description?: string;
};

type TemplateItem = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
};

const Assistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi, I'm Foley, your AI assistant. I can help you generate content, analyze data, summarize documents, and more. How can I assist you today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('context');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContextItem, setSelectedContextItem] = useState<ContextItem | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sample data for suggestions
  const suggestionChips: SuggestionChip[] = [
    { id: '1', text: 'Summarize the project status' },
    { id: '2', text: 'Generate a meeting agenda' },
    { id: '3', text: 'Draft an email to clients' },
    { id: '4', text: 'Help me with a product description' },
    { id: '5', text: 'Create a social media post' },
  ];
  
  // Sample data for command history
  const commandHistory: CommandHistoryItem[] = [
    { id: '1', query: 'Analyze Q2 financial performance', date: new Date(Date.now() - 86400000 * 2) },
    { id: '2', query: 'Generate product roadmap ideas', date: new Date(Date.now() - 86400000) },
    { id: '3', query: 'Draft a press release for new product', date: new Date() },
  ];
  
  // Sample data for context
  const contextItems: ContextItem[] = [
    { id: '1', title: 'Q2 Financial Report', type: 'document', description: 'Quarterly financial performance report' },
    { id: '2', title: 'Website Redesign', type: 'project', description: 'Project timeline and resources' },
    { id: '3', title: 'Client Meeting', type: 'task', description: 'Prepare presentation for client meeting' },
    { id: '4', title: 'Brand Assets', type: 'asset', description: 'Logos and brand guidelines' },
  ];
  
  // Sample data for templates
  const templateItems: TemplateItem[] = [
    { id: '1', name: 'Email Template', description: 'Create a professional email', icon: <MessageSquare className="h-4 w-4" /> },
    { id: '2', name: 'Project Brief', description: 'Generate a project overview', icon: <FileText className="h-4 w-4" /> },
    { id: '3', name: 'Social Media Post', description: 'Create engaging social content', icon: <ImagePlus className="h-4 w-4" /> },
    { id: '4', name: 'Meeting Agenda', description: 'Outline for your next meeting', icon: <List className="h-4 w-4" /> },
    { id: '5', name: 'Code Snippet', description: 'Generate sample code', icon: <Code className="h-4 w-4" /> },
  ];

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim() && attachments.length === 0) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input || (attachments.length > 0 ? 'Sent attachments' : ''),
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setAttachments([]);
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm processing your request. This is a simulated response as we're still in development. In the future, I'll be able to help with document analysis, research, and meeting summarization.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments = Array.from(files).map(file => file.name);
      setAttachments([...attachments, ...newAttachments]);
    }
  };
  
  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };
  
  const handleHistoryClick = (query: string) => {
    setInput(query);
  };
  
  const handleTemplateClick = (template: TemplateItem) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleContextItemClick = (item: ContextItem) => {
    setSelectedContextItem(item);
    setIsDialogOpen(true);
  };

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Get icon based on context item type
  const getContextItemIcon = (type: string) => {
    switch(type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'project': return <Briefcase className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'asset': return <Database className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] px-0 -mt-6 -mx-6">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Side - Chat Window */}
        <ResizablePanel defaultSize={65} minSize={40} className="h-full">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b">
              <h1 className="text-xl font-semibold flex items-center">
                <Bot className="mr-2 h-5 w-5" />
                Foley
              </h1>
              <p className="text-sm text-muted-foreground">Your intelligent AI assistant</p>
            </div>
            
            {/* Function Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-6 py-3 border-b">
              <Button variant="outline" className="justify-start text-xs">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Generate Content
              </Button>
              <Button variant="outline" className="justify-start text-xs">
                <BarChart3 className="mr-2 h-3.5 w-3.5" />
                Analyze Data
              </Button>
              <Button variant="outline" className="justify-start text-xs">
                <FileText className="mr-2 h-3.5 w-3.5" />
                Summarize Document
              </Button>
              <Button variant="outline" className="justify-start text-xs">
                <LayoutList className="mr-2 h-3.5 w-3.5" />
                Create List
              </Button>
            </div>
            
            {/* Message Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full px-6 py-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`flex max-w-[80%] items-start gap-2 rounded-lg px-4 py-2 
                          ${message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'}`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                            <AvatarFallback>AI</AvatarFallback>
                            <AvatarImage src="/placeholder.svg" alt="Foley AI" />
                          </Avatar>
                        )}
                        <div>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-50 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <User className="h-5 w-5 mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
            
            {/* Input Area */}
            <div className="px-6 py-4 border-t">
              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestionChips.map((chip) => (
                  <Badge 
                    key={chip.id} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleSuggestionClick(chip.text)}
                  >
                    {chip.text}
                  </Badge>
                ))}
              </div>
              
              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2 w-full">
                  {attachments.map((attachment, index) => (
                    <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span className="text-xs truncate max-w-[150px]">{attachment}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 ml-1"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Input Box */}
              <div className="flex space-x-2">
                <Textarea 
                  placeholder="Type your message here..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px]"
                />
                <div className="flex flex-col space-y-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => fileInputRef.current?.click()} 
                          size="icon" 
                          variant="outline"
                          className="h-[28px] w-[28px]"
                        >
                          <Upload className="h-4 w-4" />
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            multiple 
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Attach files</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Button onClick={handleSendMessage} size="icon" className="h-[28px] w-[28px]">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
        
        {/* Resize Handle */}
        <ResizableHandle withHandle />
        
        {/* Right Side - Context, History, Templates */}
        <ResizablePanel defaultSize={35} minSize={25} className="h-full">
          <div className="flex flex-col h-full">
            {/* Tabs for different right panel content */}
            <Tabs 
              defaultValue="context" 
              value={activeTab}
              onValueChange={setActiveTab} 
              className="w-full h-full flex flex-col"
            >
              <div className="px-6 py-3 border-b">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="context" className="text-xs">
                    <Info className="h-3.5 w-3.5 mr-1" />
                    Context
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">
                    <History className="h-3.5 w-3.5 mr-1" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="text-xs">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Templates
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Context Tab Content */}
              <TabsContent value="context" className="flex-1 overflow-hidden m-0 p-0">
                <ScrollArea className="h-full px-6 py-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Available Information</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {contextItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="border rounded-md p-3 hover:bg-accent/50 cursor-pointer transition-all"
                          onClick={() => handleContextItemClick(item)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex gap-2">
                              <div className="mt-0.5 text-primary">
                                {getContextItemIcon(item.type)}
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{item.title}</h4>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recent Projects</h4>
                      <ul className="space-y-2">
                        <li className="text-xs text-muted-foreground hover:text-foreground cursor-pointer p-2 hover:bg-accent/30 rounded-md flex items-center">
                          <Briefcase className="h-3.5 w-3.5 mr-2 text-primary" />
                          Website Redesign
                        </li>
                        <li className="text-xs text-muted-foreground hover:text-foreground cursor-pointer p-2 hover:bg-accent/30 rounded-md flex items-center">
                          <Briefcase className="h-3.5 w-3.5 mr-2 text-primary" />
                          Mobile App v2.0
                        </li>
                        <li className="text-xs text-muted-foreground hover:text-foreground cursor-pointer p-2 hover:bg-accent/30 rounded-md flex items-center">
                          <Briefcase className="h-3.5 w-3.5 mr-2 text-primary" />
                          Marketing Campaign
                        </li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Upcoming Tasks</h4>
                      <ul className="space-y-2">
                        <li className="text-xs text-muted-foreground hover:text-foreground cursor-pointer p-2 hover:bg-accent/30 rounded-md flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-2 text-primary" />
                          Client Meeting - Tomorrow, 2:00 PM
                        </li>
                        <li className="text-xs text-muted-foreground hover:text-foreground cursor-pointer p-2 hover:bg-accent/30 rounded-md flex items-center">
                          <CheckSquare className="h-3.5 w-3.5 mr-2 text-primary" />
                          Complete Project Proposal - Due in 3 days
                        </li>
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              {/* History Tab Content */}
              <TabsContent value="history" className="flex-1 overflow-hidden m-0 p-0">
                <ScrollArea className="h-full px-6 py-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Previous Queries</h3>
                    
                    <div className="space-y-2">
                      {commandHistory.map((item) => (
                        <div 
                          key={item.id} 
                          className="p-3 border rounded-md hover:bg-accent/50 cursor-pointer transition-all"
                          onClick={() => handleHistoryClick(item.query)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <span className="text-sm line-clamp-1">{item.query}</span>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatRelativeTime(item.date)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <History className="h-3.5 w-3.5 mr-2" />
                      View All History
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              {/* Templates Tab Content */}
              <TabsContent value="templates" className="flex-1 overflow-hidden m-0 p-0">
                <ScrollArea className="h-full px-6 py-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Response Templates</h3>
                    <p className="text-xs text-muted-foreground">Quick-access tools to generate specific document types</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {templateItems.map((template) => (
                        <div 
                          key={template.id} 
                          className="border rounded-lg p-3 hover:bg-accent/50 cursor-pointer transition-all"
                          onClick={() => handleTemplateClick(template)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-primary/10 rounded-full p-2">
                              {template.icon}
                            </div>
                            <div>
                              <h3 className="font-medium text-sm">{template.name}</h3>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border border-dashed rounded-lg p-3 hover:bg-accent/10 cursor-pointer transition-all flex items-center justify-center">
                        <div className="text-center">
                          <Plus className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-sm font-medium">Create Custom Template</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Dialog for Template Preview or Context Item Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] glass-panel">
          <DialogHeader>
            {selectedTemplate && (
              <>
                <DialogTitle className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    {selectedTemplate.icon}
                  </div>
                  {selectedTemplate.name}
                </DialogTitle>
                <DialogDescription>{selectedTemplate.description}</DialogDescription>
              </>
            )}
            {selectedContextItem && (
              <>
                <DialogTitle className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    {getContextItemIcon(selectedContextItem.type)}
                  </div>
                  {selectedContextItem.title}
                </DialogTitle>
                <DialogDescription>
                  <Badge variant="outline" className="text-xs mb-2">
                    {selectedContextItem.type}
                  </Badge>
                  <p>{selectedContextItem.description}</p>
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedTemplate && (
              <>
                <div className="bg-accent/30 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    This is a preview of what will be generated. The actual content will be tailored to your specific needs.
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate {selectedTemplate.name}
                  </Button>
                  <Button variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                </div>
              </>
            )}
            
            {selectedContextItem && (
              <>
                <div className="bg-accent/30 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span>May 15, 2023</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Modified:</span>
                      <span>June 2, 2023</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Owner:</span>
                      <span>John Doe</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ask About This Item
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Full View
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assistant;
