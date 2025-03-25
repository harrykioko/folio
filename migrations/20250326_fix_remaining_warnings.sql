BEGIN;

-- Drop existing diagnostic functions if they exist
DROP FUNCTION IF EXISTS public.check_multiple_permissive_policies() CASCADE;
DROP FUNCTION IF EXISTS public.check_auth_rls_initplan() CASCADE;
DROP FUNCTION IF EXISTS public.check_index_opportunities() CASCADE;

-- Create optimized policies for remaining tables with multiple permissive policies
DO $$ 
DECLARE
    v_table text;
    v_policies text[];
BEGIN
    -- Handle activity_logs table
    DROP POLICY IF EXISTS "View activity logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Manage activity logs" ON public.activity_logs;
    
    CREATE POLICY "Manage activity logs based on role"
        ON public.activity_logs
        USING (
            (select auth.jwt() ->> 'role' = 'admin') OR
            user_id = (select auth.uid())
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'admin') OR
            user_id = (select auth.uid())
        );

    -- Handle project_members table
    DROP POLICY IF EXISTS "View project members" ON public.project_members;
    DROP POLICY IF EXISTS "Manage project members" ON public.project_members;
    
    CREATE POLICY "Manage project members based on role"
        ON public.project_members
        USING (
            (select auth.jwt() ->> 'role' = 'admin') OR
            EXISTS (
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = project_members.project_id
                AND pm.user_id = (select auth.uid())
                AND pm.role IN ('owner', 'editor')
            )
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'admin') OR
            EXISTS (
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = project_members.project_id
                AND pm.user_id = (select auth.uid())
                AND pm.role IN ('owner', 'editor')
            )
        );

    -- Handle asset_projects table
    DROP POLICY IF EXISTS "View asset projects" ON public.asset_projects;
    DROP POLICY IF EXISTS "Manage asset projects" ON public.asset_projects;
    
    CREATE POLICY "Manage asset projects based on role"
        ON public.asset_projects
        USING (
            (select auth.jwt() ->> 'role' = 'admin') OR
            EXISTS (
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = asset_projects.project_id
                AND pm.user_id = (select auth.uid())
                AND pm.role IN ('owner', 'editor')
            )
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'admin') OR
            EXISTS (
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = asset_projects.project_id
                AND pm.user_id = (select auth.uid())
                AND pm.role IN ('owner', 'editor')
            )
        );
END $$;

-- Fix remaining auth_rls_initplan warnings by properly wrapping auth calls
DO $$ 
BEGIN
    -- Fix user_settings policy
    DROP POLICY IF EXISTS "Manage user settings" ON public.user_settings;
    CREATE POLICY "Manage user settings"
        ON public.user_settings
        USING (
            (select auth.jwt() ->> 'role' = 'admin') OR
            (select auth.uid()) = id
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'admin') OR
            (select auth.uid()) = id
        );

    -- Fix dashboard_settings policy
    DROP POLICY IF EXISTS "Manage dashboard settings" ON public.dashboard_settings;
    CREATE POLICY "Manage dashboard settings"
        ON public.dashboard_settings
        USING (
            (select auth.jwt() ->> 'role' = 'admin') OR
            (select auth.uid()) = user_id
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'admin') OR
            (select auth.uid()) = user_id
        );
END $$;

-- Add recommended indexes based on usage patterns
DO $$ 
BEGIN
    -- Add index for project_members lookups
    CREATE INDEX IF NOT EXISTS idx_project_members_project_user 
    ON public.project_members(project_id, user_id);

    -- Add index for asset_projects lookups
    CREATE INDEX IF NOT EXISTS idx_asset_projects_project_asset 
    ON public.asset_projects(project_id, asset_id);

    -- Add index for activity_logs lookups
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created 
    ON public.activity_logs(user_id, created_at);

    -- Add index for tasks lookups
    CREATE INDEX IF NOT EXISTS idx_tasks_project_status 
    ON public.tasks(project_id, status);

    -- Add index for assets lookups
    CREATE INDEX IF NOT EXISTS idx_assets_type_status 
    ON public.assets(type, status);
END $$;

-- Create function to verify fixes
CREATE OR REPLACE FUNCTION public.verify_warning_fixes()
RETURNS TABLE (
    check_type text,
    table_name text,
    status text,
    details text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH multiple_policies AS (
        SELECT 
            'Multiple Permissive Policies' as check_type,
            tablename as table_name,
            CASE 
                WHEN COUNT(*) > 1 THEN 'Warning'
                ELSE 'Fixed'
            END as status,
            array_agg(policyname)::text as details
        FROM pg_policies
        WHERE permissive = 'PERMISSIVE'
        GROUP BY tablename
    ),
    auth_warnings AS (
        SELECT 
            'Auth RLS Initplan' as check_type,
            tablename as table_name,
            CASE 
                WHEN qual::text LIKE '%auth.%' AND qual::text NOT LIKE '%(select auth.%' THEN 'Warning'
                ELSE 'Fixed'
            END as status,
            policyname as details
        FROM pg_policies
        WHERE qual::text LIKE '%auth.%'
    )
    SELECT * FROM multiple_policies
    UNION ALL
    SELECT * FROM auth_warnings;
END;
$$;

-- Execute verification
DO $$
DECLARE
    v_result record;
BEGIN
    RAISE NOTICE 'Verifying warning fixes...';
    FOR v_result IN 
        SELECT * FROM public.verify_warning_fixes()
    LOOP
        RAISE NOTICE '%: Table % - % - %', 
            v_result.check_type,
            v_result.table_name,
            v_result.status,
            v_result.details;
    END LOOP;
END $$;

COMMIT; 