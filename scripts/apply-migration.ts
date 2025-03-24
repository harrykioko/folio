import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Get Supabase URL and service role key from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Supabase URL and service role key must be provided in environment variables');
  console.error('Please ensure you have VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY in your .env file');
  process.exit(1);
}

// Log for debugging (remove in production)
console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key available:', !!supabaseServiceRoleKey);

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function applyMigration() {
  try {
    // Get the migration file path from command line arguments or use default
    const migrationFile = process.argv[2] || '../supabase/migrations/20250324154700_update_profiles_table.sql';
    const migrationPath = path.resolve(__dirname, migrationFile);
    
    console.log(`Applying migration from ${migrationPath}`);
    
    // Check if the file exists
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file not found: ${migrationPath}`);
      process.exit(1);
    }
    
    // Read SQL from file
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute SQL using Supabase's exec_sql RPC function
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error applying migration:', error);
      process.exit(1);
    }
    
    console.log('Migration applied successfully');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

// Run the migration
applyMigration().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
