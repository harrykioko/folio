import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Get Supabase URL and service role key from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Supabase URL and service role key must be provided in environment variables');
  console.error('Please ensure you have VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY in your .env.local file');
  process.exit(1);
}

// Log for debugging
console.log('Using Supabase URL:', supabaseUrl);
console.log('Service Role Key available:', !!supabaseServiceRoleKey);

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function applyMigration() {
  try {
    // Get the migration file path from command line arguments or use default
    const migrationFile = process.argv[2];
    
    if (!migrationFile) {
      console.error('Error: Migration file path must be provided');
      console.error('Usage: npx ts-node apply-local-migration.ts <path-to-migration-file>');
      process.exit(1);
    }
    
    const migrationPath = path.resolve(__dirname, '..', migrationFile);
    
    console.log(`Applying migration from ${migrationPath}`);
    
    // Check if the file exists
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file not found: ${migrationPath}`);
      process.exit(1);
    }
    
    // Read SQL from file
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL into statements (simple approach)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';' 
      });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement);
        // Continue with other statements
      }
    }
    
    console.log('Migration completed');
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
