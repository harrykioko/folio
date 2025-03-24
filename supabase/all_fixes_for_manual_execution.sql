-- =============================================================================
-- COMBINED FIX FOR PROFILE RLS ISSUES IN FOLIO APPLICATION
-- =============================================================================
-- This script fixes Row Level Security (RLS) policies for the profiles table
-- and creates an RPC function to bypass these policies when needed.
-- Execute this entire script in the Supabase SQL Editor.
-- =============================================================================

-- PART 1: First create the RPC function for profile creation
-- This function uses SECURITY DEFINER to bypass RLS policies

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

-- Grant necessary permissions for the function
GRANT EXECUTE ON FUNCTION public.create_user_profile(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(JSONB) TO anon;

-- PART 2: Fix the Row Level Security policies for the profiles table

-- First, ensure RLS is enabled on the profiles table
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

-- Make sure anon users can't access profiles
REVOKE ALL ON public.profiles FROM anon;

-- This refresh is required to ensure changes take effect immediately
NOTIFY pgrst, 'reload schema';
