// Base error class for policy-related errors
export class PolicyError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'PolicyError';
  }
}

// Specific policy error types
export class PolicyViolationError extends PolicyError {
  constructor(
    message: string,
    details?: Record<string, any>
  ) {
    super(message, 'POLICY_VIOLATION', details);
    this.name = 'PolicyViolationError';
  }
}

export class PolicyAccessDeniedError extends PolicyError {
  constructor(
    message: string,
    details?: Record<string, any>
  ) {
    super(message, 'ACCESS_DENIED', details);
    this.name = 'PolicyAccessDeniedError';
  }
}

export class PolicyValidationError extends PolicyError {
  constructor(
    message: string,
    details?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'PolicyValidationError';
  }
}

// Type guard functions
export function isPolicyError(error: unknown): error is PolicyError {
  return error instanceof PolicyError;
}

export function isPolicyViolationError(error: unknown): error is PolicyViolationError {
  return error instanceof PolicyViolationError;
}

export function isPolicyAccessDeniedError(error: unknown): error is PolicyAccessDeniedError {
  return error instanceof PolicyAccessDeniedError;
}

export function isPolicyValidationError(error: unknown): error is PolicyValidationError {
  return error instanceof PolicyValidationError;
}

// Error message utilities
export function getPolicyErrorMessage(error: PolicyError): string {
  switch (error.code) {
    case 'POLICY_VIOLATION':
      return `Policy violation: ${error.message}`;
    case 'ACCESS_DENIED':
      return `Access denied: ${error.message}`;
    case 'VALIDATION_ERROR':
      return `Validation error: ${error.message}`;
    default:
      return error.message;
  }
}

// Error handling utilities
export function handlePolicyError(error: unknown): PolicyError {
  if (isPolicyError(error)) {
    return error;
  }

  // Handle Supabase policy errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string; details?: any };
    
    switch (supabaseError.code) {
      case 'PGRST116':
        return new PolicyAccessDeniedError(supabaseError.message, supabaseError.details);
      case 'PGRST301':
        return new PolicyViolationError(supabaseError.message, supabaseError.details);
      case 'PGRST302':
        return new PolicyValidationError(supabaseError.message, supabaseError.details);
    }
  }

  // Default to a generic policy error
  return new PolicyError(
    error instanceof Error ? error.message : 'An unknown policy error occurred',
    'UNKNOWN_POLICY_ERROR'
  );
} 