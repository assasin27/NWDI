-- Create base tables
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create farmer_profiles table
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR NOT NULL UNIQUE,
    farm_name VARCHAR NOT NULL,
    description TEXT,
    region VARCHAR,
    certification VARCHAR,
    phone VARCHAR,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    name VARCHAR NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    quantity INTEGER DEFAULT 0,
    image_url VARCHAR,
    certification VARCHAR,
    region VARCHAR,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create indexes (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_farmer_profiles_user_id') THEN
        CREATE INDEX idx_farmer_profiles_user_id ON farmer_profiles(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_farmer_profiles_email') THEN
        CREATE INDEX idx_farmer_profiles_email ON farmer_profiles(email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_seller_id') THEN
        CREATE INDEX idx_products_seller_id ON products(seller_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_category_id') THEN
        CREATE INDEX idx_products_category_id ON products(category_id);
    END IF;
END $$;

-- RLS Policies for farmer_profiles
CREATE POLICY "Farmers can view their own profile"
    ON farmer_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Farmers can update their own profile"
    ON farmer_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for products
CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT
    USING (true);

CREATE POLICY "Products are insertable by farmers"
    ON products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM farmer_profiles 
            WHERE farmer_profiles.id = products.seller_id
            AND farmer_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Products are updatable by farmers"
    ON products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM farmer_profiles 
            WHERE farmer_profiles.id = products.seller_id
            AND farmer_profiles.user_id = auth.uid()
        )
    );
