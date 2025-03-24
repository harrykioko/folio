-- Migration: 20250326_create_settings_tables.sql
-- Description: Creates tables for the Settings section (company_settings, user_preferences, security_settings)
-- Author: System

-- First, ensure the update_updated_at_column function exists (copied from profiles migration for consistency)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if admin role helper function exists, if not create it
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Create company_settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    theme_color TEXT DEFAULT '#4f46e5', -- Default Indigo color
    contact_email TEXT,
    -- Additional fields as per schema recommendations
    timezone TEXT DEFAULT 'UTC',
    date_format TEXT DEFAULT 'YYYY-MM-DD',
    currency_format TEXT DEFAULT 'USD',
    -- Standard timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Track who created/updated the settings
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create the trigger for updated_at on company_settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger
        WHERE tgname = 'set_company_settings_updated_at'
        AND tgrelid = 'public.company_settings'::regclass
    ) THEN
        CREATE TRIGGER set_company_settings_updated_at
        BEFORE UPDATE ON public.company_settings
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- 2. Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light', -- light, dark, system
    language TEXT DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    display_density TEXT DEFAULT 'comfortable', -- comfortable, compact, spacious
    sidebar_collapsed BOOLEAN DEFAULT FALSE,
    -- Standard timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the trigger for updated_at on user_preferences
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger
        WHERE tgname = 'set_user_preferences_updated_at'
        AND tgrelid = 'public.user_preferences'::regclass
    ) THEN
        CREATE TRIGGER set_user_preferences_updated_at
        BEFORE UPDATE ON public.user_preferences
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- 3. Create security_settings table
CREATE TABLE IF NOT EXISTS public.security_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    require_mfa BOOLEAN DEFAULT FALSE,
    password_expiry_days INTEGER DEFAULT 90,
    min_password_length INTEGER DEFAULT 8,
    require_special_chars BOOLEAN DEFAULT TRUE,
    session_timeout_minutes INTEGER DEFAULT 60,
    ip_restriction_enabled BOOLEAN DEFAULT FALSE,
    allowed_ip_ranges TEXT[], -- Array of allowed IP ranges if restrictions enabled
    -- Standard timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Track who created/updated the settings
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create the trigger for updated_at on security_settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger
        WHERE tgname = 'set_security_settings_updated_at'
        AND tgrelid = 'public.security_settings'::regclass
    ) THEN
        CREATE TRIGGER set_security_settings_updated_at
        BEFORE UPDATE ON public.security_settings
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- Now set up the RLS policies for all three tables

-- 1. RLS for company_settings
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view company settings
DROP POLICY IF EXISTS "Users can view company settings" ON public.company_settings;
CREATE POLICY "Users can view company settings" 
ON public.company_settings FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only admins can insert, update, or delete company settings
DROP POLICY IF EXISTS "Admins can manage company settings" ON public.company_settings;
CREATE POLICY "Admins can manage company settings" 
ON public.company_settings FOR ALL 
USING (public.is_admin());

-- 2. RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only view and modify their own preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;
CREATE POLICY "Users can delete their own preferences" 
ON public.user_preferences FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all preferences (for support/debugging)
DROP POLICY IF EXISTS "Admins can view all preferences" ON public.user_preferences;
CREATE POLICY "Admins can view all preferences" 
ON public.user_preferences FOR SELECT 
USING (public.is_admin());

-- 3. RLS for security_settings
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view security settings
DROP POLICY IF EXISTS "Users can view security settings" ON public.security_settings;
CREATE POLICY "Users can view security settings" 
ON public.security_settings FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only admins can insert, update, or delete security settings
DROP POLICY IF EXISTS "Admins can manage security settings" ON public.security_settings;
CREATE POLICY "Admins can manage security settings" 
ON public.security_settings FOR ALL 
USING (public.is_admin());

-- Add default company settings record if none exists
INSERT INTO public.company_settings (name, contact_email, created_by)
SELECT 'My Company', 'admin@example.com', id
FROM auth.users
WHERE role = 'service_role'
AND NOT EXISTS (SELECT 1 FROM public.company_settings LIMIT 1);

-- Add default security settings if none exists
INSERT INTO public.security_settings (created_by)
SELECT id
FROM auth.users
WHERE role = 'service_role'
AND NOT EXISTS (SELECT 1 FROM public.security_settings LIMIT 1);
