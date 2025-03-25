BEGIN;

-- Drop dependent policies first
DROP POLICY IF EXISTS "Admins can manage company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage assets" ON public.assets;
DROP POLICY IF EXISTS "Admins can manage tasks" ON public.tasks;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.create_activity_log() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.initialize_user_settings() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.get_policies() CASCADE;
DROP FUNCTION IF EXISTS public.get_indexes() CASCADE;
DROP FUNCTION IF EXISTS public.get_functions() CASCADE;
DROP FUNCTION IF EXISTS public.get_permissions() CASCADE;
DROP FUNCTION IF EXISTS public.get_table_structure() CASCADE;
DROP FUNCTION IF EXISTS public.get_rls_policies() CASCADE;
DROP FUNCTION IF EXISTS public.verify_table_exists(text) CASCADE;
DROP FUNCTION IF EXISTS public.verify_index_exists(text) CASCADE;
DROP FUNCTION IF EXISTS public.verify_column_exists(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.verify_constraint_exists(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.register_company(text, text, text, text, text, text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.register_verification_function(text, text, text, jsonb, text) CASCADE;
DROP FUNCTION IF EXISTS public.register_utility_function(text, text, text, jsonb, text) CASCADE;

-- Fix search path for is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (select auth.jwt() ->> 'role' = 'admin');
END;
$$;

-- Fix search path for create_activity_log function
CREATE OR REPLACE FUNCTION public.create_activity_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO activity_logs (
        action,
        entity_type,
        entity_id,
        user_id,
        metadata
    )
    VALUES (
        TG_OP, -- INSERT, UPDATE, DELETE
        TG_TABLE_NAME,
        NEW.id,
        auth.uid(),
        jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    );
    RETURN NEW;
END;
$$;

-- Fix search path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

    -- Initialize user settings
    INSERT INTO public.user_settings (id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$;

-- Fix search path for set_updated_at function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix search path for update_timestamp function
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix search path for initialize_user_settings function
CREATE OR REPLACE FUNCTION public.initialize_user_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_settings (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$;

-- Fix search path for create_user_profile function
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$;

-- Fix search path for utility functions
CREATE OR REPLACE FUNCTION public.get_policies()
RETURNS TABLE (
    schema_name text,
    table_name text,
    policy_name text,
    permissive text,
    roles text[],
    cmd text,
    qual text,
    with_check text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname::text,
        tablename::text,
        policyname::text,
        permissive::text,
        roles::text[],
        cmd::text,
        qual::text,
        with_check::text
    FROM pg_policies
    WHERE schemaname = 'public';
END;
$$;

CREATE OR REPLACE FUNCTION public.get_indexes()
RETURNS TABLE (
    schema_name text,
    table_name text,
    index_name text,
    index_def text,
    is_unique boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname::text,
        tablename::text,
        indexname::text,
        indexdef::text,
        indexdef LIKE '%UNIQUE%'::text AS is_unique
    FROM pg_indexes
    WHERE schemaname = 'public';
END;
$$;

CREATE OR REPLACE FUNCTION public.get_functions()
RETURNS TABLE (
    schema_name text,
    function_name text,
    return_type text,
    argument_types text[],
    language text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.nspname::text,
        p.proname::text,
        pg_get_function_result(p.oid)::text,
        pg_get_function_arguments(p.oid)::text[],
        l.lanname::text
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_language l ON p.prolang = l.oid
    WHERE n.nspname = 'public';
END;
$$;

CREATE OR REPLACE FUNCTION public.get_permissions()
RETURNS TABLE (
    schema_name text,
    table_name text,
    grantee text,
    privilege_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        table_schema::text,
        table_name::text,
        grantee::text,
        privilege_type::text
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public';
END;
$$;

CREATE OR REPLACE FUNCTION public.get_table_structure()
RETURNS TABLE (
    schema_name text,
    table_name text,
    column_name text,
    data_type text,
    is_nullable text,
    column_default text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        table_schema::text,
        table_name::text,
        column_name::text,
        data_type::text,
        is_nullable::text,
        column_default::text
    FROM information_schema.columns
    WHERE table_schema = 'public';
END;
$$;

CREATE OR REPLACE FUNCTION public.get_rls_policies()
RETURNS TABLE (
    schema_name text,
    table_name text,
    policy_name text,
    permissive text,
    roles text[],
    cmd text,
    qual text,
    with_check text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname::text,
        tablename::text,
        policyname::text,
        permissive::text,
        roles::text[],
        cmd::text,
        qual::text,
        with_check::text
    FROM pg_policies
    WHERE schemaname = 'public';
END;
$$;

-- Fix search path for verification functions
CREATE OR REPLACE FUNCTION public.verify_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_index_exists(index_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname = $1
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_constraint_exists(table_name text, constraint_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND constraint_name = $2
    );
END;
$$;

-- Fix search path for registration functions
CREATE OR REPLACE FUNCTION public.register_company(
    name text,
    description text,
    logo_url text,
    website_url text,
    industry text,
    size_range text,
    founded_year integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    company_id uuid;
BEGIN
    INSERT INTO public.companies (
        name, description, logo_url, website_url, 
        industry, size_range, founded_year
    )
    VALUES (
        $1, $2, $3, $4, $5, $6, $7
    )
    RETURNING id INTO company_id;
    
    RETURN company_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_verification_function(
    name text,
    description text,
    function_name text,
    parameters jsonb,
    return_type text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    function_id uuid;
BEGIN
    INSERT INTO public.verification_functions (
        name, description, function_name, parameters, return_type
    )
    VALUES (
        $1, $2, $3, $4, $5
    )
    RETURNING id INTO function_id;
    
    RETURN function_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_utility_function(
    name text,
    description text,
    function_name text,
    parameters jsonb,
    return_type text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    function_id uuid;
BEGIN
    INSERT INTO public.utility_functions (
        name, description, function_name, parameters, return_type
    )
    VALUES (
        $1, $2, $3, $4, $5
    )
    RETURNING id INTO function_id;
    
    RETURN function_id;
END;
$$;

-- Recreate policies with fixed search paths
CREATE POLICY "Admins can manage company settings"
ON public.company_settings
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage projects"
ON public.projects
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage assets"
ON public.assets
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

COMMIT; 