// Simple script to apply migrations to local Supabase instance
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const sqlFile = process.argv[2];
  if (!sqlFile) {
    console.error('Please provide a SQL file path');
    process.exit(1);
  }

  const filePath = path.resolve(__dirname, '..', sqlFile);
  console.log(`Reading SQL from ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  console.log('Executing SQL...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('Migration successful!');
  } catch (err) {
    console.error('Error executing migration:', err);
    process.exit(1);
  }
}

runMigration().catch(console.error);
