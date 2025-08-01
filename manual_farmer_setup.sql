-- Manual Farmer Account Setup for FarmFresh
-- Run this in your Supabase SQL Editor

-- Step 1: Create required tables if they don't exist
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  image TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'out_for_delivery', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category TEXT,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category TEXT,
  description TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS on all tables
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies
-- Farmer profiles policies
DROP POLICY IF EXISTS "Farmer profiles are viewable by the farmer" ON farmer_profiles;
CREATE POLICY "Farmer profiles are viewable by the farmer" ON farmer_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmer profiles are insertable by the farmer" ON farmer_profiles;
CREATE POLICY "Farmer profiles are insertable by the farmer" ON farmer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmer profiles are updatable by the farmer" ON farmer_profiles;
CREATE POLICY "Farmer profiles are updatable by the farmer" ON farmer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Products policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products are insertable by farmers" ON products;
CREATE POLICY "Products are insertable by farmers" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM farmer_profiles 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Products are updatable by farmers" ON products;
CREATE POLICY "Products are updatable by farmers" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM farmer_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Orders policies
DROP POLICY IF EXISTS "Orders are viewable by customer and farmers" ON orders;
CREATE POLICY "Orders are viewable by customer and farmers" ON orders
  FOR SELECT USING (
    auth.uid() = customer_id OR 
    EXISTS (
      SELECT 1 FROM farmer_profiles 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Orders are insertable by customers" ON orders;
CREATE POLICY "Orders are insertable by customers" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Orders are updatable by farmers" ON orders;
CREATE POLICY "Orders are updatable by farmers" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM farmer_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Order items policies
DROP POLICY IF EXISTS "Order items are viewable by customer and farmers" ON order_items;
CREATE POLICY "Order items are viewable by customer and farmers" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.customer_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM farmer_profiles 
             WHERE user_id = auth.uid()
           ))
    )
  );

DROP POLICY IF EXISTS "Order items are insertable by customers" ON order_items;
CREATE POLICY "Order items are insertable by customers" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

-- Cart items policies
DROP POLICY IF EXISTS "Cart items are viewable by owner" ON cart_items;
CREATE POLICY "Cart items are viewable by owner" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Cart items are insertable by owner" ON cart_items;
CREATE POLICY "Cart items are insertable by owner" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Cart items are updatable by owner" ON cart_items;
CREATE POLICY "Cart items are updatable by owner" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Cart items are deletable by owner" ON cart_items;
CREATE POLICY "Cart items are deletable by owner" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Wishlist items policies
DROP POLICY IF EXISTS "Wishlist items are viewable by owner" ON wishlist_items;
CREATE POLICY "Wishlist items are viewable by owner" ON wishlist_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Wishlist items are insertable by owner" ON wishlist_items;
CREATE POLICY "Wishlist items are insertable by owner" ON wishlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Wishlist items are deletable by owner" ON wishlist_items;
CREATE POLICY "Wishlist items are deletable by owner" ON wishlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user_id ON farmer_profiles(user_id);

-- Step 5: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create triggers for updated_at
DROP TRIGGER IF EXISTS update_farmer_profiles_updated_at ON farmer_profiles;
CREATE TRIGGER update_farmer_profiles_updated_at BEFORE UPDATE ON farmer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Verify setup
SELECT 'Tables created successfully' as status;

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('farmer_profiles', 'products', 'orders', 'order_items', 'cart_items', 'wishlist_items');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('farmer_profiles', 'products', 'orders', 'order_items', 'cart_items', 'wishlist_items'); 