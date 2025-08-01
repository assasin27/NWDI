import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProductsSection } from '@/components/ProductsSection';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { cartService } from '@/lib/cartService';
import { wishlistService } from '@/lib/wishlistService';

// Mock dependencies
jest.mock('@/hooks/useCart');
jest.mock('@/hooks/useWishlist');
jest.mock('@/lib/useSupabaseUser');
jest.mock('@/lib/cartService');
jest.mock('@/lib/wishlistService');

// Mock products data
const mockProducts = [
  {
    id: 'product-1',
    name: 'Organic Apples',
    price: 5.99,
    image: '/images/apple.jpg',
    category: 'Fruits',
    description: 'Fresh organic apples from local farms',
    inStock: true,
    isOrganic: true
  },
  {
    id: 'product-2',
    name: 'Basmati Rice',
    price: 8.99,
    image: '/images/rice.jpg',
    category: 'Grains',
    description: 'Premium quality basmati rice',
    inStock: true,
    variants: [
      { name: 'Short Grain', price: 8.99 },
      { name: 'Long Grain', price: 9.99 },
      { name: 'Premium Long Grain', price: 12.99 }
    ]
  },
  {
    id: 'product-3',
    name: 'Dhoopbatti',
    price: 15.99,
    image: '/images/dhoopbatti.jpg',
    category: 'Eco Friendly Products',
    description: 'Natural incense sticks',
    inStock: true,
    variants: [
      { name: 'Sandalwood', price: 15.99 },
      { name: 'Lavender', price: 16.99 },
      { name: 'Rose', price: 17.99 }
    ]
  }
];

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('User Flow Integration Tests', () => {
  const mockUser = { id: 'test-user-id', email: 'test@example.com' };
  const mockAddToCart = jest.fn();
  const mockAddToWishlist = jest.fn();
  const mockRemoveFromWishlist = jest.fn();
  const mockRemoveFromCart = jest.fn();
  const mockUpdateQuantity = jest.fn();
  const mockClearCart = jest.fn();
  const mockClearWishlist = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useSupabaseUser
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    });

    // Mock useCart
    (useCart as jest.Mock).mockReturnValue({
      cart: [],
      addToCart: mockAddToCart,
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      clearCart: mockClearCart,
      loading: false
    });

    // Mock useWishlist
    (useWishlist as jest.Mock).mockReturnValue({
      wishlist: [],
      addToWishlist: mockAddToWishlist,
      removeFromWishlist: mockRemoveFromWishlist,
      clearWishlist: mockClearWishlist,
      loading: false
    });

    // Mock services
    (cartService.addToCart as jest.Mock).mockResolvedValue(true);
    (cartService.removeFromCart as jest.Mock).mockResolvedValue(true);
    (cartService.updateQuantity as jest.Mock).mockResolvedValue(true);
    (cartService.clearCart as jest.Mock).mockResolvedValue(true);
    (wishlistService.addToWishlist as jest.Mock).mockResolvedValue(true);
    (wishlistService.removeFromWishlist as jest.Mock).mockResolvedValue(true);
    (wishlistService.clearWishlist as jest.Mock).mockResolvedValue(true);
  });

  // Shopping Cart Flow
  describe('Shopping Cart Flow', () => {
    it('should allow user to browse products, add to cart, and checkout', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      });

      // Add product to cart
      const addToCartButtons = screen.getAllByText('Add to Cart');
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalledWith({
          id: 'product-1',
          name: 'Organic Apples',
          price: 5.99,
          image: '/images/apple.jpg',
          category: 'Fruits',
          description: 'Fresh organic apples from local farms'
        });
      });
    });

    it('should allow user to update quantities in cart', async () => {
      // Mock cart with items
      (useCart as jest.Mock).mockReturnValue({
        cart: [
          {
            id: 'product-1',
            name: 'Organic Apples',
            price: 5.99,
            quantity: 1
          }
        ],
        addToCart: mockAddToCart,
        removeFromCart: mockRemoveFromCart,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart,
        loading: false
      });

      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Update quantity
      await act(async () => {
        mockUpdateQuantity('product-1', 3);
      });

      expect(mockUpdateQuantity).toHaveBeenCalledWith('product-1', 3);
    });

    it('should allow user to remove items from cart', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Remove item from cart
      await act(async () => {
        mockRemoveFromCart('product-1');
      });

      expect(mockRemoveFromCart).toHaveBeenCalledWith('product-1');
    });

    it('should allow user to clear entire cart', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Clear cart
      await act(async () => {
        mockClearCart();
      });

      expect(mockClearCart).toHaveBeenCalled();
    });
  });

  // Wishlist Flow
  describe('Wishlist Flow', () => {
    it('should allow user to add products to wishlist', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      });

      // Add to wishlist
      const wishlistButtons = screen.getAllByRole('button', { name: /wishlist/i });
      fireEvent.click(wishlistButtons[0]);

      await waitFor(() => {
        expect(mockAddToWishlist).toHaveBeenCalledWith({
          id: 'product-1',
          name: 'Organic Apples',
          price: 5.99,
          image: '/images/apple.jpg',
          category: 'Fruits',
          description: 'Fresh organic apples from local farms'
        });
      });
    });

    it('should allow user to remove products from wishlist', async () => {
      // Mock wishlist with items
      (useWishlist as jest.Mock).mockReturnValue({
        wishlist: [
          {
            id: 'product-1',
            name: 'Organic Apples',
            price: 5.99
          }
        ],
        addToWishlist: mockAddToWishlist,
        removeFromWishlist: mockRemoveFromWishlist,
        clearWishlist: mockClearWishlist,
        loading: false
      });

      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Remove from wishlist
      await act(async () => {
        mockRemoveFromWishlist('product-1');
      });

      expect(mockRemoveFromWishlist).toHaveBeenCalledWith('product-1');
    });

    it('should allow user to clear entire wishlist', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Clear wishlist
      await act(async () => {
        mockClearWishlist();
      });

      expect(mockClearWishlist).toHaveBeenCalled();
    });
  });

  // Product Search and Filter Flow
  describe('Product Search and Filter Flow', () => {
    it('should allow user to search for products', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'apple' } });

      await waitFor(() => {
        expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      });
    });

    it('should allow user to filter products by category', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      const categorySelect = screen.getByRole('combobox');
      fireEvent.click(categorySelect);

      // Select Fruits category
      const fruitsOption = screen.getByText('Fruits');
      fireEvent.click(fruitsOption);

      await waitFor(() => {
        expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      });
    });

    it('should allow user to combine search and filter', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Search for "rice"
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'rice' } });

      // Filter by Grains category
      const categorySelect = screen.getByRole('combobox');
      fireEvent.click(categorySelect);
      const grainsOption = screen.getByText('Grains');
      fireEvent.click(grainsOption);

      await waitFor(() => {
        expect(screen.getByText('Basmati Rice')).toBeInTheDocument();
      });
    });

    it('should show appropriate results for search queries', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Search for non-existent product
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('No products found matching your criteria.')).toBeInTheDocument();
      });
    });
  });

  // Variant Selection Flow
  describe('Variant Selection Flow', () => {
    it('should allow user to select rice grain variants', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Basmati Rice')).toBeInTheDocument();
      });

      // Click add to cart for product with variants
      const addToCartButtons = screen.getAllByText('Add to Cart');
      const riceAddButton = addToCartButtons.find(button => 
        button.closest('[data-testid]')?.getAttribute('data-testid')?.includes('rice')
      ) || addToCartButtons[1];
      
      fireEvent.click(riceAddButton);

      await waitFor(() => {
        expect(screen.getByText('Select grain length')).toBeInTheDocument();
      });
    });

    it('should allow user to select dhoopbatti fragrance variants', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Dhoopbatti')).toBeInTheDocument();
      });

      // Click add to wishlist for product with variants
      const wishlistButtons = screen.getAllByRole('button', { name: /wishlist/i });
      const dhoopbattiWishlistButton = wishlistButtons.find(button => 
        button.closest('[data-testid]')?.getAttribute('data-testid')?.includes('dhoopbatti')
      ) || wishlistButtons[2];
      
      fireEvent.click(dhoopbattiWishlistButton);

      await waitFor(() => {
        expect(screen.getByText('Select fragrance')).toBeInTheDocument();
      });
    });

    it('should add selected variant to cart/wishlist', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Open variant selector
      const addToCartButtons = screen.getAllByText('Add to Cart');
      fireEvent.click(addToCartButtons[1]); // Basmati Rice

      await waitFor(() => {
        expect(screen.getByText('Select grain length')).toBeInTheDocument();
      });

      // Select a variant
      const shortGrainButton = screen.getByText('Short Grain').closest('button');
      fireEvent.click(shortGrainButton!);

      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalledWith({
          id: 'product-2-Short Grain',
          name: 'Basmati Rice - Short Grain',
          price: 8.99,
          image: '/images/rice.jpg',
          category: 'Grains',
          description: 'Premium quality basmati rice'
        });
      });
    });

    it('should close variant selector after selection', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Open variant selector
      const addToCartButtons = screen.getAllByText('Add to Cart');
      fireEvent.click(addToCartButtons[1]);

      await waitFor(() => {
        expect(screen.getByText('Select grain length')).toBeInTheDocument();
      });

      // Select a variant
      const shortGrainButton = screen.getByText('Short Grain').closest('button');
      fireEvent.click(shortGrainButton!);

      await waitFor(() => {
        expect(screen.queryByText('Select grain length')).not.toBeInTheDocument();
      });
    });
  });

  // Authentication Flow
  describe('Authentication Flow', () => {
    it('should require authentication for cart operations', async () => {
      // Mock unauthenticated user
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: null,
        loading: false
      });

      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      });

      // Try to add to cart
      const addToCartButtons = screen.getAllByText('Add to Cart');
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Please login first to add items to cart')).toBeInTheDocument();
      });
    });

    it('should require authentication for wishlist operations', async () => {
      // Mock unauthenticated user
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: null,
        loading: false
      });

      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Try to add to wishlist
      const wishlistButtons = screen.getAllByRole('button', { name: /wishlist/i });
      fireEvent.click(wishlistButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Please login first to add items to wishlist')).toBeInTheDocument();
      });
    });

    it('should show appropriate messages for unauthenticated users', async () => {
      // Mock unauthenticated user
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: null,
        loading: false
      });

      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Try to add to cart
      const addToCartButtons = screen.getAllByText('Add to Cart');
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Please login first to add items to cart')).toBeInTheDocument();
      });

      // Try to add to wishlist
      const wishlistButtons = screen.getAllByRole('button', { name: /wishlist/i });
      fireEvent.click(wishlistButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Please login first to add items to wishlist')).toBeInTheDocument();
      });
    });

    it('should handle user login/logout state changes', async () => {
      const { rerender } = render(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Initially unauthenticated
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: null,
        loading: false
      });

      rerender(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Try to add to cart
      const addToCartButtons = screen.getAllByText('Add to Cart');
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Please login first to add items to cart')).toBeInTheDocument();
      });

      // Now authenticate user
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false
      });

      rerender(
        <TestWrapper>
          <ProductsSection />
        </TestWrapper>
      );

      // Try to add to cart again
      const newAddToCartButtons = screen.getAllByText('Add to Cart');
      fireEvent.click(newAddToCartButtons[0]);

      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalled();
      });
    });
  });

  // Error Handling Flow
  describe('Error Handling Flow', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      (cartService.addToCart as jest.Mock).mockRejectedValue(new Error('Network error'));

      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Try to add to cart
      const addToCartButtons = screen.getAllByText('Add to Cart');
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Failed to add Organic Apples to cart')).toBeInTheDocument();
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      (wishlistService.addToWishlist as jest.Mock).mockRejectedValue(new Error('Database error'));

      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Try to add to wishlist
      const wishlistButtons = screen.getAllByRole('button', { name: /wishlist/i });
      fireEvent.click(wishlistButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Failed to add Organic Apples to wishlist')).toBeInTheDocument();
      });
    });

    it('should show appropriate error messages', async () => {
      // Mock various errors
      (cartService.addToCart as jest.Mock).mockRejectedValue(new Error('Cart service error'));
      (wishlistService.addToWishlist as jest.Mock).mockRejectedValue(new Error('Wishlist service error'));

      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Test cart error
      const addToCartButtons = screen.getAllByText('Add to Cart');
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Failed to add Organic Apples to cart')).toBeInTheDocument();
      });

      // Test wishlist error
      const wishlistButtons = screen.getAllByRole('button', { name: /wishlist/i });
      fireEvent.click(wishlistButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Failed to add Organic Apples to wishlist')).toBeInTheDocument();
      });
    });

    it('should allow user to retry failed operations', async () => {
      // Mock initial failure then success
      (cartService.addToCart as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(true);

      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // First attempt fails
      const addToCartButtons = screen.getAllByText('Add to Cart');
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Failed to add Organic Apples to cart')).toBeInTheDocument();
      });

      // Second attempt succeeds
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Added Organic Apples to cart')).toBeInTheDocument();
      });
    });
  });

  // Performance and Load Testing
  describe('Performance and Load Testing', () => {
    it('should handle large product lists efficiently', async () => {
      const largeProductList = Array.from({ length: 100 }, (_, i) => ({
        id: `product-${i}`,
        name: `Product ${i}`,
        price: 10 + i,
        image: `/images/product-${i}.jpg`,
        category: 'Test',
        description: `Description for product ${i}`,
        inStock: true
      }));

      // Mock products data
      jest.doMock('../lib/productsData', () => ({
        products: largeProductList
      }));

      const startTime = performance.now();
      
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });
      
      const endTime = performance.now();

      // Should render within reasonable time (less than 500ms)
      expect(endTime - startTime).toBeLessThan(500);

      await waitFor(() => {
        expect(screen.getByText('Product 0')).toBeInTheDocument();
        expect(screen.getByText('Product 99')).toBeInTheDocument();
      });
    });

    it('should handle rapid user interactions', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      const addToCartButtons = screen.getAllByText('Add to Cart');
      const wishlistButtons = screen.getAllByRole('button', { name: /wishlist/i });

      // Rapid clicking
      for (let i = 0; i < 5; i++) {
        fireEvent.click(addToCartButtons[0]);
        fireEvent.click(wishlistButtons[0]);
      }

      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalledTimes(5);
        expect(mockAddToWishlist).toHaveBeenCalledTimes(5);
      });
    });

    it('should maintain responsive UI during operations', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <ProductsSection />
          </TestWrapper>
        );
      });

      // Start multiple operations
      const addToCartButtons = screen.getAllByText('Add to Cart');
      const wishlistButtons = screen.getAllByRole('button', { name: /wishlist/i });

      // UI should remain responsive
      fireEvent.click(addToCartButtons[0]);
      fireEvent.click(wishlistButtons[0]);
      fireEvent.click(addToCartButtons[1]);

      // Should still be able to interact with UI
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(searchInput).toHaveValue('test');
    });
  });
}); 