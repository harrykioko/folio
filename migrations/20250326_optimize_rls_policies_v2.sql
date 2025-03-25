BEGIN;

-- Drop existing policies
DO $$ 
DECLARE
    policy_name text;
    table_name text;
BEGIN
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

    -- Drop all policies on company_settings
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'company_settings'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.company_settings', policy_name);
    END LOOP;
END $$;

-- Create optimized policies for projects
DO $$ 
BEGIN
    -- Combined policy for admins and project members
    CREATE POLICY "Manage projects based on role"
        ON public.projects
        USING (
            (select auth.jwt() ->> 'role' = 'admin') OR
            (select auth.uid()) IN (
                SELECT user_id 
                FROM project_members 
                WHERE project_id = projects.id
            )
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'admin') OR
            (select auth.uid()) IN (
                SELECT user_id 
                FROM project_members 
                WHERE project_id = projects.id
            )
        );
END $$;

-- Create optimized policies for assets
DO $$ 
BEGIN
    -- Combined policy for admins and authenticated users
    CREATE POLICY "View and manage assets based on role"
        ON public.assets
        USING (
            (select auth.jwt() ->> 'role' = 'admin') OR
            (select auth.jwt() ->> 'role' = 'authenticated')
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'admin')
        );
END $$;

-- Create optimized policies for tasks
DO $$ 
BEGIN
    -- Combined policy for admins and task assignees
    CREATE POLICY "View and manage tasks based on role"
        ON public.tasks
        USING (
            (select auth.jwt() ->> 'role' = 'admin') OR
            (select auth.jwt() ->> 'role' = 'authenticated')
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'admin') OR
            (select auth.uid()) = assignee_id
        );
END $$;

-- Create optimized policies for company_settings
DO $$ 
BEGIN
    -- Combined policy for authenticated users
    CREATE POLICY "Manage company settings"
        ON public.company_settings
        USING (
            (select auth.jwt() ->> 'role' = 'authenticated')
        )
        WITH CHECK (
            (select auth.jwt() ->> 'role' = 'authenticated')
        );
END $$;

COMMIT; 