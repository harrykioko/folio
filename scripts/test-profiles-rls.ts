// Use ES module imports for TypeScript
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Define types for test data
interface ProfileTestData {
  select: Record<string, any>;
  insert: Record<string, any>;
  update: Record<string, any>;
  delete: Record<string, any>;
}

// Define types for user data
interface TestUserData {
  email: string;
  password: string;
  profile: {
    first_name: string;
    last_name: string;
    bio: string;
    phone: string;
    role: string;
  };
}

// Get Supabase URL and keys from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_KEY; // Changed to match .env file

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error('Error: Supabase URL, anon key, and service role key must be provided in environment variables');
  console.error('Please ensure you have VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_SUPABASE_SERVICE_KEY in your .env file');
  process.exit(1);
}

// Log for debugging (remove in production)
console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key available:', !!supabaseAnonKey);
console.log('Service Role Key available:', !!supabaseServiceRoleKey);

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

// Test data for profiles
const profilesTestData: ProfileTestData = {
  select: { id: 'auth.uid()' },
  insert: { 
    first_name: 'Test', 
    last_name: 'User', 
    bio: 'Test bio', 
    phone: '123-456-7890',
    role: 'member' 
  },
  update: { bio: 'Updated bio' },
  delete: {}
};

// Test user credentials
const testUser: TestUserData = {
  email: 'test-rls@example.com',
  password: 'Password123!',
  profile: {
    first_name: 'RLS',
    last_name: 'Tester',
    bio: 'Testing RLS policies',
    phone: '555-123-4567',
    role: 'member'
  }
};

// Admin user credentials
const adminUser: TestUserData = {
  email: 'admin-rls@example.com',
  password: 'AdminPass123!',
  profile: {
    first_name: 'Admin',
    last_name: 'User',
    bio: 'Admin user for testing',
    phone: '555-987-6543',
    role: 'admin'
  }
};

// Function to create a test user
async function createTestUser(userData: TestUserData): Promise<User | null> {
  try {
    // Create user with auth API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });
    
    if (authError) {
      console.error('Error creating test user:', authError);
      return null;
    }
    
    // Create profile for the user
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: userData.profile.first_name,
        last_name: userData.profile.last_name,
        bio: userData.profile.bio,
        phone: userData.profile.phone,
        role: userData.profile.role
      });
    
    if (profileError) {
      console.error('Error creating profile for test user:', profileError);
      return null;
    }
    
    return authData.user;
  } catch (err) {
    console.error('Unexpected error creating test user:', err);
    return null;
  }
}

// Function to sign in as a user
async function signInAsUser(email: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Error signing in:', error);
      return null;
    }
    
    return data.user;
  } catch (err) {
    console.error('Unexpected error signing in:', err);
    return null;
  }
}

// Function to test RLS policies
async function testRLSPolicies(): Promise<void> {
  console.log('Testing RLS policies for profiles table...');
  
  try {
    // Create test users
    console.log('Creating test users...');
    const regularUser = await createTestUser(testUser);
    const admin = await createTestUser(adminUser);
    
    if (!regularUser || !admin) {
      console.error('Failed to create test users');
      return;
    }
    
    console.log('Test users created successfully');
    
    // Test regular user permissions
    console.log('\nTesting regular user permissions:');
    await signInAsUser(testUser.email, testUser.password);
    
    // Test SELECT - own profile
    console.log('- SELECT own profile:');
    let { data: ownProfile, error: ownProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', regularUser.id)
      .single();
    
    console.log(ownProfileError 
      ? `  Failed: ${ownProfileError.message}` 
      : `  Success: Retrieved profile for ${ownProfile?.first_name} ${ownProfile?.last_name}`);
    
    // Test SELECT - admin's profile
    console.log('- SELECT admin profile:');
    let { data: adminProfile, error: adminProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', admin.id)
      .single();
    
    console.log(adminProfileError 
      ? `  Failed: ${adminProfileError.message}` 
      : `  Success: Retrieved profile for ${adminProfile?.first_name} ${adminProfile?.last_name}`);
    
    // Test UPDATE - own profile
    console.log('- UPDATE own profile:');
    let { error: updateOwnError } = await supabase
      .from('profiles')
      .update({ bio: 'Updated by regular user' })
      .eq('id', regularUser.id);
    
    console.log(updateOwnError 
      ? `  Failed: ${updateOwnError.message}` 
      : '  Success: Updated own profile');
    
    // Test UPDATE - admin's profile
    console.log('- UPDATE admin profile:');
    let { error: updateAdminError } = await supabase
      .from('profiles')
      .update({ bio: 'Attempted update by regular user' })
      .eq('id', admin.id);
    
    console.log(updateAdminError 
      ? `  Failed as expected: ${updateAdminError.message}` 
      : '  Unexpected success - RLS policy may not be working correctly');
    
    // Test admin user permissions
    console.log('\nTesting admin user permissions:');
    await signInAsUser(adminUser.email, adminUser.password);
    
    // Test SELECT - regular user's profile
    console.log('- SELECT regular user profile:');
    let { data: regularUserProfile, error: regularUserProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', regularUser.id)
      .single();
    
    console.log(regularUserProfileError 
      ? `  Failed: ${regularUserProfileError.message}` 
      : `  Success: Retrieved profile for ${regularUserProfile?.first_name} ${regularUserProfile?.last_name}`);
    
    // Test UPDATE - regular user's profile
    console.log('- UPDATE regular user profile:');
    let { error: updateRegularError } = await supabase
      .from('profiles')
      .update({ bio: 'Updated by admin' })
      .eq('id', regularUser.id);
    
    console.log(updateRegularError 
      ? `  Failed: ${updateRegularError.message}` 
      : '  Success: Updated regular user profile');
    
    // Clean up test users
    console.log('\nCleaning up test users...');
    await adminClient.auth.admin.deleteUser(regularUser.id);
    await adminClient.auth.admin.deleteUser(admin.id);
    
    console.log('Test users deleted successfully');
    console.log('\nRLS policy testing completed');
  } catch (err) {
    console.error('Unexpected error during testing:', err);
  }
}

// Run the tests
testRLSPolicies().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
