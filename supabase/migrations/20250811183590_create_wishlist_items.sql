CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    image TEXT,
    category TEXT,
    description TEXT,
    is_organic BOOLEAN DEFAULT false,
    in_stock BOOLEAN DEFAULT true,
    selected_variant JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist_items(product_id);

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_wishlist_items_updated_at
    BEFORE UPDATE ON public.wishlist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own wishlist items
CREATE POLICY "Users can view own wishlist items"
    ON public.wishlist_items
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own wishlist items
CREATE POLICY "Users can insert own wishlist items"
    ON public.wishlist_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own wishlist items
CREATE POLICY "Users can update own wishlist items"
    ON public.wishlist_items
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete their own wishlist items
CREATE POLICY "Users can delete own wishlist items"
    ON public.wishlist_items
    FOR DELETE
    USING (auth.uid() = user_id);
