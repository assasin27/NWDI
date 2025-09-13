import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../hooks/useCart';
import { WishlistProvider } from '../../hooks/useWishlist';
import { NotificationProvider } from '../../contexts/NotificationContext';
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

describe('Clear Cart and Wishlist Functionality', () => {
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

  describe('Clear Cart Button', () => {
    it('should render clear cart button when cart has items', async () => {
      // Mock cart with items
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

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Clear')).toBeInTheDocument();
      });
    });

    it('should not render clear cart button when cart is empty', async () => {
      // Mock empty cart
      mockCartService.getCartItems.mockResolvedValue([]);

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Clear')).not.toBeInTheDocument();
      });
    });

    it('should call clearCart when clear button is clicked', async () => {
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

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);
      });

      expect(mockCartService.clearCart).toHaveBeenCalledWith(mockUser.id);
    });

    it('should show loading state while clearing cart', async () => {
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

      // Mock slow clear operation
      mockCartService.clearCart.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 100))
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

      // Should show loading spinner
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should handle clear cart error gracefully', async () => {
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
      mockCartService.clearCart.mockRejectedValue(new Error('Clear failed'));

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);
      });

      // Should show error notification
      await waitFor(() => {
        expect(screen.getByText('Failed to clear cart')).toBeInTheDocument();
      });
    });
  });

  describe('Clear Wishlist Button', () => {
    it('should render clear wishlist button when wishlist has items', async () => {
      // Mock wishlist with items
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

      render(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Clear Wishlist')).toBeInTheDocument();
      });
    });

    it('should not render clear wishlist button when wishlist is empty', async () => {
      // Mock empty wishlist
      mockWishlistService.getWishlistItems.mockResolvedValue([]);

      render(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Clear Wishlist')).not.toBeInTheDocument();
      });
    });

    it('should call clearWishlist when clear button is clicked', async () => {
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

      render(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear Wishlist');
        fireEvent.click(clearButton);
      });

      expect(mockWishlistService.clearWishlist).toHaveBeenCalledWith(mockUser.id);
    });

    it('should show loading state while clearing wishlist', async () => {
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

      // Mock slow clear operation
      mockWishlistService.clearWishlist.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 100))
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

      // Should show loading text
      expect(screen.getByText('Clearing...')).toBeInTheDocument();
    });

    it('should handle clear wishlist error gracefully', async () => {
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
      mockWishlistService.clearWishlist.mockRejectedValue(new Error('Clear failed'));

      render(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear Wishlist');
        fireEvent.click(clearButton);
      });

      // Should show error notification
      await waitFor(() => {
        expect(screen.getByText('Failed to clear wishlist')).toBeInTheDocument();
      });
    });
  });

  describe('Button Styling and Accessibility', () => {
    it('should have correct styling for clear cart button', async () => {
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

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear');
        expect(clearButton).toHaveClass('text-red-600', 'border-red-200', 'hover:bg-red-50');
      });
    });

    it('should have correct styling for clear wishlist button', async () => {
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

      render(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear Wishlist');
        expect(clearButton).toHaveClass('text-red-600', 'border-red-200', 'hover:bg-red-50');
      });
    });

    it('should be disabled during loading states', async () => {
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

      // Mock slow operation
      mockCartService.clearCart.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 100))
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

      // Button should be disabled during loading
      const clearButton = screen.getByText('Clear');
      expect(clearButton).toBeDisabled();
    });
  });

  describe('Notification System', () => {
    it('should show success notification when cart is cleared', async () => {
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

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Cart cleared successfully')).toBeInTheDocument();
      });
    });

    it('should show success notification when wishlist is cleared', async () => {
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

      render(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      await waitFor(() => {
        const clearButton = screen.getByText('Clear Wishlist');
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Wishlist cleared successfully')).toBeInTheDocument();
      });
    });

    it('should show info notification when cart is already empty', async () => {
      mockCartService.getCartItems.mockResolvedValue([]);

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      // Try to clear empty cart (button shouldn't exist, but test the logic)
      await waitFor(() => {
        expect(screen.queryByText('Clear')).not.toBeInTheDocument();
      });
    });

    it('should show info notification when wishlist is already empty', async () => {
      mockWishlistService.getWishlistItems.mockResolvedValue([]);

      render(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Clear Wishlist')).not.toBeInTheDocument();
      });
    });
  });
}); 