// ESM module format
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = "https://dnjookyyhfnxvjyytggt.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam9va3l5aGZueHZqeXl0Z2d0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjc2MDQ1MSwiZXhwIjoyMDU4MzM2NDUxfQ._20BFqHQlIAPVNsIKZuLeFTRwJXCVmiDAiWOesUQYlg";

// Create a Supabase client with the service role key for full access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Use the existing profile ID we found in the read test
const EXISTING_USER_ID = '4083cf26-8eca-4c6e-87e2-9c71a26d177b';

async function testUpdate() {
    console.log('🔍 Testing UPDATE operation on existing profile...');
    
    try {
        // First, get the current profile data to store original values
        console.log(`Looking up existing profile with ID: ${EXISTING_USER_ID}`);
        const { data: originalProfile, error: readError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', EXISTING_USER_ID)
            .single();
            
        if (readError) {
            console.error('❌ READ ERROR:', readError);
            return;
        }
        
        if (!originalProfile) {
            console.error('❌ Profile not found');
            return;
        }
        
        console.log('✅ Found existing profile:');
        console.log(`  Name: ${originalProfile.first_name} ${originalProfile.last_name}`);
        console.log(`  Role: ${originalProfile.role}`);
        
        // Add a test marker to the profile (we'll update this field)
        const testMarker = `Test ${new Date().toISOString()}`;
        
        // Update the profile with a test value
        console.log('\nUpdating profile with test data...');
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
                updated_at: new Date().toISOString(),
                test_field: testMarker 
            })
            .eq('id', EXISTING_USER_ID);
            
        if (updateError) {
            console.error('❌ UPDATE ERROR:', updateError);
            
            // If the test_field doesn't exist, try a different approach
            if (updateError.message && updateError.message.includes('test_field')) {
                console.log('Test field may not exist, trying with existing fields...');
                
                // Update just the timestamp
                const { error: simpleUpdateError } = await supabase
                    .from('profiles')
                    .update({ 
                        updated_at: new Date().toISOString() 
                    })
                    .eq('id', EXISTING_USER_ID);
                    
                if (simpleUpdateError) {
                    console.error('❌ SIMPLE UPDATE ERROR:', simpleUpdateError);
                    return;
                }
                
                console.log('✅ Simple update successful');
            } else {
                return;
            }
        } else {
            console.log('✅ UPDATE with test field successful');
        }
        
        // Verify the update
        console.log('\nVerifying the update...');
        const { data: updatedProfile, error: verifyError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', EXISTING_USER_ID)
            .single();
            
        if (verifyError) {
            console.error('❌ VERIFICATION ERROR:', verifyError);
            return;
        }
        
        console.log('✅ VERIFICATION successful');
        console.log('Updated profile:');
        console.log(`  Updated at: ${updatedProfile.updated_at}`);
        
        // Check if the test field was added
        if (updatedProfile.test_field === testMarker) {
            console.log(`  Test field: ${updatedProfile.test_field} ✅`);
        }
        
        // Restore original values if needed
        if (updatedProfile.test_field) {
            console.log('\nRestoring original profile data...');
            const { error: restoreError } = await supabase
                .from('profiles')
                .update({ 
                    test_field: null 
                })
                .eq('id', EXISTING_USER_ID);
                
            if (restoreError) {
                console.error('❌ RESTORE ERROR:', restoreError);
            } else {
                console.log('✅ Profile restored successfully');
            }
        }
        
        console.log('\n🎉 UPDATE TEST COMPLETED SUCCESSFULLY!');
        console.log('This confirms that the Supabase connection allows both READ and WRITE operations.');
    } catch (error) {
        console.error('❌ UNEXPECTED ERROR:', error);
    }
}

// Run the test
testUpdate();
