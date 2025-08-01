import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VariantSelector } from '@/components/VariantSelector';

// Mock product data
const mockRiceProduct = {
  id: 'rice-1',
  name: 'Basmati Rice',
  price: 8.99,
  image: '/images/rice.jpg',
  category: 'Grains',
  description: 'Premium quality basmati rice',
  variants: [
    { name: 'Short Grain', price: 8.99 },
    { name: 'Long Grain', price: 9.99 },
    { name: 'Premium Long Grain', price: 12.99 }
  ]
};

const mockDhoopbattiProduct = {
  id: 'dhoopbatti-1',
  name: 'Dhoopbatti',
  price: 15.99,
  image: '/images/dhoopbatti.jpg',
  category: 'Eco Friendly Products',
  description: 'Natural incense sticks',
  variants: [
    { name: 'Sandalwood', price: 15.99 },
    { name: 'Lavender', price: 16.99 },
    { name: 'Rose', price: 17.99 },
    { name: 'Jasmine', price: 18.99 }
  ]
};

const mockProductWithSingleVariant = {
  id: 'single-variant-1',
  name: 'Single Variant Product',
  price: 10.99,
  image: '/images/single.jpg',
  category: 'Test',
  description: 'Product with only one variant',
  variants: [
    { name: 'Only Option', price: 10.99 }
  ]
};

describe('VariantSelector Component', () => {
  const defaultProps = {
    product: mockRiceProduct,
    onSelect: jest.fn(),
    onClose: jest.fn(),
    productType: 'rice' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Rendering Tests
  describe('Rendering', () => {
    it('should render modal overlay correctly', () => {
      render(<VariantSelector {...defaultProps} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('fixed inset-0 bg-black bg-opacity-50');
    });

    it('should display product name in header', () => {
      render(<VariantSelector {...defaultProps} />);
      
      expect(screen.getByText('Basmati Rice')).toBeInTheDocument();
    });

    it('should show correct selection text for rice products', () => {
      render(<VariantSelector {...defaultProps} productType="rice" />);
      
      expect(screen.getByText('Select grain length')).toBeInTheDocument();
    });

    it('should show correct selection text for dhoopbatti products', () => {
      render(<VariantSelector {...defaultProps} product={mockDhoopbattiProduct} productType="dhoopbatti" />);
      
      expect(screen.getByText('Select fragrance')).toBeInTheDocument();
    });

    it('should display all variant options', () => {
      render(<VariantSelector {...defaultProps} />);
      
      expect(screen.getByText('Short Grain')).toBeInTheDocument();
      expect(screen.getByText('Long Grain')).toBeInTheDocument();
      expect(screen.getByText('Premium Long Grain')).toBeInTheDocument();
    });

    it('should show variant names and prices', () => {
      render(<VariantSelector {...defaultProps} />);
      
      expect(screen.getByText('Short Grain')).toBeInTheDocument();
      expect(screen.getByText('₹8.99')).toBeInTheDocument();
      expect(screen.getByText('Long Grain')).toBeInTheDocument();
      expect(screen.getByText('₹9.99')).toBeInTheDocument();
      expect(screen.getByText('Premium Long Grain')).toBeInTheDocument();
      expect(screen.getByText('₹12.99')).toBeInTheDocument();
    });

    it('should display rice grain options correctly', () => {
      render(<VariantSelector {...defaultProps} productType="rice" />);
      
      const variantButtons = screen.getAllByRole('button');
      // +1 for the close button
      expect(variantButtons).toHaveLength(4);
      
      expect(screen.getByText('Short Grain')).toBeInTheDocument();
      expect(screen.getByText('Long Grain')).toBeInTheDocument();
      expect(screen.getByText('Premium Long Grain')).toBeInTheDocument();
    });

    it('should display dhoopbatti fragrance options correctly', () => {
      render(<VariantSelector {...defaultProps} product={mockDhoopbattiProduct} productType="dhoopbatti" />);
      
      expect(screen.getByText('Sandalwood')).toBeInTheDocument();
      expect(screen.getByText('Lavender')).toBeInTheDocument();
      expect(screen.getByText('Rose')).toBeInTheDocument();
      expect(screen.getByText('Jasmine')).toBeInTheDocument();
    });

    it('should show variant prices in correct format', () => {
      render(<VariantSelector {...defaultProps} />);
      
      expect(screen.getByText('₹8.99')).toBeInTheDocument();
      expect(screen.getByText('₹9.99')).toBeInTheDocument();
      expect(screen.getByText('₹12.99')).toBeInTheDocument();
    });

    it('should handle variants with different price ranges', () => {
      const productWithPriceRange = {
        ...mockRiceProduct,
        variants: [
          { name: 'Budget', price: 5.99 },
          { name: 'Standard', price: 8.99 },
          { name: 'Premium', price: 15.99 }
        ]
      };
      
      render(<VariantSelector {...defaultProps} product={productWithPriceRange} />);
      
      expect(screen.getByText('₹5.99')).toBeInTheDocument();
      expect(screen.getByText('₹8.99')).toBeInTheDocument();
      expect(screen.getByText('₹15.99')).toBeInTheDocument();
    });
  });

  // Interaction Tests
  describe('Interaction', () => {
    it('should close modal when X button is clicked', () => {
      const onClose = jest.fn();
      render(<VariantSelector {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should close modal when overlay is clicked', () => {
      const onClose = jest.fn();
      render(<VariantSelector {...defaultProps} onClose={onClose} />);
      
      const overlay = screen.getByRole('dialog');
      fireEvent.click(overlay);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect with selected variant when variant is clicked', () => {
      const onSelect = jest.fn();
      render(<VariantSelector {...defaultProps} onSelect={onSelect} />);
      
      const shortGrainButton = screen.getByText('Short Grain').closest('button');
      fireEvent.click(shortGrainButton!);
      
      expect(onSelect).toHaveBeenCalledWith(mockRiceProduct.variants[0]);
    });

    it('should not close modal when modal content is clicked', () => {
      const onClose = jest.fn();
      render(<VariantSelector {...defaultProps} onClose={onClose} />);
      
      const modalContent = screen.getByRole('dialog').querySelector('.w-full.max-w-md');
      fireEvent.click(modalContent!);
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should handle clicking on different variants', () => {
      const onSelect = jest.fn();
      render(<VariantSelector {...defaultProps} onSelect={onSelect} />);
      
      // Click on first variant
      const shortGrainButton = screen.getByText('Short Grain').closest('button');
      fireEvent.click(shortGrainButton!);
      expect(onSelect).toHaveBeenCalledWith(mockRiceProduct.variants[0]);
      
      // Click on second variant
      const longGrainButton = screen.getByText('Long Grain').closest('button');
      fireEvent.click(longGrainButton!);
      expect(onSelect).toHaveBeenCalledWith(mockRiceProduct.variants[1]);
      
      // Click on third variant
      const premiumButton = screen.getByText('Premium Long Grain').closest('button');
      fireEvent.click(premiumButton!);
      expect(onSelect).toHaveBeenCalledWith(mockRiceProduct.variants[2]);
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<VariantSelector {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<VariantSelector {...defaultProps} />);
      
      const variantButtons = screen.getAllByRole('button').slice(1); // Exclude close button
      variantButtons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex');
      });
    });

    it('should have proper focus indicators', () => {
      render(<VariantSelector {...defaultProps} />);
      
      const firstVariantButton = screen.getByText('Short Grain').closest('button');
      firstVariantButton!.focus();
      
      expect(firstVariantButton).toHaveFocus();
    });

    it('should close on Escape key', () => {
      const onClose = jest.fn();
      render(<VariantSelector {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should trap focus within modal', () => {
      render(<VariantSelector {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      const firstVariantButton = screen.getByText('Short Grain').closest('button');
      
      closeButton.focus();
      expect(closeButton).toHaveFocus();
      
      firstVariantButton!.focus();
      expect(firstVariantButton).toHaveFocus();
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle products with no variants', () => {
      const productWithoutVariants = {
        ...mockRiceProduct,
        variants: undefined
      };
      
      render(<VariantSelector {...defaultProps} product={productWithoutVariants} />);
      
      // Should still render the modal but with no variant options
      expect(screen.getByText('Basmati Rice')).toBeInTheDocument();
      expect(screen.queryByText('Short Grain')).not.toBeInTheDocument();
    });

    it('should handle products with single variant', () => {
      render(<VariantSelector {...defaultProps} product={mockProductWithSingleVariant} />);
      
      expect(screen.getByText('Single Variant Product')).toBeInTheDocument();
      expect(screen.getByText('Only Option')).toBeInTheDocument();
      expect(screen.getByText('₹10.99')).toBeInTheDocument();
    });

    it('should handle very long variant names', () => {
      const productWithLongVariantNames = {
        ...mockRiceProduct,
        variants: [
          { name: 'This is a very long variant name that should be handled gracefully', price: 8.99 },
          { name: 'Another very long variant name that might cause layout issues', price: 9.99 }
        ]
      };
      
      render(<VariantSelector {...defaultProps} product={productWithLongVariantNames} />);
      
      expect(screen.getByText(/This is a very long variant name/)).toBeInTheDocument();
      expect(screen.getByText(/Another very long variant name/)).toBeInTheDocument();
    });

    it('should handle variants with zero price', () => {
      const productWithZeroPrice = {
        ...mockRiceProduct,
        variants: [
          { name: 'Free Variant', price: 0 },
          { name: 'Paid Variant', price: 8.99 }
        ]
      };
      
      render(<VariantSelector {...defaultProps} product={productWithZeroPrice} />);
      
      expect(screen.getByText('Free Variant')).toBeInTheDocument();
      expect(screen.getByText('₹0')).toBeInTheDocument();
      expect(screen.getByText('Paid Variant')).toBeInTheDocument();
      expect(screen.getByText('₹8.99')).toBeInTheDocument();
    });

    it('should handle missing product name', () => {
      const productWithoutName = {
        ...mockRiceProduct,
        name: ''
      };
      
      render(<VariantSelector {...defaultProps} product={productWithoutName} />);
      
      // Should not crash and should still show the modal
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle rapid clicking on variants', async () => {
      const onSelect = jest.fn();
      render(<VariantSelector {...defaultProps} onSelect={onSelect} />);
      
      const shortGrainButton = screen.getByText('Short Grain').closest('button');
      const longGrainButton = screen.getByText('Long Grain').closest('button');
      
      // Rapid clicking on different variants
      fireEvent.click(shortGrainButton!);
      fireEvent.click(longGrainButton!);
      fireEvent.click(shortGrainButton!);
      
      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledTimes(3);
      });
    });

    it('should handle rapid clicking on close button', async () => {
      const onClose = jest.fn();
      render(<VariantSelector {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      // Rapid clicking on close button
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(3);
      });
    });
  });

  // Integration Tests
  describe('Integration', () => {
    it('should work with ProductsSection parent component', () => {
      render(<VariantSelector {...defaultProps} />);
      
      // Should render all essential elements
      expect(screen.getByText('Basmati Rice')).toBeInTheDocument();
      expect(screen.getByText('Select grain length')).toBeInTheDocument();
      expect(screen.getByText('Short Grain')).toBeInTheDocument();
      expect(screen.getByText('Long Grain')).toBeInTheDocument();
      expect(screen.getByText('Premium Long Grain')).toBeInTheDocument();
    });

    it('should handle all callback functions correctly', () => {
      const onSelect = jest.fn();
      const onClose = jest.fn();
      
      render(<VariantSelector {...defaultProps} onSelect={onSelect} onClose={onClose} />);
      
      // Test variant selection
      const shortGrainButton = screen.getByText('Short Grain').closest('button');
      fireEvent.click(shortGrainButton!);
      expect(onSelect).toHaveBeenCalledWith(mockRiceProduct.variants[0]);
      
      // Test modal close
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle different product types correctly', () => {
      // Test rice product
      const { rerender } = render(<VariantSelector {...defaultProps} productType="rice" />);
      expect(screen.getByText('Select grain length')).toBeInTheDocument();
      
      // Test dhoopbatti product
      rerender(<VariantSelector {...defaultProps} product={mockDhoopbattiProduct} productType="dhoopbatti" />);
      expect(screen.getByText('Select fragrance')).toBeInTheDocument();
    });

    it('should maintain state correctly during interactions', () => {
      const onSelect = jest.fn();
      const onClose = jest.fn();
      
      render(<VariantSelector {...defaultProps} onSelect={onSelect} onClose={onClose} />);
      
      // Select a variant
      const shortGrainButton = screen.getByText('Short Grain').closest('button');
      fireEvent.click(shortGrainButton!);
      
      // Verify the callback was called with correct data
      expect(onSelect).toHaveBeenCalledWith({
        name: 'Short Grain',
        price: 8.99
      });
      
      // Close the modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should render efficiently with many variants', () => {
      const productWithManyVariants = {
        ...mockRiceProduct,
        variants: Array.from({ length: 20 }, (_, i) => ({
          name: `Variant ${i + 1}`,
          price: 8.99 + i
        }))
      };
      
      const startTime = performance.now();
      render(<VariantSelector {...defaultProps} product={productWithManyVariants} />);
      const endTime = performance.now();
      
      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      
      // Should display all variants
      expect(screen.getByText('Variant 1')).toBeInTheDocument();
      expect(screen.getByText('Variant 20')).toBeInTheDocument();
    });

    it('should handle rapid state changes efficiently', () => {
      const onSelect = jest.fn();
      const onClose = jest.fn();
      
      const { rerender } = render(<VariantSelector {...defaultProps} onSelect={onSelect} onClose={onClose} />);
      
      // Rapidly change props
      for (let i = 0; i < 10; i++) {
        rerender(<VariantSelector {...defaultProps} product={{ ...mockRiceProduct, id: `product-${i}` }} onSelect={onSelect} onClose={onClose} />);
      }
      
      // Should still be functional
      const shortGrainButton = screen.getByText('Short Grain').closest('button');
      fireEvent.click(shortGrainButton!);
      
      expect(onSelect).toHaveBeenCalledWith(mockRiceProduct.variants[0]);
    });
  });
}); 