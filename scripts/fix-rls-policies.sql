-- Fix RLS Policies for products table

-- First, drop all existing policies to avoid conflicts
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename = 'products' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', policy_record.policyname);
    END LOOP;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 1. Allow public read access to all products
CREATE POLICY "Enable read access for all users" 
ON public.products 
FOR SELECT 
TO public
USING (true);

-- 2. Allow authenticated users to insert their own products
--    (they must have a seller_profile and the seller_id must match)
CREATE POLICY "Enable insert for authenticated users" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.seller_profiles 
        WHERE seller_profiles.id = products.seller_id 
        AND seller_profiles.user_id = auth.uid()
    )
);

-- 3. Allow users to update their own products
CREATE POLICY "Enable update for users based on seller_id" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.seller_profiles 
        WHERE seller_profiles.id = products.seller_id 
        AND seller_profiles.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.seller_profiles 
        WHERE seller_profiles.id = products.seller_id 
        AND seller_profiles.user_id = auth.uid()
    )
);

-- 4. Allow users to delete their own products
CREATE POLICY "Enable delete for users based on seller_id" 
ON public.products 
FOR DELETE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.seller_profiles 
        WHERE seller_profiles.id = products.seller_id 
        AND seller_profiles.user_id = auth.uid()
    )
);

-- Verify the policies were created
SELECT * FROM pg_policies WHERE tablename = 'products';
