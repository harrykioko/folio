-- 1. Fix company_settings table and RLS
-- First, check if the table exists and create/update it if needed
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Next, drop any existing RLS policies on this table to start fresh
DROP POLICY IF EXISTS "Users can view their own company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can create their own company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can update their own company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can delete their own company settings" ON public.company_settings;

-- Enable RLS on the table
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create the CRUD policies
CREATE POLICY "Users can view their own company settings" 
ON public.company_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own company settings" 
ON public.company_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company settings" 
ON public.company_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company settings" 
ON public.company_settings FOR DELETE
USING (auth.uid() = user_id);
