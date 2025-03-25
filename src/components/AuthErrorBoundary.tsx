import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { PolicyError, AuthError } from '@/types/errors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Authentication Error</h2>
              <p className="mt-2 text-muted-foreground">
                {this.state.error instanceof PolicyError
                  ? 'You do not have permission to perform this action.'
                  : this.state.error instanceof AuthError
                  ? 'Your session has expired. Please sign in again.'
                  : 'An unexpected error occurred. Please try again.'}
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.href = '/auth'}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Sign In
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook wrapper for using the error boundary with navigation and toast
export function useAuthErrorBoundary() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuthError = (error: Error) => {
    if (error instanceof PolicyError) {
      toast({
        title: 'Access Denied',
        description: error.message,
        variant: 'destructive'
      });
      navigate('/dashboard');
    } else if (error instanceof AuthError) {
      toast({
        title: 'Session Expired',
        description: 'Please sign in again to continue.',
        variant: 'destructive'
      });
      navigate('/auth');
    } else {
      toast({
        title: 'Authentication Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return { handleAuthError };
} 