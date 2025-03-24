-- Test script for Settings tables RLS policies
-- Purpose: Verify that Row Level Security is working correctly for all settings tables

-- 1. First, create test users with different roles
DO $$
DECLARE
    admin_user_id UUID;
    regular_user_id UUID;
BEGIN
    -- Create an admin test user if it doesn't exist
    INSERT INTO auth.users (id, email, role)
    VALUES (
        '11111111-1111-1111-1111-111111111111',
        'admin_test@example.com',
        'authenticated'
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO admin_user_id;

    -- Create a regular test user if it doesn't exist
    INSERT INTO auth.users (id, email, role)
    VALUES (
        '22222222-2222-2222-2222-222222222222',
        'regular_test@example.com',
        'authenticated'
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO regular_user_id;

    -- Create profiles with appropriate roles
    INSERT INTO public.profiles (id, first_name, last_name, role)
    VALUES (
        '11111111-1111-1111-1111-111111111111',
        'Admin',
        'User',
        'admin'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id, first_name, last_name, role)
    VALUES (
        '22222222-2222-2222-2222-222222222222',
        'Regular',
        'User',
        'user'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Create preferences for both users
    INSERT INTO public.user_preferences (user_id, theme)
    VALUES ('11111111-1111-1111-1111-111111111111', 'dark')
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_preferences (user_id, theme)
    VALUES ('22222222-2222-2222-2222-222222222222', 'light')
    ON CONFLICT (user_id) DO NOTHING;

    -- Update or insert company and security settings
    INSERT INTO public.company_settings (id, name, contact_email, created_by)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Test Company',
        'company@example.com',
        '11111111-1111-1111-1111-111111111111'
    )
    ON CONFLICT (id) DO UPDATE SET name = 'Test Company';

    INSERT INTO public.security_settings (id, require_mfa, created_by)
    VALUES (
        '00000000-0000-0000-0000-000000000002',
        TRUE,
        '11111111-1111-1111-1111-111111111111'
    )
    ON CONFLICT (id) DO UPDATE SET require_mfa = TRUE;
END;
$$;

-- 2. Test as admin user
SELECT 'ADMIN USER TESTS' AS test_type;

-- Set context to admin user
SET LOCAL ROLE postgres;
SELECT set_config('auth.uid', '11111111-1111-1111-1111-111111111111', TRUE);

-- Test company_settings access
SELECT 'Company Settings (Admin View)' AS table_test;
SELECT id, name, contact_email FROM public.company_settings;

-- Test company_settings update
BEGIN;
UPDATE public.company_settings SET name = 'Updated by Admin';
SELECT 'Company Settings (After Admin Update)' AS table_test;
SELECT id, name, contact_email FROM public.company_settings;
ROLLBACK;

-- Test security_settings access
SELECT 'Security Settings (Admin View)' AS table_test;
SELECT id, require_mfa FROM public.security_settings;

-- Test security_settings update
BEGIN;
UPDATE public.security_settings SET require_mfa = FALSE;
SELECT 'Security Settings (After Admin Update)' AS table_test;
SELECT id, require_mfa FROM public.security_settings;
ROLLBACK;

-- Test user_preferences access (should see all as admin)
SELECT 'User Preferences (Admin View)' AS table_test;
SELECT user_id, theme FROM public.user_preferences;

-- 3. Test as regular user
SELECT 'REGULAR USER TESTS' AS test_type;

-- Set context to regular user
SELECT set_config('auth.uid', '22222222-2222-2222-2222-222222222222', TRUE);

-- Test company_settings access (should be able to view only)
SELECT 'Company Settings (Regular User View)' AS table_test;
SELECT id, name, contact_email FROM public.company_settings;

-- Test company_settings update (should fail due to RLS)
BEGIN;
UPDATE public.company_settings SET name = 'Updated by Regular User';
SELECT 'Company Settings (After Regular User Update Attempt)' AS table_test;
SELECT id, name, contact_email FROM public.company_settings;
ROLLBACK;

-- Test security_settings access (should be able to view only)
SELECT 'Security Settings (Regular User View)' AS table_test;
SELECT id, require_mfa FROM public.security_settings;

-- Test security_settings update (should fail due to RLS)
BEGIN;
UPDATE public.security_settings SET require_mfa = FALSE;
SELECT 'Security Settings (After Regular User Update Attempt)' AS table_test;
SELECT id, require_mfa FROM public.security_settings;
ROLLBACK;

-- Test user_preferences access (should only see own preferences)
SELECT 'User Preferences (Regular User View)' AS table_test;
SELECT user_id, theme FROM public.user_preferences;

-- Test user_preferences update (should be able to update own preferences)
BEGIN;
UPDATE public.user_preferences 
SET theme = 'system' 
WHERE user_id = '22222222-2222-2222-2222-222222222222';
SELECT 'User Preferences (After Regular User Update)' AS table_test;
SELECT user_id, theme FROM public.user_preferences;
ROLLBACK;

-- Test user_preferences update (should not be able to update other user's preferences)
BEGIN;
UPDATE public.user_preferences 
SET theme = 'hacked' 
WHERE user_id = '11111111-1111-1111-1111-111111111111';
SELECT 'User Preferences (After Regular User Attempted Update of Admin)' AS table_test;
SELECT user_id, theme FROM public.user_preferences;
ROLLBACK;

-- Reset context
RESET ROLE;
RESET "auth.uid";

SELECT 'RLS POLICY TESTING COMPLETE' AS status;
