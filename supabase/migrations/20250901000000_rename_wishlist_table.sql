-- Rename wishlist_items to wishlist
BEGIN;

-- Rename the table
ALTER TABLE public.wishlist_items RENAME TO wishlist;

-- Rename indexes
ALTER INDEX IF EXISTS wishlist_items_pkey RENAME TO wishlist_pkey;
ALTER INDEX IF EXISTS wishlist_items_product_id_fkey RENAME TO wishlist_product_id_fkey;
ALTER INDEX IF EXISTS wishlist_items_user_id_fkey RENAME TO wishlist_user_id_fkey;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own wishlist items" ON public.wishlist;
DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON public.wishlist;
DROP POLICY IF EXISTS "Users can update their own wishlist items" ON public.wishlist;
DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON public.wishlist;

-- Recreate RLS policies
CREATE POLICY "Users can view their own wishlist items"
    ON public.wishlist
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own wishlist items"
    ON public.wishlist
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own wishlist items"
    ON public.wishlist
    FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own wishlist items"
    ON public.wishlist
    FOR DELETE
    USING (auth.uid()::text = user_id);

-- Update any views or functions that reference the old table name
-- Example:
-- CREATE OR REPLACE VIEW public.user_wishlist AS
-- SELECT * FROM public.wishlist;

COMMIT;
