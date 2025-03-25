BEGIN;

-- 1. Fix Simple User ID Checks
-- Dashboard Settings
DROP POLICY IF EXISTS "Users can manage own dashboard settings" ON public.dashboard_settings;
CREATE POLICY "Users can manage own dashboard settings"
    ON public.dashboard_settings
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- User Preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences"
    ON public.user_preferences
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Security Settings
DROP POLICY IF EXISTS "Users can manage own security settings" ON public.security_settings;
CREATE POLICY "Users can manage own security settings"
    ON public.security_settings
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

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

-- 2. Fix Role-Based Checks
-- Company Settings
DROP POLICY IF EXISTS "Anyone can view company settings" ON public.company_settings;
CREATE POLICY "Anyone can view company settings"
    ON public.company_settings
    FOR SELECT
    USING ((select auth.role()) = 'authenticated');

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

-- Companies and Related Functions
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

-- 3. Fix Storage Policies
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
    ON storage.objects
    USING (
        bucket_id = 'profile-images' AND
        (select auth.uid()) IS NOT NULL
    )
    WITH CHECK (
        bucket_id = 'profile-images' AND
        (select auth.uid()) IS NOT NULL
    );

-- Verify fixes by checking remaining warnings
DO $$
DECLARE
    warning record;
BEGIN
    FOR warning IN
        SELECT tablename, policyname, qual
        FROM pg_policies
        WHERE qual::text LIKE '%auth.%'
        AND qual::text NOT LIKE '%(select auth.%'
    LOOP
        RAISE NOTICE 'Remaining warning on table % policy %: %',
            warning.tablename,
            warning.policyname,
            warning.qual;
    END LOOP;
END $$;

COMMIT; 