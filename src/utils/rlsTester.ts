import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export type RLSTestResult = {
  success: boolean;
  message: string;
  insertedId?: string | number | null;
};

export type RLSTestResults = {
  select?: RLSTestResult;
  insert?: RLSTestResult;
  update?: RLSTestResult;
  delete?: RLSTestResult;
  overall?: string;
};

type TestDataMap = {
  [tableName: string]: Record<string, any>;
};

/**
 * Tests RLS policies for a specific table by attempting SELECT, INSERT, UPDATE, and DELETE operations
 * 
 * @param supabase - Supabase client instance
 * @param tableName - Name of the table to test
 * @returns Object containing test results for each operation
 */
export const testRLSPolicy = async (
  supabase: SupabaseClient<any>,
  tableName: string
): Promise<RLSTestResults> => {
  console.log(`Testing RLS for ${tableName}...`);
  const results: RLSTestResults = {};
  
  // Test SELECT
  try {
    const { data: selectData, error: selectError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    results.select = {
      success: !selectError,
      message: selectError ? selectError.message : 'Success'
    };
    
    console.log(`SELECT test for ${tableName}:`, 
      selectError ? `Error: ${selectError.message}` : 'Success');
  } catch (err) {
    results.select = {
      success: false,
      message: err instanceof Error ? err.message : String(err)
    };
    console.error(`SELECT test error for ${tableName}:`, err);
  }
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No authenticated user found');
    results.overall = 'Failed - No authenticated user';
    return results;
  }
  
  // Test INSERT with minimal data
  try {
    // Add test fields based on table
    let testData: Record<string, any> = { user_id: user.id };
    
    // Add required fields based on table
    const testDataMap: TestDataMap = {
      'company_settings': {
        company_name: 'Test Company',
        logo_url: 'https://example.com/logo.png',
        primary_color: '#3B82F6',
        accent_color: '#10B981'
      },
      'tasks': {
        title: 'Test Task',
        description: 'This is a test task for RLS testing',
        status: 'pending',
        priority: 'medium',
        due_date: new Date().toISOString()
      },
      'assets': {
        name: 'Test Asset',
        description: 'This is a test asset for RLS testing',
        type: 'image',
        url: 'https://example.com/test.jpg',
        size: 1024
      },
      'portfolios': {
        name: 'Test Portfolio',
        description: 'This is a test portfolio for RLS testing'
      },
      'workspaces': {
        name: 'Test Workspace',
        description: 'This is a test workspace for RLS testing'
      },
      'user_profiles': {
        full_name: 'Test User',
        email: user.email,
        avatar_url: 'https://example.com/avatar.jpg'
      }
    };
    
    // Merge default test data with table-specific data
    testData = {
      ...testData,
      ...(testDataMap[tableName] || { name: 'Test Entry' })
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from(tableName)
      .insert([testData])
      .select();
    
    results.insert = {
      success: !insertError,
      message: insertError ? insertError.message : 'Success',
      insertedId: insertData && insertData[0] ? insertData[0].id : null
    };
    
    console.log(`INSERT test for ${tableName}:`, 
      insertError ? `Error: ${insertError.message}` : 'Success');
      
    // If insert succeeded, test UPDATE and DELETE on the new row
    if (!insertError && insertData && insertData[0]) {
      const insertedId = insertData[0].id;
      
      // Test UPDATE
      try {
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ updated_at: new Date().toISOString() })
          .eq('id', insertedId);
          
        results.update = {
          success: !updateError,
          message: updateError ? updateError.message : 'Success'
        };
        
        console.log(`UPDATE test for ${tableName}:`, 
          updateError ? `Error: ${updateError.message}` : 'Success');
      } catch (err) {
        results.update = {
          success: false,
          message: err instanceof Error ? err.message : String(err)
        };
        console.error(`UPDATE test error for ${tableName}:`, err);
      }
      
      // Test DELETE
      try {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', insertedId);
          
        results.delete = {
          success: !deleteError,
          message: deleteError ? deleteError.message : 'Success'
        };
        
        console.log(`DELETE test for ${tableName}:`, 
          deleteError ? `Error: ${deleteError.message}` : 'Success');
      } catch (err) {
        results.delete = {
          success: false,
          message: err instanceof Error ? err.message : String(err)
        };
        console.error(`DELETE test error for ${tableName}:`, err);
      }
    }
  } catch (err) {
    results.insert = {
      success: false,
      message: err instanceof Error ? err.message : String(err)
    };
    console.error(`INSERT test error for ${tableName}:`, err);
  }
  
  // Determine overall result
  const allTests = Object.values(results).filter(r => typeof r === 'object');
  const allPassed = allTests.every(test => test.success);
  results.overall = allPassed ? 'Passed' : 'Failed';
  
  return results;
};

/**
 * Tests RLS policies for multiple tables
 * 
 * @param supabase - Supabase client instance
 * @param tableNames - Array of table names to test
 * @returns Object containing test results for each table
 */
export const testMultipleRLSPolicies = async (
  supabase: SupabaseClient<any>,
  tableNames: string[]
): Promise<Record<string, RLSTestResults>> => {
  const results: Record<string, RLSTestResults> = {};
  
  for (const tableName of tableNames) {
    results[tableName] = await testRLSPolicy(supabase, tableName);
  }
  
  return results;
};

/**
 * Generates a summary report of RLS test results
 * 
 * @param results - Results from testMultipleRLSPolicies
 * @returns Formatted summary string
 */
export const generateRLSTestSummary = (
  results: Record<string, RLSTestResults>
): string => {
  let summary = '=== RLS Test Summary ===\n\n';
  
  Object.entries(results).forEach(([tableName, tableResults]) => {
    summary += `Table: ${tableName}\n`;
    summary += `Overall: ${tableResults.overall}\n`;
    
    if (tableResults.select) {
      summary += `  SELECT: ${tableResults.select.success ? 'Passed' : 'Failed'} - ${tableResults.select.message}\n`;
    }
    
    if (tableResults.insert) {
      summary += `  INSERT: ${tableResults.insert.success ? 'Passed' : 'Failed'} - ${tableResults.insert.message}\n`;
    }
    
    if (tableResults.update) {
      summary += `  UPDATE: ${tableResults.update.success ? 'Passed' : 'Failed'} - ${tableResults.update.message}\n`;
    }
    
    if (tableResults.delete) {
      summary += `  DELETE: ${tableResults.delete.success ? 'Passed' : 'Failed'} - ${tableResults.delete.message}\n`;
    }
    
    summary += '\n';
  });
  
  return summary;
};
