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

-- Create verification functions table
CREATE TABLE IF NOT EXISTS public.verification_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    function_type VARCHAR(50) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    return_type VARCHAR(50) NOT NULL,
    implementation TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    last_modified_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verification_functions_name ON public.verification_functions(name);
CREATE INDEX IF NOT EXISTS idx_verification_functions_type ON public.verification_functions(function_type);
CREATE INDEX IF NOT EXISTS idx_verification_functions_created_by ON public.verification_functions(created_by);
CREATE INDEX IF NOT EXISTS idx_verification_functions_last_modified_by ON public.verification_functions(last_modified_by);

-- Enable Row Level Security
ALTER TABLE public.verification_functions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view active verification functions"
    ON public.verification_functions
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage verification functions"
    ON public.verification_functions
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Create updated_at trigger
CREATE TRIGGER set_verification_functions_updated_at
    BEFORE UPDATE ON public.verification_functions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Create function to register a verification function
CREATE OR REPLACE FUNCTION register_verification_function(
    p_name VARCHAR,
    p_description TEXT,
    p_function_type VARCHAR,
    p_parameters JSONB,
    p_return_type VARCHAR,
    p_implementation TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.verification_functions (
        name,
        description,
        function_type,
        parameters,
        return_type,
        implementation,
        created_by,
        last_modified_by
    ) VALUES (
        p_name,
        p_description,
        p_function_type,
        p_parameters,
        p_return_type,
        p_implementation,
        auth.uid(),
        auth.uid()
    ) RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION register_verification_function TO authenticated; 