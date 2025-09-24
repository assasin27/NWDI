-- Migration: Convert multi-seller system to single farmer/admin system
-- This migration removes seller_profiles table and modifies products to be managed by a single admin farmer

BEGIN;

-- First, let's create a backup of existing data if needed
-- (This is commented out but can be uncommented if you want to preserve existing seller data)
-- CREATE TABLE seller_profiles_backup AS SELECT * FROM seller_profiles;

-- Drop all RLS policies that depend on seller_id first
DROP POLICY IF EXISTS "Sellers can view orders for their products" ON orders;
DROP POLICY IF EXISTS "Sellers can view items for their products" ON order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable update for users based on seller_id" ON products;
DROP POLICY IF EXISTS "Enable delete for users based on seller_id" ON products;
DROP POLICY IF EXISTS "Products are insertable by farmers" ON products;
DROP POLICY IF EXISTS "Products are updatable by farmers" ON products;
DROP POLICY IF EXISTS "Products are deletable by farmers" ON products;

-- Drop foreign key constraints that reference seller_profiles
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;

-- Remove seller_id column from products table
ALTER TABLE products DROP COLUMN IF EXISTS seller_id;

-- Drop the seller_profiles table
DROP TABLE IF EXISTS seller_profiles CASCADE;

-- Remove is_seller column from users table since we'll have a single admin
ALTER TABLE users DROP COLUMN IF EXISTS is_seller;

-- Add admin role to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create a single admin farmer profile table (simpler than seller_profiles)
CREATE TABLE IF NOT EXISTS admin_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL DEFAULT 'Nareshwadi Farm',
    description TEXT DEFAULT 'Organic farm providing fresh produce',
    region VARCHAR(255) DEFAULT 'Nareshwadi',
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_profile
ALTER TABLE admin_profile ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_profile
CREATE POLICY "Admin profile is viewable by owner only" ON admin_profile
    FOR SELECT USING (
        auth.uid() = admin_profile.user_id
    );

CREATE POLICY "Admin profile is insertable by owner only" ON admin_profile
    FOR INSERT WITH CHECK (
        auth.uid() = admin_profile.user_id
    );

CREATE POLICY "Admin profile is updatable by owner only" ON admin_profile
    FOR UPDATE USING (
        auth.uid() = admin_profile.user_id
    );

-- Update RLS policies for products to use admin instead of seller_profiles
DROP POLICY IF EXISTS "Products are insertable by farmers" ON products;
DROP POLICY IF EXISTS "Products are updatable by farmers" ON products;

CREATE POLICY "Products are insertable by admin only" ON products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_profile 
            WHERE admin_profile.user_id = auth.uid()
        )
    );

CREATE POLICY "Products are updatable by admin only" ON products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_profile 
            WHERE admin_profile.user_id = auth.uid()
        )
    );

CREATE POLICY "Products are deletable by admin only" ON products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin_profile 
            WHERE admin_profile.user_id = auth.uid()
        )
    );

-- Update RLS policies for orders to use admin instead of seller_profiles
DROP POLICY IF EXISTS "Orders are viewable by customer and farmer" ON orders;
DROP POLICY IF EXISTS "Orders are updatable by farmers" ON orders;

CREATE POLICY "Orders are viewable by customer and admin" ON orders
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM admin_profile 
            WHERE admin_profile.user_id = auth.uid()
        )
    );

CREATE POLICY "Orders are updatable by admin only" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_profile 
            WHERE admin_profile.user_id = auth.uid()
        )
    );

-- Update RLS policies for order_items to use admin instead of seller_profiles
DROP POLICY IF EXISTS "Order items are viewable by customer and farmer" ON order_items;

CREATE POLICY "Order items are viewable by customer and admin" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM admin_profile 
                     WHERE admin_profile.user_id = auth.uid()
                 ))
        )
    );

-- Create default admin user (if not exists)
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

-- Create admin profile for the default admin user
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_admin_profile_user_id ON admin_profile(user_id);

-- Create trigger for updated_at on admin_profile
CREATE TRIGGER update_admin_profile_updated_at 
    BEFORE UPDATE ON admin_profile
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
