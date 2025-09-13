import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../hooks/useCart';
import { WishlistProvider } from '../../hooks/useWishlist';
import { NotificationProvider } from '../../contexts/NotificationContext';
import ProductsSection from '../../components/ProductsSection';
import CartDrawer from '../../components/CartDrawer';
import Wishlist from '../../pages/Wishlist';

// Mock the services and hooks
jest.mock('../../lib/useSupabaseUser');
jest.mock('../../lib/cartService');
jest.mock('../../lib/wishlistService');

import { useSupabaseUser } from '../../lib/useSupabaseUser';
import { cartService } from '../../lib/cartService';
import { wishlistService } from '../../lib/wishlistService';

// Mock the Supabase client
jest.mock('../../integrations/supabase/supabaseClient', () => ({
  supabase: {
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
  }
}));

// Mock the cart and wishlist services
jest.mock('../../lib/cartService', () => ({
  cartService: {
    getCartItems: jest.fn(),
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    testConnection: jest.fn()
  }
}));

jest.mock('../../lib/wishlistService', () => ({
  wishlistService: {
    getWishlistItems: jest.fn(),
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    clearWishlist: jest.fn(),
    testConnection: jest.fn()
  }
}));

// Mock the error handler
jest.mock('../../lib/errorHandler', () => ({
  errorHandler: {
    handleError: jest.fn(),
    setupGlobalErrorHandler: jest.fn()
  }
}));

// Mock the user hook
jest.mock('../../lib/useSupabaseUser', () => ({
  useSupabaseUser: jest.fn()
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <NotificationProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </CartProvider>
    </NotificationProvider>
  </BrowserRouter>
);

describe('Clear Cart and Wishlist Integration Tests', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };  const mockUseSupabaseUser = useSupabaseUser as jest.MockedFunction<typeof useSupabaseUser>;
  const mockCartService = cartService as jest.Mocked<typeof cartService>;
  const mockWishlistService = wishlistService as jest.Mocked<typeof wishlistService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSupabaseUser.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: jest.fn()
    });
  });

  describe('Complete Cart Clear Workflow', () => {
    it('should complete full cart clear workflow', async () => {
      // Setup: Mock cart with multiple items
      const mockCartItems = [
        {
          product_id: 'rice-Indrayani Full',
          name: 'Rice - Indrayani Full',
          price: 100,
          quantity: 2,
          image: 'rice-image.jpg',
          category: 'Grains',
          description: 'Premium rice variety'
        },
        {
          product_id: 'dhoopbatti-Chandan',
          name: 'Dhoopbatti - Chandan',
          price: 120,
          quantity: 1,
          image: 'dhoopbatti-image.jpg',
          category: 'Eco Friendly Products',
          description: 'Aromatic incense'
        }
      ];

      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      mockCartService.clearCart.mockResolvedValue(true);

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      // Step 1: Verify cart has items
      await waitFor(() => {
        expect(screen.getByText('Rice - Indrayani Full')).toBeInTheDocument();
        expect(screen.getByText('Dhoopbatti - Chandan')).toBeInTheDocument();
      });

      // Step 2: Verify clear button is present
      const clearButton = screen.getByText('Clear');
      expect(clearButton).toBeInTheDocument();

      // Step 3: Click clear button
      fireEvent.click(clearButton);

      // Step 4: Verify clearCart service is called
      expect(mockCartService.clearCart).toHaveBeenCalledWith(mockUser.id);

      // Step 5: Verify success notification
      await waitFor(() => {
        expect(screen.getByText('Cart cleared successfully')).toBeInTheDocument();
      });

      // Step 6: Verify cart is empty
      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      });
    });

    it('should handle cart clear with loading states', async () => {
      const mockCartItems = [
        {
          product_id: 'test-product',
          name: 'Test Product',
          price: 100,
          quantity: 1,
          image: 'test-image.jpg',
          category: 'Test Category',
          description: 'Test Description'
        }
      ];

      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      
      // Mock slow clear operation
      mockCartService.clearCart.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 200))
      );

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);
      });

      // Verify loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Clear')).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Cart cleared successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Complete Wishlist Clear Workflow', () => {
    it('should complete full wishlist clear workflow', async () => {
      // Setup: Mock wishlist with multiple items
      const mockWishlistItems = [
        {
          product_id: 'rice-Shakti Full',
          name: 'Rice - Shakti Full',
          price: 100,
          image: 'rice-image.jpg',
          category: 'Grains',
          description: 'Premium rice variety'
        },
        {
          product_id: 'dhoopbatti-Lobhan',
          name: 'Dhoopbatti - Lobhan',
          price: 120,
          image: 'dhoopbatti-image.jpg',
          category: 'Eco Friendly Products',
          description: 'Aromatic incense'
        }
      ];

      mockWishlistService.getWishlistItems.mockResolvedValue(mockWishlistItems);
      mockWishlistService.clearWishlist.mockResolvedValue(true);

      render(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      // Step 1: Verify wishlist has items
      await waitFor(() => {
        expect(screen.getByText('Rice - Shakti Full')).toBeInTheDocument();
        expect(screen.getByText('Dhoopbatti - Lobhan')).toBeInTheDocument();
      });

      // Step 2: Verify clear button is present
      const clearButton = screen.getByText('Clear Wishlist');
      expect(clearButton).toBeInTheDocument();

      // Step 3: Click clear button
      fireEvent.click(clearButton);

      // Step 4: Verify clearWishlist service is called
      expect(mockWishlistService.clearWishlist).toHaveBeenCalledWith(mockUser.id);

      // Step 5: Verify success notification
      await waitFor(() => {
        expect(screen.getByText('Wishlist cleared successfully')).toBeInTheDocument();
      });

      // Step 6: Verify wishlist is empty
      await waitFor(() => {
        expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
      });
    });

    it('should handle wishlist clear with loading states', async () => {
      const mockWishlistItems = [
        {
          product_id: 'test-product',
          name: 'Test Product',
          price: 100,
          image: 'test-image.jpg',
          category: 'Test Category',
          description: 'Test Description'
        }
      ];

      mockWishlistService.getWishlistItems.mockResolvedValue(mockWishlistItems);
      
      // Mock slow clear operation
      mockWishlistService.clearWishlist.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 200))
      );

      render(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear Wishlist');
        fireEvent.click(clearButton);
      });

      // Verify loading state
      expect(screen.getByText('Clearing...')).toBeInTheDocument();
      expect(screen.getByText('Clear Wishlist')).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Wishlist cleared successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle cart clear error gracefully', async () => {
      const mockCartItems = [
        {
          product_id: 'test-product',
          name: 'Test Product',
          price: 100,
          quantity: 1,
          image: 'test-image.jpg',
          category: 'Test Category',
          description: 'Test Description'
        }
      ];

      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      mockCartService.clearCart.mockRejectedValue(new Error('Database error'));

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);
      });

      // Verify error notification
      await waitFor(() => {
        expect(screen.getByText('Failed to clear cart')).toBeInTheDocument();
      });

      // Verify cart items are still present
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    it('should handle wishlist clear error gracefully', async () => {
      const mockWishlistItems = [
        {
          product_id: 'test-product',
          name: 'Test Product',
          price: 100,
          image: 'test-image.jpg',
          category: 'Test Category',
          description: 'Test Description'
        }
      ];

      mockWishlistService.getWishlistItems.mockResolvedValue(mockWishlistItems);
      mockWishlistService.clearWishlist.mockRejectedValue(new Error('Database error'));

      render(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear Wishlist');
        fireEvent.click(clearButton);
      });

      // Verify error notification
      await waitFor(() => {
        expect(screen.getByText('Failed to clear wishlist')).toBeInTheDocument();
      });

      // Verify wishlist items are still present
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  describe('User Experience Integration', () => {
    it('should provide consistent UX across cart and wishlist clear', async () => {
      // Test cart clear UX
      mockCartService.getCartItems.mockResolvedValue([
        {
          product_id: 'test-product',
          name: 'Test Product',
          price: 100,
          quantity: 1,
          image: 'test-image.jpg',
          category: 'Test Category',
          description: 'Test Description'
        }
      ]);
      mockCartService.clearCart.mockResolvedValue(true);

      const { rerender } = render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear');
        expect(clearButton).toHaveClass('text-red-600', 'border-red-200', 'hover:bg-red-50');
      });

      // Test wishlist clear UX
      mockWishlistService.getWishlistItems.mockResolvedValue([
        {
          product_id: 'test-product',
          name: 'Test Product',
          price: 100,
          image: 'test-image.jpg',
          category: 'Test Category',
          description: 'Test Description'
        }
      ]);
      mockWishlistService.clearWishlist.mockResolvedValue(true);

      rerender(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear Wishlist');
        expect(clearButton).toHaveClass('text-red-600', 'border-red-200', 'hover:bg-red-50');
      });
    });

    it('should handle authentication states correctly', async () => {
      // Test with no user
      mockUseSupabaseUser.mockReturnValue({
        user: null,
        loading: false,
        signOut: jest.fn()
      });

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      // Should show login message
      await waitFor(() => {
        expect(screen.getByText('Please log in to complete your order')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Integration', () => {
    it('should handle large cart/wishlist efficiently', async () => {
      // Create large mock data
      const largeCartItems = Array.from({ length: 50 }, (_, i) => ({
        product_id: `product-${i}`,
        name: `Product ${i}`,
        price: 100 + i,
        quantity: 1,
        image: `image-${i}.jpg`,
        category: 'Test Category',
        description: `Description ${i}`
      }));

      mockCartService.getCartItems.mockResolvedValue(largeCartItems);
      mockCartService.clearCart.mockResolvedValue(true);

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);
      });

      // Should handle large data without performance issues
      await waitFor(() => {
        expect(mockCartService.clearCart).toHaveBeenCalled();
      });
    });
  });
}); 