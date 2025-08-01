import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project URL and anon key
const supabaseUrl = 'https://lzjhjecktllltkizgwnr.supabase.co'; // <-- Replace with your Supabase project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6amhqZWNrdGxsbHRraXpnd25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTg0NTUsImV4cCI6MjA2ODE3NDQ1NX0.MW3fIJA4_8nnMnC-__8aloqH1tBo4IIpmA_2LPqDxug'; // <-- Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
