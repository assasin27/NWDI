-- This migration integrates with existing tables in the database
-- It assumes the following tables already exist:
-- - cart_items
-- - orders
-- - wishlist_items

-- Add any missing columns or constraints to existing tables
-- This is a no-op if columns already exist

-- 1. Add any missing constraints to existing tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cart_items_pkey') THEN
        ALTER TABLE cart_items ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_pkey') THEN
        ALTER TABLE orders ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlist_items_pkey') THEN
        ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- 2. Create indexes for better query performance on existing tables
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product ON wishlist_items(product_id);

-- 3. Enable Row Level Security on existing tables
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies and functions (run after all tables/columns/indexes are created)
DO $$
BEGIN
    -- RLS Policies for cart_items
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Users can manage their own cart items" ON cart_items FOR ALL USING (auth.uid()::text = user_id)';

    -- RLS Policies for orders
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Users can view their own orders" ON orders FOR SELECT USING (auth.uid()::text = customer_email)';

    -- RLS Policies for wishlist_items
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Users can manage their own wishlist items" ON wishlist_items FOR ALL USING (auth.uid()::text = user_id)';
END $$;

-- 5. Create a function to get the current user's ID
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS text AS $$
BEGIN
    RETURN auth.uid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
