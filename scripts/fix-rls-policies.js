// Script to fix Row Level Security policies for profiles table
// Run with: node scripts/fix-rls-policies.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get directory name for __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use environment variables or fallback to the values from supabase.ts
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dnjookyyhfnxvjyytggt.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.warn('Warning: VITE_SUPABASE_SERVICE_KEY not found in environment variables.');
  console.warn('You may need to use the Supabase dashboard to run the SQL script manually.');
  console.warn('The SQL script path is: supabase/fix_profiles_rls_updated.sql');
  process.exit(1);
}

// Create Supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Simple function to execute SQL using the Supabase client
async function executeSql(sql) {
  try {
    const { data, error } = await supabase.rpc('_exec_sql', { sql_string: sql });
    
    if (error) {
      console.error('SQL execution error:', error);
      return false;
    }
    
    console.log('SQL executed successfully');
    return true;
  } catch (error) {
    console.error('Error executing SQL:', error);
    return false;
  }
}

// Main function to apply RLS policies
async function fixRlsPolicies() {
  try {
    console.log('Starting RLS policy fixes...');
    
    // First, directly create the RPC function we'll need for profile creation
    console.log('Setting up profile RPC function...');
    
    const createRpcSql = `
    -- Create an RPC function to create user profiles bypassing RLS
    CREATE OR REPLACE FUNCTION public.create_user_profile(profile_data JSONB)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER -- This bypasses RLS policies
    AS $$
    DECLARE
      new_profile JSONB;
    BEGIN
      -- Insert the profile data
      INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        role,
        created_at
      ) VALUES (
        (profile_data->>'id')::UUID,
        profile_data->>'first_name',
        profile_data->>'last_name',
        profile_data->>'role',
        COALESCE((profile_data->>'created_at')::TIMESTAMP, NOW())
      )
      ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name
      RETURNING to_jsonb(profiles.*) INTO new_profile;
      
      RETURN new_profile;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Error creating profile: %', SQLERRM;
    END;
    $$;

    -- Set permissions for the function
    GRANT EXECUTE ON FUNCTION public.create_user_profile(JSONB) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.create_user_profile(JSONB) TO anon;
    `;
    
    const rpcSuccess = await executeSql(createRpcSql);
    
    if (rpcSuccess) {
      console.log('Successfully created profile RPC function.');
      
      // Now fix the RLS policies
      console.log('Updating RLS policies...');
      
      const fixRlsSql = `
      -- Fix Row Level Security policies for profiles table
      -- First, ensure RLS is enabled
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      -- Remove existing policies to avoid conflicts
      DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
      DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;

      -- Allow authenticated users to create their own profile
      CREATE POLICY "Users can create their own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

      -- Allow users to view their own profiles
      CREATE POLICY "Users can view their own profile"
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = id);

      -- Allow users to update their own profile
      CREATE POLICY "Users can update their own profile" 
      ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id);

      -- Allow users to view all profiles (needed for collaboration features)
      CREATE POLICY "Users can view all profiles"
      ON public.profiles
      FOR SELECT
      USING (auth.role() = 'authenticated');

      -- Allow service role to manage all profiles (critical for auth hooks)
      CREATE POLICY "Service role can manage all profiles"
      ON public.profiles
      FOR ALL
      USING (auth.role() = 'service_role');

      -- Grant necessary permissions to authenticated users
      GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
      GRANT USAGE ON SEQUENCE public.profiles_id_seq TO authenticated;

      -- Make sure anon users can't access profiles
      REVOKE ALL ON public.profiles FROM anon;
      `;
      
      const rlsSuccess = await executeSql(fixRlsSql);
      
      if (rlsSuccess) {
        console.log('Successfully updated RLS policies.');
      } else {
        console.error('Failed to update RLS policies.');
      }
    } else {
      console.error('Failed to create profile RPC function.');
    }
    
    console.log('RLS policy fix process completed.');
    console.log('If you still encounter issues, you may need to apply the SQL script manually via the Supabase dashboard.');
    
  } catch (error) {
    console.error('Error fixing RLS policies:', error);
    console.log('Please apply the SQL script manually via the Supabase dashboard.');
  }
}

// Run the function
fixRlsPolicies();
