import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TableInfo {
  table_name: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface PolicyInfo {
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
  qual: string;
  with_check: string;
}

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) throw error;
    console.log('✅ Database connection successful');

    // Get list of all tables
    const { data: tables, error: tablesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tablesError) throw tablesError;
    
    console.log('\n📊 Current Database Structure:');
    console.log('-----------------------------');
    
    // List all tables we know about from our migrations
    const knownTables = [
      'profiles',
      'company_settings',
      'user_preferences',
      'security_settings'
    ];
    
    for (const tableName of knownTables) {
      console.log(`\nTable: ${tableName}`);
      
      // Get table structure
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.log(`  Error accessing table: ${tableError.message}`);
        continue;
      }
      
      if (tableData && tableData.length > 0) {
        console.log('Columns:');
        Object.keys(tableData[0]).forEach(key => {
          console.log(`  - ${key}`);
        });
      }
    }
    
    console.log('\n✅ Database structure review completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testConnection(); 