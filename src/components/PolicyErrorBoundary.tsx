import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  PolicyError,
  PolicyAccessDeniedError,
  PolicyViolationError,
  PolicyValidationError,
  handlePolicyError,
  getPolicyErrorMessage
} from '@/types/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onPolicyError?: (error: PolicyError) => void;
  retryOnError?: boolean;
}

interface State {
  hasError: boolean;
  error: PolicyError | null;
  retryCount: number;
}

const MAX_RETRIES = 3;

export class PolicyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const policyError = handlePolicyError(error);
    return {
      hasError: true,
      error: policyError,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('PolicyErrorBoundary caught an error:', error, errorInfo);
    
    // Call the onPolicyError callback if provided
    if (this.props.onPolicyError) {
      this.props.onPolicyError(handlePolicyError(error));
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < MAX_RETRIES) {
      this.setState(prev => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1
      }));
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.state.error;
      if (!error) return null;

      return (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <h2 className="text-lg font-semibold text-red-800">
            {error instanceof PolicyAccessDeniedError ? 'Access Denied' :
             error instanceof PolicyViolationError ? 'Policy Violation' :
             error instanceof PolicyValidationError ? 'Validation Error' :
             'An Error Occurred'}
          </h2>
          <p className="mt-2 text-sm text-red-700">
            {getPolicyErrorMessage(error)}
          </p>
          {this.state.retryCount < MAX_RETRIES && (
            <button
              onClick={this.handleRetry}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook wrapper for the PolicyErrorBoundary
export function usePolicyErrorBoundary() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePolicyError = (error: PolicyError) => {
    // Show toast notification
    toast({
      title: error instanceof PolicyAccessDeniedError ? 'Access Denied' :
             error instanceof PolicyViolationError ? 'Policy Violation' :
             error instanceof PolicyValidationError ? 'Validation Error' :
             'Error',
      description: getPolicyErrorMessage(error),
      variant: 'destructive'
    });

    // Handle navigation based on error type
    if (error instanceof PolicyAccessDeniedError) {
      navigate('/dashboard');
    }
  };

  return {
    PolicyErrorBoundary: (props: Omit<Props, 'onPolicyError'>) => (
      <PolicyErrorBoundary
        {...props}
        onPolicyError={handlePolicyError}
      />
    )
  };
} 