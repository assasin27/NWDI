# Database Setup for Cart and Wishlist

This document explains how to set up the database tables for the cart and wishlist functionality.

## Prerequisites

1. You need access to your Supabase project dashboard
2. The Supabase project should have authentication enabled

## Setup Instructions

### 1. Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor

### 2. Create Database Tables

Copy and paste the following SQL script into the SQL Editor and execute it:

```sql
-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_organic BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_organic BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for cart_items
CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for wishlist_items
CREATE POLICY "Users can view their own wishlist items" ON wishlist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items" ON wishlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist items" ON wishlist_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" ON wishlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON wishlist_items(product_id);
```

### 3. Verify Setup

After running the SQL script, you should see:

1. Two new tables: `cart_items` and `wishlist_items`
2. Row Level Security (RLS) enabled on both tables
3. Policies created for secure access
4. Indexes created for better performance

## How It Works

### Cart and Wishlist Persistence

- **User-specific data**: Each user can only see and modify their own cart and wishlist items
- **Automatic cleanup**: When a user logs out, their cart and wishlist are cleared from the UI
- **Database persistence**: Cart and wishlist items are stored in the database and tied to the user's account
- **Security**: Row Level Security ensures users can only access their own data

### Authentication Required

- Users must be logged in to add items to cart or wishlist
- If a user tries to add items without being logged in, they'll see an error message
- Cart and wishlist are automatically loaded when a user logs in
- Cart and wishlist are automatically cleared when a user logs out

### Database Schema

#### cart_items table:
- `id`: Unique identifier for the cart item
- `user_id`: References the authenticated user
- `product_id`: The product identifier
- `name`, `price`, `image`, `category`, `description`: Product details
- `quantity`: Number of items in cart
- `is_organic`, `in_stock`: Product flags
- `created_at`, `updated_at`: Timestamps

#### wishlist_items table:
- Similar structure to cart_items but without quantity field
- Each product can only be in the wishlist once per user

## Testing

1. **Login**: Create an account or log in to an existing account
2. **Add to Cart**: Click "Add to Cart" on any product
3. **Add to Wishlist**: Click the heart icon on any product
4. **Navigate**: Go to different pages and verify items persist
5. **Logout**: Log out and verify cart/wishlist are cleared
6. **Login Again**: Log back in and verify your items are restored

## Troubleshooting

### Common Issues:

1. **"User not authenticated" error**: Make sure you're logged in
2. **Database connection errors**: Check your Supabase URL and API key
3. **Permission denied**: Ensure RLS policies are correctly set up
4. **Items not persisting**: Check the browser console for errors

### Debug Steps:

1. Check browser console for error messages
2. Verify Supabase connection in the client configuration
3. Test database queries directly in Supabase SQL Editor
4. Check that user authentication is working properly 