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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_settings_user_id ON public.dashboard_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_settings_company_id ON public.dashboard_settings(company_id);

-- Enable Row Level Security
ALTER TABLE public.dashboard_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create updated_at trigger
CREATE TRIGGER set_dashboard_settings_updated_at
    BEFORE UPDATE ON public.dashboard_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at(); 