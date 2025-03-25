import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthLoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function AuthLoadingState({ 
  message = 'Loading...', 
  fullScreen = true 
}: AuthLoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
} 