-- Verification script for migrations 20250326
-- Tests utility functions and user management tables

-- Start transaction
BEGIN;

-- 1. Test utility functions
DO $$
DECLARE
    test_user_id uuid;
    is_admin_result boolean;
BEGIN
    -- Test set_updated_at function
    RAISE NOTICE 'Testing set_updated_at function...';
    
    -- Test is_admin function
    RAISE NOTICE 'Testing is_admin function...';
    -- Get the first user (should be admin)
    SELECT id INTO test_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    IF test_user_id IS NOT NULL THEN
        is_admin_result := public.is_admin(test_user_id);
        RAISE NOTICE 'First user admin status: %', is_admin_result;
        IF NOT is_admin_result THEN
            RAISE EXCEPTION 'is_admin function failed: First user should be admin';
        END IF;
    ELSE
        RAISE EXCEPTION 'No users found in auth.users table';
    END IF;
END $$;

-- 2. Test user_preferences table
DO $$
DECLARE
    test_user_id uuid;
    pref_id uuid;
BEGIN
    RAISE NOTICE 'Testing user_preferences table...';
    
    -- Get a test user
    SELECT id INTO test_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found for testing';
    END IF;
    
    -- Check if preferences exist
    SELECT id INTO pref_id FROM public.user_preferences WHERE user_id = test_user_id;
    IF pref_id IS NULL THEN
        RAISE EXCEPTION 'User preferences not created for test user';
    END IF;
    
    -- Test constraints
    BEGIN
        INSERT INTO public.user_preferences (user_id, theme) 
        VALUES (test_user_id, 'invalid_theme');
        RAISE EXCEPTION 'Theme constraint check failed';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Theme constraint check passed';
    END;
    
    BEGIN
        INSERT INTO public.user_preferences (user_id, language) 
        VALUES (test_user_id, 'invalid_language');
        RAISE EXCEPTION 'Language constraint check failed';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Language constraint check passed';
    END;
END $$;

-- 3. Test security_settings table
DO $$
DECLARE
    test_user_id uuid;
    sec_id uuid;
BEGIN
    RAISE NOTICE 'Testing security_settings table...';
    
    -- Get a test user
    SELECT id INTO test_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found for testing';
    END IF;
    
    -- Check if security settings exist
    SELECT id INTO sec_id FROM public.security_settings WHERE user_id = test_user_id;
    IF sec_id IS NULL THEN
        RAISE EXCEPTION 'Security settings not created for test user';
    END IF;
    
    -- Test constraints
    BEGIN
        INSERT INTO public.security_settings (user_id, mfa_method) 
        VALUES (test_user_id, 'invalid_method');
        RAISE EXCEPTION 'MFA method constraint check failed';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'MFA method constraint check passed';
    END;
    
    BEGIN
        INSERT INTO public.security_settings (user_id, session_timeout_minutes) 
        VALUES (test_user_id, 10);
        RAISE EXCEPTION 'Session timeout constraint check failed';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Session timeout constraint check passed';
    END;
END $$;

-- 4. Test RLS policies
DO $$
DECLARE
    test_user_id uuid;
    other_user_id uuid;
    pref_count integer;
    sec_count integer;
BEGIN
    RAISE NOTICE 'Testing RLS policies...';
    
    -- Get two different users
    SELECT id INTO test_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    SELECT id INTO other_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
    
    IF test_user_id IS NULL OR other_user_id IS NULL THEN
        RAISE EXCEPTION 'Need at least two users for RLS testing';
    END IF;
    
    -- Test user_preferences RLS
    SET request.jwt.claim.sub = test_user_id::text;
    SELECT COUNT(*) INTO pref_count FROM public.user_preferences;
    RAISE NOTICE 'User preferences visible to test user: %', pref_count;
    
    SET request.jwt.claim.sub = other_user_id::text;
    SELECT COUNT(*) INTO pref_count FROM public.user_preferences;
    RAISE NOTICE 'User preferences visible to other user: %', pref_count;
    
    -- Test security_settings RLS
    SET request.jwt.claim.sub = test_user_id::text;
    SELECT COUNT(*) INTO sec_count FROM public.security_settings;
    RAISE NOTICE 'Security settings visible to test user: %', sec_count;
    
    SET request.jwt.claim.sub = other_user_id::text;
    SELECT COUNT(*) INTO sec_count FROM public.security_settings;
    RAISE NOTICE 'Security settings visible to other user: %', sec_count;
END $$;

-- 5. Test triggers
DO $$
DECLARE
    test_user_id uuid;
    pref_id uuid;
    sec_id uuid;
    old_updated_at timestamptz;
    new_updated_at timestamptz;
BEGIN
    RAISE NOTICE 'Testing triggers...';
    
    -- Get a test user
    SELECT id INTO test_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found for testing';
    END IF;
    
    -- Test user_preferences trigger
    SELECT id, updated_at INTO pref_id, old_updated_at 
    FROM public.user_preferences 
    WHERE user_id = test_user_id;
    
    UPDATE public.user_preferences 
    SET theme = 'dark' 
    WHERE id = pref_id;
    
    SELECT updated_at INTO new_updated_at 
    FROM public.user_preferences 
    WHERE id = pref_id;
    
    IF new_updated_at <= old_updated_at THEN
        RAISE EXCEPTION 'user_preferences updated_at trigger failed';
    END IF;
    RAISE NOTICE 'user_preferences trigger test passed';
    
    -- Test security_settings trigger
    SELECT id, updated_at INTO sec_id, old_updated_at 
    FROM public.security_settings 
    WHERE user_id = test_user_id;
    
    UPDATE public.security_settings 
    SET mfa_enabled = true 
    WHERE id = sec_id;
    
    SELECT updated_at INTO new_updated_at 
    FROM public.security_settings 
    WHERE id = sec_id;
    
    IF new_updated_at <= old_updated_at THEN
        RAISE EXCEPTION 'security_settings updated_at trigger failed';
    END IF;
    RAISE NOTICE 'security_settings trigger test passed';
END $$;

-- 6. Test user initialization trigger
DO $$
DECLARE
    new_user_id uuid;
    pref_count integer;
    sec_count integer;
BEGIN
    RAISE NOTICE 'Testing user initialization trigger...';
    
    -- Create a new user
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
    VALUES ('test@example.com', crypt('password123', gen_salt('bf')), now())
    RETURNING id INTO new_user_id;
    
    -- Check if preferences and settings were created
    SELECT COUNT(*) INTO pref_count FROM public.user_preferences WHERE user_id = new_user_id;
    SELECT COUNT(*) INTO sec_count FROM public.security_settings WHERE user_id = new_user_id;
    
    IF pref_count = 0 OR sec_count = 0 THEN
        RAISE EXCEPTION 'User initialization trigger failed';
    END IF;
    
    RAISE NOTICE 'User initialization trigger test passed';
    
    -- Cleanup
    DELETE FROM auth.users WHERE id = new_user_id;
END $$;

COMMIT; 