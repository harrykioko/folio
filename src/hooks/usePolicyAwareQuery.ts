import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { handlePolicyError, PolicyError } from '@/types/errors';
import { supabase } from '@/lib/supabase';

interface PolicyAwareQueryOptions<TData = unknown, TError = PolicyError>
  extends Omit<UseQueryOptions<TData, TError>, 'queryFn'> {
  table: string;
  columns?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function usePolicyAwareQuery<TData = unknown, TError = PolicyError>({
  table,
  columns = '*',
  filters = {},
  orderBy,
  limit,
  offset,
  enabled = true,
  ...options
}: PolicyAwareQueryOptions<TData, TError>): UseQueryResult<TData, TError> {
  const { toast } = useToast();

  return useQuery<TData, TError>({
    queryKey: [table, columns, filters, orderBy, limit, offset],
    queryFn: async () => {
      try {
        let query = supabase
          .from(table)
          .select(columns);

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
        }

        // Apply pagination
        if (limit) {
          query = query.limit(limit);
        }
        if (offset) {
          query = query.range(offset, offset + (limit ?? 10) - 1);
        }

        const { data, error } = await query;

        if (error) {
          throw handlePolicyError(error);
        }

        return data as TData;
      } catch (error) {
        const policyError = handlePolicyError(error);
        
        // Show toast notification for policy errors
        toast({
          title: 'Error',
          description: policyError.message,
          variant: 'destructive'
        });

        throw policyError;
      }
    },
    enabled,
    ...options
  });
}

// Example usage:
/*
const { data, isLoading, error } = usePolicyAwareQuery({
  table: 'profiles',
  columns: 'id, name, email',
  filters: { user_id: currentUserId },
  orderBy: { column: 'created_at', ascending: false },
  limit: 10,
  offset: 0
});
*/ 