-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for timestamp updates
CREATE TRIGGER update_farmer_profiles_timestamp
    BEFORE UPDATE ON farmer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_timestamp
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('Vegetables', 'Fresh vegetables from local farms'),
    ('Fruits', 'Seasonal fruits and berries'),
    ('Grains', 'Whole grains and cereals'),
    ('Dairy', 'Farm-fresh dairy products'),
    ('Herbs', 'Fresh and dried herbs')
ON CONFLICT DO NOTHING;

-- Insert test farmer account
DO $$
DECLARE
    test_user_id UUID;
    test_farmer_id UUID;
BEGIN
    -- Only insert if the test farmer doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'test@nareshwadi.in'
    ) THEN
        -- Get or create test user using auth.users() function
        SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@nareshwadi.in';
        
        -- If user doesn't exist, we'll skip - user should be created through auth API
        IF test_user_id IS NULL THEN
            RAISE NOTICE 'Test user does not exist in auth.users table. Create through auth API first.';
            RETURN;
        END IF;

        -- Then insert the farmer profile
        INSERT INTO farmer_profiles (
            user_id,
            email,
            farm_name,
            description,
            region,
            certification,
            phone,
            is_verified
        ) VALUES (
            test_user_id,
            'test@nareshwadi.in',
            'Nareshwadi Test Farm',
            'Test farm for development purposes',
            'Maharashtra',
            'Organic',
            '+91-1234567890',
            true
        ) RETURNING id INTO test_farmer_id;

        -- Insert some test products
        INSERT INTO products (
            seller_id,
            category_id,
            name,
            description,
            price,
            quantity,
            region
        ) VALUES
        (
            test_farmer_id,
            (SELECT id FROM categories WHERE name = 'Vegetables' LIMIT 1),
            'Fresh Tomatoes',
            'Organically grown fresh tomatoes',
            50.00,
            100,
            'Maharashtra'
        );
    END IF;
END
$$;
