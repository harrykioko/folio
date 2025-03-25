-- Migration: 20250326_setup_rls_policies.sql
-- Description: Sets up RLS policies for existing tables with best practices
-- Author: System

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create indexes for foreign keys and commonly queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_company_settings_id ON public.company_settings(id);

-- Profiles table policies
-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Company Settings policies
-- 1. Anyone can view company settings
CREATE POLICY "Anyone can view company settings"
ON public.company_settings
FOR SELECT
USING (true);

-- 2. Only authenticated users can update company settings
CREATE POLICY "Authenticated users can update company settings"
ON public.company_settings
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 3. Only authenticated users can insert company settings
CREATE POLICY "Authenticated users can insert company settings"
ON public.company_settings
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 4. Only authenticated users can delete company settings
CREATE POLICY "Authenticated users can delete company settings"
ON public.company_settings
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = user_id
        AND role = 'admin'
    );
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.company_settings TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated; 