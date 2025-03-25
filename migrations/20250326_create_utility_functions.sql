-- Migration: 20250326_create_utility_functions.sql
-- Description: Creates utility functions needed by other migrations
-- Author: System

-- Start transaction
BEGIN;

-- Create function to automatically update timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    -- For now, we'll consider the first user as admin
    -- This should be replaced with proper admin role checking logic
    RETURN EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = user_id
        AND id IN (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

COMMIT; 