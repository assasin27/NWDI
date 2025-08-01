import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductCard } from '@/components/ProductCard';

// Mock product data
const mockProduct = {
  id: 'test-product-1',
  name: 'Organic Apples',
  price: 5.99,
  image: '/images/apple.jpg',
  category: 'Fruits',
  description: 'Fresh organic apples from local farms',
  inStock: true,
  isOrganic: true
};

const mockProductWithVariants = {
  ...mockProduct,
  id: 'test-product-2',
  name: 'Basmati Rice',
  variants: [
    { name: 'Short Grain', price: 8.99 },
    { name: 'Long Grain', price: 9.99 },
    { name: 'Premium Long Grain', price: 12.99 }
  ]
};

const mockOutOfStockProduct = {
  ...mockProduct,
  id: 'test-product-3',
  name: 'Out of Stock Product',
  inStock: false
};

describe('ProductCard Component', () => {
  const defaultProps = {
    product: mockProduct,
    onAddToCart: jest.fn(),
    onAddToWishlist: jest.fn(),
    onRemoveFromWishlist: jest.fn(),
    isWishlisted: false,
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Rendering Tests
  describe('Rendering', () => {
    it('should render product information correctly', () => {
      render(<ProductCard {...defaultProps} />);
      
      expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      expect(screen.getByText('₹5.99')).toBeInTheDocument();
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Fresh organic apples from local farms')).toBeInTheDocument();
    });

    it('should display product image with alt text', () => {
      render(<ProductCard {...defaultProps} />);
      
      const image = screen.getByAltText('Organic Apples');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/apple.jpg');
    });

    it('should show product name, price, and category', () => {
      render(<ProductCard {...defaultProps} />);
      
      expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      expect(screen.getByText('₹5.99')).toBeInTheDocument();
      expect(screen.getByText('fruits')).toBeInTheDocument();
    });

    it('should display product description', () => {
      render(<ProductCard {...defaultProps} />);
      
      expect(screen.getByText('Fresh organic apples from local farms')).toBeInTheDocument();
    });

    it('should show out of stock indicator for unavailable products', () => {
      render(<ProductCard {...defaultProps} product={mockOutOfStockProduct} />);
      
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });
  });

  // Wishlist Button Tests
  describe('Wishlist Button', () => {
    it('should show empty heart when product is not wishlisted', () => {
      render(<ProductCard {...defaultProps} isWishlisted={false} />);
      
      const wishlistButton = screen.getByRole('button', { name: /wishlist/i });
      expect(wishlistButton).toBeInTheDocument();
      expect(wishlistButton).toHaveClass('bg-white/80');
    });

    it('should show filled heart when product is wishlisted', () => {
      render(<ProductCard {...defaultProps} isWishlisted={true} />);
      
      const wishlistButton = screen.getByRole('button', { name: /wishlist/i });
      expect(wishlistButton).toHaveClass('bg-red-500');
    });

    it('should toggle wishlist state when heart button is clicked', () => {
      const onAddToWishlist = jest.fn();
      const onRemoveFromWishlist = jest.fn();
      
      render(
        <ProductCard 
          {...defaultProps} 
          isWishlisted={false}
          onAddToWishlist={onAddToWishlist}
          onRemoveFromWishlist={onRemoveFromWishlist}
        />
      );
      
      const wishlistButton = screen.getByRole('button', { name: /wishlist/i });
      fireEvent.click(wishlistButton);
      
      expect(onAddToWishlist).toHaveBeenCalledTimes(1);
    });

    it('should call onRemoveFromWishlist when wishlisted product heart is clicked', () => {
      const onRemoveFromWishlist = jest.fn();
      
      render(
        <ProductCard 
          {...defaultProps} 
          isWishlisted={true}
          onRemoveFromWishlist={onRemoveFromWishlist}
        />
      );
      
      const wishlistButton = screen.getByRole('button', { name: /wishlist/i });
      fireEvent.click(wishlistButton);
      
      expect(onRemoveFromWishlist).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when loading', () => {
      render(<ProductCard {...defaultProps} loading={true} />);
      
      const wishlistButton = screen.getByRole('button', { name: /wishlist/i });
      expect(wishlistButton).toBeDisabled();
    });

    it('should have correct styling for wishlisted vs non-wishlisted state', () => {
      const { rerender } = render(<ProductCard {...defaultProps} isWishlisted={false} />);
      
      let wishlistButton = screen.getByRole('button', { name: /wishlist/i });
      expect(wishlistButton).toHaveClass('bg-white/80');
      
      rerender(<ProductCard {...defaultProps} isWishlisted={true} />);
      wishlistButton = screen.getByRole('button', { name: /wishlist/i });
      expect(wishlistButton).toHaveClass('bg-red-500');
    });
  });

  // Add to Cart Button Tests
  describe('Add to Cart Button', () => {
    it('should be enabled for in-stock products', () => {
      render(<ProductCard {...defaultProps} />);
      
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      expect(addToCartButton).toBeEnabled();
    });

    it('should be disabled for out-of-stock products', () => {
      render(<ProductCard {...defaultProps} product={mockOutOfStockProduct} />);
      
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      expect(addToCartButton).toBeDisabled();
    });

    it('should be disabled when loading', () => {
      render(<ProductCard {...defaultProps} loading={true} />);
      
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      expect(addToCartButton).toBeDisabled();
    });

    it('should call onAddToCart when clicked', () => {
      const onAddToCart = jest.fn();
      
      render(<ProductCard {...defaultProps} onAddToCart={onAddToCart} />);
      
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addToCartButton);
      
      expect(onAddToCart).toHaveBeenCalledTimes(1);
    });
  });

  // Variant Hint Tests
  describe('Variant Hint', () => {
    it('should show variant hint for products with variants', () => {
      render(<ProductCard {...defaultProps} product={mockProductWithVariants} />);
      
      expect(screen.getByText(/add to cart or wishlist to choose variety\/fragrance/i)).toBeInTheDocument();
    });

    it('should show correct hint text for rice products', () => {
      const riceProduct = {
        ...mockProductWithVariants,
        name: 'Basmati Rice'
      };
      
      render(<ProductCard {...defaultProps} product={riceProduct} />);
      
      expect(screen.getByText(/add to cart or wishlist to choose variety\/fragrance/i)).toBeInTheDocument();
    });

    it('should show correct hint text for dhoopbatti products', () => {
      const dhoopbattiProduct = {
        ...mockProductWithVariants,
        name: 'Dhoopbatti'
      };
      
      render(<ProductCard {...defaultProps} product={dhoopbattiProduct} />);
      
      expect(screen.getByText(/add to cart or wishlist to choose variety\/fragrance/i)).toBeInTheDocument();
    });

    it('should not show variant hint for products without variants', () => {
      render(<ProductCard {...defaultProps} />);
      
      expect(screen.queryByText(/add to cart or wishlist to choose variety\/fragrance/i)).not.toBeInTheDocument();
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ProductCard {...defaultProps} />);
      
      const image = screen.getByAltText('Organic Apples');
      expect(image).toBeInTheDocument();
      
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      expect(addToCartButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<ProductCard {...defaultProps} />);
      
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      const wishlistButton = screen.getByRole('button', { name: /wishlist/i });
      
      expect(addToCartButton).toHaveAttribute('tabIndex');
      expect(wishlistButton).toHaveAttribute('tabIndex');
    });

    it('should have proper focus indicators', () => {
      render(<ProductCard {...defaultProps} />);
      
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      addToCartButton.focus();
      
      expect(addToCartButton).toHaveFocus();
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle missing product images gracefully', () => {
      const productWithoutImage = {
        ...mockProduct,
        image: ''
      };
      
      render(<ProductCard {...defaultProps} product={productWithoutImage} />);
      
      const image = screen.getByAltText('Organic Apples');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '');
    });

    it('should handle very long product names', () => {
      const productWithLongName = {
        ...mockProduct,
        name: 'This is a very long product name that should be handled gracefully by the component without breaking the layout or causing any visual issues'
      };
      
      render(<ProductCard {...defaultProps} product={productWithLongName} />);
      
      expect(screen.getByText(/This is a very long product name/)).toBeInTheDocument();
    });

    it('should handle very long descriptions', () => {
      const productWithLongDescription = {
        ...mockProduct,
        description: 'This is a very long description that should be handled gracefully by the component. It should not break the layout or cause any visual issues. The text should be properly truncated or wrapped as needed.'
      };
      
      render(<ProductCard {...defaultProps} product={productWithLongDescription} />);
      
      expect(screen.getByText(/This is a very long description/)).toBeInTheDocument();
    });

    it('should handle zero price products', () => {
      const freeProduct = {
        ...mockProduct,
        price: 0
      };
      
      render(<ProductCard {...defaultProps} product={freeProduct} />);
      
      expect(screen.getByText('₹0')).toBeInTheDocument();
    });

    it('should handle products with missing descriptions', () => {
      const productWithoutDescription = {
        ...mockProduct,
        description: ''
      };
      
      render(<ProductCard {...defaultProps} product={productWithoutDescription} />);
      
      // Should not crash and should render other elements
      expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      expect(screen.getByText('₹5.99')).toBeInTheDocument();
    });

    it('should handle rapid clicking on add buttons', async () => {
      const onAddToCart = jest.fn();
      
      render(<ProductCard {...defaultProps} onAddToCart={onAddToCart} />);
      
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      
      // Rapid clicking
      fireEvent.click(addToCartButton);
      fireEvent.click(addToCartButton);
      fireEvent.click(addToCartButton);
      
      await waitFor(() => {
        expect(onAddToCart).toHaveBeenCalledTimes(3);
      });
    });

    it('should handle loading state changes', () => {
      const { rerender } = render(<ProductCard {...defaultProps} loading={false} />);
      
      let addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      expect(addToCartButton).toBeEnabled();
      
      rerender(<ProductCard {...defaultProps} loading={true} />);
      addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      expect(addToCartButton).toBeDisabled();
    });
  });

  // Integration Tests
  describe('Integration', () => {
    it('should work with ProductsSection parent component', () => {
      // This test ensures the component integrates well with its parent
      render(<ProductCard {...defaultProps} />);
      
      // All essential elements should be present
      expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /wishlist/i })).toBeInTheDocument();
    });

    it('should handle all callback functions correctly', () => {
      const onAddToCart = jest.fn();
      const onAddToWishlist = jest.fn();
      const onRemoveFromWishlist = jest.fn();
      
      render(
        <ProductCard 
          {...defaultProps} 
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          onRemoveFromWishlist={onRemoveFromWishlist}
        />
      );
      
      // Test add to cart
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addToCartButton);
      expect(onAddToCart).toHaveBeenCalledTimes(1);
      
      // Test add to wishlist
      const wishlistButton = screen.getByRole('button', { name: /wishlist/i });
      fireEvent.click(wishlistButton);
      expect(onAddToWishlist).toHaveBeenCalledTimes(1);
    });
  });
}); 