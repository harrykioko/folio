// ESM module format
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = "https://dnjookyyhfnxvjyytggt.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam9va3l5aGZueHZqeXl0Z2d0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjc2MDQ1MSwiZXhwIjoyMDU4MzM2NDUxfQ._20BFqHQlIAPVNsIKZuLeFTRwJXCVmiDAiWOesUQYlg";

// Create a Supabase client with the service role key for full access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test UUID for our test record
const TEST_UUID = '11111111-1111-1111-1111-111111111111';

async function testWrite() {
    console.log('🔍 Testing WRITE operation...');
    
    try {
        // First, check if our test profile already exists
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', TEST_UUID)
            .single();
            
        // If it exists, delete it first
        if (existingProfile) {
            console.log('Found existing test profile, deleting it first...');
            await supabase
                .from('profiles')
                .delete()
                .eq('id', TEST_UUID);
        }
        
        // Create a test profile
        const testProfile = {
            id: TEST_UUID,
            first_name: 'Test',
            last_name: 'User',
            role: 'test',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Insert the test profile
        console.log('Inserting test profile...');
        const { error: insertError } = await supabase
            .from('profiles')
            .insert([testProfile]);
            
        if (insertError) {
            console.error('❌ WRITE ERROR:', insertError);
            return;
        }
        
        console.log('✅ INSERT successful');
        
        // Verify the profile was inserted
        console.log('Verifying profile was inserted...');
        const { data: verifyData, error: verifyError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', TEST_UUID)
            .single();
            
        if (verifyError) {
            console.error('❌ VERIFICATION ERROR:', verifyError);
            return;
        }
        
        console.log('✅ VERIFICATION successful');
        console.log('Retrieved test profile:');
        console.log(`  ID: ${verifyData.id}`);
        console.log(`  Name: ${verifyData.first_name} ${verifyData.last_name}`);
        console.log(`  Role: ${verifyData.role}`);
        
        // Clean up by deleting the test profile
        console.log('Cleaning up test profile...');
        const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', TEST_UUID);
            
        if (deleteError) {
            console.error('❌ CLEANUP ERROR:', deleteError);
            return;
        }
        
        console.log('✅ CLEANUP successful');
        console.log('🎉 WRITE TEST COMPLETED SUCCESSFULLY!');
    } catch (error) {
        console.error('❌ UNEXPECTED ERROR:', error);
    }
}

// Run the test
testWrite();
