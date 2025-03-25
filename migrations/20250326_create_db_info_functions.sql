-- Migration: 20250326_create_db_info_functions.sql
-- Description: Creates functions to get database structure information
-- Author: System

-- Function to get all tables in a schema
CREATE OR REPLACE FUNCTION public.get_tables(schema_name text)
RETURNS TABLE (table_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT t.table_name::text
    FROM information_schema.tables t
    WHERE t.table_schema = schema_name
    AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name;
END;
$$;

-- Function to get columns for a specific table
CREATE OR REPLACE FUNCTION public.get_columns(schema_name text, table_name text)
RETURNS TABLE (
    column_name text,
    data_type text,
    is_nullable text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text
    FROM information_schema.columns c
    WHERE c.table_schema = schema_name
    AND c.table_name = table_name
    ORDER BY c.ordinal_position;
END;
$$;

-- Function to get RLS policies for a specific table
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
        p.policyname::text,
        p.permissive::text,
        p.roles::text[],
        p.cmd::text,
        p.qual::text,
        p.with_check::text
    FROM pg_policies p
    WHERE p.schemaname = schema_name
    AND p.tablename = table_name
    ORDER BY p.policyname;
END;
$$; 