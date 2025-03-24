-- Fix Row Level Security policies for profiles table
-- This script addresses the "new row violates row-level security policy" error

-- First, ensure RLS is enabled on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove existing policies to avoid conflicts (will recreate them)
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

-- This refresh is required to ensure changes take effect immediately
NOTIFY pgrst, 'reload schema';
