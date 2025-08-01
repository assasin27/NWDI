-- Setup Farmer Account for FarmFresh
-- Run this in your Supabase SQL Editor

-- First, let's check if the farmer account already exists
SELECT id, email, created_at FROM auth.users WHERE email = 'test@nareshwadi.in';

-- If no user exists, create the farmer account
-- Note: This requires admin privileges in Supabase
-- You may need to create this user manually through the Supabase Auth dashboard

-- Alternative: Create the user through Supabase Auth API
-- You can also create this user manually in the Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Email: test@nareshwadi.in
-- 4. Password: farmer
-- 5. Set "Email Confirmed" to true

-- Once the user exists, create the farmer profile
INSERT INTO farmer_profiles (
  user_id,
  email,
  name
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@nareshwadi.in'),
  'test@nareshwadi.in',
  'Nareshwadi Farmer'
) ON CONFLICT (email) DO NOTHING;

-- Verify the farmer profile was created
SELECT * FROM farmer_profiles WHERE email = 'test@nareshwadi.in';

-- Check if all required tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('farmer_profiles', 'products', 'orders', 'order_items', 'cart_items', 'wishlist_items');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('farmer_profiles', 'products', 'orders', 'order_items', 'cart_items', 'wishlist_items'); 