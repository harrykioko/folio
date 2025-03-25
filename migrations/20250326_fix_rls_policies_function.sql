-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_rls_policies();

-- Create the fixed version of the function
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
        p.permissive::text,
        p.roles,
        p.cmd::text,
        p.qual::text,
        p.with_check::text
    FROM pg_policies p
    WHERE p.schemaname = 'public'
    ORDER BY p.tablename, p.policyname;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_rls_policies() TO authenticated; 