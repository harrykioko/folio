// ESM module format
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = "https://dnjookyyhfnxvjyytggt.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam9va3l5aGZueHZqeXl0Z2d0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjc2MDQ1MSwiZXhwIjoyMDU4MzM2NDUxfQ._20BFqHQlIAPVNsIKZuLeFTRwJXCVmiDAiWOesUQYlg";

// Create a Supabase client with the service role key for full access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testRead() {
    console.log('🔍 Testing READ operation...');
    
    try {
        // Get tables in the database
        const { data: tableData, error: tableError } = await supabase
            .from('profiles')
            .select('*')
            .limit(5);
            
        if (tableError) {
            console.error('❌ READ ERROR:', tableError);
            return;
        }
        
        console.log('✅ READ TEST SUCCESSFUL');
        console.log(`Found ${tableData.length} profiles`);
        
        if (tableData.length > 0) {
            console.log('Sample profile:');
            const profile = tableData[0];
            console.log(`  ID: ${profile.id}`);
            console.log(`  Name: ${profile.first_name} ${profile.last_name}`);
            console.log(`  Role: ${profile.role}`);
        }
    } catch (error) {
        console.error('❌ UNEXPECTED ERROR:', error);
    }
}

// Run the test
testRead();
