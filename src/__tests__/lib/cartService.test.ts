import { cartService, CartItem } from '@/lib/cartService';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
};

const mockSupabase = {
  from: jest.fn(() => mockQueryBuilder),
};

jest.mock('@/integrations/supabase/client', () => {
  return { supabase: mockSupabase };
});

describe('cartService', () => {
  const mockUserId = 'test-user-id';
  const mockItem = {
    id: 'test-product-id',
    name: 'Test Product',
    price: 100,
    image: 'test-image.jpg',
    category: 'test',
    description: 'Test description',
    is_organic: false,
    in_stock: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCartItems', () => {
    it('should return cart items when successful', async () => {
      const mockCartItems = [
        {
          id: '1',
          user_id: mockUserId,
          product_id: 'test-product-id',
          name: 'Test Product',
          price: 100,
          image: 'test-image.jpg',
          category: 'test',
          description: 'Test description',
          quantity: 1,
          is_organic: false,
          in_stock: true,
        },
      ];

      // Mock the Supabase response
      (mockQueryBuilder as any).mockResolvedValue({
        data: mockCartItems,
        error: null,
      });

      const result = await cartService.getCartItems(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual(mockCartItems);
    });

    it('should return empty array when error occurs', async () => {
      // Mock the Supabase response with an error
      (mockQueryBuilder as any).mockResolvedValue({
        data: null,
        error: { message: 'Error fetching cart items' },
      });

      const result = await cartService.getCartItems(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual([]);
    });
  });

  describe('addToCart', () => {
    it('should add a new item to cart when it does not exist', async () => {
      // Mock checking for existing item (not found)
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // Not found error
      });

      // Mock insert operation
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValueOnce({
        data: { id: '1' },
        error: null,
      });

      const result = await cartService.addToCart(mockUserId, mockItem);

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(supabase.insert).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should update quantity when item already exists in cart', async () => {
      const existingItem = {
        id: '1',
        user_id: mockUserId,
        product_id: mockItem.id,
        quantity: 1,
      };

      // Mock checking for existing item (found)
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValueOnce({
        data: existingItem,
        error: null,
      });

      // Mock update operation
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.update as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValueOnce({
        data: { id: '1' },
        error: null,
      });

      const result = await cartService.addToCart(mockUserId, mockItem);

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(supabase.update).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when error occurs during insert', async () => {
      // Mock checking for existing item (not found)
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // Not found error
      });

      // Mock insert operation with error
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'Error inserting item' },
      });

      const result = await cartService.addToCart(mockUserId, mockItem);

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(supabase.insert).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart when successful', async () => {
      // Mock delete operation
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.delete as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValue({
        error: null,
      });

      const result = await cartService.removeFromCart(mockUserId, 'test-product-id');

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(supabase.delete).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(supabase.eq).toHaveBeenCalledWith('product_id', 'test-product-id');
      expect(result).toBe(true);
    });

    it('should return false when error occurs', async () => {
      // Mock delete operation with error
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.delete as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValue({
        error: { message: 'Error removing item' },
      });

      const result = await cartService.removeFromCart(mockUserId, 'test-product-id');

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(supabase.delete).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity when successful', async () => {
      // Mock update operation
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.update as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValue({
        error: null,
      });

      const result = await cartService.updateQuantity(mockUserId, 'test-product-id', 2);

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(supabase.update).toHaveBeenCalledWith({ quantity: 2 });
      expect(supabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(supabase.eq).toHaveBeenCalledWith('product_id', 'test-product-id');
      expect(result).toBe(true);
    });

    it('should call removeFromCart when quantity is 0 or less', async () => {
      // Spy on removeFromCart
      const removeFromCartSpy = jest.spyOn(cartService, 'removeFromCart');
      removeFromCartSpy.mockResolvedValue(true);

      const result = await cartService.updateQuantity(mockUserId, 'test-product-id', 0);

      expect(removeFromCartSpy).toHaveBeenCalledWith(mockUserId, 'test-product-id');
      expect(result).toBe(true);

      removeFromCartSpy.mockRestore();
    });

    it('should return false when error occurs', async () => {
      // Mock update operation with error
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.update as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValue({
        error: { message: 'Error updating quantity' },
      });

      const result = await cartService.updateQuantity(mockUserId, 'test-product-id', 2);

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(supabase.update).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart when successful', async () => {
      // Mock delete operation
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.delete as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValue({
        error: null,
      });

      const result = await cartService.clearCart(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(supabase.delete).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toBe(true);
    });

    it('should return false when error occurs', async () => {
      // Mock delete operation with error
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.delete as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValue({
        error: { message: 'Error clearing cart' },
      });

      const result = await cartService.clearCart(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(supabase.delete).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});