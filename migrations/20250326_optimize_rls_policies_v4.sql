BEGIN;

-- Create is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (select auth.jwt() ->> 'role' = 'admin');
END;
$$;

-- Drop existing policies
DO $$ 
DECLARE
    policy_name text;
    table_name text;
BEGIN
    -- Drop all policies on company_settings
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'company_settings'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.company_settings', policy_name);
    END LOOP;

    -- Drop all policies on projects
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'projects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.projects', policy_name);
    END LOOP;

    -- Drop all policies on assets
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'assets'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.assets', policy_name);
    END LOOP;

    -- Drop all policies on tasks
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'tasks'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.tasks', policy_name);
    END LOOP;
END $$;

-- Create optimized policies for company_settings
DO $$ 
BEGIN
    -- Allow all authenticated users to view company settings
    CREATE POLICY "Anyone can view company settings"
        ON public.company_settings
        FOR SELECT
        USING (auth.role() = 'authenticated');

    -- Only admins can modify company settings
    CREATE POLICY "Admins can manage company settings"
        ON public.company_settings
        FOR ALL
        USING (public.is_admin());
END $$;

-- Create optimized policies for projects
DO $$ 
BEGIN
    CREATE POLICY "Manage projects based on role"
        ON public.projects
        USING (
            (select auth.jwt() ->> 'role' = 'admin') OR
            EXISTS (
                SELECT 1 FROM public.project_members
                WHERE project_id = projects.id
                AND user_id = (select auth.uid())
                AND role IN ('owner', 'editor')
            )
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'admin') OR
            EXISTS (
                SELECT 1 FROM public.project_members
                WHERE project_id = projects.id
                AND user_id = (select auth.uid())
                AND role IN ('owner', 'editor')
            )
        );
END $$;

-- Create optimized policies for assets
DO $$ 
BEGIN
    CREATE POLICY "View and manage assets based on role"
        ON public.assets
        USING (
            (select auth.jwt() ->> 'role' = 'admin') OR
            EXISTS (
                SELECT 1 FROM public.asset_projects ap
                JOIN public.project_members pm ON ap.project_id = pm.project_id
                WHERE ap.asset_id = assets.id
                AND pm.user_id = (select auth.uid())
                AND pm.role IN ('owner', 'editor')
            )
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'admin') OR
            EXISTS (
                SELECT 1 FROM public.asset_projects ap
                JOIN public.project_members pm ON ap.project_id = pm.project_id
                WHERE ap.asset_id = assets.id
                AND pm.user_id = (select auth.uid())
                AND pm.role IN ('owner', 'editor')
            )
        );
END $$;

-- Create optimized policies for tasks
DO $$ 
BEGIN
    CREATE POLICY "View and manage tasks based on role"
        ON public.tasks
        USING (
            (select auth.jwt() ->> 'role' = 'admin') OR
            EXISTS (
                SELECT 1 FROM public.project_members
                WHERE project_id = tasks.project_id
                AND user_id = (select auth.uid())
                AND role IN ('owner', 'editor')
            )
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'admin') OR
            EXISTS (
                SELECT 1 FROM public.project_members
                WHERE project_id = tasks.project_id
                AND user_id = (select auth.uid())
                AND role IN ('owner', 'editor')
            )
        );
END $$;

-- Fix remaining auth_rls_initplan warnings for previously addressed tables
DO $$ 
BEGIN
    -- Recreate profiles policy with proper wrapping
    DROP POLICY IF EXISTS "Manage profiles based on role" ON public.profiles;
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

    -- Recreate companies policy with proper wrapping
    DROP POLICY IF EXISTS "Manage companies based on role" ON public.companies;
    CREATE POLICY "Manage companies based on role"
        ON public.companies
        USING (
            (select auth.jwt() ->> 'role' = 'service_role') OR
            is_active = true
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'service_role')
        );

    -- Recreate verification_functions policy with proper wrapping
    DROP POLICY IF EXISTS "Manage verification functions based on role" ON public.verification_functions;
    CREATE POLICY "Manage verification functions based on role"
        ON public.verification_functions
        USING (
            (select auth.jwt() ->> 'role' = 'service_role') OR
            is_active = true
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'service_role')
        );

    -- Recreate utility_functions policy with proper wrapping
    DROP POLICY IF EXISTS "Manage utility functions based on role" ON public.utility_functions;
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