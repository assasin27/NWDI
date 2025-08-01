import { wishlistService, WishlistItem } from '@/lib/wishlistService';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
jest.mock('@/integrations/supabase/client', () => {
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  };
  
  const mockSupabase = {
    from: jest.fn(() => mockQueryBuilder),
  };
  
  return { supabase: mockSupabase };
});

describe('wishlistService', () => {
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

  describe('getWishlistItems', () => {
    it('should return wishlist items when successful', async () => {
      const mockWishlistItems = [
        {
          id: '1',
          user_id: mockUserId,
          product_id: 'test-product-id',
          name: 'Test Product',
          price: 100,
          image: 'test-image.jpg',
          category: 'test',
          description: 'Test description',
          is_organic: false,
          in_stock: true,
        },
      ];

      // Mock the Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValue({
        data: mockWishlistItems,
        error: null,
      });

      const result = await wishlistService.getWishlistItems(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith('wishlist_items');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual(mockWishlistItems);
    });

    it('should return empty array when error occurs', async () => {
      // Mock the Supabase response with an error
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValue({
        data: null,
        error: { message: 'Error fetching wishlist items' },
      });

      const result = await wishlistService.getWishlistItems(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith('wishlist_items');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual([]);
    });
  });

  describe('addToWishlist', () => {
    it('should add a new item to wishlist when it does not exist', async () => {
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

      const result = await wishlistService.addToWishlist(mockUserId, mockItem);

      expect(supabase.from).toHaveBeenCalledWith('wishlist_items');
      expect(supabase.insert).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return true when item already exists in wishlist', async () => {
      const existingItem = {
        id: '1',
        user_id: mockUserId,
        product_id: mockItem.id,
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

      const result = await wishlistService.addToWishlist(mockUserId, mockItem);

      expect(supabase.from).toHaveBeenCalledWith('wishlist_items');
      expect(supabase.select).toHaveBeenCalled();
      expect(result).toBe(true);
      // Should not call insert since item already exists
      expect(supabase.insert).not.toHaveBeenCalled();
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

      const result = await wishlistService.addToWishlist(mockUserId, mockItem);

      expect(supabase.from).toHaveBeenCalledWith('wishlist_items');
      expect(supabase.insert).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when error occurs during check', async () => {
      // Mock checking for existing item with a non-PGRST116 error
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValueOnce({
        data: null,
        error: { code: 'OTHER_ERROR' }, // Some other error
      });

      const result = await wishlistService.addToWishlist(mockUserId, mockItem);

      expect(supabase.from).toHaveBeenCalledWith('wishlist_items');
      expect(supabase.select).toHaveBeenCalled();
      expect(result).toBe(false);
      // Should not call insert due to error during check
      expect(supabase.insert).not.toHaveBeenCalled();
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove item from wishlist when successful', async () => {
      // Mock delete operation
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.delete as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase as any).mockResolvedValue({
        error: null,
      });

      const result = await wishlistService.removeFromWishlist(mockUserId, 'test-product-id');

      expect(supabase.from).toHaveBeenCalledWith('wishlist_items');
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

      const result = await wishlistService.removeFromWishlist(mockUserId, 'test-product-id');

      expect(supabase.from).toHaveBeenCalledWith('wishlist_items');
      expect(supabase.delete).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});