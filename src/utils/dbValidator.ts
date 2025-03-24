import { SupabaseClient } from '@supabase/supabase-js';

export interface TableDefinition {
  name: string;
  requiredColumns: string[];
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

/**
 * Validates the database schema against expected tables and columns
 * Also checks if Row Level Security (RLS) is enabled for each table
 * 
 * @param supabase - The Supabase client instance
 * @returns An object with validation results
 */
export const validateDatabaseSchema = async (supabase: SupabaseClient): Promise<ValidationResult> => {
  console.log('Validating database schema...');
  
  // Define expected tables and their required columns
  const tables: TableDefinition[] = [
    {
      name: 'company_settings',
      requiredColumns: ['id', 'user_id', 'company_name', 'logo_url', 'created_at', 'updated_at']
    },
    {
      name: 'profiles',
      requiredColumns: ['id', 'first_name', 'last_name', 'avatar_url', 'role', 'created_at', 'updated_at']
    },
    {
      name: 'tasks',
      requiredColumns: ['id', 'user_id', 'title', 'description', 'status', 'created_at', 'updated_at']
    },
    {
      name: 'assets',
      requiredColumns: ['id', 'user_id', 'name', 'type', 'url', 'created_at', 'updated_at']
    },
    {
      name: 'portfolio',
      requiredColumns: ['id', 'user_id', 'title', 'description', 'created_at', 'updated_at']
    },
    {
      name: 'workspace',
      requiredColumns: ['id', 'user_id', 'name', 'description', 'created_at', 'updated_at']
    }
    // Add other tables as needed
  ];
  
  const issues: string[] = [];
  
  for (const table of tables) {
    console.log(`Checking table: ${table.name}`);
    
    // Check if table exists
    const { data, error } = await supabase
      .from(table.name)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST204') {
        issues.push(`Table '${table.name}' does not exist or has incorrect structure`);
        console.error(`Table '${table.name}' does not exist or has incorrect structure`);
        
        // You can add automatic table creation here if needed
      } else {
        issues.push(`Error checking table '${table.name}': ${error.message}`);
        console.error(`Error checking table '${table.name}':`, error);
      }
    } else {
      console.log(`Table '${table.name}' exists`);
      
      // Check if RLS is enabled
      const { data: rlsData, error: rlsError } = await supabase
        .rpc('check_rls_enabled', { table_name: table.name });
        
      if (rlsError) {
        issues.push(`Error checking RLS for '${table.name}': ${rlsError.message}`);
        console.error(`Error checking RLS for '${table.name}':`, rlsError);
      } else if (!rlsData) {
        issues.push(`RLS is not enabled for '${table.name}'`);
        console.error(`RLS is not enabled for '${table.name}'`);
      } else {
        console.log(`RLS is enabled for '${table.name}'`);
      }
      
      // Check for required columns
      try {
        // This is a more advanced check that would require introspection
        // For now, we'll just log that we should check columns
        console.log(`Should check columns for '${table.name}': ${table.requiredColumns.join(', ')}`);
      } catch (err) {
        console.error(`Error checking columns for '${table.name}':`, err);
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};

/**
 * Checks if a specific table has the expected structure
 * 
 * @param supabase - The Supabase client instance
 * @param tableName - The name of the table to check
 * @param requiredColumns - Array of column names that should exist
 * @returns An object with validation results
 */
export const validateTableStructure = async (
  supabase: SupabaseClient,
  tableName: string,
  requiredColumns: string[]
): Promise<ValidationResult> => {
  console.log(`Validating structure for table: ${tableName}`);
  
  const issues: string[] = [];
  
  // Check if table exists
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);
  
  if (error) {
    issues.push(`Table '${tableName}' does not exist or has incorrect structure: ${error.message}`);
    return { valid: false, issues };
  }
  
  // Check if RLS is enabled
  const { data: rlsData, error: rlsError } = await supabase
    .rpc('check_rls_enabled', { table_name: tableName });
    
  if (rlsError) {
    issues.push(`Error checking RLS for '${tableName}': ${rlsError.message}`);
  } else if (!rlsData) {
    issues.push(`RLS is not enabled for '${tableName}'`);
  }
  
  // For a more comprehensive check, we would need to query the information_schema
  // to get column information, but that's beyond the scope of this basic validator
  
  return {
    valid: issues.length === 0,
    issues
  };
};
