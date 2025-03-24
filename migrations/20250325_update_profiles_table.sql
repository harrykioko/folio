-- Update profiles table to add phone field and ensure updated_at trigger exists
-- This migration adds a phone field to the profiles table and ensures the updated_at trigger is set up

-- First, check if the phone column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
END
$$;

-- Check if the function to update the updated_at timestamp exists, if not create it
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if the trigger exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger
        WHERE tgname = 'set_profiles_updated_at'
        AND tgrelid = 'public.profiles'::regclass
    ) THEN
        CREATE TRIGGER set_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- Create or replace the function to create a profile
CREATE OR REPLACE FUNCTION public.create_profile(profile_data JSONB)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        first_name, 
        last_name, 
        avatar_url, 
        bio, 
        phone,
        role, 
        created_at
    ) VALUES (
        profile_data->>'id',
        profile_data->>'first_name',
        profile_data->>'last_name',
        profile_data->>'avatar_url',
        profile_data->>'bio',
        profile_data->>'phone',
        profile_data->>'role',
        (profile_data->>'created_at')::TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up Row Level Security (RLS) policies for the profiles table

-- First, enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own profiles
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Create policy for users to view basic profile information of others for collaboration
DROP POLICY IF EXISTS profiles_select_others ON public.profiles;
CREATE POLICY profiles_select_others ON public.profiles
    FOR SELECT
    USING (auth.uid() <> id)
    WITH CHECK (
        -- Only allow viewing specific fields for other users
        -- This is enforced at the application level
        TRUE
    );

-- Create policy for users to update their own profiles
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create policy for users to insert their own profiles
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create policy for admins to view all profiles
DROP POLICY IF EXISTS profiles_admin_select ON public.profiles;
CREATE POLICY profiles_admin_select ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policy for admins to update all profiles
DROP POLICY IF EXISTS profiles_admin_update ON public.profiles;
CREATE POLICY profiles_admin_update ON public.profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
