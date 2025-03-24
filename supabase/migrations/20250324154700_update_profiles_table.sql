-- Update profiles table to match requirements
-- Add phone field if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Ensure the updated_at trigger function exists
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_updated_at_on_profiles'
  ) THEN
    CREATE TRIGGER set_updated_at_on_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- Update RLS policies for profiles table
-- First, enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_others" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;

-- Create comprehensive RLS policies
-- Allow users to create their own profile
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow all authenticated users to view basic profile information of others for collaboration
CREATE POLICY "profiles_select_others"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create helper function to check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE 
      id = auth.uid() AND 
      role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies
CREATE POLICY "profiles_admin_select"
ON public.profiles
FOR SELECT
USING (public.is_admin());

CREATE POLICY "profiles_admin_update"
ON public.profiles
FOR UPDATE
USING (public.is_admin());

-- Create a secure function for profile creation that can be called from the client
CREATE OR REPLACE FUNCTION public.create_profile(
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  phone TEXT DEFAULT NULL
) RETURNS public.profiles AS $$
DECLARE
  new_profile public.profiles;
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, bio, phone, role)
  VALUES (auth.uid(), first_name, last_name, avatar_url, bio, phone, 'member')
  RETURNING * INTO new_profile;
  
  RETURN new_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
