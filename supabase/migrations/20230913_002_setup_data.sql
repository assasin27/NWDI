-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for timestamp updates
DO $$ 
BEGIN
    -- Check if trigger exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_farmer_profiles_timestamp'
    ) THEN
        CREATE TRIGGER update_farmer_profiles_timestamp
            BEFORE UPDATE ON farmer_profiles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_products_timestamp'
    ) THEN
        CREATE TRIGGER update_products_timestamp
            BEFORE UPDATE ON products
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('Vegetables', 'Fresh vegetables from local farms'),
    ('Fruits', 'Seasonal fruits and berries'),
    ('Grains', 'Whole grains and cereals'),
    ('Dairy', 'Farm-fresh dairy products'),
    ('Herbs', 'Fresh and dried herbs')
ON CONFLICT DO NOTHING;

-- Note: Test farmer account should be created through the authentication API
-- This has been removed from the migration as it requires special auth handling