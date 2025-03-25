BEGIN;

-- 1. Fix Auth RLS Initplan Warnings
-- Profiles
DROP POLICY IF EXISTS "Manage profiles based on role" ON public.profiles;
CREATE POLICY "Manage profiles based on role"
    ON public.profiles
    USING (
        (select auth.jwt() ->> 'role') = 'admin' OR
        (select auth.uid()) = id
    )
    WITH CHECK (
        (select auth.jwt() ->> 'role') = 'admin' OR
        (select auth.uid()) = id
    );

-- Projects
DROP POLICY IF EXISTS "Manage projects based on role" ON public.projects;
CREATE POLICY "Manage projects based on role"
    ON public.projects
    USING (
        (select auth.jwt() ->> 'role') = 'admin' OR
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = projects.id
            AND project_members.user_id = (select auth.uid())
            AND project_members.role IN ('owner', 'editor')
        )
    )
    WITH CHECK (
        (select auth.jwt() ->> 'role') = 'admin' OR
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = projects.id
            AND project_members.user_id = (select auth.uid())
            AND project_members.role IN ('owner', 'editor')
        )
    );

-- Assets
DROP POLICY IF EXISTS "View and manage assets based on role" ON public.assets;
CREATE POLICY "View and manage assets based on role"
    ON public.assets
    USING (
        (select auth.jwt() ->> 'role') = 'admin' OR
        EXISTS (
            SELECT 1 FROM public.asset_projects ap
            JOIN public.project_members pm ON ap.project_id = pm.project_id
            WHERE ap.asset_id = assets.id
            AND pm.user_id = (select auth.uid())
            AND pm.role IN ('owner', 'editor')
        )
    )
    WITH CHECK (
        (select auth.jwt() ->> 'role') = 'admin' OR
        EXISTS (
            SELECT 1 FROM public.asset_projects ap
            JOIN public.project_members pm ON ap.project_id = pm.project_id
            WHERE ap.asset_id = assets.id
            AND pm.user_id = (select auth.uid())
            AND pm.role IN ('owner', 'editor')
        )
    );

-- Tasks
DROP POLICY IF EXISTS "View and manage tasks based on role" ON public.tasks;
CREATE POLICY "View and manage tasks based on role"
    ON public.tasks
    USING (
        (select auth.jwt() ->> 'role') = 'admin' OR
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = tasks.project_id
            AND project_members.user_id = (select auth.uid())
            AND project_members.role IN ('owner', 'editor')
        )
    )
    WITH CHECK (
        (select auth.jwt() ->> 'role') = 'admin' OR
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = tasks.project_id
            AND project_members.user_id = (select auth.uid())
            AND project_members.role IN ('owner', 'editor')
        )
    );

-- Companies
DROP POLICY IF EXISTS "Manage companies based on role" ON public.companies;
CREATE POLICY "Manage companies based on role"
    ON public.companies
    USING (
        (select auth.jwt() ->> 'role') = 'service_role' OR
        is_active = true
    )
    WITH CHECK (
        (select auth.jwt() ->> 'role') = 'service_role'
    );

-- Verification Functions
DROP POLICY IF EXISTS "Manage verification functions based on role" ON public.verification_functions;
CREATE POLICY "Manage verification functions based on role"
    ON public.verification_functions
    USING (
        (select auth.jwt() ->> 'role') = 'service_role' OR
        is_active = true
    )
    WITH CHECK (
        (select auth.jwt() ->> 'role') = 'service_role'
    );

-- Utility Functions
DROP POLICY IF EXISTS "Manage utility functions based on role" ON public.utility_functions;
CREATE POLICY "Manage utility functions based on role"
    ON public.utility_functions
    USING (
        (select auth.jwt() ->> 'role') = 'service_role' OR
        is_active = true
    )
    WITH CHECK (
        (select auth.jwt() ->> 'role') = 'service_role'
    );

-- 2. Fix Multiple Permissive Policies
-- Remove redundant admin policies since they're covered by role-based policies
DROP POLICY IF EXISTS "Admins can manage assets" ON public.assets;
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can manage company settings" ON public.company_settings;

-- Company Settings - Consolidate policies
DROP POLICY IF EXISTS "Anyone can view company settings" ON public.company_settings;
CREATE POLICY "View and manage company settings based on role"
    ON public.company_settings
    USING (
        (select auth.jwt() ->> 'role') = 'admin' OR
        (select auth.role()) = 'authenticated'
    )
    WITH CHECK (
        (select auth.jwt() ->> 'role') = 'admin'
    );

-- Verify fixes
DO $$
DECLARE
    warning record;
BEGIN
    -- Check for remaining auth_rls_initplan warnings
    FOR warning IN
        SELECT tablename, policyname, qual
        FROM pg_policies
        WHERE qual::text LIKE '%auth.%'
        AND qual::text NOT LIKE '%(select auth.%'
    LOOP
        RAISE NOTICE 'Remaining auth_rls_initplan warning on table % policy %: %',
            warning.tablename,
            warning.policyname,
            warning.qual;
    END LOOP;

    -- Check for remaining multiple permissive policies
    FOR warning IN
        SELECT tablename, array_agg(policyname) as policies
        FROM pg_policies
        WHERE permissive = true
        GROUP BY tablename, roles, cmd
        HAVING count(*) > 1
    LOOP
        RAISE NOTICE 'Remaining multiple permissive policies on table %: %',
            warning.tablename,
            warning.policies;
    END LOOP;
END $$;

COMMIT; 