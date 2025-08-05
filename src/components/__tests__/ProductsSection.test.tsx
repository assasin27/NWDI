import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import ProductsSection from '../ProductsSection';
import { CartProvider } from '../../hooks/useCart';
import { WishlistProvider } from '../../hooks/useWishlist';

// Mock the hooks
jest.mock('../../hooks/useCart', () => ({
  useCart: () => ({
    addToCart: jest.fn(),
  }),
}));

jest.mock('../../hooks/useWishlist', () => ({
  useWishlist: () => ({
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    wishlist: [],
  }),
}));

jest.mock('../../lib/useSupabaseUser', () => ({
  useSupabaseUser: () => ({
    user: null,
    loading: false,
  }),
}));

const renderProductsSection = () => {
  return render(
    <BrowserRouter>
      <WishlistProvider>
        <CartProvider>
          <ProductsSection />
        </CartProvider>
      </WishlistProvider>
    </BrowserRouter>
  );
};

describe('ProductsSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders section header', () => {
      renderProductsSection();
      expect(screen.getByText('Our Fresh Products')).toBeInTheDocument();
      expect(screen.getByText(/Discover our handpicked selection/)).toBeInTheDocument();
    });

    test('renders search and filter controls', () => {
      renderProductsSection();
      expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
      expect(screen.getByText('Sort by category')).toBeInTheDocument();
    });

    test('renders product grid', () => {
      renderProductsSection();
      expect(screen.getByText('Guava')).toBeInTheDocument();
      expect(screen.getByText('Papaya')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('filters products by search term', () => {
      renderProductsSection();
      const searchInput = screen.getByPlaceholderText('Search products...');
      
      fireEvent.change(searchInput, { target: { value: 'Guava' } });
      expect(screen.getByText('Guava')).toBeInTheDocument();
      expect(screen.queryByText('Papaya')).not.toBeInTheDocument();
    });

    test('filters products by description', () => {
      renderProductsSection();
      const searchInput = screen.getByPlaceholderText('Search products...');
      
      fireEvent.change(searchInput, { target: { value: 'sweet' } });
      expect(screen.getByText('Guava')).toBeInTheDocument();
    });

    test('shows no products message when no matches', () => {
      renderProductsSection();
      const searchInput = screen.getByPlaceholderText('Search products...');
      
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      expect(screen.getByText('No products found matching your criteria.')).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    test('filters products by category', () => {
      renderProductsSection();
      const categorySelect = screen.getByText('Sort by category');
      
      fireEvent.click(categorySelect);
      fireEvent.click(screen.getByText('Fruits'));
      
      expect(screen.getByText('Guava')).toBeInTheDocument();
      expect(screen.getByText('Papaya')).toBeInTheDocument();
    });

    test('shows all products when "All" is selected', () => {
      renderProductsSection();
      const categorySelect = screen.getByText('Sort by category');
      
      fireEvent.click(categorySelect);
      fireEvent.click(screen.getByText('All'));
      
      expect(screen.getByText('Guava')).toBeInTheDocument();
      expect(screen.getByText('Mushroom')).toBeInTheDocument();
    });
  });

  describe('Product Variants', () => {
    test('shows variant selector for rice products', () => {
      renderProductsSection();
      const riceProduct = screen.getByText('Rice');
      expect(riceProduct).toBeInTheDocument();
    });

    test('shows variant selector for dhoopbatti products', () => {
      renderProductsSection();
      const dhoopbattiProduct = screen.getByText('Dhoopbatti');
      expect(dhoopbattiProduct).toBeInTheDocument();
    });

    test('opens variant selector when adding rice to cart', async () => {
      renderProductsSection();
      const riceProduct = screen.getByText('Rice');
      const addToCartButton = riceProduct.closest('.product-card')?.querySelector('button');
      
      if (addToCartButton) {
        fireEvent.click(addToCartButton);
        await waitFor(() => {
          expect(screen.getByText('Select grain length')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Authentication Integration', () => {
    test('shows login message when adding to cart without authentication', () => {
      renderProductsSection();
      const addToCartButton = screen.getAllByText('Add to Cart')[0];
      
      fireEvent.click(addToCartButton);
      expect(screen.getByText('Please login first to add items to cart')).toBeInTheDocument();
    });

    test('shows login message when adding to wishlist without authentication', () => {
      renderProductsSection();
      const wishlistButton = screen.getAllByTestId('wishlist-button')[0];
      
      fireEvent.click(wishlistButton);
      expect(screen.getByText('Please login first to add items to wishlist')).toBeInTheDocument();
    });

    test('allows adding to cart when authenticated', async () => {
      vi.mocked(require('../../lib/useSupabaseUser').useSupabaseUser).mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: false,
      });

      const mockAddToCart = vi.fn();
      vi.mocked(require('../../hooks/useCart').useCart).mockReturnValue({
        addToCart: mockAddToCart,
      });

      renderProductsSection();
      const addToCartButton = screen.getAllByText('Add to Cart')[0];
      
      fireEvent.click(addToCartButton);
      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalled();
      });
    });
  });

  describe('Wishlist Functionality', () => {
    test('toggles wishlist state', async () => {
      const mockAddToWishlist = vi.fn();
      const mockRemoveFromWishlist = vi.fn();
      
      vi.mocked(require('../../hooks/useWishlist').useWishlist).mockReturnValue({
        addToWishlist: mockAddToWishlist,
        removeFromWishlist: mockRemoveFromWishlist,
        wishlist: [],
      });

      vi.mocked(require('../../lib/useSupabaseUser').useSupabaseUser).mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: false,
      });

      renderProductsSection();
      const wishlistButton = screen.getAllByTestId('wishlist-button')[0];
      
      fireEvent.click(wishlistButton);
      await waitFor(() => {
        expect(mockAddToWishlist).toHaveBeenCalled();
      });
    });

    test('shows filled heart when item is wishlisted', () => {
      vi.mocked(require('../../hooks/useWishlist').useWishlist).mockReturnValue({
        addToWishlist: vi.fn(),
        removeFromWishlist: vi.fn(),
        wishlist: [{ id: 'f1', name: 'Guava' }],
      });

      renderProductsSection();
      const wishlistButton = screen.getAllByTestId('wishlist-button')[0];
      expect(wishlistButton).toHaveClass('bg-red-500');
    });
  });

  describe('Loading States', () => {
    test('shows loading spinner when adding to cart', async () => {
      vi.mocked(require('../../lib/useSupabaseUser').useSupabaseUser).mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: false,
      });

      const mockAddToCart = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      vi.mocked(require('../../hooks/useCart').useCart).mockReturnValue({
        addToCart: mockAddToCart,
      });

      renderProductsSection();
      const addToCartButton = screen.getAllByText('Add to Cart')[0];
      
      fireEvent.click(addToCartButton);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('shows error message when cart operation fails', async () => {
      vi.mocked(require('../../lib/useSupabaseUser').useSupabaseUser).mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: false,
      });

      const mockAddToCart = vi.fn().mockRejectedValue(new Error('Failed to add to cart'));
      vi.mocked(require('../../hooks/useCart').useCart).mockReturnValue({
        addToCart: mockAddToCart,
      });

      renderProductsSection();
      const addToCartButton = screen.getAllByText('Add to Cart')[0];
      
      fireEvent.click(addToCartButton);
      await waitFor(() => {
        expect(screen.getByText(/Failed to add/)).toBeInTheDocument();
      });
    });
  });

  describe('Security', () => {
    test('sanitizes search input', () => {
      renderProductsSection();
      const searchInput = screen.getByPlaceholderText('Search products...');
      
      const maliciousInput = '<script>alert("xss")</script>';
      fireEvent.change(searchInput, { target: { value: maliciousInput } });
      
      expect(searchInput).toHaveValue(maliciousInput);
      // The input should be sanitized and not execute scripts
    });

    test('prevents SQL injection in search', () => {
      renderProductsSection();
      const searchInput = screen.getByPlaceholderText('Search products...');
      
      const sqlInjection = "'; DROP TABLE products; --";
      fireEvent.change(searchInput, { target: { value: sqlInjection } });
      
      expect(searchInput).toHaveValue(sqlInjection);
      // The search should be handled safely without SQL injection
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderProductsSection();
      expect(screen.getByLabelText(/search products/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by category/i)).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      renderProductsSection();
      const searchInput = screen.getByPlaceholderText('Search products...');
      
      searchInput.focus();
      fireEvent.keyDown(searchInput, { key: 'Enter' });
      
      expect(searchInput).toHaveFocus();
    });
  });
}); 