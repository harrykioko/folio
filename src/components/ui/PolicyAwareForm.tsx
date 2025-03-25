import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handlePolicyError, PolicyError } from '@/types/errors';

type FormInputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface PolicyAwareFormProps<T extends { [K in keyof T]: string | undefined }> {
  onSubmit: (data: T) => Promise<void>;
  children: React.ReactNode;
  className?: string;
  submitButtonText?: string;
  isSubmitting?: boolean;
  onSuccess?: () => void;
  onError?: (error: PolicyError) => void;
}

type FormChild<T> = React.ReactElement<{
  name: keyof T;
  onChange?: (e: React.ChangeEvent<FormInputElement>) => void;
  value?: string;
  disabled?: boolean;
  [key: string]: any;
}>;

export function PolicyAwareForm<T extends { [K in keyof T]: string | undefined }>({
  onSubmit,
  children,
  className = '',
  submitButtonText = 'Submit',
  isSubmitting = false,
  onSuccess,
  onError
}: PolicyAwareFormProps<T>) {
  const [formData, setFormData] = useState<T>({} as T);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Form submitted successfully',
        variant: 'default'
      });

      // Call success callback if provided
      onSuccess?.();
    } catch (error) {
      const policyError = handlePolicyError(error);
      
      // Show error message
      toast({
        title: 'Error',
        description: policyError.message,
        variant: 'destructive'
      });

      // Call error callback if provided
      onError?.(policyError);
    }
  };

  const handleChange = (e: React.ChangeEvent<FormInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && 'name' in child.props) {
          const name = child.props.name as keyof T;
          return React.cloneElement(child as FormChild<T>, {
            onChange: handleChange,
            value: formData[name] || '',
            disabled: isSubmitting
          });
        }
        return child;
      })}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : submitButtonText}
      </button>
    </form>
  );
}

// Example usage:
/*
interface ProfileFormData {
  fullName: string;
  bio: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
}

<PolicyAwareForm<ProfileFormData>
  onSubmit={async (data) => {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
      
    if (error) throw error;
  }}
  onSuccess={() => {
    // Handle success (e.g., redirect)
  }}
  onError={(error) => {
    // Handle specific error cases
  }}
>
  <input
    type="text"
    name="fullName"
    placeholder="Full Name"
    className="w-full p-2 border rounded"
  />
  <textarea
    name="bio"
    placeholder="Bio"
    className="w-full p-2 border rounded mt-2"
  />
  <input
    type="email"
    name="email"
    placeholder="Email"
    className="w-full p-2 border rounded mt-2"
  />
</PolicyAwareForm>
*/ 