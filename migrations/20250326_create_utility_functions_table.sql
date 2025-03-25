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
CREATE INDEX IF NOT EXISTS idx_utility_functions_name ON public.utility_functions(name);
CREATE INDEX IF NOT EXISTS idx_utility_functions_category ON public.utility_functions(category);
CREATE INDEX IF NOT EXISTS idx_utility_functions_created_by ON public.utility_functions(created_by);
CREATE INDEX IF NOT EXISTS idx_utility_functions_last_modified_by ON public.utility_functions(last_modified_by);

-- Enable Row Level Security
ALTER TABLE public.utility_functions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view active utility functions"
    ON public.utility_functions
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage utility functions"
    ON public.utility_functions
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Create updated_at trigger
CREATE TRIGGER set_utility_functions_updated_at
    BEFORE UPDATE ON public.utility_functions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Create function to register a utility function
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
GRANT EXECUTE ON FUNCTION register_utility_function TO authenticated; 