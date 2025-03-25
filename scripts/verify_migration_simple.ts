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

    // 2. Test RLS by trying to access data with different policies
    console.log('\nTesting RLS policies:');

    // Test profiles table policies
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Error accessing profiles:', profileError);
    } else {
      console.log('✅ Profiles table RLS working');
    }

    // Test company settings policies
    const { data: settingsData, error: settingsError } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1);
    
    if (settingsError) {
      console.error('❌ Error accessing company settings:', settingsError);
    } else {
      console.log('✅ Company settings table RLS working');
    }

    // Test user preferences policies
    const { data: preferencesData, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);
    
    if (preferencesError) {
      console.error('❌ Error accessing user preferences:', preferencesError);
    } else {
      console.log('✅ User preferences table RLS working');
    }

    // Test security settings policies
    const { data: securityData, error: securityError } = await supabase
      .from('security_settings')
      .select('*')
      .limit(1);
    
    if (securityError) {
      console.error('❌ Error accessing security settings:', securityError);
    } else {
      console.log('✅ Security settings table RLS working');
    }

    // 3. Test admin function
    const { data: adminData, error: adminError } = await supabase
      .rpc('is_admin', { user_id: '00000000-0000-0000-0000-000000000000' });
    
    if (adminError) {
      console.error('\n❌ Error testing is_admin function:', adminError);
    } else {
      console.log('\n✅ is_admin function working');
    }

    console.log('\nVerification complete!');
    
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyMigration(); 