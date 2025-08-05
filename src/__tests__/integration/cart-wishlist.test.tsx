import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../hooks/useCart';
import { WishlistProvider } from '../../hooks/useWishlist';
import { NotificationProvider } from '../../contexts/NotificationContext';
import ProductsSection from '../../components/ProductsSection';
import CartDrawer from '../../components/CartDrawer';
import Wishlist from '../../pages/Wishlist';

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

describe('Cart and Wishlist Functionality', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  const mockUseSupabaseUser = require('../../lib/useSupabaseUser').useSupabaseUser;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseSupabaseUser.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: jest.fn()
    });
  });

  describe('User Authentication Tests', () => {
    test('should show login message when user is not authenticated', () => {
      mockUseSupabaseUser.mockReturnValue({
        user: null,
        loading: false,
        signOut: jest.fn()
      });

      render(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Try to add item to cart
      const addToCartButtons = screen.getAllByText(/add to cart/i);
      fireEvent.click(addToCartButtons[0]);

      // Should show login notification
      expect(screen.getByText(/please log in/i)).toBeInTheDocument();
    });

    test('should allow adding items when user is authenticated', async () => {
      const { cartService } = require('../../lib/cartService');
      cartService.addToCart.mockResolvedValue(true);
      cartService.getCartItems.mockResolvedValue([]);

      render(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Add item to cart
      const addToCartButtons = screen.getAllByText(/add to cart/i);
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(cartService.addToCart).toHaveBeenCalled();
      });
    });
  });

  describe('Cart Functionality Tests', () => {
    test('should add item to cart successfully', async () => {
      const { cartService } = require('../../lib/cartService');
      cartService.addToCart.mockResolvedValue(true);
      cartService.getCartItems.mockResolvedValue([
        {
          id: '1',
          product_id: 'product-1',
          name: 'Test Product',
          price: 10.99,
          image: 'test.jpg',
          category: 'Vegetables',
          description: 'Test description',
          quantity: 1,
          user_id: mockUser.id,
          is_organic: true,
          in_stock: true
        }
      ]);

      render(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Add item to cart
      const addToCartButtons = screen.getAllByText(/add to cart/i);
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(cartService.addToCart).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            name: expect.any(String),
            price: expect.any(Number)
          })
        );
      });
    });

    test('should remove item from cart', async () => {
      const { cartService } = require('../../lib/cartService');
      cartService.removeFromCart.mockResolvedValue(true);
      cartService.getCartItems.mockResolvedValue([]);

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      // Find and click remove button
      const removeButtons = screen.getAllByText(/remove/i);
      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0]);
        
        await waitFor(() => {
          expect(cartService.removeFromCart).toHaveBeenCalled();
        });
      }
    });

    test('should update item quantity', async () => {
      const { cartService } = require('../../lib/cartService');
      cartService.updateQuantity.mockResolvedValue(true);
      cartService.getCartItems.mockResolvedValue([
        {
          id: '1',
          product_id: 'product-1',
          name: 'Test Product',
          price: 10.99,
          image: 'test.jpg',
          category: 'Vegetables',
          description: 'Test description',
          quantity: 1,
          user_id: mockUser.id,
          is_organic: true,
          in_stock: true
        }
      ]);

      render(
        <TestWrapper>
          <CartDrawer isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      );

      // Find quantity controls and update
      const quantityInputs = screen.getAllByRole('spinbutton');
      if (quantityInputs.length > 0) {
        fireEvent.change(quantityInputs[0], { target: { value: '3' } });
        
        await waitFor(() => {
          expect(cartService.updateQuantity).toHaveBeenCalledWith(
            mockUser.id,
            expect.any(String),
            3
          );
        });
      }
    });

    test('should clear cart when user logs out', async () => {
      const { cartService } = require('../../lib/cartService');
      cartService.clearCart.mockResolvedValue(true);

      // Start with authenticated user
      mockUseSupabaseUser.mockReturnValue({
        user: mockUser,
        loading: false,
        signOut: jest.fn()
      });

      const { rerender } = render(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Simulate user logout
      mockUseSupabaseUser.mockReturnValue({
        user: null,
        loading: false,
        signOut: jest.fn()
      });

      rerender(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      await waitFor(() => {
        // Cart should be empty after logout
        expect(cartService.getCartItems).not.toHaveBeenCalled();
      });
    });
  });

  describe('Wishlist Functionality Tests', () => {
    test('should add item to wishlist successfully', async () => {
      const { wishlistService } = require('../../lib/wishlistService');
      wishlistService.addToWishlist.mockResolvedValue(true);
      wishlistService.getWishlistItems.mockResolvedValue([]);

      render(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Add item to wishlist
      const addToWishlistButtons = screen.getAllByText(/add to wishlist/i);
      fireEvent.click(addToWishlistButtons[0]);

      await waitFor(() => {
        expect(wishlistService.addToWishlist).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            name: expect.any(String),
            price: expect.any(Number)
          })
        );
      });
    });

    test('should remove item from wishlist', async () => {
      const { wishlistService } = require('../../lib/wishlistService');
      wishlistService.removeFromWishlist.mockResolvedValue(true);
      wishlistService.getWishlistItems.mockResolvedValue([
        {
          id: '1',
          product_id: 'product-1',
          name: 'Test Product',
          price: 10.99,
          image: 'test.jpg',
          category: 'Vegetables',
          description: 'Test description',
          user_id: mockUser.id,
          is_organic: true,
          in_stock: true
        }
      ]);

      render(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      // Find and click remove button
      const removeButtons = screen.getAllByText(/remove/i);
      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0]);
        
        await waitFor(() => {
          expect(wishlistService.removeFromWishlist).toHaveBeenCalled();
        });
      }
    });

    test('should clear wishlist when user logs out', async () => {
      const { wishlistService } = require('../../lib/wishlistService');
      wishlistService.clearWishlist.mockResolvedValue(true);

      // Start with authenticated user
      mockUseSupabaseUser.mockReturnValue({
        user: mockUser,
        loading: false,
        signOut: jest.fn()
      });

      const { rerender } = render(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      // Simulate user logout
      mockUseSupabaseUser.mockReturnValue({
        user: null,
        loading: false,
        signOut: jest.fn()
      });

      rerender(
        <TestWrapper>
          <Wishlist />
        </TestWrapper>
      );

      await waitFor(() => {
        // Wishlist should be empty after logout
        expect(wishlistService.getWishlistItems).not.toHaveBeenCalled();
      });
    });
  });

  describe('Variant Support Tests', () => {
    test('should show variant selector for rice products', () => {
      render(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Look for rice products (they should have variants)
      const riceProducts = screen.getAllByText(/rice/i);
      if (riceProducts.length > 0) {
        // Click on a rice product's add to cart button
        const addToCartButtons = screen.getAllByText(/add to cart/i);
        fireEvent.click(addToCartButtons[0]);

        // Should show variant selector
        expect(screen.getByText(/select variety/i)).toBeInTheDocument();
      }
    });

    test('should show variant selector for dhoopbatti products', () => {
      render(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Look for dhoopbatti products (they should have variants)
      const dhoopbattiProducts = screen.getAllByText(/dhoopbatti/i);
      if (dhoopbattiProducts.length > 0) {
        // Click on a dhoopbatti product's add to cart button
        const addToCartButtons = screen.getAllByText(/add to cart/i);
        fireEvent.click(addToCartButtons[0]);

        // Should show variant selector
        expect(screen.getByText(/select fragrance/i)).toBeInTheDocument();
      }
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection errors gracefully', async () => {
      const { cartService } = require('../../lib/cartService');
      cartService.addToCart.mockRejectedValue(new Error('Database connection failed'));

      render(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Add item to cart
      const addToCartButtons = screen.getAllByText(/add to cart/i);
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        // Should show error notification
        expect(screen.getByText(/failed to add item/i)).toBeInTheDocument();
      });
    });

    test('should handle authentication errors', async () => {
      const { cartService } = require('../../lib/cartService');
      cartService.addToCart.mockRejectedValue(new Error('User not authenticated'));

      render(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Add item to cart
      const addToCartButtons = screen.getAllByText(/add to cart/i);
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        // Should show authentication error
        expect(screen.getByText(/please log in/i)).toBeInTheDocument();
      });
    });
  });

  describe('UI State Tests', () => {
    test('should show loading state while adding items', async () => {
      const { cartService } = require('../../lib/cartService');
      cartService.addToCart.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));

      render(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Add item to cart
      const addToCartButtons = screen.getAllByText(/add to cart/i);
      fireEvent.click(addToCartButtons[0]);

      // Should show loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('should update cart count in navbar', async () => {
      const { cartService } = require('../../lib/cartService');
      cartService.getCartItems.mockResolvedValue([
        {
          id: '1',
          product_id: 'product-1',
          name: 'Test Product',
          price: 10.99,
          image: 'test.jpg',
          category: 'Vegetables',
          description: 'Test description',
          quantity: 2,
          user_id: mockUser.id,
          is_organic: true,
          in_stock: true
        }
      ]);

      render(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show cart count
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });
}); 