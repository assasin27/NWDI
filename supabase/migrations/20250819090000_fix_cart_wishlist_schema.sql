-- Fix cart_items table
-- 1. First, drop the duplicate selectedvariant column (case-insensitive check)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'cart_items' AND 
                     column_name = 'selectedvariant' AND 
                     column_name != 'selectedVariant') THEN
        ALTER TABLE public.cart_items DROP COLUMN "selectedvariant";
    END IF;
END $$;

-- 2. Fix wishlist_items table
-- Drop the duplicate selectedvariant column (case-insensitive check)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'wishlist_items' AND 
                     column_name = 'selectedvariant' AND 
                     column_name != 'selectedVariant') THEN
        ALTER TABLE public.wishlist_items DROP COLUMN "selectedvariant";
    END IF;
END $$;

-- 3. Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- For cart_items
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'cart_items_product_id_fkey'
    ) THEN
        -- First, make the column nullable
        ALTER TABLE public.cart_items 
        ALTER COLUMN product_id DROP NOT NULL;
        
        -- Create a temporary column with UUID type
        ALTER TABLE public.cart_items 
        ADD COLUMN temp_product_id UUID;
        
        -- Convert valid UUID strings to UUID type
        UPDATE public.cart_items 
        SET temp_product_id = product_id::uuid
        WHERE product_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND product_id IN (SELECT id::text FROM public.products);
        
        -- Drop the old column and rename the new one
        ALTER TABLE public.cart_items DROP COLUMN product_id;
        ALTER TABLE public.cart_items RENAME COLUMN temp_product_id TO product_id;
        
        -- Add the foreign key constraint
        ALTER TABLE public.cart_items
        ADD CONSTRAINT cart_items_product_id_fkey 
        FOREIGN KEY (product_id) 
        REFERENCES public.products(id) 
        ON DELETE SET NULL;
        
        -- Log any orphaned cart items
        RAISE NOTICE 'Found % cart items with invalid product references', 
            (SELECT COUNT(*) FROM public.cart_items WHERE product_id IS NULL);
    END IF;

    -- For wishlist_items
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'wishlist_items_product_id_fkey'
    ) THEN
        -- First, make the column nullable
        ALTER TABLE public.wishlist_items 
        ALTER COLUMN product_id DROP NOT NULL;
        
        -- Create a temporary column with UUID type
        ALTER TABLE public.wishlist_items 
        ADD COLUMN temp_product_id UUID;
        
        -- Convert valid UUID strings to UUID type
        UPDATE public.wishlist_items 
        SET temp_product_id = product_id::uuid
        WHERE product_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND product_id IN (SELECT id::text FROM public.products);
        
        -- Drop the old column and rename the new one
        ALTER TABLE public.wishlist_items DROP COLUMN product_id;
        ALTER TABLE public.wishlist_items RENAME COLUMN temp_product_id TO product_id;
        
        -- Add the foreign key constraint
        ALTER TABLE public.wishlist_items
        ADD CONSTRAINT wishlist_items_product_id_fkey 
        FOREIGN KEY (product_id) 
        REFERENCES public.products(id) 
        ON DELETE CASCADE;
        
        -- Log any orphaned wishlist items
        RAISE NOTICE 'Found % wishlist items with invalid product references', 
            (SELECT COUNT(*) FROM public.wishlist_items WHERE product_id IS NULL);
    END IF;
END $$;

-- 4. Add indexes for better performance if they don't exist
DO $$
BEGIN
    -- For cart_items
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_cart_items_user_id'
    ) THEN
        CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_cart_items_product_id'
    ) THEN
        CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);
    END IF;

    -- For wishlist_items
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_wishlist_items_user_id'
    ) THEN
        CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_wishlist_items_product_id'
    ) THEN
        CREATE INDEX idx_wishlist_items_product_id ON public.wishlist_items(product_id);
    END IF;
END $$;
