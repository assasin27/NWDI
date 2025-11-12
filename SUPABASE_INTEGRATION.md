# Farmer Dashboard - Supabase Integration Guide

## ✅ Changes Made

### 1. **FarmerDashboard Component** (`src/pages/farmer/FarmerDashboard.tsx`)
   - **Removed:** `apiService` imports (mock API service)
   - **Added:** `productService` and `orderService` imports from Supabase
   - **Updated Methods:**
     - `loadStats()` - Now uses `productService.getAllProducts()` and `orderService.getAllOrders()`
     - `loadRecentOrders()` - Uses `orderService.getAllOrders()`
     - `loadInventoryItems()` - Uses `productService.getAllProducts()`
     - `loadStockAlerts()` - Uses `productService.getAllProducts()`
     - `handleUpdateOrderStatus()` - Uses `orderService.updateOrderStatus()`
     - `handleUpdateStock()` - Uses `productService.getProductById()` and `productService.updateProduct()`
     - `exportInventoryReport()` - Uses `productService.getAllProducts()`

### 2. **Product Service** (`src/lib/productService.ts`)
   - **Updated Interface:**
     - Added `quantity` property (required for stock management)
     - Added `image_url` property (optional, maps to `image`)
   - **Already Implemented Methods:**
     - `getAllProducts()` - Get all products from Supabase
     - `getProductById()` - Get single product
     - `updateProduct()` - Update product details and stock
     - `deleteProduct()` - Delete product
     - `addProduct()` - Add new product
     - `searchProducts()` - Search by name/description
     - `getProductCategories()` - Get unique categories
     - `updateProductStock()` - Update in_stock status
     - `getProductStats()` - Get product statistics

### 3. **Order Service** (`src/lib/orderService.ts`)
   - **Already Implemented Methods:**
     - `getAllOrders()` - Get all orders for farmer dashboard
     - `getOrderById()` - Get single order with items
     - `updateOrderStatus()` - Update order status (pending/shipped/delivered)
     - `createOrder()` - Create new order
     - `getOrderStats()` - Get order statistics

### 4. **Supabase Configuration** (`src/integrations/supabase/supabaseClient.ts`)
   - Already configured with environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Uses production Supabase project: `lzjhjecktllltkizgwnr.supabase.co`

### 5. **Environment Variables** (`.env`)
   ```
   VITE_SUPABASE_URL=https://lzjhjecktllltkizgwnr.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 🚀 How It Works Now

### Data Flow:
1. **FarmerDashboard** component loads
2. Calls **productService** and **orderService** methods
3. These services make queries to **Supabase** database
4. Real data from `products` and `orders` tables is displayed
5. User can perform CRUD operations directly on Supabase

### Supported Operations:

#### Products:
- ✅ View all products
- ✅ View product details
- ✅ Add new product
- ✅ Update product (name, price, description, quantity, etc.)
- ✅ Delete product
- ✅ Update stock levels
- ✅ Search products
- ✅ Export inventory CSV

#### Orders:
- ✅ View all orders
- ✅ View order details with items
- ✅ Update order status (pending → shipped → delivered)
- ✅ View order statistics (total, processing, delivered, etc.)

## 📋 Database Schema

### Products Table:
```sql
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  image_url VARCHAR,
  certification VARCHAR,
  region VARCHAR,
  category_id uuid REFERENCES categories(id),
  category VARCHAR,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Orders Table:
```sql
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  customer_name VARCHAR,
  customer_email VARCHAR,
  status VARCHAR DEFAULT 'pending',
  total_amount NUMERIC,
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  product_name VARCHAR,
  quantity INTEGER,
  price NUMERIC
);
```

## 🧪 Testing the Connection

### Quick Test:
1. Open Farmer Dashboard: `http://localhost:3001/farmer/dashboard`
2. Check DevTools Console (F12) for any errors
3. Verify data loads from Supabase

### Populate Test Data:
Use the test functions in `src/lib/testSupabase.ts`:

```typescript
import { 
  testSupabaseConnection, 
  addSampleProducts, 
  addSampleOrders,
  checkDatabaseStatus 
} from '../lib/testSupabase';

// Test connection
await testSupabaseConnection();

// Add sample data
await addSampleProducts();
await addSampleOrders();

// Check status
await checkDatabaseStatus();
```

## 🔄 Switching Between Mock and Real Data

### To Use Mock API (Development):
- Keep running: `node backend-mock.js` (port 8000)
- Update FarmerDashboard to use `apiService` again

### To Use Supabase (Real Data):
- Dashboard now uses `productService` and `orderService`
- Automatically reads from `.env` Supabase credentials
- No mock server needed

## ✨ Key Features Now Working

1. **Dashboard Overview:**
   - Total revenue (sum of all order amounts)
   - Total orders count
   - Pending/delivered orders
   - Total products
   - Low stock/out of stock alerts

2. **Recent Orders Tab:**
   - Display last 10 orders
   - Customer name, email, amount
   - Order status (pending/shipped/delivered)
   - Update status with one click

3. **Inventory Management:**
   - List all products with current stock
   - Add/remove stock levels
   - View product details
   - Mark as in/out of stock

4. **Stock Alerts:**
   - Auto-detect products with quantity ≤ 10
   - Show out of stock items
   - Display alert type and creation date

5. **Export Report:**
   - Download inventory as CSV
   - Includes product ID, name, stock, price, category, last updated

## 🐛 Troubleshooting

### "Products not loading":
1. Check Supabase credentials in `.env`
2. Verify `products` table exists in Supabase
3. Check browser console for errors (F12)
4. Run `testSupabaseConnection()` to verify connectivity

### "Orders showing as empty":
1. Verify `orders` table exists in Supabase
2. Check that orders have proper `customer_id` and `user_id`
3. Ensure order items are linked in `order_items` table

### "Update operations failing":
1. Check Supabase RLS policies allow updates
2. Verify user has proper permissions
3. Check network tab for failed requests

## 📝 Notes

- The mock Express API server (`backend-mock.js`) is no longer used
- All data is now persisted in Supabase
- Changes sync immediately with Supabase database
- Use Supabase Studio to view/edit data directly: https://app.supabase.com
