BEGIN;

-- RLS Policies and functions (run after all tables/columns/indexes are created)

-- Users RLS Policies
-- Users can view all users
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid()::uuid);

-- Seller Profiles RLS Policies
-- Anyone can view seller profiles
CREATE POLICY "Anyone can view seller profiles" ON seller_profiles
    FOR SELECT USING (true);

CREATE POLICY "Sellers can update their own profile" ON seller_profiles
    FOR UPDATE USING (user_id = auth.uid()::uuid);

-- Categories RLS Policies
-- Anyone can view categories
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

-- Only admins can modify categories
CREATE POLICY "Only admins can modify categories" ON categories
    USING (EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()::uuid
        AND raw_user_meta_data->>'role' = 'admin'
    ));

-- Products RLS Policies
-- Anyone can view products
CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (true);

-- Sellers can manage their own products
CREATE POLICY "Sellers can insert their own products" ON products
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM seller_profiles
        WHERE seller_profiles.id = products.seller_id
        AND seller_profiles.user_id = auth.uid()::uuid
    ));

CREATE POLICY "Sellers can update their own products" ON products
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM seller_profiles
        WHERE seller_profiles.id = products.seller_id
        AND seller_profiles.user_id = auth.uid()::uuid
    ));

CREATE POLICY "Sellers can delete their own products" ON products
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM seller_profiles
        WHERE seller_profiles.id = products.seller_id
        AND seller_profiles.user_id = auth.uid()::uuid
    ));

-- Orders RLS Policies
-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (user_id = auth.uid()::uuid);

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

-- Sellers can view orders for their products
CREATE POLICY "Sellers can view orders for their products" ON orders
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM order_items
        JOIN products ON order_items.product_id = products.id
        JOIN seller_profiles ON products.seller_id = seller_profiles.id
        WHERE order_items.order_id = orders.id
        AND seller_profiles.user_id = auth.uid()::uuid
    ));

-- Order Items RLS Policies
-- Users can view items in their own orders
CREATE POLICY "Users can view items in their own orders" ON order_items
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()::uuid
    ));

-- Sellers can view items for their products
CREATE POLICY "Sellers can view items for their products" ON order_items
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM products
        JOIN seller_profiles ON products.seller_id = seller_profiles.id
        WHERE products.id = order_items.product_id
        AND seller_profiles.user_id = auth.uid()::uuid
    ));

-- Reviews RLS Policies
-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

-- Users can update/delete their own reviews
CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete their own reviews" ON reviews
    FOR DELETE USING (user_id = auth.uid()::uuid);

-- Notifications RLS Policies
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid()::uuid);

-- Users can mark notifications as read
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid()::uuid);

-- Create a function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT (raw_user_meta_data->>'role')::text 
  FROM auth.users 
  WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

COMMIT;
