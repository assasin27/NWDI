import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useCart } from '../useCart';
import { cartService } from '@/lib/cartService';
import { useSupabaseUser } from '@/lib/useSupabaseUser';

// Mock dependencies
jest.mock('@/lib/cartService');
jest.mock('@/lib/useSupabaseUser');

const mockCartService = cartService as jest.Mocked<typeof cartService>;
const mockUseSupabaseUser = useSupabaseUser as jest.MockedFunction<typeof useSupabaseUser>;

// Test component to render the hook
const TestComponent = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();

  return (
    <div>
      <div data-testid="cart-count">{cart.length}</div>
      <button onClick={() => addToCart({ id: '1', name: 'Test', price: 100 })}>
        Add to Cart
      </button>
      <button onClick={() => removeFromCart('1')}>Remove from Cart</button>
      <button onClick={() => updateQuantity('1', 2)}>Update Quantity</button>
      <button onClick={() => clearCart()}>Clear Cart</button>
    </div>
  );
};

describe('useCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSupabaseUser.mockReturnValue({ user: { id: 'test-user' }, loading: false });
  });

  describe('Initialization', () => {
    it('loads cart items on mount', async () => {
      const mockCartItems = [
        {
          id: '1',
          name: 'Test Product',
          price: 100,
          image: 'test.jpg',
          category: 'test',
          description: 'Test description',
          inStock: true,
          quantity: 1,
        },
      ];

      mockCartService.getCartItems.mockResolvedValue(mockCartItems);

      render(<TestComponent />);

      await waitFor(() => {
        expect(mockCartService.getCartItems).toHaveBeenCalledWith('test-user');
      });
    });

    it('clears cart when user logs out', async () => {
      // Start with authenticated user
      mockUseSupabaseUser.mockReturnValue({ user: { id: 'test-user' }, loading: false });
      mockCartService.getCartItems.mockResolvedValue([]);

      const { rerender } = render(<TestComponent />);

      // Simulate user logout
      mockUseSupabaseUser.mockReturnValue({ user: null, loading: false });

      rerender(<TestComponent />);

      await waitFor(() => {
        expect(mockCartService.clearCart).toHaveBeenCalledWith('test-user');
      });
    });
  });

  describe('addToCart', () => {
    it('adds item to cart successfully', async () => {
      mockCartService.addToCart.mockResolvedValue(true);
      mockCartService.getCartItems.mockResolvedValue([]);

      render(<TestComponent />);

      const addButton = screen.getByText('Add to Cart');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockCartService.addToCart).toHaveBeenCalledWith(
          { id: '1', name: 'Test', price: 100 },
          'test-user'
        );
      });
    });

    it('handles add to cart failure', async () => {
      mockCartService.addToCart.mockResolvedValue(false);
      mockCartService.getCartItems.mockResolvedValue([]);

      render(<TestComponent />);

      const addButton = screen.getByText('Add to Cart');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockCartService.addToCart).toHaveBeenCalled();
      });
    });
  });

  describe('removeFromCart', () => {
    it('removes item from cart successfully', async () => {
      mockCartService.removeFromCart.mockResolvedValue(true);
      mockCartService.getCartItems.mockResolvedValue([]);

      render(<TestComponent />);

      const removeButton = screen.getByText('Remove from Cart');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(mockCartService.removeFromCart).toHaveBeenCalledWith('1', 'test-user');
      });
    });

    it('handles remove from cart failure', async () => {
      mockCartService.removeFromCart.mockResolvedValue(false);
      mockCartService.getCartItems.mockResolvedValue([]);

      render(<TestComponent />);

      const removeButton = screen.getByText('Remove from Cart');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(mockCartService.removeFromCart).toHaveBeenCalled();
      });
    });
  });

  describe('updateQuantity', () => {
    it('updates item quantity successfully', async () => {
      mockCartService.updateQuantity.mockResolvedValue(true);
      mockCartService.getCartItems.mockResolvedValue([]);

      render(<TestComponent />);

      const updateButton = screen.getByText('Update Quantity');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockCartService.updateQuantity).toHaveBeenCalledWith('1', 2, 'test-user');
      });
    });

    it('handles update quantity failure', async () => {
      mockCartService.updateQuantity.mockResolvedValue(false);
      mockCartService.getCartItems.mockResolvedValue([]);

      render(<TestComponent />);

      const updateButton = screen.getByText('Update Quantity');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockCartService.updateQuantity).toHaveBeenCalled();
      });
    });
  });

  describe('clearCart', () => {
    it('clears cart successfully', async () => {
      mockCartService.clearCart.mockResolvedValue(true);
      mockCartService.getCartItems.mockResolvedValue([]);

      render(<TestComponent />);

      const clearButton = screen.getByText('Clear Cart');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockCartService.clearCart).toHaveBeenCalledWith('test-user');
      });
    });

    it('handles clear cart failure', async () => {
      mockCartService.clearCart.mockResolvedValue(false);
      mockCartService.getCartItems.mockResolvedValue([]);

      render(<TestComponent />);

      const clearButton = screen.getByText('Clear Cart');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockCartService.clearCart).toHaveBeenCalled();
      });
    });
  });

  describe('Data Transformation', () => {
    it('transforms cart items correctly', async () => {
      const mockCartItems = [
        {
          id: '1',
          name: 'Test Product',
          price: 100,
          image: 'test.jpg',
          category: 'test',
          description: 'Test description',
          in_stock: true,
          quantity: 2,
        },
      ];

      mockCartService.getCartItems.mockResolvedValue(mockCartItems);

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      });
    });
  });

  describe('Context Provider', () => {
    it('provides cart context to children', () => {
      const TestConsumer = () => {
        const { cart } = useCart();
        return <div data-testid="cart-length">{cart.length}</div>;
      };

      render(<TestConsumer />);

      expect(screen.getByTestId('cart-length')).toBeInTheDocument();
    });
  });
}); 