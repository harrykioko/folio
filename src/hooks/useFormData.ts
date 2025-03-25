import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { handlePolicyError, PolicyError } from '@/types/errors';
import { useToast } from '@/hooks/use-toast';
import React, { useCallback } from 'react';
import debounce from 'lodash/debounce';

interface UseFormDataOptions<TData> {
  table: string;
  id?: string;
  select?: string;
  enabled?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: PolicyError) => void;
  staleTime?: number; // Time in milliseconds before data is considered stale
  cacheTime?: number; // Time in milliseconds before data is removed from cache
  debounceMs?: number; // Time in milliseconds to debounce updates
}

/**
 * A custom hook for managing form data with Supabase integration and policy-aware error handling.
 * Includes performance optimizations like query caching and request debouncing.
 * 
 * @template TData - The type of data being managed, must extend Record<string, unknown>
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.table - The Supabase table name
 * @param {string} [options.id] - The ID of the record to fetch/update
 * @param {string} [options.select='*'] - The fields to select from the table
 * @param {boolean} [options.enabled=true] - Whether the query should be enabled
 * @param {function} [options.onSuccess] - Callback for successful operations
 * @param {function} [options.onError] - Callback for error handling
 * @param {number} [options.staleTime=30000] - Time before data is considered stale (30s default)
 * @param {number} [options.cacheTime=300000] - Time before data is removed from cache (5m default)
 * @param {number} [options.debounceMs=1000] - Time to debounce updates (1s default)
 * 
 * @returns {Object} An object containing:
 * - data: The fetched/updated data
 * - isLoading: Loading state for the query
 * - error: Any error that occurred
 * - update: Debounced function to update the data
 * - isUpdating: Loading state for updates
 * - updateError: Any error that occurred during update
 * 
 * @example
 * See useFormData.example.tsx for a complete usage example with PolicyAwareForm
 */
export function useFormData<TData extends Record<string, unknown>>({
  table,
  id,
  select = '*',
  enabled = true,
  onSuccess,
  onError,
  staleTime = 30000, // 30 seconds
  cacheTime = 300000, // 5 minutes
  debounceMs = 1000 // 1 second
}: UseFormDataOptions<TData>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching form data with caching
  const { data, isLoading, error } = useQuery<TData, PolicyError>({
    queryKey: [table, id],
    queryFn: async () => {
      try {
        let query = supabase
          .from(table)
          .select(select);

        if (id) {
          query = query.eq('id', id);
        }

        const { data: result, error } = await query.single();

        if (error) throw handlePolicyError(error);
        return result as unknown as TData;
      } catch (error) {
        const policyError = handlePolicyError(error);
        onError?.(policyError);
        throw policyError;
      }
    },
    enabled: enabled && !!id,
    staleTime,
    cacheTime,
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000) // Exponential backoff
  });

  // Handle query success
  React.useEffect(() => {
    if (data && onSuccess) {
      onSuccess(data);
    }
  }, [data, onSuccess]);

  // Create a debounced update function
  const debouncedUpdate = useCallback(
    debounce(async (formData: TData) => {
      try {
        const { data: result, error } = await supabase
          .from(table)
          .update(formData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw handlePolicyError(error);
        
        // Update cache immediately for optimistic updates
        queryClient.setQueryData([table, id], result as unknown as TData);
        
        onSuccess?.(result as unknown as TData);
      } catch (error) {
        const policyError = handlePolicyError(error);
        onError?.(policyError);
        toast({
          title: 'Error',
          description: policyError.message,
          variant: 'destructive'
        });
      }
    }, debounceMs),
    [table, id, queryClient, onSuccess, onError, toast]
  );

  // Mutation for handling updates
  const mutation = useMutation<TData, PolicyError, TData>({
    mutationFn: debouncedUpdate,
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [table, id] });
      onSuccess?.(data);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      onError?.(error);
    }
  });

  return {
    data,
    isLoading,
    error,
    update: mutation.mutate,
    isUpdating: mutation.isPending,
    updateError: mutation.error
  };
}

/**
 * Example usage:
 * 
 * interface ProfileFormData {
 *   fullName: string;
 *   bio: string;
 *   email: string;
 *   phone?: string;
 *   location?: string;
 *   website?: string;
 * }
 * 
 * function ProfileForm() {
 *   const { data, isLoading, update, isUpdating } = useFormData<ProfileFormData>({
 *     table: 'profiles',
 *     id: userId,
 *     select: 'full_name, bio, email, phone, location, website',
 *     onSuccess: (data) => {
 *       // Handle success
 *     },
 *     onError: (error) => {
 *       // Handle error
 *     }
 *   });
 * 
 *   if (isLoading) return <div>Loading...</div>;
 * 
 *   return (
 *     <PolicyAwareForm<ProfileFormData>
 *       onSubmit={update}
 *       isSubmitting={isUpdating}
 *       initialData={data}
 *     >
 *       <input
 *         type="text"
 *         name="fullName"
 *         defaultValue={data?.fullName}
 *         placeholder="Full Name"
 *       />
 *       <textarea
 *         name="bio"
 *         defaultValue={data?.bio}
 *         placeholder="Bio"
 *       />
 *       <input
 *         type="email"
 *         name="email"
 *         defaultValue={data?.email}
 *         placeholder="Email"
 *       />
 *       {/* ... other fields ... */}
 *     </PolicyAwareForm>
 *   );
 * }
 */ 