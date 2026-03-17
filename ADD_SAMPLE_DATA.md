# How to Add Sample Data to Supabase

## Option 1: Using Supabase Studio (Easiest)

### Step 1: Go to Supabase Dashboard
1. Visit: https://app.supabase.com
2. Login with your account
3. Select your project: `farmfresh-dashboard`
4. Go to SQL Editor on the left sidebar

### Step 2: Create Tables (if they don't exist)

#### Create Products Table:
```sql
CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  price numeric NOT NULL,
  quantity integer NOT NULL,
  image_url character varying,
  certification character varying,
  region character varying,
  category character varying,
  in_stock boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read products"
  ON products FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow all authenticated users to insert
CREATE POLICY "Allow authenticated users to create products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow all authenticated users to update
CREATE POLICY "Allow authenticated users to update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow all authenticated users to delete
CREATE POLICY "Allow authenticated users to delete products"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');
```

#### Create Orders Table:
```sql
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  customer_id uuid,
  customer_name character varying,
  customer_email character varying,
  status character varying DEFAULT 'pending',
  total_amount numeric,
  shipping_address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

#### Create Order Items Table:
```sql
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  product_name character varying,
  quantity integer,
  price numeric,
  CONSTRAINT order_items_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read order_items"
  ON order_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create order_items"
  ON order_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

### Step 3: Insert Sample Data

#### Add Products:
```sql
INSERT INTO products (name, description, price, quantity, image_url, certification, region, category, in_stock)
VALUES 
  ('Organic Tomatoes', 'Fresh, pesticide-free tomatoes from Nareshwadi farm', 45.50, 25, 'https://via.placeholder.com/300x300?text=Tomatoes', 'Organic', 'Nareshwadi', 'Vegetables', true),
  ('Fresh Spinach', 'Leafy green spinach, organically grown', 30.00, 15, 'https://via.placeholder.com/300x300?text=Spinach', 'Organic', 'Nareshwadi', 'Leafy Greens', true),
  ('Sweet Carrots', 'Sweet orange carrots, fresh from farm', 35.00, 30, 'https://via.placeholder.com/300x300?text=Carrots', 'Organic', 'Nareshwadi', 'Vegetables', true),
  ('Bell Peppers (Red)', 'Fresh red bell peppers', 50.00, 12, 'https://via.placeholder.com/300x300?text=RedPeppers', 'Organic', 'Nareshwadi', 'Vegetables', true),
  ('Cucumber', 'Fresh crisp cucumber', 25.00, 20, 'https://via.placeholder.com/300x300?text=Cucumber', 'Organic', 'Nareshwadi', 'Vegetables', true);
```

#### Add Orders:
```sql
INSERT INTO orders (customer_id, customer_name, customer_email, total_amount, status, shipping_address)
VALUES 
  (gen_random_uuid(), 'Raj Kumar', 'raj@example.com', 250.50, 'processing', '123 Main St, Nareshwadi, India'),
  (gen_random_uuid(), 'Priya Singh', 'priya@example.com', 150.00, 'shipped', '456 Oak Ave, Nareshwadi, India'),
  (gen_random_uuid(), 'Amit Patel', 'amit@example.com', 100.00, 'delivered', '789 Pine Rd, Nareshwadi, India');
```

#### Add Order Items:
First, get the IDs of products and orders from the tables, then:
```sql
-- Add items to order 1
INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
SELECT o.id, p.id, p.name, 2, p.price
FROM orders o, products p
WHERE o.customer_name = 'Raj Kumar' AND p.name = 'Organic Tomatoes'
LIMIT 1;

-- Add more items
INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
SELECT o.id, p.id, p.name, 1, p.price
FROM orders o, products p
WHERE o.customer_name = 'Raj Kumar' AND p.name = 'Fresh Spinach'
LIMIT 1;
```

### Step 4: Verify Data
- Go to the Table Editor in Supabase
- You should see your products and orders displayed
- Navigate to dashboard and refresh

---

## Option 2: Using Python Script

### Create a Python script:
```python
import os
from supabase import create_client, Client
from datetime import datetime

# Initialize Supabase client
SUPABASE_URL = "https://lzjhjecktllltkizgwnr.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6amhqZWNrdGxsbHRraXpnd25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTg0NTUsImV4cCI6MjA2ODE3NDQ1NX0.MW3fIJA4_8nnMnC-__8aloqH1tBo4IIpmA_2LPqDxug"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Add sample products
products = [
    {
        "name": "Organic Tomatoes",
        "description": "Fresh, pesticide-free tomatoes",
        "price": 45.50,
        "quantity": 25,
        "image_url": "https://via.placeholder.com/300x300?text=Tomatoes",
        "certification": "Organic",
        "region": "Nareshwadi",
        "category": "Vegetables",
        "in_stock": True
    },
    {
        "name": "Fresh Spinach",
        "description": "Leafy green spinach",
        "price": 30.00,
        "quantity": 15,
        "image_url": "https://via.placeholder.com/300x300?text=Spinach",
        "certification": "Organic",
        "region": "Nareshwadi",
        "category": "Leafy Greens",
        "in_stock": True
    },
    {
        "name": "Sweet Carrots",
        "description": "Sweet orange carrots",
        "price": 35.00,
        "quantity": 30,
        "image_url": "https://via.placeholder.com/300x300?text=Carrots",
        "certification": "Organic",
        "region": "Nareshwadi",
        "category": "Vegetables",
        "in_stock": True
    }
]

# Insert products
response = supabase.table("products").insert(products).execute()
print("Products inserted:", response)

# Add sample orders
orders = [
    {
        "customer_name": "Raj Kumar",
        "customer_email": "raj@example.com",
        "total_amount": 250.50,
        "status": "processing",
        "shipping_address": "123 Main St, Nareshwadi, India"
    },
    {
        "customer_name": "Priya Singh",
        "customer_email": "priya@example.com",
        "total_amount": 150.00,
        "status": "shipped",
        "shipping_address": "456 Oak Ave, Nareshwadi, India"
    }
]

response = supabase.table("orders").insert(orders).execute()
print("Orders inserted:", response)
```

### Run it:
```bash
pip install supabase
python add_sample_data.py
```

---

## Option 3: Using TypeScript Functions (Browser Console)

### Create a test file:
```typescript
// In src/lib/testSupabase.ts (already created)

export const populateSampleData = async () => {
  // Products
  const sampleProducts = [
    {
      name: "Organic Tomatoes",
      description: "Fresh tomatoes",
      price: 45.50,
      quantity: 25,
      category: "Vegetables",
      in_stock: true
    }
    // ... more products
  ];
  
  const { error: productError } = await supabase
    .from('products')
    .insert(sampleProducts);
  
  if (productError) console.error('Error:', productError);
  else console.log('Products added!');
  
  // Orders
  const sampleOrders = [
    {
      customer_name: "Raj Kumar",
      customer_email: "raj@example.com",
      total_amount: 250.50,
      status: "processing"
    }
    // ... more orders
  ];
  
  const { error: orderError } = await supabase
    .from('orders')
    .insert(sampleOrders);
  
  if (orderError) console.error('Error:', orderError);
  else console.log('Orders added!');
};
```

### Run in browser console:
```javascript
import { populateSampleData } from './lib/testSupabase.ts';
await populateSampleData();
```

---

## Option 4: Manual Using Table Editor

1. Go to Supabase Dashboard
2. Click "Table Editor" on left
3. Click "Products" table
4. Click "+ Insert row"
5. Fill in:
   - name: "Organic Tomatoes"
   - description: "Fresh tomatoes"
   - price: 45.50
   - quantity: 25
   - category: "Vegetables"
   - certification: "Organic"
   - region: "Nareshwadi"
   - in_stock: true
6. Click "Save"
7. Repeat for more products

---

## Verification

### Check if data is in Supabase:
1. Go to Table Editor
2. Click "Products" - should see your data
3. Click "Orders" - should see orders
4. Go back to dashboard and refresh

### Check if dashboard shows data:
1. Open: http://localhost:3001/farmer/dashboard
2. Should see stats updated with real data
3. Recent Orders tab should show your orders
4. Inventory tab should show your products

---

## Sample Product Data Ready to Copy-Paste

```json
[
  {
    "name": "Organic Tomatoes",
    "description": "Fresh, pesticide-free tomatoes from Nareshwadi farm",
    "price": 45.50,
    "quantity": 25,
    "image_url": "https://via.placeholder.com/300x300?text=Tomatoes",
    "certification": "Organic",
    "region": "Nareshwadi",
    "category": "Vegetables",
    "in_stock": true
  },
  {
    "name": "Fresh Spinach",
    "description": "Leafy green spinach, organically grown",
    "price": 30.00,
    "quantity": 15,
    "image_url": "https://via.placeholder.com/300x300?text=Spinach",
    "certification": "Organic",
    "region": "Nareshwadi",
    "category": "Leafy Greens",
    "in_stock": true
  },
  {
    "name": "Sweet Carrots",
    "description": "Sweet orange carrots, fresh from farm",
    "price": 35.00,
    "quantity": 30,
    "image_url": "https://via.placeholder.com/300x300?text=Carrots",
    "certification": "Organic",
    "region": "Nareshwadi",
    "category": "Vegetables",
    "in_stock": true
  }
]
```

---

## Troubleshooting

### "Table doesn't exist"
- Check Supabase has the tables created
- Run the CREATE TABLE SQL above
- Refresh page

### "Permission denied"
- Make sure RLS policies are created
- Or disable RLS temporarily for testing
- Check authentication is working

### "Data not showing on dashboard"
- Refresh browser (F5)
- Check console for errors (F12)
- Verify Supabase URL and key in .env
- Wait a few seconds for data to sync

---

**Next:** Once data is added, refresh your dashboard to see real data! 🎉
