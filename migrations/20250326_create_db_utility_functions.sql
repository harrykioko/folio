-- Create function to get table structure
CREATE OR REPLACE FUNCTION get_table_structure(table_name text)
RETURNS TABLE (
    column_name text,
    data_type text,
    is_nullable text,
    column_default text,
    character_maximum_length integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text,
        c.column_default::text,
        c.character_maximum_length::integer
    FROM information_schema.columns c
    WHERE c.table_name = get_table_structure.table_name
    AND c.table_schema = 'public'
    ORDER BY c.ordinal_position;
END;
$$;

-- Create function to get RLS policies
CREATE OR REPLACE FUNCTION get_rls_policies()
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
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname || '.' || tablename as table_name,
        policyname as policy_name,
        permissive,
        roles,
        cmd,
        qual::text,
        with_check::text
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
END;
$$;

-- Create function to verify table exists
CREATE OR REPLACE FUNCTION verify_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = verify_table_exists.table_name 
        AND table_schema = 'public'
    );
END;
$$;

-- Create function to verify column exists
CREATE OR REPLACE FUNCTION verify_column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = verify_column_exists.table_name 
        AND column_name = verify_column_exists.column_name 
        AND table_schema = 'public'
    );
END;
$$;

-- Create function to verify index exists
CREATE OR REPLACE FUNCTION verify_index_exists(table_name text, index_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = verify_index_exists.table_name 
        AND indexname = verify_index_exists.index_name 
        AND schemaname = 'public'
    );
END;
$$;

-- Create function to verify constraint exists
CREATE OR REPLACE FUNCTION verify_constraint_exists(table_name text, constraint_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = verify_constraint_exists.table_name 
        AND constraint_name = verify_constraint_exists.constraint_name 
        AND table_schema = 'public'
    );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_table_structure(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rls_policies() TO authenticated;
GRANT EXECUTE ON FUNCTION verify_table_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_column_exists(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_index_exists(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_constraint_exists(text, text) TO authenticated; 