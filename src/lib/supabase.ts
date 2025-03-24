import { createClient } from '@supabase/supabase-js';

// Check if using local Supabase instance for development
const useLocalSupabase = import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';

// Determine which Supabase configuration to use based on environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (useLocalSupabase 
  ? 'http://127.0.0.1:54321' 
  : 'https://dnjookyyhfnxvjyytggt.supabase.co');

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam9va3l5aGZueHZqeXl0Z2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjA0NTEsImV4cCI6MjA1ODMzNjQ1MX0.7emCEDqiIpOPJcbK0Uc2YKqCcw7zw8OeAt3wF0N_dck';

// Log which environment is being used (helpful for debugging)
console.log(`Using ${useLocalSupabase ? 'local' : 'production'} Supabase instance: ${supabaseUrl}`);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
