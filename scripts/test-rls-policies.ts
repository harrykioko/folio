import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { testMultipleRLSPolicies, generateRLSTestSummary } from '../src/utils/rlsTester';
import type { Database } from '../src/integrations/supabase/types';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

/**
 * Main function to run RLS tests
 */
async function runRLSTests(): Promise<void> {
  try {
    // Create a Supabase client with the service role key for admin access
    const adminClient = createClient<Database>(
      SUPABASE_URL, 
      SUPABASE_SERVICE_KEY
    );
    
    // Create a Supabase client with the anon key for RLS testing
    const anonClient = createClient<Database>(
      SUPABASE_URL, 
      SUPABASE_ANON_KEY
    );
    
    // Get command line arguments for specific tables to test
    const args = process.argv.slice(2);
    let tablesToTest: string[] = [];
    
    if (args.length > 0) {
      tablesToTest = args;
    } else {
      // Default tables to test if none specified
      tablesToTest = [
        'user_profiles',
        'company_settings',
        'tasks',
        'assets',
        'portfolios',
        'workspaces'
      ];
    }
    
    console.log('Starting RLS policy tests...');
    console.log(`Tables to test: ${tablesToTest.join(', ')}`);
    
    // First, we need to sign in with a test user
    // You can either create a test user here or use an existing one
    const testEmail = process.env.TEST_USER_EMAIL || '';
    const testPassword = process.env.TEST_USER_PASSWORD || '';
    
    if (!testEmail || !testPassword) {
      console.error('Missing test user credentials. Set TEST_USER_EMAIL and TEST_USER_PASSWORD in your .env file');
      process.exit(1);
    }
    
    // Sign in with the test user
    const { error: signInError } = await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('Failed to sign in with test user:', signInError.message);
      process.exit(1);
    }
    
    console.log(`Signed in as ${testEmail}`);
    
    // Run the RLS tests
    const results = await testMultipleRLSPolicies(anonClient as any, tablesToTest);
    
    // Generate and display the summary
    const summary = generateRLSTestSummary(results);
    console.log(summary);
    
    // Count passed and failed tables
    const passedTables = Object.values(results).filter(result => result.overall === 'Passed').length;
    const failedTables = Object.values(results).filter(result => result.overall === 'Failed').length;
    
    console.log(`RLS Test Results: ${passedTables} tables passed, ${failedTables} tables failed`);
    
    // Exit with appropriate code
    process.exit(failedTables > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error running RLS tests:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the tests
runRLSTests();
