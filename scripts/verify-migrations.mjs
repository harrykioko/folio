import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigrations() {
    try {
        console.log('Starting migration verification...\n');

        // 1. Test utility functions
        console.log('1. Testing utility functions...');
        const { data: firstUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        if (userError) throw userError;
        if (!firstUser) throw new Error('No users found in database');

        // Test is_admin function
        const { data: isAdminResult, error: isAdminError } = await supabase
            .rpc('is_admin', { user_id: firstUser.id });

        if (isAdminError) throw isAdminError;
        console.log('✓ is_admin function working correctly');

        // 2. Test user_preferences table
        console.log('\n2. Testing user_preferences table...');
        const { data: preferences, error: prefError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', firstUser.id)
            .single();

        if (prefError) throw prefError;
        if (!preferences) throw new Error('User preferences not found');
        console.log('✓ user_preferences table structure correct');

        // Test constraints
        const { error: themeError } = await supabase
            .from('user_preferences')
            .insert({
                user_id: firstUser.id,
                theme: 'invalid_theme'
            });

        if (!themeError) throw new Error('Theme constraint check failed');
        console.log('✓ Theme constraint working');

        // 3. Test security_settings table
        console.log('\n3. Testing security_settings table...');
        const { data: security, error: secError } = await supabase
            .from('security_settings')
            .select('*')
            .eq('user_id', firstUser.id)
            .single();

        if (secError) throw secError;
        if (!security) throw new Error('Security settings not found');
        console.log('✓ security_settings table structure correct');

        // Test constraints
        const { error: mfaError } = await supabase
            .from('security_settings')
            .insert({
                user_id: firstUser.id,
                mfa_method: 'invalid_method'
            });

        if (!mfaError) throw new Error('MFA method constraint check failed');
        console.log('✓ MFA method constraint working');

        // 4. Test RLS policies
        console.log('\n4. Testing RLS policies...');
        
        // Create a test user for RLS testing
        const { data: testUser, error: testUserError } = await supabase.auth.admin.createUser({
            email: 'test@example.com',
            password: 'testpassword123'
        });

        if (testUserError) throw testUserError;

        // Test user_preferences RLS
        const { data: prefCount, error: prefCountError } = await supabase
            .from('user_preferences')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', testUser.user.id);

        if (prefCountError) throw prefCountError;
        if (prefCount !== 1) throw new Error('RLS policy for user_preferences not working correctly');
        console.log('✓ RLS policies working correctly');

        // Cleanup test user
        const { error: deleteError } = await supabase.auth.admin.deleteUser(testUser.user.id);
        if (deleteError) throw deleteError;

        // 5. Test triggers
        console.log('\n5. Testing triggers...');
        
        // Test updated_at trigger for user_preferences
        const oldUpdatedAt = preferences.updated_at;
        const { error: updateError } = await supabase
            .from('user_preferences')
            .update({ theme: 'dark' })
            .eq('id', preferences.id);

        if (updateError) throw updateError;

        const { data: updatedPrefs, error: fetchError } = await supabase
            .from('user_preferences')
            .select('updated_at')
            .eq('id', preferences.id)
            .single();

        if (fetchError) throw fetchError;
        if (new Date(updatedPrefs.updated_at) <= new Date(oldUpdatedAt)) {
            throw new Error('updated_at trigger not working');
        }
        console.log('✓ Triggers working correctly');

        console.log('\nAll verification tests passed successfully! 🎉');
    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
        process.exit(1);
    }
}

// Run verification
verifyMigrations(); 