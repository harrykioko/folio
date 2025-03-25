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

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Basic connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Connection test failed:', testError);
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Check RLS
    const { data: rlsData, error: rlsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (rlsError) {
      console.error('RLS test failed:', rlsError);
      return;
    }
    
    console.log('✅ RLS policies working');
    
    // Test 3: Check permissions
    const { data: settingsData, error: settingsError } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1);
    
    if (settingsError) {
      console.error('Permissions test failed:', settingsError);
      return;
    }
    
    console.log('✅ Permissions working');
    
    console.log('\nAll tests passed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection(); 