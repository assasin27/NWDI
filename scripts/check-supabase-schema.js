import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Anon Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    console.log('Checking Supabase schema...');
    
    // Check products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productsError) {
      console.error('Error querying products table:', productsError);
    } else {
      console.log('Products table exists with columns:', Object.keys(products[0] || {}));
    }

    // Check categories table
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (categoriesError) {
      console.error('Error querying categories table:', categoriesError);
    } else {
      console.log('Categories table exists with columns:', Object.keys(categories[0] || {}));
    }

    // Check RLS policies
    const { data: rlsPolicies, error: rlsError } = await supabase
      .rpc('get_rls_policies');

    if (rlsError) {
      console.error('Error checking RLS policies:', rlsError);
    } else {
      console.log('\nRLS Policies:');
      console.table(rlsPolicies);
    }

  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema();
