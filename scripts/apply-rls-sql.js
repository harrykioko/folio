// A simplified script to apply SQL directly to Supabase
// Run with: node scripts/apply-rls-sql.js

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase configuration. Check your .env file.');
  process.exit(1);
}

// Extract project reference from URL (e.g., "dnjookyyhfnxvjyytggt" from "https://dnjookyyhfnxvjyytggt.supabase.co")
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

async function applySql(sqlContent) {
  try {
    // Endpoint for Supabase's management API to run SQL
    const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/sql`;
    
    console.log(`Applying SQL to project: ${projectRef}`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({
        query: sqlContent
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error applying SQL:', result);
      return false;
    }
    
    console.log('SQL applied successfully:', result);
    return true;
  } catch (error) {
    console.error('Error applying SQL:', error);
    return false;
  }
}

async function main() {
  try {
    // Read and apply RLS policies SQL
    const rlsPoliciesPath = path.join(__dirname, '..', 'supabase', 'fix_profiles_rls_updated.sql');
    console.log(`Reading RLS policies from: ${rlsPoliciesPath}`);
    const rlsPoliciesSQL = fs.readFileSync(rlsPoliciesPath, 'utf8');
    
    console.log('Applying RLS policies...');
    const rlsResult = await applySql(rlsPoliciesSQL);
    
    if (rlsResult) {
      console.log('RLS policies applied successfully.');
    } else {
      console.error('Failed to apply RLS policies.');
    }
    
    // Read and apply RPC function SQL
    const rpcFunctionPath = path.join(__dirname, '..', 'supabase', 'create_profile_rpc.sql');
    console.log(`Reading RPC function from: ${rpcFunctionPath}`);
    const rpcFunctionSQL = fs.readFileSync(rpcFunctionPath, 'utf8');
    
    console.log('Applying RPC function...');
    const rpcResult = await applySql(rpcFunctionSQL);
    
    if (rpcResult) {
      console.log('RPC function applied successfully.');
    } else {
      console.error('Failed to apply RPC function.');
    }
    
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

main();
