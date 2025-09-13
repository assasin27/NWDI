# Supabase Integration

This directory contains Supabase-related code for the Nareshwadi Products e-commerce platform.

## Important Note

The main Supabase client initialization has been moved to `src/lib/supabase.ts` and should be imported from there:

```typescript
import { supabase } from '../../lib/supabase';
```

This ensures consistent usage of environment variables across the application.

## Files
- `types.ts`: TypeScript types for the database schema
- `auth.ts`: Authentication service (sign up, login, logout, etc.)
- `database.ts`: Database operations (products, orders, reviews, etc.)
- `storage.ts`: File upload and management with Supabase Storage

## Setup

1. Make sure you have the following environment variables in your `.env` file:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Usage

### Authentication

```typescript
import { signUp, login, logout, getCurrentUser } from '@/integrations/supabase/auth';

// Sign up a new user
const user = await signUp({
  email: 'user@example.com',
  password: 'secure-password',
  firstName: 'John',
  lastName: 'Doe',
  isSeller: false
});

// Login
const loggedInUser = await login({
  email: 'user@example.com',
  password: 'secure-password'
});

// Logout
await logout();

// Get current user
const currentUser = await getCurrentUser();

// Listen for auth state changes
import { onAuthStateChange } from '@/integrations/supabase/auth';

const unsubscribe = onAuthStateChange((user) => {
  console.log('User state changed:', user);
});

// Don't forget to unsubscribe when component unmounts
unsubscribe();
```

### Database Operations

```typescript
import { 
  getProducts, 
  getProductById, 
  getCategories, 
  createOrder 
} from '@/integrations/supabase/database';

// Get all products
const products = await getProducts();

// Get products by category
const vegetables = await getProducts('vegetables-category-id');

// Get single product
const product = await getProductById('product-id');

// Get categories
const categories = await getCategories();

// Create an order
const order = await createOrder({
  userId: 'user-id',
  items: [
    {
      productId: 'product-1',
      productName: 'Organic Tomatoes',
      productPrice: 2.99,
      quantity: 2
    }
  ],
  shippingAddress: '123 Main St, City, Country'
});
```

### File Storage

```typescript
import { uploadFile, deleteFile } from '@/integrations/supabase/storage';

// Upload a file
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const fileUrl = await uploadFile(file, 'products');

// Delete a file
await deleteFile(fileUrl);
```

## Real-time Subscriptions

```typescript
import { subscribeToOrderUpdates } from '@/integrations/supabase/database';

// Subscribe to order updates
const unsubscribe = subscribeToOrderUpdates('order-id', (payload) => {
  console.log('Order updated:', payload);
  
  // Handle the update
  if (payload.eventType === 'UPDATE') {
    console.log('Order status changed to:', payload.new.status);
  }
});

// Unsubscribe when done
unsubscribe();
```

## Error Handling

All Supabase operations can throw errors. Make sure to handle them appropriately:

```typescript
try {
  const user = await login({ email, password });
  // Handle success
} catch (error) {
  console.error('Login failed:', error.message);
  // Show error to user
}
```

## Type Safety

All database operations are fully typed. You can import types from the types file:

```typescript
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
```

## Next Steps

1. Set up proper error boundaries in your React components
2. Implement loading states for async operations
3. Add proper error messages for the end user
4. Set up proper file validation before upload
