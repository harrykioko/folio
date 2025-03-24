-- Test RLS policies for company_settings table

-- Make sure we have test users set up
DO $$
BEGIN
  -- Create admin user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111') THEN
    INSERT INTO auth.users (id, email, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin_test@example.com', 'authenticated');
  END IF;
  
  -- Create regular user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '22222222-2222-2222-2222-222222222222') THEN
    INSERT INTO auth.users (id, email, role) VALUES
    ('22222222-2222-2222-2222-222222222222', 'regular_test@example.com', 'authenticated');
  END IF;
  
  -- Create admin profile if not exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111') THEN
    INSERT INTO public.profiles (id, first_name, last_name, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Admin', 'User', 'admin');
  ELSE
    UPDATE public.profiles SET role = 'admin' WHERE id = '11111111-1111-1111-1111-111111111111';
  END IF;
  
  -- Create regular user profile if not exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '22222222-2222-2222-2222-222222222222') THEN
    INSERT INTO public.profiles (id, first_name, last_name, role) VALUES
    ('22222222-2222-2222-2222-222222222222', 'Regular', 'User', 'user');
  ELSE
    UPDATE public.profiles SET role = 'user' WHERE id = '22222222-2222-2222-2222-222222222222';
  END IF;
  
  -- Create or update company settings
  IF NOT EXISTS (SELECT 1 FROM public.company_settings LIMIT 1) THEN
    INSERT INTO public.company_settings (name, contact_email, created_by) VALUES
    ('Test Company', 'company@example.com', '11111111-1111-1111-1111-111111111111');
  END IF;
END $$;

-- Display current company settings
SELECT 'Current company_settings:' as info;
SELECT id, name, contact_email FROM public.company_settings;

-- 1. Test as admin user
SELECT '===== TESTING AS ADMIN USER =====' as test_section;

BEGIN;
-- Set auth context to admin user
SET LOCAL ROLE postgres;
SET LOCAL "auth.uid" TO '11111111-1111-1111-1111-111111111111';

-- Try to view company settings as admin (should succeed)
SELECT 'Admin viewing company_settings:' as test;
SELECT id, name, contact_email FROM public.company_settings;

-- Try to update company settings as admin (should succeed)
SELECT 'Admin updating company_settings:' as test;
UPDATE public.company_settings 
SET name = 'Updated by Admin', contact_email = 'admin@example.com' 
RETURNING id, name, contact_email;

ROLLBACK;

-- 2. Test as regular user
SELECT '===== TESTING AS REGULAR USER =====' as test_section;

BEGIN;
-- Set auth context to regular user
SET LOCAL ROLE postgres;
SET LOCAL "auth.uid" TO '22222222-2222-2222-2222-222222222222';

-- Try to view company settings as regular user (should succeed)
SELECT 'Regular user viewing company_settings:' as test;
SELECT id, name, contact_email FROM public.company_settings;

-- Try to update company settings as regular user (should fail)
SELECT 'Regular user attempting to update company_settings:' as test;
UPDATE public.company_settings 
SET name = 'Hacked by Regular User', contact_email = 'hacked@example.com' 
RETURNING id, name, contact_email;

ROLLBACK;

-- Reset role
RESET ROLE;
RESET "auth.uid";

SELECT '===== COMPANY SETTINGS RLS TEST COMPLETE =====' as status;
