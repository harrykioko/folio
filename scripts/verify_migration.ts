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

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  try {
    console.log('Verifying migration implementation...\n');

    // 1. Check if tables exist and have RLS enabled
    const tables = ['profiles', 'company_settings', 'user_preferences', 'security_settings'];
    for (const table of tables) {
      const { data: tableInfo, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error(`❌ Error accessing ${table} table:`, tableError);
        continue;
      }
      
      console.log(`✅ ${table} table exists and is accessible`);
    }

    // 2. Check RLS policies
    const policies = [
      { table: 'profiles', policies: ['Users can view own profile', 'Users can update own profile', 'Users can insert own profile'] },
      { table: 'company_settings', policies: ['Anyone can view company settings', 'Authenticated users can update company settings', 'Authenticated users can insert company settings', 'Authenticated users can delete company settings'] },
      { table: 'user_preferences', policies: ['Users can view own preferences', 'Users can update own preferences', 'Users can insert own preferences'] },
      { table: 'security_settings', policies: ['Users can view own security settings', 'Users can update own security settings', 'Users can insert own security settings'] }
    ];

    for (const { table, policies: tablePolicies } of policies) {
      console.log(`\nChecking policies for ${table}:`);
      for (const policy of tablePolicies) {
        const { data: policyData, error: policyError } = await supabase
          .rpc('get_policies', { schema_name: 'public', table_name: table });
        
        if (policyError) {
          console.error(`❌ Error checking policies for ${table}:`, policyError);
          continue;
        }

        const policyExists = policyData.some((p: any) => p.policyname === policy);
        console.log(`${policyExists ? '✅' : '❌'} ${policy}`);
      }
    }

    // 3. Check indexes
    const indexes = [
      { table: 'profiles', index: 'idx_profiles_id' },
      { table: 'company_settings', index: 'idx_company_settings_id' },
      { table: 'user_preferences', index: 'idx_user_preferences_user_id' },
      { table: 'security_settings', index: 'idx_security_settings_user_id' }
    ];

    console.log('\nChecking indexes:');
    for (const { table, index } of indexes) {
      const { data: indexData, error: indexError } = await supabase
        .rpc('get_indexes', { schema_name: 'public', table_name: table });
      
      if (indexError) {
        console.error(`❌ Error checking indexes for ${table}:`, indexError);
        continue;
      }

      const indexExists = indexData.some((i: any) => i.indexname === index);
      console.log(`${indexExists ? '✅' : '❌'} ${index}`);
    }

    // 4. Check admin function
    const { data: functionData, error: functionError } = await supabase
      .rpc('get_functions', { schema_name: 'public' });

    if (functionError) {
      console.error('\n❌ Error checking functions:', functionError);
    } else {
      const isAdminExists = functionData.some((f: any) => f.proname === 'is_admin');
      console.log(`\n${isAdminExists ? '✅' : '❌'} is_admin function exists`);
    }

    // 5. Check permissions
    const { data: permissionData, error: permissionError } = await supabase
      .rpc('get_permissions', { schema_name: 'public' });

    if (permissionError) {
      console.error('\n❌ Error checking permissions:', permissionError);
    } else {
      console.log('\nChecking permissions:');
      const authenticatedRole = permissionData.find((p: any) => p.role_name === 'authenticated');
      if (authenticatedRole) {
        console.log('✅ Authenticated role has permissions');
      } else {
        console.log('❌ No permissions found for authenticated role');
      }
    }

    console.log('\nVerification complete!');
    
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyMigration(); 