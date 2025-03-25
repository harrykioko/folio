BEGIN;

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.get_policies() CASCADE;
DROP FUNCTION IF EXISTS public.get_indexes() CASCADE;
DROP FUNCTION IF EXISTS public.get_functions() CASCADE;
DROP FUNCTION IF EXISTS public.get_permissions() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_table_structure() CASCADE;
DROP FUNCTION IF EXISTS public.verify_index_exists(text) CASCADE;
DROP FUNCTION IF EXISTS public.register_company(text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.register_verification_function(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.register_utility_function(text, text, text) CASCADE;

-- Fix function search path mutable warnings
-- Create user profile
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$;

-- Get policies
CREATE OR REPLACE FUNCTION public.get_policies()
RETURNS TABLE (
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
        schemaname || '.' || tablename as table_name,
        policyname as policy_name,
        permissive::text,
        roles::text[],
        cmd::text,
        qual::text,
        with_check::text
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
END;
$$;

-- Get indexes
CREATE OR REPLACE FUNCTION public.get_indexes()
RETURNS TABLE (
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
        schemaname || '.' || tablename as table_name,
        indexname as index_name,
        indexdef as index_def,
        indexdef LIKE '%UNIQUE%' as is_unique
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
END;
$$;

-- Get functions
CREATE OR REPLACE FUNCTION public.get_functions()
RETURNS TABLE (
    function_name text,
    return_type text,
    parameters text,
    language text,
    security_definer boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.proname as function_name,
        pg_get_function_result(p.oid) as return_type,
        pg_get_function_arguments(p.oid) as parameters,
        l.lanname as language,
        p.prosecdef as security_definer
    FROM pg_proc p
    JOIN pg_language l ON p.prolang = l.oid
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    ORDER BY p.proname;
END;
$$;

-- Get permissions
CREATE OR REPLACE FUNCTION public.get_permissions()
RETURNS TABLE (
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
        schemaname || '.' || tablename as table_name,
        grantee,
        privilege_type
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
    ORDER BY table_name, grantee;
END;
$$;

-- Is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (SELECT auth.jwt() ->> 'role' = 'admin');
END;
$$;

-- Get table structure
CREATE OR REPLACE FUNCTION public.get_table_structure()
RETURNS TABLE (
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
        table_schema || '.' || table_name as table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
END;
$$;

-- Verify index exists
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
        WHERE indexname = index_name
        AND schemaname = 'public'
    );
END;
$$;

-- Register company
CREATE OR REPLACE FUNCTION public.register_company(
    company_name text,
    company_email text,
    company_phone text,
    company_address text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_company_id uuid;
BEGIN
    INSERT INTO public.companies (
        name,
        email,
        phone,
        address,
        is_active
    )
    VALUES (
        company_name,
        company_email,
        company_phone,
        company_address,
        true
    )
    RETURNING id INTO new_company_id;
    
    RETURN new_company_id;
END;
$$;

-- Register verification function
CREATE OR REPLACE FUNCTION public.register_verification_function(
    function_name text,
    function_description text,
    function_code text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_function_id uuid;
BEGIN
    INSERT INTO public.verification_functions (
        name,
        description,
        code,
        is_active
    )
    VALUES (
        function_name,
        function_description,
        function_code,
        true
    )
    RETURNING id INTO new_function_id;
    
    RETURN new_function_id;
END;
$$;

-- Register utility function
CREATE OR REPLACE FUNCTION public.register_utility_function(
    function_name text,
    function_description text,
    function_code text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_function_id uuid;
BEGIN
    INSERT INTO public.utility_functions (
        name,
        description,
        code,
        is_active
    )
    VALUES (
        function_name,
        function_description,
        function_code,
        true
    )
    RETURNING id INTO new_function_id;
    
    RETURN new_function_id;
END;
$$;

-- Verify fixes
DO $$
DECLARE
    warning record;
BEGIN
    -- Check for remaining functions without search_path
    FOR warning IN
        SELECT p.proname as function_name
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND NOT EXISTS (
            SELECT 1
            FROM pg_proc p2
            WHERE p2.oid = p.oid
            AND EXISTS (
                SELECT 1
                FROM unnest(p2.proconfig) AS config
                WHERE config LIKE 'search_path=%'
            )
        )
    LOOP
        RAISE NOTICE 'Remaining function without search_path: %',
            warning.function_name;
    END LOOP;
END $$;

COMMIT; 