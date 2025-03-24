-- Simplified Test script for Settings tables RLS policies
-- Purpose: Verify that Row Level Security is working correctly for all settings tables

-- Step 1: Create test users with different roles
INSERT INTO auth.users (id, email, role) VALUES
('11111111-1111-1111-1111-111111111111', 'admin_test@example.com', 'authenticated'),
('22222222-2222-2222-2222-222222222222', 'regular_test@example.com', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create profiles with appropriate roles
INSERT INTO public.profiles (id, first_name, last_name, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Admin', 'User', 'admin'),
('22222222-2222-2222-2222-222222222222', 'Regular', 'User', 'user')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- Step 3: Create preferences for both users
INSERT INTO public.user_preferences (id, user_id, theme) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'dark'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'light')
ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme;

-- Step 4: Create company and security settings
INSERT INTO public.company_settings (id, name, contact_email, created_by) VALUES
(gen_random_uuid(), 'Test Company', 'company@example.com', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

INSERT INTO public.security_settings (id, require_mfa, created_by) VALUES
(gen_random_uuid(), TRUE, '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Step 5: Test as admin user
SELECT '===== ADMIN USER TESTS =====' AS test_section;
SET LOCAL ROLE postgres;
SET LOCAL "request.jwt.claim.sub" TO '11111111-1111-1111-1111-111111111111';

-- Test company_settings access
SELECT 'Company Settings (Admin View)' AS test;
SELECT id, name, contact_email FROM public.company_settings;

-- Test security_settings access
SELECT 'Security Settings (Admin View)' AS test;
SELECT id, require_mfa FROM public.security_settings;

-- Test user_preferences access (should see all as admin)
SELECT 'User Preferences (Admin View)' AS test;
SELECT id, user_id, theme FROM public.user_preferences ORDER BY user_id;

-- Step 6: Test as regular user
SELECT '===== REGULAR USER TESTS =====' AS test_section;
SET LOCAL "request.jwt.claim.sub" TO '22222222-2222-2222-2222-222222222222';

-- Test company_settings access (should be able to view only)
SELECT 'Company Settings (Regular User View)' AS test;
SELECT id, name, contact_email FROM public.company_settings;

-- Test company_settings update (should fail due to RLS)
SELECT 'Company Settings Update (Should Fail)' AS test;
UPDATE public.company_settings SET name = 'Updated by Regular User' RETURNING id, name;

-- Test security_settings access (should be able to view only)
SELECT 'Security Settings (Regular User View)' AS test;
SELECT id, require_mfa FROM public.security_settings;

-- Test security_settings update (should fail due to RLS)
SELECT 'Security Settings Update (Should Fail)' AS test;
UPDATE public.security_settings SET require_mfa = FALSE RETURNING id, require_mfa;

-- Test user_preferences access (should only see own preferences)
SELECT 'User Preferences (Regular User View)' AS test;
SELECT id, user_id, theme FROM public.user_preferences ORDER BY user_id;

-- Test user_preferences update (should only update own preferences)
SELECT 'User Preferences Update (Own)' AS test;
UPDATE public.user_preferences 
SET theme = 'system' 
WHERE user_id = '22222222-2222-2222-2222-222222222222'
RETURNING id, user_id, theme;

-- Test user_preferences update (should fail on other's preferences)
SELECT 'User Preferences Update (Other - Should Fail)' AS test;
UPDATE public.user_preferences 
SET theme = 'hacked' 
WHERE user_id = '11111111-1111-1111-1111-111111111111'
RETURNING id, user_id, theme;

-- Reset role
RESET ROLE;
RESET "request.jwt.claim.sub";

SELECT '===== RLS POLICY TESTING COMPLETE =====' AS status;
