-- Migration: 20250326_dashboard_migration.sql
-- Description: Combined migration for RLS policies and missing tables
-- Author: System

-- Start transaction
BEGIN;

-- Part 1: RLS Policies Setup
-- Enable RLS on existing tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create indexes for foreign keys and commonly queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_company_settings_id ON public.company_settings(id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Authenticated users can update company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Authenticated users can insert company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Authenticated users can delete company settings" ON public.company_settings;

-- Profiles table policies
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Company Settings policies
CREATE POLICY "Anyone can view company settings"
ON public.company_settings
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can update company settings"
ON public.company_settings
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert company settings"
ON public.company_settings
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete company settings"
ON public.company_settings
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create admin check function
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

-- Part 2: Create Missing Tables
-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme text NOT NULL DEFAULT 'light',
    language text NOT NULL DEFAULT 'en',
    notifications_enabled boolean NOT NULL DEFAULT true,
    email_notifications boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_theme CHECK (theme IN ('light', 'dark', 'system')),
    CONSTRAINT valid_language CHECK (language IN ('en', 'es', 'fr', 'de', 'pt'))
);

-- Create security_settings table
CREATE TABLE IF NOT EXISTS public.security_settings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    two_factor_enabled boolean NOT NULL DEFAULT false,
    two_factor_method text,
    last_password_change timestamptz,
    failed_login_attempts integer NOT NULL DEFAULT 0,
    account_locked boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_two_factor_method CHECK (two_factor_method IN ('sms', 'email', 'authenticator'))
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_security_settings_user_id ON public.security_settings(user_id);

-- Enable RLS on new tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can view own security settings" ON public.security_settings;
DROP POLICY IF EXISTS "Users can update own security settings" ON public.security_settings;
DROP POLICY IF EXISTS "Users can insert own security settings" ON public.security_settings;

-- User Preferences policies
CREATE POLICY "Users can view own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Security Settings policies
CREATE POLICY "Users can view own security settings"
ON public.security_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own security settings"
ON public.security_settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own security settings"
ON public.security_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.company_settings TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.security_settings TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- Commit transaction
COMMIT; 