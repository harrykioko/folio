-- Migration: 20250326_fix_company_settings_schema.sql
-- Description: Fix company_settings table to match auth code requirements
-- Author: System

-- Add user_id column to company_settings table
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records to set user_id = created_by
UPDATE public.company_settings
SET user_id = created_by
WHERE user_id IS NULL AND created_by IS NOT NULL;

-- Add unique constraint on user_id to ensure only one company setting per user
ALTER TABLE public.company_settings
ADD CONSTRAINT company_settings_user_id_key UNIQUE (user_id);

-- Create function to get company settings by user_id
CREATE OR REPLACE FUNCTION public.get_company_settings(p_user_id UUID)
RETURNS public.company_settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    settings_record public.company_settings;
BEGIN
    -- Get the company settings for the given user_id
    SELECT * INTO settings_record
    FROM public.company_settings
    WHERE user_id = p_user_id;
    
    -- If no settings found, return NULL
    IF settings_record IS NULL THEN
        RAISE EXCEPTION 'No company settings found for user %', p_user_id;
    END IF;
    
    RETURN settings_record;
END;
$$;
