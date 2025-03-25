-- Migration: 20250326_create_user_management_tables.sql
-- Description: Creates tables for user preferences and security settings
-- Author: System

-- Start transaction
BEGIN;

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme text NOT NULL DEFAULT 'light',
    language text NOT NULL DEFAULT 'en',
    timezone text NOT NULL DEFAULT 'UTC',
    notifications_enabled boolean NOT NULL DEFAULT true,
    email_notifications jsonb NOT NULL DEFAULT '{
        "task_assignments": true,
        "task_updates": true,
        "project_updates": true,
        "mentions": true,
        "security_alerts": true
    }'::jsonb,
    dashboard_layout jsonb NOT NULL DEFAULT '{
        "widgets": ["tasks", "activity", "metrics", "calendar"]
    }'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_theme CHECK (theme IN ('light', 'dark', 'system')),
    CONSTRAINT valid_language CHECK (language ~ '^[a-z]{2}(-[A-Z]{2})?$')
);

-- Create security_settings table
CREATE TABLE IF NOT EXISTS public.security_settings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mfa_enabled boolean NOT NULL DEFAULT false,
    mfa_method text,
    last_password_change timestamptz,
    password_reset_required boolean NOT NULL DEFAULT false,
    login_attempts integer NOT NULL DEFAULT 0,
    account_locked boolean NOT NULL DEFAULT false,
    lock_expiry_time timestamptz,
    allowed_ip_addresses text[] DEFAULT ARRAY[]::text[],
    session_timeout_minutes integer NOT NULL DEFAULT 60,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_mfa_method CHECK (mfa_method IS NULL OR mfa_method IN ('app', 'sms', 'email')),
    CONSTRAINT valid_session_timeout CHECK (session_timeout_minutes BETWEEN 15 AND 1440)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for security_settings
CREATE POLICY "Users can view their own security settings"
ON public.security_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings"
ON public.security_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings"
ON public.security_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_security_settings_user_id ON public.security_settings(user_id);

-- Grant permissions
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.security_settings TO authenticated;

-- Create trigger for updated_at
CREATE TRIGGER set_timestamp_user_preferences
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_timestamp_security_settings
    BEFORE UPDATE ON public.security_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Create function to initialize user settings
CREATE OR REPLACE FUNCTION public.initialize_user_settings()
RETURNS trigger AS $$
BEGIN
    -- Create default user preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Create default security settings
    INSERT INTO public.security_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize settings for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_settings();

COMMIT; 