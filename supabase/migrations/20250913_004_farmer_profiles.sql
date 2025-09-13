-- Drop existing table if it exists
DROP TABLE IF EXISTS farmer_profiles CASCADE;

-- Create the farmer_profiles table
CREATE TABLE farmer_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR NOT NULL UNIQUE,
    farm_name VARCHAR NOT NULL,
    description TEXT,
    region VARCHAR,
    certification VARCHAR,
    phone VARCHAR,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_farmer_profiles_user_id ON farmer_profiles(user_id);
CREATE INDEX idx_farmer_profiles_email ON farmer_profiles(email);

-- Enable Row Level Security
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Farmers can view their own profile"
    ON farmer_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Farmers can update their own profile"
    ON farmer_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all profiles"
    ON farmer_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@nareshwadi.in'
        )
    );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_farmer_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update timestamp
CREATE TRIGGER update_farmer_profiles_timestamp
    BEFORE UPDATE ON farmer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_farmer_profiles_timestamp();

-- Insert test farmer account (first create auth user, then profile)
DO $$
BEGIN
    -- Only insert if the test farmer doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'test@nareshwadi.in'
    ) THEN
        -- Insert into auth.users first
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            aud,
            role
        ) VALUES (
            gen_random_uuid(),  -- Generate UUID for id
            '00000000-0000-0000-0000-000000000000',  -- Default instance_id
            'test@nareshwadi.in',
            crypt('farmer', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"role":"farmer"}',
            now(),
            now(),
            'authenticated',
            'authenticated'
        );

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
            (SELECT id FROM auth.users WHERE email = 'test@nareshwadi.in'),
            'test@nareshwadi.in',
            'Nareshwadi Test Farm',
            'Test farm for development purposes',
            'Maharashtra',
            'Organic',
            '+91-1234567890',
            true
        );
    END IF;
END
$$;
