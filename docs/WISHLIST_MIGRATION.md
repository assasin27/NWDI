# Wishlist Table Migration Guide

This document outlines the changes made to fix the wishlist table naming inconsistency and provides instructions for applying these changes in different environments.

## Changes Made

1. **API Service Update**:
   - Updated all wishlist-related methods in `apiService.ts` to use `wishlist_items` instead of `wishlist`
   - Ensured all CRUD operations reference the correct table name

2. **Database Migration**:
   - Created a migration script to rename the table from `wishlist_items` to `wishlist`
   - Updated all related indexes and constraints
   - Added proper RLS policies for the new table name

## Migration Instructions

### Option 1: Update Code (Recommended)

1. The code has already been updated to use `wishlist_items` table
2. No database changes are needed if you want to keep using `wishlist_items`
3. Deploy the updated code to your environment

### Option 2: Rename Table (If you prefer `wishlist` table name)

1. Run the migration script:
   ```sql
   -- Rename wishlist_items to wishlist
   BEGIN;
   
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
   
   COMMIT;
   ```

## Verification

1. **Test Wishlist Operations**:
   - Add items to wishlist
   - Remove items from wishlist
   - View wishlist items
   - Clear wishlist

2. **Check Database**:
   - Verify the table exists with the correct name
   - Confirm RLS policies are in place
   - Ensure all indexes and constraints are correctly named

## Rollback Plan

If you need to rollback:

1. Revert the code changes to use the previous table name
2. If you renamed the table, run:
   ```sql
   BEGIN;
   ALTER TABLE public.wishlist RENAME TO wishlist_items;
   -- Revert index names if needed
   COMMIT;
   ```

## Environment Variables

Ensure these environment variables are set in your deployment:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Support

If you encounter any issues, please check the following:
- Supabase logs for any errors
- Network tab in browser dev tools for failed API requests
- Verify RLS policies in Supabase dashboard

## Additional Notes

- The application now uses `wishlist_items` as the default table name
- All existing wishlist data should be preserved
- The migration is backward compatible with existing data
