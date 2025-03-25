-- First, create the database utility functions
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

-- Create the fixed version of the RLS policies function
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

-- Create companies table first (since it's referenced by other tables)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    industry VARCHAR(100),
    size_range VARCHAR(50),
    founded_year INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    last_modified_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create indexes for companies
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);
CREATE INDEX IF NOT EXISTS idx_companies_last_modified_by ON public.companies(last_modified_by);

-- Enable Row Level Security for companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
DROP POLICY IF EXISTS "Users can view active companies" ON public.companies;
DROP POLICY IF EXISTS "Service role can manage companies" ON public.companies;

CREATE POLICY "Users can view active companies"
    ON public.companies
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage companies"
    ON public.companies
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Create updated_at trigger for companies
DROP TRIGGER IF EXISTS set_companies_updated_at ON public.companies;
CREATE TRIGGER set_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Create dashboard settings table
CREATE TABLE IF NOT EXISTS public.dashboard_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    layout JSONB NOT NULL DEFAULT '{}'::jsonb,
    widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
    theme VARCHAR(50) NOT NULL DEFAULT 'light',
    refresh_interval INTEGER NOT NULL DEFAULT 300,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

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

-- Create utility functions table
CREATE TABLE IF NOT EXISTS public.utility_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_dashboard_settings_user_id ON public.dashboard_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_settings_company_id ON public.dashboard_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_verification_functions_name ON public.verification_functions(name);
CREATE INDEX IF NOT EXISTS idx_verification_functions_type ON public.verification_functions(function_type);
CREATE INDEX IF NOT EXISTS idx_verification_functions_created_by ON public.verification_functions(created_by);
CREATE INDEX IF NOT EXISTS idx_verification_functions_last_modified_by ON public.verification_functions(last_modified_by);
CREATE INDEX IF NOT EXISTS idx_utility_functions_name ON public.utility_functions(name);
CREATE INDEX IF NOT EXISTS idx_utility_functions_category ON public.utility_functions(category);
CREATE INDEX IF NOT EXISTS idx_utility_functions_created_by ON public.utility_functions(created_by);
CREATE INDEX IF NOT EXISTS idx_utility_functions_last_modified_by ON public.utility_functions(last_modified_by);

-- Enable Row Level Security
ALTER TABLE public.dashboard_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_functions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dashboard_settings
DROP POLICY IF EXISTS "Users can view their own dashboard settings" ON public.dashboard_settings;
DROP POLICY IF EXISTS "Users can insert their own dashboard settings" ON public.dashboard_settings;
DROP POLICY IF EXISTS "Users can update their own dashboard settings" ON public.dashboard_settings;
DROP POLICY IF EXISTS "Users can delete their own dashboard settings" ON public.dashboard_settings;

CREATE POLICY "Users can view their own dashboard settings"
    ON public.dashboard_settings
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard settings"
    ON public.dashboard_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard settings"
    ON public.dashboard_settings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard settings"
    ON public.dashboard_settings
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for verification_functions
DROP POLICY IF EXISTS "Users can view active verification functions" ON public.verification_functions;
DROP POLICY IF EXISTS "Service role can manage verification functions" ON public.verification_functions;

CREATE POLICY "Users can view active verification functions"
    ON public.verification_functions
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage verification functions"
    ON public.verification_functions
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Create RLS policies for utility_functions
DROP POLICY IF EXISTS "Users can view active utility functions" ON public.utility_functions;
DROP POLICY IF EXISTS "Service role can manage utility functions" ON public.utility_functions;

CREATE POLICY "Users can view active utility functions"
    ON public.utility_functions
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage utility functions"
    ON public.utility_functions
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Create updated_at triggers
DROP TRIGGER IF EXISTS set_dashboard_settings_updated_at ON public.dashboard_settings;
DROP TRIGGER IF EXISTS set_verification_functions_updated_at ON public.verification_functions;
DROP TRIGGER IF EXISTS set_utility_functions_updated_at ON public.utility_functions;

CREATE TRIGGER set_dashboard_settings_updated_at
    BEFORE UPDATE ON public.dashboard_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_verification_functions_updated_at
    BEFORE UPDATE ON public.verification_functions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_utility_functions_updated_at
    BEFORE UPDATE ON public.utility_functions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Create registration functions
CREATE OR REPLACE FUNCTION register_company(
    p_name VARCHAR,
    p_description TEXT,
    p_logo_url TEXT,
    p_website_url TEXT,
    p_industry VARCHAR,
    p_size_range VARCHAR,
    p_founded_year INTEGER
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.companies (
        name,
        description,
        logo_url,
        website_url,
        industry,
        size_range,
        founded_year,
        created_by,
        last_modified_by
    ) VALUES (
        p_name,
        p_description,
        p_logo_url,
        p_website_url,
        p_industry,
        p_size_range,
        p_founded_year,
        auth.uid(),
        auth.uid()
    ) RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;

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

CREATE OR REPLACE FUNCTION register_utility_function(
    p_name VARCHAR,
    p_description TEXT,
    p_category VARCHAR,
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
    INSERT INTO public.utility_functions (
        name,
        description,
        category,
        parameters,
        return_type,
        implementation,
        created_by,
        last_modified_by
    ) VALUES (
        p_name,
        p_description,
        p_category,
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
GRANT EXECUTE ON FUNCTION get_table_structure(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rls_policies() TO authenticated;
GRANT EXECUTE ON FUNCTION register_company TO authenticated;
GRANT EXECUTE ON FUNCTION register_verification_function TO authenticated;
GRANT EXECUTE ON FUNCTION register_utility_function TO authenticated; 