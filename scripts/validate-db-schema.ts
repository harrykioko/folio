import { createClient } from '@supabase/supabase-js';
import { validateDatabaseSchema } from '../src/utils/dbValidator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Starting database schema validation...');
  
  try {
    const validationResult = await validateDatabaseSchema(supabase);
    
    if (validationResult.valid) {
      console.log('✅ Database schema validation passed!');
    } else {
      console.error('❌ Database schema validation failed!');
      console.error('Issues found:');
      validationResult.issues.forEach((issue, index) => {
        console.error(`${index + 1}. ${issue}`);
      });
    }
  } catch (error) {
    console.error('Error during validation:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => {
    console.log('Validation complete');
    process.exit(0);
  });
