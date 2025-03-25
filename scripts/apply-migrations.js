// Apply migrations to Supabase database
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key not found in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Get migration file paths from command line arguments
const migrationFiles = process.argv.slice(2);

if (migrationFiles.length === 0) {
  console.error('No migration files specified');
  console.log('Usage: node apply-migrations.js <migration-file-1> <migration-file-2> ...');
  process.exit(1);
}

async function applyMigration(filePath) {
  try {
    console.log(`Applying migration: ${filePath}`);
    
    // Read the migration file
    const migrationSql = fs.readFileSync(filePath, 'utf8');
    
    // Execute the SQL directly using the Supabase client
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSql });
    
    if (error) {
      throw error;
    }
    
    console.log(`Successfully applied migration: ${filePath}`);
    console.log(data);
    return true;
  } catch (error) {
    console.error(`Error applying migration ${filePath}:`, error);
    return false;
  }
}

async function applyMigrations() {
  let success = true;
  
  for (const filePath of migrationFiles) {
    const result = await applyMigration(filePath);
    if (!result) {
      success = false;
    }
  }
  
  if (success) {
    console.log('All migrations applied successfully');
  } else {
    console.error('Some migrations failed to apply');
    process.exit(1);
  }
}

applyMigrations();
