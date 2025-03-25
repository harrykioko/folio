-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own dashboard settings" ON public.dashboard_settings;
DROP POLICY IF EXISTS "Users can insert own dashboard settings" ON public.dashboard_settings;
DROP POLICY IF EXISTS "Users can update own dashboard settings" ON public.dashboard_settings;
DROP POLICY IF EXISTS "Users can delete own dashboard settings" ON public.dashboard_settings;

DROP POLICY IF EXISTS "Service role can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view active companies" ON public.companies;

DROP POLICY IF EXISTS "Service role can manage verification functions" ON public.verification_functions;
DROP POLICY IF EXISTS "Users can view active verification functions" ON public.verification_functions;

DROP POLICY IF EXISTS "Service role can manage utility functions" ON public.utility_functions;
DROP POLICY IF EXISTS "Users can view active utility functions" ON public.utility_functions;

-- Create optimized policies for profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
    ON public.profiles
    USING ((SELECT auth.jwt() ->> 'role' = 'admin'))
    WITH CHECK ((SELECT auth.jwt() ->> 'role' = 'admin'));

-- Create optimized policies for dashboard settings
CREATE POLICY "Users can manage own dashboard settings"
    ON public.dashboard_settings
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create optimized policies for companies
CREATE POLICY "Users can view active companies"
    ON public.companies
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage companies"
    ON public.companies
    USING ((SELECT auth.jwt() ->> 'role' = 'service_role'))
    WITH CHECK ((SELECT auth.jwt() ->> 'role' = 'service_role'));

-- Create optimized policies for verification functions
CREATE POLICY "Users can view active verification functions"
    ON public.verification_functions
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage verification functions"
    ON public.verification_functions
    USING ((SELECT auth.jwt() ->> 'role' = 'service_role'))
    WITH CHECK ((SELECT auth.jwt() ->> 'role' = 'service_role'));

-- Create optimized policies for utility functions
CREATE POLICY "Users can view active utility functions"
    ON public.utility_functions
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage utility functions"
    ON public.utility_functions
    USING ((SELECT auth.jwt() ->> 'role' = 'service_role'))
    WITH CHECK ((SELECT auth.jwt() ->> 'role' = 'service_role')); 