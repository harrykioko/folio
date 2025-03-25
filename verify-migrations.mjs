// ESM module format
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = "https://dnjookyyhfnxvjyytggt.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam9va3l5aGZueHZqeXl0Z2d0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjc2MDQ1MSwiZXhwIjoyMDU4MzM2NDUxfQ._20BFqHQlIAPVNsIKZuLeFTRwJXCVmiDAiWOesUQYlg";

// Create a Supabase client with the service role key for full access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Tables to verify (based on our recent migrations)
const TABLES_TO_VERIFY = [
    'profiles',
    'company_settings',
    'user_settings',
    'dashboard_settings',
    'verification_functions',
    'utility_functions'
];

async function verifyMigrations() {
    console.log('🔍 Verifying Supabase migrations...');
    console.log(`🌐 Using URL: ${SUPABASE_URL}`);

    try {
        // Test database connection first
        console.log('\n📡 Testing database connection...');
        const { data: testData, error: testError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (testError) {
            console.error('❌ Database connection failed:', testError);
            return;
        }

        console.log('✅ Database connection successful!');

        // Verify each table
        for (const tableName of TABLES_TO_VERIFY) {
            console.log(`\n🔍 Verifying table: ${tableName}`);
            
            // Check if table exists and get its structure
            const { data: tableData, error: tableError } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);

            if (tableError) {
                console.error(`❌ Error accessing table ${tableName}:`, tableError);
                continue;
            }

            console.log(`✅ Table ${tableName} exists and is accessible`);
            
            // Get table structure
            const { data: structureData, error: structureError } = await supabase
                .rpc('get_table_structure', { table_name: tableName });

            if (structureError) {
                console.error(`❌ Error getting structure for ${tableName}:`, structureError);
                continue;
            }

            console.log(`📊 Table structure for ${tableName}:`, structureData);
        }

        // Verify RLS policies
        console.log('\n🔒 Verifying RLS policies...');
        const { data: policies, error: policiesError } = await supabase
            .rpc('get_rls_policies');

        if (policiesError) {
            console.error('❌ Error getting RLS policies:', policiesError);
        } else {
            console.log('✅ RLS policies retrieved successfully');
            console.log('📋 Active policies:', policies);
        }

        console.log('\n🎉 Migration verification completed!');
    } catch (error) {
        console.error('❌ UNEXPECTED ERROR:', error);
    }
}

// Run the verification
verifyMigrations(); 