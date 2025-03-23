
import React, { useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

const Assistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    
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

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col h-[calc(100vh-150px)]">
        <h1 className="text-2xl font-semibold mb-6">AI Assistant</h1>
        
        <Card className="flex-1 flex flex-col mb-4 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              Intelligent Assistant
            </CardTitle>
            <CardDescription>
              Ask me anything about your projects, tasks, or request help with content generation.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto px-4 py-0">
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
                      <Bot className="h-5 w-5 mt-1 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm">{message.content}</p>
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
            </div>
          </CardContent>
          
          <CardFooter className="pt-4 pb-3 border-t">
            <div className="flex w-full space-x-2">
              <Textarea 
                placeholder="Type your message here..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px]"
              />
              <Button onClick={handleSendMessage} size="icon" className="h-[60px] w-[60px]">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Assistant;
