import { SupabaseClient } from '@supabase/supabase-js';

export interface RlsTestResult {
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Tests Row Level Security (RLS) policies for a specific table
 * 
 * @param supabase - The Supabase client instance
 * @param tableName - The name of the table to test
 * @param userId - The user ID to test with (usually auth.uid())
 * @returns An array of test results for different operations
 */
export const testRlsPolicies = async (
  supabase: SupabaseClient,
  tableName: string,
  userId: string
): Promise<RlsTestResult[]> => {
  console.log(`Testing RLS policies for table: ${tableName} with user: ${userId}`);
  
  const results: RlsTestResult[] = [];
  
  // Test SELECT
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userId)
      .limit(1);
    
    results.push({
      table: tableName,
      operation: 'SELECT',
      success: !error,
      error: error?.message,
      data: data
    });
  } catch (err: any) {
    results.push({
      table: tableName,
      operation: 'SELECT',
      success: false,
      error: err.message
    });
  }
  
  // Test INSERT (with a dummy record that we'll delete)
  try {
    const testRecord = {
      user_id: userId,
      test_field: 'RLS Test - ' + new Date().toISOString(),
      // Add any required fields based on the table
    };
    
    const { data, error } = await supabase
      .from(tableName)
      .insert(testRecord)
      .select();
    
    results.push({
      table: tableName,
      operation: 'INSERT',
      success: !error,
      error: error?.message,
      data: data
    });
    
    // If insert was successful, clean up by deleting the test record
    if (!error && data && data.length > 0) {
      await supabase
        .from(tableName)
        .delete()
        .eq('id', data[0].id);
    }
  } catch (err: any) {
    results.push({
      table: tableName,
      operation: 'INSERT',
      success: false,
      error: err.message
    });
  }
  
  // Note: We're not testing UPDATE and DELETE here to avoid modifying real data
  // In a real implementation, you might want to create a test record first,
  // then update it, and finally delete it
  
  return results;
};

/**
 * Runs RLS policy tests on multiple tables
 * 
 * @param supabase - The Supabase client instance
 * @param tables - Array of table names to test
 * @param userId - The user ID to test with
 * @returns An object with test results grouped by table
 */
export const runRlsTests = async (
  supabase: SupabaseClient,
  tables: string[],
  userId: string
): Promise<Record<string, RlsTestResult[]>> => {
  const results: Record<string, RlsTestResult[]> = {};
  
  for (const table of tables) {
    results[table] = await testRlsPolicies(supabase, table, userId);
  }
  
  return results;
};
