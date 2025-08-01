export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
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