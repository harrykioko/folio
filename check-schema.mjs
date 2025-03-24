// ESM module format
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = "https://dnjookyyhfnxvjyytggt.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam9va3l5aGZueHZqeXl0Z2d0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjc2MDQ1MSwiZXhwIjoyMDU4MzM2NDUxfQ._20BFqHQlIAPVNsIKZuLeFTRwJXCVmiDAiWOesUQYlg";

// Create a Supabase client with the service role key for full access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkSchema() {
    console.log('🔍 Checking database schema and relationships...');
    
    try {
        // Examine existing users to find a valid ID we can use
        console.log('\nFetching existing users from auth.users table...');
        const { data: users, error: usersError } = await supabase
            .from('auth.users')
            .select('id, email')
            .limit(1);
            
        if (usersError) {
            console.error('❌ Error fetching users:', usersError);
            
            // Try alternative approach if the auth.users table isn't directly accessible
            console.log('\nTrying alternative approach to find users...');
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id')
                .limit(1);
                
            if (profilesError) {
                console.error('❌ Error fetching profiles:', profilesError);
            } else {
                console.log('✅ Successfully retrieved profiles');
                console.log(`Found ${profiles.length} profiles`);
                
                if (profiles.length > 0) {
                    console.log('Sample profile ID that should be valid:', profiles[0].id);
                }
            }
        } else {
            console.log('✅ Successfully retrieved users');
            console.log(`Found ${users.length} users`);
            
            if (users.length > 0) {
                console.log('Sample user that could be used for testing:');
                console.log(`  ID: ${users[0].id}`);
                console.log(`  Email: ${users[0].email}`);
            }
        }
        
        // List all tables in the public schema
        console.log('\nListing all tables in the public schema...');
        const { data: tables, error: tablesError } = await supabase
            .rpc('list_tables');
            
        if (tablesError) {
            console.error('❌ Error listing tables:', tablesError);
            
            // If the RPC function doesn't exist, we can try another approach
            console.log('Trying alternative approach...');
            
            // Query information_schema directly
            const { data: schemaTables, error: schemaError } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');
                
            if (schemaError) {
                console.error('❌ Error querying information_schema:', schemaError);
            } else {
                console.log('✅ Successfully retrieved tables from information_schema');
                console.log('Tables in public schema:');
                schemaTables.forEach(table => {
                    console.log(`  ${table.table_name}`);
                });
            }
        } else {
            console.log('✅ Successfully retrieved tables using RPC');
            console.log('Tables:');
            tables.forEach(table => {
                console.log(`  ${table.name}`);
            });
        }
    } catch (error) {
        console.error('❌ UNEXPECTED ERROR:', error);
    }
}

// Run the check
checkSchema();
