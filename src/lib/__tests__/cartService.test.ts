import { cartService } from '../cartService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('cartService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCartItems', () => {
    it('should fetch cart items successfully', async () => {
      const mockCartItems = [
        {
          id: '1',
          user_id: 'user123',
          product_id: 'prod1',
          name: 'Test Product',
          price: 100,
          image: 'test.jpg',
          category: 'test',
          description: 'Test description',
          quantity: 1,
          in_stock: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockCartItems,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom as any);

      const result = await cartService.getCartItems('user123');

      expect(result).toEqual(mockCartItems);
      expect(mockSupabase.from).toHaveBeenCalledWith('cart_items');
    });

    it('should handle errors when fetching cart items', async () => {
      const mockError = new Error('Database error');
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom as any);

      const result = await cartService.getCartItems('user123');

      expect(result).toEqual([]);
    });
  });

  describe('addToCart', () => {
    it('should add new item to cart successfully', async () => {
      const mockItem = {
        id: 'prod1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        category: 'test',
        description: 'Test description',
        in_stock: true,
      };

      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ ...mockItem, quantity: 1 }],
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom as any);

      const result = await cartService.addToCart(mockItem, 'user123');

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('cart_items');
    });

    it('should update quantity for existing item', async () => {
      const mockItem = {
        id: 'prod1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        category: 'test',
        description: 'Test description',
        in_stock: true,
      };

      const mockFrom = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [{ ...mockItem, quantity: 2 }],
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom as any);

      const result = await cartService.addToCart(mockItem, 'user123');

      expect(result).toBe(true);
    });

    it('should handle errors when adding to cart', async () => {
      const mockItem = {
        id: 'prod1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        category: 'test',
        description: 'Test description',
        in_stock: true,
      };

      const mockError = new Error('Insert failed');
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom as any);

      const result = await cartService.addToCart(mockItem, 'user123');

      expect(result).toBe(false);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart successfully', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom as any);

      const result = await cartService.removeFromCart('item1', 'user123');

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('cart_items');
    });

    it('should handle errors when removing from cart', async () => {
      const mockError = new Error('Delete failed');
      const mockFrom = jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom as any);

      const result = await cartService.removeFromCart('item1', 'user123');

      expect(result).toBe(false);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity successfully', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [{ quantity: 3 }],
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom as any);

      const result = await cartService.updateQuantity('item1', 3, 'user123');

      expect(result).toBe(true);
    });

    it('should handle errors when updating quantity', async () => {
      const mockError = new Error('Update failed');
      const mockFrom = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom as any);

      const result = await cartService.updateQuantity('item1', 3, 'user123');

      expect(result).toBe(false);
    });
  });

  describe('clearCart', () => {
    it('should clear all cart items successfully', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom as any);

      const result = await cartService.clearCart('user123');

      expect(result).toBe(true);
    });

    it('should handle errors when clearing cart', async () => {
      const mockError = new Error('Clear failed');
      const mockFrom = jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom as any);

      const result = await cartService.clearCart('user123');

      expect(result).toBe(false);
    });
  });
}); 