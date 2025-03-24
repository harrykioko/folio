-- Migration: 20250326_add_user_profile_functions.sql
-- Description: Add missing get_user_profile RPC function
-- Author: System

-- Create the RPC function to get a user profile safely
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_record public.profiles;
BEGIN
    -- Get the profile for the given user_id
    SELECT * INTO profile_record
    FROM public.profiles
    WHERE id = user_id;
    
    -- If no profile found, return NULL
    IF profile_record IS NULL THEN
        RAISE EXCEPTION 'No profile found for user %', user_id;
    END IF;
    
    RETURN profile_record;
END;
$$;
