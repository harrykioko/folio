
import React, { useState } from 'react';
import { 
  Bot, 
  Copy, 
  Cpu, 
  FileText, 
  Paperclip, 
  Plus, 
  Send, 
  ThumbsUp, 
  Zap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestedPrompt {
  id: string;
  text: string;
  icon: React.ElementType;
}

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  
  // Sample suggested prompts
  const suggestedPrompts: SuggestedPrompt[] = [
    { id: '1', text: 'Summarize our quarterly performance', icon: FileText },
    { id: '2', text: 'Generate a marketing email template', icon: FileText },
    { id: '3', text: 'Help me prepare for my investor meeting', icon: Zap },
    { id: '4', text: 'Research our competitor's latest product', icon: Cpu },
  ];
  
  // Sample related resources
  const relatedResources = [
    { id: '1', title: 'Q2 Financial Report', type: 'document', date: '2 weeks ago' },
    { id: '2', title: 'Marketing Strategy 2023', type: 'document', date: '1 month ago' },
    { id: '3', title: 'Team Meeting Notes', type: 'document', date: '3 days ago' },
    { id: '4', title: 'Product Roadmap', type: 'document', date: '2 days ago' },
  ];

  // Sample actions
  const assistantActions = [
    { id: '1', title: 'Create Task', icon: Plus },
    { id: '2', title: 'Schedule Meeting', icon: Plus },
    { id: '3', title: 'Add to Documents', icon: FileText },
  ];

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate assistant response after a short delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `This is a simulated response to your message: "${inputValue}"`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="container px-4 md:px-6 h-[calc(100vh-7rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">AI Assistant</h1>
          <p className="text-muted-foreground">
            Get help, insights, and recommendations
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="outline">
            <Bot className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        {/* Chat Panel */}
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="flex flex-col h-full">
            {/* Messages area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                            message.role === 'user'
                              ? 'bg-primary-foreground text-primary'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          {message.role === 'user' ? 'U' : <Bot className="h-3 w-3" />}
                        </div>
                        <span className="text-xs opacity-70">
                          {message.role === 'user' ? 'You' : 'Assistant'} • {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p>{message.content}</p>
                      {message.role === 'assistant' && (
                        <div className="flex items-center justify-end mt-2 space-x-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Suggested prompts */}
            <div className="p-4 border-t">
              <h3 className="text-sm font-medium mb-2">Suggested Prompts</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt) => (
                  <Button
                    key={prompt.id}
                    variant="outline"
                    className="text-xs h-auto py-1.5"
                    onClick={() => handleSuggestedPrompt(prompt.text)}
                  >
                    <prompt.icon className="h-3 w-3 mr-1" />
                    {prompt.text}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" className="shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="relative flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pr-10"
                  />
                  <Button
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={handleSendMessage}
                    disabled={inputValue.trim() === ''}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                AI Assistant can make mistakes. Consider checking important information.
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Context Panel */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="h-full">
            <Tabs defaultValue="context">
              <TabsList className="w-full">
                <TabsTrigger value="context" className="flex-1">Context</TabsTrigger>
                <TabsTrigger value="actions" className="flex-1">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="context" className="h-[calc(100%-40px)]">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <Card className="mb-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Current Context</CardTitle>
                        <CardDescription>The assistant will use this information</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">Analyzing your recent interactions and documents related to marketing strategy and financial planning.</p>
                      </CardContent>
                    </Card>
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-medium mb-2">Related Resources</h3>
                      <div className="space-y-2">
                        {relatedResources.map((resource) => (
                          <Card key={resource.id} className="cursor-pointer hover:bg-accent/50">
                            <CardContent className="p-3 flex items-center">
                              <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                              <div>
                                <h4 className="text-sm font-medium">{resource.title}</h4>
                                <p className="text-xs text-muted-foreground">{resource.date}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Capabilities</CardTitle>
                        <CardDescription>What this assistant can do</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                            <FileText className="h-3 w-3" />
                          </div>
                          <div className="text-sm">Document analysis and summarization</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-3">
                            <Bot className="h-3 w-3" />
                          </div>
                          <div className="text-sm">Natural language conversation</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                            <Zap className="h-3 w-3" />
                          </div>
                          <div className="text-sm">Content generation and editing</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="actions" className="h-[calc(100%-40px)]">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-3">Available Actions</h3>
                    <div className="space-y-2 mb-6">
                      {assistantActions.map((action) => (
                        <Button key={action.id} variant="outline" className="w-full justify-start">
                          <action.icon className="h-4 w-4 mr-2" />
                          {action.title}
                        </Button>
                      ))}
                    </div>
                    
                    <Card className="mb-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Save This Conversation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Save as Document
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Advanced Options</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Bot className="h-4 w-4 mr-2" />
                          Change AI Model
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Cpu className="h-4 w-4 mr-2" />
                          Adjust Settings
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-red-500">
                          <FileText className="h-4 w-4 mr-2" />
                          Clear Conversation
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Assistant;
