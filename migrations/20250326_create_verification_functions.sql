-- Migration: 20250326_create_verification_functions.sql
-- Description: Creates helper functions for database verification
-- Author: System

-- Function to get policies for a table
CREATE OR REPLACE FUNCTION public.get_policies(schema_name text, table_name text)
RETURNS TABLE (
    policyname text,
    permissive text,
    roles text[],
    cmd text,
    qual text,
    with_check text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.policyname,
        p.permissive,
        p.roles,
        p.cmd,
        p.qual,
        p.with_check
    FROM pg_policies p
    WHERE p.schemaname = schema_name
    AND p.tablename = table_name;
END;
$$;

-- Function to get indexes for a table
CREATE OR REPLACE FUNCTION public.get_indexes(schema_name text, table_name text)
RETURNS TABLE (
    indexname text,
    indexdef text,
    isunique boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.indexname,
        i.indexdef,
        i.isunique
    FROM pg_indexes i
    WHERE i.schemaname = schema_name
    AND i.tablename = table_name;
END;
$$;

-- Function to get functions in a schema
CREATE OR REPLACE FUNCTION public.get_functions(schema_name text)
RETURNS TABLE (
    proname text,
    prosrc text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.proname,
        p.prosrc
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = schema_name;
END;
$$;

-- Function to get permissions for a schema
CREATE OR REPLACE FUNCTION public.get_permissions(schema_name text)
RETURNS TABLE (
    role_name text,
    table_name text,
    privilege_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.rolname as role_name,
        c.relname as table_name,
        a.privilege_type
    FROM pg_roles r
    JOIN pg_auth_members m ON r.oid = m.member
    JOIN pg_authid a ON m.roleid = a.oid
    JOIN pg_class c ON a.classid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = schema_name;
END;
$$;

-- Grant execute permissions to authenticated role
GRANT EXECUTE ON FUNCTION public.get_policies TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_indexes TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_functions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_permissions TO authenticated; 