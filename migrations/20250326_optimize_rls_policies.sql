BEGIN;

-- Drop existing policies
DO $$ 
DECLARE
    policy_name text;
    table_name text;
BEGIN
    -- Drop all policies on profiles
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_name);
    END LOOP;

    -- Drop all policies on dashboard_settings
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'dashboard_settings'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.dashboard_settings', policy_name);
    END LOOP;

    -- Drop all policies on companies
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'companies'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.companies', policy_name);
    END LOOP;

    -- Drop all policies on verification_functions
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'verification_functions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.verification_functions', policy_name);
    END LOOP;

    -- Drop all policies on utility_functions
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'utility_functions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.utility_functions', policy_name);
    END LOOP;

    -- Drop all policies on user_preferences
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_preferences'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_preferences', policy_name);
    END LOOP;

    -- Drop all policies on security_settings
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'security_settings'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.security_settings', policy_name);
    END LOOP;
END $$;

-- Create optimized policies for profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile"
            ON public.profiles
            FOR SELECT
            USING ((select auth.uid()) = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
            ON public.profiles
            FOR UPDATE
            USING ((select auth.uid()) = id)
            WITH CHECK ((select auth.uid()) = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile"
            ON public.profiles
            FOR INSERT
            WITH CHECK ((select auth.uid()) = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Admins can manage all profiles'
    ) THEN
        CREATE POLICY "Admins can manage all profiles"
            ON public.profiles
            USING ((select auth.jwt() ->> 'role' = 'admin'))
            WITH CHECK ((select auth.jwt() ->> 'role' = 'admin'));
    END IF;
END $$;

-- Create optimized policies for dashboard settings
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dashboard_settings' 
        AND policyname = 'Users can manage own dashboard settings'
    ) THEN
        CREATE POLICY "Users can manage own dashboard settings"
            ON public.dashboard_settings
            USING ((select auth.uid()) = user_id)
            WITH CHECK ((select auth.uid()) = user_id);
    END IF;
END $$;

-- Create optimized policies for companies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'companies' 
        AND policyname = 'Users can view active companies'
    ) THEN
        CREATE POLICY "Users can view active companies"
            ON public.companies
            FOR SELECT
            USING (is_active = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'companies' 
        AND policyname = 'Service role can manage companies'
    ) THEN
        CREATE POLICY "Service role can manage companies"
            ON public.companies
            USING ((select auth.jwt() ->> 'role' = 'service_role'))
            WITH CHECK ((select auth.jwt() ->> 'role' = 'service_role'));
    END IF;
END $$;

-- Create optimized policies for verification functions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'verification_functions' 
        AND policyname = 'Users can view active verification functions'
    ) THEN
        CREATE POLICY "Users can view active verification functions"
            ON public.verification_functions
            FOR SELECT
            USING (is_active = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'verification_functions' 
        AND policyname = 'Service role can manage verification functions'
    ) THEN
        CREATE POLICY "Service role can manage verification functions"
            ON public.verification_functions
            USING ((select auth.jwt() ->> 'role' = 'service_role'))
            WITH CHECK ((select auth.jwt() ->> 'role' = 'service_role'));
    END IF;
END $$;

-- Create optimized policies for utility functions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'utility_functions' 
        AND policyname = 'Users can view active utility functions'
    ) THEN
        CREATE POLICY "Users can view active utility functions"
            ON public.utility_functions
            FOR SELECT
            USING (is_active = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'utility_functions' 
        AND policyname = 'Service role can manage utility functions'
    ) THEN
        CREATE POLICY "Service role can manage utility functions"
            ON public.utility_functions
            USING ((select auth.jwt() ->> 'role' = 'service_role'))
            WITH CHECK ((select auth.jwt() ->> 'role' = 'service_role'));
    END IF;
END $$;

-- Create optimized policies for user preferences
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_preferences' 
        AND policyname = 'Users can manage own preferences'
    ) THEN
        CREATE POLICY "Users can manage own preferences"
            ON public.user_preferences
            USING ((select auth.uid()) = user_id)
            WITH CHECK ((select auth.uid()) = user_id);
    END IF;
END $$;

-- Create optimized policies for security settings
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'security_settings' 
        AND policyname = 'Users can manage own security settings'
    ) THEN
        CREATE POLICY "Users can manage own security settings"
            ON public.security_settings
            USING ((select auth.uid()) = user_id)
            WITH CHECK ((select auth.uid()) = user_id);
    END IF;
END $$;

COMMIT; 