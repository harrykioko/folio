BEGIN;

-- Function to check for multiple permissive policies
CREATE OR REPLACE FUNCTION public.check_multiple_permissive_policies()
RETURNS TABLE (
    table_name text,
    policy_count bigint,
    policy_names text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tablename::text,
        COUNT(*)::bigint,
        array_agg(policyname::text)
    FROM pg_policies
    WHERE permissive = 'PERMISSIVE'
    GROUP BY tablename
    HAVING COUNT(*) > 1;
END;
$$;

-- Function to check for auth_rls_initplan warnings
CREATE OR REPLACE FUNCTION public.check_auth_rls_initplan()
RETURNS TABLE (
    table_name text,
    policy_name text,
    policy_definition text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tablename::text,
        policyname::text,
        qual::text
    FROM pg_policies
    WHERE qual::text LIKE '%auth.%'
    AND qual::text NOT LIKE '%(select auth.%';
END;
$$;

-- Function to check for potential index opportunities
CREATE OR REPLACE FUNCTION public.check_index_opportunities()
RETURNS TABLE (
    table_name text,
    column_name text,
    usage_count bigint,
    current_indexes text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.relname::text,
        a.attname::text,
        COUNT(*)::bigint,
        array_agg(DISTINCT i.indexname::text)
    FROM pg_stat_user_tables t
    JOIN pg_attribute a ON a.attrelid = t.relid
    LEFT JOIN pg_indexes i ON i.tablename = t.relname
    WHERE t.seq_scan > 0
    AND a.attnum > 0
    AND NOT a.attisdropped
    GROUP BY t.relname, a.attname
    HAVING COUNT(*) > 1000
    ORDER BY COUNT(*) DESC;
END;
$$;

-- Execute checks and store results
DO $$
DECLARE
    v_multiple_policies record;
    v_auth_warnings record;
    v_index_opportunities record;
BEGIN
    RAISE NOTICE 'Checking for multiple permissive policies...';
    FOR v_multiple_policies IN 
        SELECT * FROM public.check_multiple_permissive_policies()
    LOOP
        RAISE NOTICE 'Table % has % permissive policies: %', 
            v_multiple_policies.table_name,
            v_multiple_policies.policy_count,
            v_multiple_policies.policy_names;
    END LOOP;

    RAISE NOTICE 'Checking for auth_rls_initplan warnings...';
    FOR v_auth_warnings IN 
        SELECT * FROM public.check_auth_rls_initplan()
    LOOP
        RAISE NOTICE 'Table % has potential auth_rls_initplan warning in policy %: %', 
            v_auth_warnings.table_name,
            v_auth_warnings.policy_name,
            v_auth_warnings.policy_definition;
    END LOOP;

    RAISE NOTICE 'Checking for index opportunities...';
    FOR v_index_opportunities IN 
        SELECT * FROM public.check_index_opportunities()
    LOOP
        RAISE NOTICE 'Table % column % has % usages. Current indexes: %', 
            v_index_opportunities.table_name,
            v_index_opportunities.column_name,
            v_index_opportunities.usage_count,
            v_index_opportunities.current_indexes;
    END LOOP;
END $$;

COMMIT; 