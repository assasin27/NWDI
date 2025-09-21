-- Create enum type for farmer status
CREATE TYPE farmer_status AS ENUM ('pending', 'active', 'suspended');

-- Create or replace farmer_profiles table
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    description TEXT,
    status farmer_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;

-- Allow farmers to read their own profile
CREATE POLICY "Farmers can read own profile"
    ON public.farmer_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow farmers to update their own profile
CREATE POLICY "Farmers can update own profile"
    ON public.farmer_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user_id ON public.farmer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_email ON public.farmer_profiles(email);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_farmer_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_farmer_profiles_updated_at
    BEFORE UPDATE ON public.farmer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_farmer_profiles_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.farmer_profiles TO authenticated;
GRANT USAGE ON SEQUENCE farmer_profiles_id_seq TO authenticated;
