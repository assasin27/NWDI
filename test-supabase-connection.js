// Test Supabase connection
import { createClient } from '@supabase/supabase-js';

// Using the same credentials from supabaseClient.ts
const supabaseUrl = 'https://lzjhjecktllltkizgwnr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6amhqZWNrdGxsbHRraXpnd25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTg0NTUsImV4cCI6MjA2ODE3NDQ1NX0.MW3fIJA4_8nnMnC-__8aloqH1tBo4IIpmA_2LPqDxug';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Try to fetch a small amount of data
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log('Sample data:', data);
  } catch (err) {
    console.error('Exception when connecting to Supabase:', err);
  }
}

testConnection();
