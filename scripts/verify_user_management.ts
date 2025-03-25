import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyUserManagement() {
  try {
    console.log('Verifying user management implementation...\n');

    // 1. Create a test user
    console.log('Testing user creation:');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test123!@#',
      email_confirm: true
    });

    if (userError) {
      console.error('❌ Error creating test user:', userError);
      return;
    }
    console.log('✅ Test user created successfully');

    // 2. Verify user preferences were automatically created
    console.log('\nVerifying user preferences:');
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (prefError) {
      console.error('❌ Error fetching user preferences:', prefError);
    } else {
      console.log('✅ User preferences created automatically');
      console.log('✅ Default theme:', preferences.theme);
      console.log('✅ Default language:', preferences.language);
      console.log('✅ Default timezone:', preferences.timezone);
    }

    // 3. Verify security settings were automatically created
    console.log('\nVerifying security settings:');
    const { data: security, error: secError } = await supabase
      .from('security_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (secError) {
      console.error('❌ Error fetching security settings:', secError);
    } else {
      console.log('✅ Security settings created automatically');
      console.log('✅ MFA enabled:', security.mfa_enabled);
      console.log('✅ Session timeout:', security.session_timeout_minutes, 'minutes');
    }

    // 4. Test updating user preferences
    console.log('\nTesting preference updates:');
    const { error: updateError } = await supabase
      .from('user_preferences')
      .update({
        theme: 'dark',
        language: 'es'
      })
      .eq('user_id', userData.user.id);

    if (updateError) {
      console.error('❌ Error updating preferences:', updateError);
    } else {
      console.log('✅ User preferences updated successfully');
    }

    // 5. Test updating security settings
    console.log('\nTesting security settings updates:');
    const { error: secUpdateError } = await supabase
      .from('security_settings')
      .update({
        mfa_enabled: true,
        mfa_method: 'app'
      })
      .eq('user_id', userData.user.id);

    if (secUpdateError) {
      console.error('❌ Error updating security settings:', secUpdateError);
    } else {
      console.log('✅ Security settings updated successfully');
    }

    // 6. Clean up - delete test user
    console.log('\nCleaning up test data:');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      userData.user.id
    );

    if (deleteError) {
      console.error('❌ Error deleting test user:', deleteError);
    } else {
      console.log('✅ Test user and related data deleted successfully');
    }

    console.log('\nVerification complete!');
    
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyUserManagement(); 