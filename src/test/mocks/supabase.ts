export const supabase = {
  auth: {
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    signOut: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        limit: jest.fn()
      })),
      limit: jest.fn()
    })),
    insert: jest.fn(),
    update: jest.fn(() => ({
      eq: jest.fn()
    })),
    delete: jest.fn(() => ({
      eq: jest.fn()
    }))
  }))
};

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { name: 'Test User' },
};

export const mockCartItems = [
  {
    id: 'cart-1',
    user_id: 'test-user-id',
    product_id: 'product-1',
    name: 'Test Product',
    price: 100,
    quantity: 1,
  },
];

export const mockWishlistItems = [
  {
    id: 'wishlist-1',
    user_id: 'test-user-id',
    product_id: 'product-1',
    name: 'Test Product',
    price: 100,
  },
]; 