import type { CartItem } from '@/lib/cartService';
import type { ProductVariant } from '@/lib/productsData';

export const mockApiService = {
  testCartConnection: jest.fn(),
  getCartItems: jest.fn(),
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateQuantity: jest.fn(),
};
