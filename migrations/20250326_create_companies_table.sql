-- Create companies table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);
CREATE INDEX IF NOT EXISTS idx_companies_last_modified_by ON public.companies(last_modified_by);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view active companies"
    ON public.companies
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage companies"
    ON public.companies
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Create updated_at trigger
CREATE TRIGGER set_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Create function to register a company
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION register_company TO authenticated; 