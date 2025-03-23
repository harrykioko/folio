
import React, { useState, useRef } from 'react';
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
  ImagePlus
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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

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
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Generate a ${template.name}`,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    
    // Simulate assistant response for template
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Here's a ${template.name} template. This is a placeholder response. In the future, I'll generate customized ${template.name.toLowerCase()} content based on your specific requirements.`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 1000);
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

  return (
    <div className="container max-w-full mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Context Sidebar for Desktop */}
        <div className="hidden md:flex flex-col w-64 space-y-4">
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  Context
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsContextOpen(!isContextOpen)} className="h-7 w-7">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isContextOpen ? '' : 'rotate-180'}`} />
                </Button>
              </CardTitle>
              <CardDescription>Available information</CardDescription>
            </CardHeader>
            
            {isContextOpen && (
              <CardContent className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {contextItems.map((item) => (
                      <div key={item.id} className="border rounded-md p-3 hover:bg-accent/50 cursor-pointer transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Recent Projects</h4>
                  <ul className="space-y-2">
                    <li className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">Website Redesign</li>
                    <li className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">Mobile App v2.0</li>
                    <li className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">Marketing Campaign</li>
                  </ul>
                </div>
              </CardContent>
            )}
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <History className="mr-2 h-4 w-4" />
                History
              </CardTitle>
              <CardDescription>Previous queries</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {commandHistory.map((item) => (
                  <li 
                    key={item.id} 
                    className="text-xs flex justify-between hover:bg-accent/50 p-2 rounded-md cursor-pointer"
                    onClick={() => handleHistoryClick(item.query)}
                  >
                    <span className="line-clamp-1">{item.query}</span>
                    <span className="text-muted-foreground whitespace-nowrap ml-2">{formatRelativeTime(item.date)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-[calc(100vh-150px)]">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold flex items-center">
              <Bot className="mr-2 h-6 w-6" />
              Foley
            </h1>
            
            {/* Context Sidebar for Mobile */}
            <div className="md:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Info className="h-4 w-4 mr-2" />
                    Context
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Context</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 space-y-4">
                    <div className="space-y-3">
                      {contextItems.map((item) => (
                        <div key={item.id} className="border rounded-md p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{item.title}</h4>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                              )}
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
                      <h4 className="text-sm font-medium mb-2">Command History</h4>
                      <ul className="space-y-2">
                        {commandHistory.map((item) => (
                          <li 
                            key={item.id} 
                            className="text-xs flex justify-between p-2 rounded-md"
                            onClick={() => handleHistoryClick(item.query)}
                          >
                            <span className="line-clamp-1">{item.query}</span>
                            <span className="text-muted-foreground whitespace-nowrap ml-2">{formatRelativeTime(item.date)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
          
          {/* Function Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <Button variant="outline" className="justify-start">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Content
            </Button>
            <Button variant="outline" className="justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analyze Data
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Summarize Document
            </Button>
            <Button variant="outline" className="justify-start">
              <LayoutList className="mr-2 h-4 w-4" />
              Create List
            </Button>
          </div>
          
          {/* Tabs for Templates and Chat */}
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="mb-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 flex flex-col">
              <Card className="flex-1 flex flex-col mb-4 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Bot className="mr-2 h-5 w-5" />
                    Intelligent Assistant
                  </CardTitle>
                  <CardDescription>
                    Ask me anything about your projects, tasks, or request help with content generation.
                  </CardDescription>
                </CardHeader>
                
                {/* Suggestion Chips */}
                <div className="px-4 pb-2 flex flex-wrap gap-2">
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
                
                <CardContent className="flex-1 overflow-y-auto px-4 py-0">
                  <ScrollArea className="h-full pr-4">
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
                </CardContent>
                
                <CardFooter className="pt-4 pb-3 border-t">
                  {/* Attachments */}
                  {attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2 w-full">
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
                
                  <div className="flex w-full space-x-2">
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
                              className="h-[28px] w-[60px]"
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
                      
                      <Button onClick={handleSendMessage} size="icon" className="h-[28px] w-[60px]">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="templates" className="flex-1">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">Response Templates</CardTitle>
                  <CardDescription>Quick-access tools to generate specific document types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templateItems.map((template) => (
                      <div 
                        key={template.id} 
                        className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-all"
                        onClick={() => handleTemplateClick(template)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 rounded-full p-2">
                            {template.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border border-dashed rounded-lg p-4 hover:bg-accent/10 cursor-pointer transition-all flex items-center justify-center">
                      <div className="text-center">
                        <Plus className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm font-medium">Create Custom Template</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
