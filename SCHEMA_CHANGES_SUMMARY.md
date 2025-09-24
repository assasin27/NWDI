# Schema Changes Summary: Multi-Seller to Single Farmer/Admin

## Overview
This document outlines the changes made to convert the multi-seller system to a single farmer/admin system for the Nareshwadi Products platform.

## Key Changes Made

### 1. **Removed Multi-Seller Structure**
- ❌ **Removed**: `seller_profiles` table
- ❌ **Removed**: `is_seller` column from `users` table
- ❌ **Removed**: `seller_id` foreign key from `products` table

### 2. **Added Single Admin Structure**
- ✅ **Added**: `is_admin` boolean column to `users` table
- ✅ **Added**: `admin_profile` table for single farmer profile
- ✅ **Simplified**: Products no longer need seller association

### 3. **Updated Row Level Security (RLS) Policies**
- **Products**: Only admin can create/update/delete products
- **Orders**: Admin can view and update all orders
- **Categories**: Admin manages all categories
- **Reviews**: Public can view, users can create, admin can delete

### 4. **New Admin Account**
- **Email**: `admin@nareshwadi.in`
- **Password**: `admin123`
- **Farm Name**: "Nareshwadi Organic Farm"
- **Region**: "Nareshwadi, Maharashtra"

## Database Structure After Changes

### Core Tables:
1. **users** - Customers + single admin
2. **admin_profile** - Single farmer profile
3. **categories** - Product categories
4. **products** - All products (no seller association)
5. **orders** - Customer orders
6. **order_items** - Order line items
7. **reviews** - Product reviews
8. **notifications** - System notifications
9. **cart_items** - Shopping cart
10. **wishlist_items** - Customer wishlists

## Access Control

### Admin Access (Farmer Portal):
- ✅ Manage all products
- ✅ View all orders
- ✅ Update order status
- ✅ Manage categories
- ✅ Delete reviews
- ✅ Send notifications
- ✅ View all customers

### Customer Access:
- ✅ Browse products
- ✅ Place orders
- ✅ Write reviews
- ✅ Manage cart/wishlist
- ✅ View own orders

## Migration Files Created:
1. `supabase/migrations/20250121120000_convert_to_single_farmer.sql` - Migration script
2. `single_farmer_schema.sql` - Complete new schema

## Next Steps:
1. Apply the migration to Supabase
2. Update frontend code to use admin authentication
3. Modify farmer portal to use admin role instead of seller role
4. Test the new single-farmer system

## Benefits of This Change:
- ✅ Simplified architecture
- ✅ Single point of control
- ✅ Easier maintenance
- ✅ Clear admin/customer separation
- ✅ Better security model

