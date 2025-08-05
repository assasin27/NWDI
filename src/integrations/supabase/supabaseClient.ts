import { createClient } from '@supabase/supabase-js';

// Environment variables for production security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lzjhjecktllltkizgwnr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6amhqZWNrdGxsbHRraXpnd25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTg0NTUsImV4cCI6MjA2ODE3NDQ1NX0.MW3fIJA4_8nnMnC-__8aloqH1tBo4IIpmA_2LPqDxug';

// Validate environment variables in production
if (import.meta.env.PROD) {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.error('Missing required environment variables for Supabase configuration');
    throw new Error('Supabase environment variables are required in production');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
