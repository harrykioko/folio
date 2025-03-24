-- Consolidate profiles migration

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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_select_others ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_select ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_update ON public.profiles;

-- Policies
CREATE POLICY profiles_select_own ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY profiles_select_others ON public.profiles
    FOR SELECT
    USING (auth.uid() <> id)
    WITH CHECK (
        -- Only allow viewing specific fields for other users
        -- This is enforced at the application level
        TRUE
    );

CREATE POLICY profiles_update_own ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_insert_own ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Admin policies
CREATE POLICY profiles_admin_select ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

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

-- Remove the get_user_profile and create_user_profile functions
DROP FUNCTION IF EXISTS public.get_user_profile(uuid);
DROP FUNCTION IF EXISTS public.create_user_profile(jsonb);
