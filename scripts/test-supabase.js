// Enhanced Supabase test script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configure dotenv with the correct .env file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.production') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase URL or Anon Key in environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? '***** (hidden for security)' : 'Not found');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function testConnection() {
  console.log('\n🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    if (versionError) throw versionError;
    console.log('✅ Connected to Supabase. Server version:', versionData);
    
    // Test auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;
    
    console.log(`🔑 Authentication status: ${session ? 'Authenticated' : 'Not authenticated'}`);
    if (session?.user) {
      console.log(`   - User ID: ${session.user.id}`);
      console.log(`   - Email: ${session.user.email}`);
    }
    
    // Test querying products table
    console.log('\n🛒 Testing products table access...');
    await testTableQuery('products');
    
    // Test querying categories table
    console.log('\n📚 Testing categories table access...');
    await testTableQuery('categories');
    
    // Test querying orders table
    console.log('\n📦 Testing orders table access...');
    await testTableQuery('orders');
    
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error.message);
  }
}

async function testTableQuery(tableName) {
  try {
    const { data, error, status } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`   ❌ Error querying ${tableName}:`, error.message);
      
      // Check for RLS issues
      if (error.code === '42501') {
        console.log('   ℹ️  This is likely a Row Level Security (RLS) issue.');
        console.log('   ℹ️  Check if RLS is enabled and proper policies are set up.');
      }
      
      return null;
    }
    
    if (data && data.length > 0) {
      console.log(`   ✅ Successfully queried ${tableName}`);
      console.log(`   📊 Sample record:`, JSON.stringify(data[0], null, 2));
      return data[0];
    } else {
      console.log(`   ⚠️  ${tableName} table is empty or no records found`);
      return null;
    }
  } catch (error) {
    console.error(`   ❌ Unexpected error querying ${tableName}:`, error.message);
    return null;
  }
}

// Run the tests
console.log('🚀 Starting Supabase connection tests...');
testConnection().then(() => {
  console.log('\n✨ Test completed. Check the output for any issues.');  
});
