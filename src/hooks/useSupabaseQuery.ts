import { useState, useEffect, DependencyList } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { PostgrestFilterBuilder, PostgrestQueryBuilder } from '@supabase/postgrest-js';
import { supabase } from '../integrations/supabase/client';

type SupabaseQueryResult = {
  data: any;
  error: any;
};

/**
 * Custom hook for Supabase queries to prevent infinite loops and provide consistent data fetching
 * 
 * @param tableName - The name of the table to query
 * @param queryFn - Optional function to customize the query
 * @param dependencies - Array of dependencies that should trigger a refetch when changed
 * @returns Object containing data, loading state, and error
 */
export function useSupabaseQuery<T>(
  tableName: string,
  queryFn?: (query: any) => any,
  dependencies: DependencyList = []
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Allow for custom query building or use default
        let query;
        if (typeof queryFn === 'function') {
          query = queryFn(supabase.from(tableName));
        } else {
          query = supabase.from(tableName).select('*');
        }
        
        const { data: result, error: queryError } = await query;
        
        if (queryError) throw queryError;
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        console.error(`Error fetching data from ${tableName}:`, err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { 
    data, 
    loading, 
    error, 
    refetch: async () => {
      setLoading(true);
      try {
        let query;
        if (typeof queryFn === 'function') {
          query = queryFn(supabase.from(tableName));
        } else {
          query = supabase.from(tableName).select('*');
        }
        
        const { data: result, error: queryError } = await query;
        
        if (queryError) throw queryError;
        
        setData(result);
        setError(null);
        return result;
      } catch (err) {
        console.error(`Error refetching data from ${tableName}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };
}

/**
 * Custom hook for a single Supabase record query
 * 
 * @param tableName - The name of the table to query
 * @param queryFn - Optional function to customize the query
 * @param dependencies - Array of dependencies that should trigger a refetch when changed
 * @returns Object containing data (single record), loading state, and error
 */
export function useSupabaseQuerySingle<T>(
  tableName: string,
  queryFn?: (query: any) => any,
  dependencies: DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Allow for custom query building or use default
        let query;
        if (typeof queryFn === 'function') {
          query = queryFn(supabase.from(tableName));
        } else {
          query = supabase.from(tableName).select('*');
        }
        
        // Add single() to get a single record
        const { data: result, error: queryError } = await query.single();
        
        if (queryError) {
          // PGRST116 is a "no rows returned" error, which might be expected
          if (queryError.code !== 'PGRST116') {
            throw queryError;
          } else {
            if (isMounted) {
              setData(null);
              setError(null);
            }
          }
        } else if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        console.error(`Error fetching single record from ${tableName}:`, err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { 
    data, 
    loading, 
    error, 
    refetch: async () => {
      setLoading(true);
      try {
        let query;
        if (typeof queryFn === 'function') {
          query = queryFn(supabase.from(tableName));
        } else {
          query = supabase.from(tableName).select('*');
        }
        
        const { data: result, error: queryError } = await query.single();
        
        if (queryError) {
          if (queryError.code !== 'PGRST116') {
            throw queryError;
          } else {
            setData(null);
            setError(null);
            return null;
          }
        }
        
        setData(result);
        setError(null);
        return result;
      } catch (err) {
        console.error(`Error refetching single record from ${tableName}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };
}
