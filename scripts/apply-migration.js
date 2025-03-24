const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

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

// Split SQL into individual statements
function splitSqlStatements(sql) {
  // This is a simple implementation and might not handle all edge cases
  // It splits on semicolons, but ignores those within quotes or comments
  const statements = [];
  let currentStatement = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inComment = false;
  let inBlockComment = false;
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1] || '';
    
    // Handle comments
    if (!inSingleQuote && !inDoubleQuote) {
      if (!inComment && !inBlockComment && char === '-' && nextChar === '-') {
        inComment = true;
      } else if (inComment && char === '\n') {
        inComment = false;
      } else if (!inComment && !inBlockComment && char === '/' && nextChar === '*') {
        inBlockComment = true;
        i++; // Skip the next character
      } else if (inBlockComment && char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++; // Skip the next character
        continue;
      }
    }
    
    // Handle quotes
    if (!inComment && !inBlockComment) {
      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      }
    }
    
    // Handle statement termination
    if (!inSingleQuote && !inDoubleQuote && !inComment && !inBlockComment && char === ';') {
      statements.push(currentStatement.trim() + ';');
      currentStatement = '';
    } else {
      currentStatement += char;
    }
  }
  
  // Add the last statement if it doesn't end with a semicolon
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim() + ';');
  }
  
  return statements.filter(stmt => stmt.trim() !== ';');
}

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
    
    // Split SQL into individual statements
    const statements = splitSqlStatements(sql);
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Use the from('').select() pattern with the service role key to execute raw SQL
        const { error } = await supabase.from('').select('*').limit(1).then(
          async () => {
            // This is a workaround to execute raw SQL
            // We're using the internal connection from the Supabase client
            return await supabase.rpc('exec_sql', { sql: statement });
          }
        );
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.error('Statement:', statement);
          // Continue with the next statement instead of failing completely
          console.log('Continuing with next statement...');
        }
      } catch (stmtError) {
        console.error(`Error executing statement ${i + 1}:`, stmtError);
        console.error('Statement:', statement);
        // Continue with the next statement instead of failing completely
        console.log('Continuing with next statement...');
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
