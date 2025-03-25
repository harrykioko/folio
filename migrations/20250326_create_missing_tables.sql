-- Migration: 20250326_create_missing_tables.sql
-- Description: Creates missing tables from existing migrations
-- Author: System

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

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_security_settings_user_id ON public.security_settings(user_id);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

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
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.security_settings TO authenticated; 