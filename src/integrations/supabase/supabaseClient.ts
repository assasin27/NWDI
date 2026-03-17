import { createClient } from '@supabase/supabase-js';

// Configuration - Now using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Validate configuration
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}
if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Export configuration
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
export { API_URL };

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  }
});