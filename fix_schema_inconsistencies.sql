-- Fix Schema Inconsistencies: Align with Single Farmer/Admin System
-- This script fixes the current schema to be consistent with the single farmer/admin design

BEGIN;

-- Step 1: Fix cart_items table - user_id should be UUID, not TEXT
ALTER TABLE cart_items ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 2: Fix wishlist table - user_id should be UUID, not TEXT
ALTER TABLE wishlist ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE wishlist ADD CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 3: Add missing columns to orders table for better customer management
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);

-- Step 4: Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT TRUE;

-- Step 5: Add missing columns to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 6: Drop any remaining seller-related policies that might exist
DROP POLICY IF EXISTS "Sellers can view orders for their products" ON orders;
DROP POLICY IF EXISTS "Sellers can view items for their products" ON order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable update for users based on seller_id" ON products;
DROP POLICY IF EXISTS "Enable delete for users based on seller_id" ON products;
DROP POLICY IF EXISTS "Products are insertable by farmers" ON products;
DROP POLICY IF EXISTS "Products are updatable by farmers" ON products;
DROP POLICY IF EXISTS "Products are deletable by farmers" ON products;

-- Step 7: Enable RLS on all tables (in case some are missing)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Step 8: Create comprehensive RLS policies for users
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

-- Step 9: Create comprehensive RLS policies for admin_profile
DROP POLICY IF EXISTS "Admin profile is viewable by admin only" ON admin_profile;
DROP POLICY IF EXISTS "Admin profile is insertable by admin only" ON admin_profile;
DROP POLICY IF EXISTS "Admin profile is updatable by admin only" ON admin_profile;

CREATE POLICY "Admin profile is viewable by admin only" ON admin_profile
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

CREATE POLICY "Admin profile is insertable by admin only" ON admin_profile
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

CREATE POLICY "Admin profile is updatable by admin only" ON admin_profile
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

-- Step 10: Create comprehensive RLS policies for categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories are manageable by admin only" ON categories;

CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Categories are manageable by admin only" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

-- Step 11: Create comprehensive RLS policies for products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are manageable by admin only" ON products;

CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Products are manageable by admin only" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

-- Step 12: Create comprehensive RLS policies for orders
DROP POLICY IF EXISTS "Orders are viewable by customer and admin" ON orders;
DROP POLICY IF EXISTS "Orders are insertable by customers" ON orders;
DROP POLICY IF EXISTS "Orders are updatable by admin only" ON orders;

CREATE POLICY "Orders are viewable by customer and admin" ON orders
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

CREATE POLICY "Orders are insertable by customers" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Orders are updatable by admin only" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

-- Step 13: Create comprehensive RLS policies for order_items
DROP POLICY IF EXISTS "Order items are viewable by customer and admin" ON order_items;
DROP POLICY IF EXISTS "Order items are insertable by customers" ON order_items;

CREATE POLICY "Order items are viewable by customer and admin" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM users 
                     WHERE users.id = auth.uid() 
                     AND users.is_admin = TRUE
                 ))
        )
    );

CREATE POLICY "Order items are insertable by customers" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Step 14: Create comprehensive RLS policies for reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Reviews are insertable by authenticated users" ON reviews;
DROP POLICY IF EXISTS "Reviews are updatable by author" ON reviews;
DROP POLICY IF EXISTS "Reviews are deletable by author or admin" ON reviews;

CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Reviews are insertable by authenticated users" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reviews are updatable by author" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Reviews are deletable by author or admin" ON reviews
    FOR DELETE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

-- Step 15: Create comprehensive RLS policies for notifications
DROP POLICY IF EXISTS "Notifications are viewable by owner" ON notifications;
DROP POLICY IF EXISTS "Notifications are insertable by admin" ON notifications;
DROP POLICY IF EXISTS "Notifications are updatable by owner" ON notifications;

CREATE POLICY "Notifications are viewable by owner" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Notifications are insertable by admin" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

CREATE POLICY "Notifications are updatable by owner" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Step 16: Create comprehensive RLS policies for cart_items
DROP POLICY IF EXISTS "Cart items are viewable by owner" ON cart_items;
DROP POLICY IF EXISTS "Cart items are manageable by owner" ON cart_items;

CREATE POLICY "Cart items are viewable by owner" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Cart items are manageable by owner" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Step 17: Create comprehensive RLS policies for wishlist
DROP POLICY IF EXISTS "Wishlist items are viewable by owner" ON wishlist;
DROP POLICY IF EXISTS "Wishlist items are manageable by owner" ON wishlist;

CREATE POLICY "Wishlist items are viewable by owner" ON wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Wishlist items are manageable by owner" ON wishlist
    FOR ALL USING (auth.uid() = user_id);

-- Step 18: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_admin_profile_user_id ON admin_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);

-- Step 19: Create function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 20: Create triggers for updated_at (if not exist)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_profile_updated_at ON admin_profile;
CREATE TRIGGER update_admin_profile_updated_at BEFORE UPDATE ON admin_profile
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

DROP TRIGGER IF EXISTS update_wishlist_updated_at ON wishlist;
CREATE TRIGGER update_wishlist_updated_at BEFORE UPDATE ON wishlist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 21: Ensure admin user exists
INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    is_admin,
    address,
    phone,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@nareshwadi.in',
    crypt('admin123', gen_salt('bf')),
    'Nareshwadi',
    'Admin',
    TRUE,
    'Nareshwadi Farm, Maharashtra',
    '+91-9876543210',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET 
    is_admin = TRUE,
    updated_at = NOW();

-- Step 22: Ensure admin profile exists
INSERT INTO admin_profile (
    user_id,
    farm_name,
    description,
    region,
    contact_email,
    contact_phone
) VALUES (
    (SELECT id FROM users WHERE email = 'admin@nareshwadi.in'),
    'Nareshwadi Organic Farm',
    'Premium organic farm providing fresh, chemical-free produce directly from our fields to your table.',
    'Nareshwadi, Maharashtra',
    'admin@nareshwadi.in',
    '+91-9876543210'
) ON CONFLICT (user_id) DO UPDATE SET
    farm_name = 'Nareshwadi Organic Farm',
    description = 'Premium organic farm providing fresh, chemical-free produce directly from our fields to your table.',
    region = 'Nareshwadi, Maharashtra',
    contact_email = 'admin@nareshwadi.in',
    contact_phone = '+91-9876543210',
    updated_at = NOW();

-- Step 23: Insert default categories if they don't exist
INSERT INTO categories (name, description) VALUES
    ('Vegetables', 'Fresh organic vegetables'),
    ('Fruits', 'Seasonal organic fruits'),
    ('Grains', 'Organic grains and cereals'),
    ('Spices', 'Fresh herbs and spices'),
    ('Dairy', 'Fresh dairy products')
ON CONFLICT DO NOTHING;

COMMIT;

-- Verify the changes
SELECT 'Schema inconsistencies fixed successfully!' as status;
SELECT 'Admin user: admin@nareshwadi.in' as admin_info;
SELECT 'Password: admin123' as admin_password;
SELECT 'All tables now have proper RLS policies for single farmer/admin system' as rls_status;

