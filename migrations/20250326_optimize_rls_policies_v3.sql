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
END $$;

-- Create optimized policies for profiles
DO $$ 
BEGIN
    -- Combined policy for all profile operations
    CREATE POLICY "Manage profiles based on role"
        ON public.profiles
        USING (
            (select auth.jwt() ->> 'role' = 'admin') OR
            (select auth.uid()) = id
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'admin') OR
            (select auth.uid()) = id
        );
END $$;

-- Create optimized policies for companies
DO $$ 
BEGIN
    -- Combined policy for all company operations
    CREATE POLICY "Manage companies based on role"
        ON public.companies
        USING (
            (select auth.jwt() ->> 'role' = 'service_role') OR
            is_active = true
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'service_role')
        );
END $$;

-- Create optimized policies for verification_functions
DO $$ 
BEGIN
    -- Combined policy for all verification function operations
    CREATE POLICY "Manage verification functions based on role"
        ON public.verification_functions
        USING (
            (select auth.jwt() ->> 'role' = 'service_role') OR
            is_active = true
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'service_role')
        );
END $$;

-- Create optimized policies for utility_functions
DO $$ 
BEGIN
    -- Combined policy for all utility function operations
    CREATE POLICY "Manage utility functions based on role"
        ON public.utility_functions
        USING (
            (select auth.jwt() ->> 'role' = 'service_role') OR
            is_active = true
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'service_role')
        );
END $$;

COMMIT; 