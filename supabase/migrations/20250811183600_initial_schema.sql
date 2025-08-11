BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE order_status AS ENUM ('pending', 'shipped', 'delivered', 'cancelled');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_seller BOOLEAN DEFAULT FALSE,
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller profiles
CREATE TABLE IF NOT EXISTS seller_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    description TEXT,
    region VARCHAR(255),
    certification VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    image_url VARCHAR(255),
    certification VARCHAR(255),
    region VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status order_status DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
-- Users can view all users
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id::text);

-- Seller Profiles RLS Policies
-- Anyone can view seller profiles
CREATE POLICY "Anyone can view seller profiles" ON seller_profiles
    FOR SELECT USING (true);

-- Sellers can update their own profile
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seller_profiles') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seller_profiles' AND column_name = 'user_id') THEN
            CREATE OR REPLACE POLICY "Sellers can update their own profile" ON seller_profiles
                FOR UPDATE USING (user_id = auth.uid()::uuid);
        END IF;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating seller profile update policy: %', SQLERRM;
END
$$;

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

-- Row Level Security (RLS) policies will be set up in a separate migration
-- after the tables are created and initial data is loaded.
