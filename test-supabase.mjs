// ESM module format
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = "https://dnjookyyhfnxvjyytggt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam9va3l5aGZueHZqeXl0Z2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjA0NTEsImV4cCI6MjA1ODMzNjQ1MX0.7emCEDqiIpOPJcbK0Uc2YKqCcw7zw8OeAt3wF0N_dck";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam9va3l5aGZueHZqeXl0Z2d0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjc2MDQ1MSwiZXhwIjoyMDU4MzM2NDUxfQ._20BFqHQlIAPVNsIKZuLeFTRwJXCVmiDAiWOesUQYlg";

// Create a Supabase client with the service role key for full access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test UUID for our test record
const TEST_UUID = '11111111-1111-1111-1111-111111111111';

async function testSupabase() {
    console.log('🔍 Testing Supabase connection...');
    console.log(`🌐 Using URL: ${SUPABASE_URL}`);

    try {
        // -------------- TEST READ OPERATION --------------
        console.log('\n📖 Testing READ operation...');
        const { data: profiles, error: readError } = await supabase
            .from('profiles')
            .select('*')
            .limit(5);

        if (readError) {
            console.error('❌ READ ERROR:', readError);
            return;
        }

        console.log('✅ READ successful!');
        console.log(`📊 Found ${profiles.length} profiles`);
        if (profiles.length > 0) {
            console.log('📝 First profile sample:', {
                id: profiles[0].id,
                name: `${profiles[0].first_name} ${profiles[0].last_name}`,
                role: profiles[0].role
            });
        }

        // -------------- TEST WRITE OPERATION --------------
        console.log('\n✏️ Testing WRITE operation...');
        const testProfile = {
            id: TEST_UUID,
            first_name: 'Test',
            last_name: 'User',
            role: 'test',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // First, check if the test record already exists (and delete it if it does)
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', TEST_UUID)
            .single();

        if (existingProfile) {
            console.log('🧹 Found existing test record, cleaning up first...');
            await supabase
                .from('profiles')
                .delete()
                .eq('id', TEST_UUID);
        }

        // Now insert the test record
        const { error: writeError } = await supabase
            .from('profiles')
            .insert([testProfile]);

        if (writeError) {
            console.error('❌ WRITE ERROR:', writeError);
            return;
        }

        console.log('✅ WRITE successful!');

        // -------------- VERIFY WRITE OPERATION --------------
        console.log('\n🔎 Verifying WRITE operation...');
        const { data: verifyData, error: verifyError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', TEST_UUID)
            .single();

        if (verifyError) {
            console.error('❌ VERIFICATION ERROR:', verifyError);
            return;
        }

        console.log('✅ VERIFICATION successful!');
        console.log('📝 Retrieved test record:', {
            id: verifyData.id,
            name: `${verifyData.first_name} ${verifyData.last_name}`,
            role: verifyData.role
        });

        // -------------- CLEAN UP TEST DATA --------------
        console.log('\n🧹 Cleaning up test data...');
        const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', TEST_UUID);

        if (deleteError) {
            console.error('❌ CLEANUP ERROR:', deleteError);
            return;
        }

        console.log('✅ CLEANUP successful!');
        console.log('\n🎉 All tests completed successfully! Supabase connection is working properly.');
    } catch (error) {
        console.error('❌ UNEXPECTED ERROR:', error);
    }
}

// Run the test function
testSupabase();
