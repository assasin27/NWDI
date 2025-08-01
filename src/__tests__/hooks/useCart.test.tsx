import * as React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useCart, CartProvider } from '@/hooks/useCart';
import { cartService } from '@/lib/cartService';
import { useSupabaseUser } from '@/lib/useSupabaseUser';

// Mock dependencies
jest.mock('@/lib/cartService');
jest.mock('@/lib/useSupabaseUser');

// Test component that uses the useCart hook
const TestComponent = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, loading } = useCart();

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="cart-length">{cart.length}</div>
      <button data-testid="add-to-cart" onClick={() => addToCart({
        id: 'test-id',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        category: 'test',
        description: 'Test description',
        isOrganic: false,
        inStock: true
      })}>Add to Cart</button>
      <button data-testid="remove-from-cart" onClick={() => removeFromCart('test-id')}>Remove from Cart</button>
      <button data-testid="update-quantity" onClick={() => updateQuantity('test-id', 2)}>Update Quantity</button>
      <button data-testid="clear-cart" onClick={() => clearCart()}>Clear Cart</button>
    </div>
  );
};

describe('useCart hook', () => {
  const mockUser = { id: 'test-user-id', email: 'test@example.com' };
  const mockCartItems = [
    {
      product_id: 'test-id',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      category: 'test',
      description: 'Test description',
      quantity: 1,
      is_organic: false,
      in_stock: true,
      user_id: 'test-user-id'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useSupabaseUser
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    });

    // Mock cartService methods
    (cartService.getCartItems as jest.Mock).mockResolvedValue(mockCartItems);
    (cartService.addToCart as jest.Mock).mockResolvedValue(true);
    (cartService.removeFromCart as jest.Mock).mockResolvedValue(true);
    (cartService.updateQuantity as jest.Mock).mockResolvedValue(true);
    (cartService.clearCart as jest.Mock).mockResolvedValue(true);
  });

  it('should load cart items when user is authenticated', async () => {
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    expect(cartService.getCartItems).toHaveBeenCalledWith(mockUser.id);
    await waitFor(() => {
      expect(screen.getByTestId('cart-length').textContent).toBe('1');
    });
  });

  it('should not load cart items when user is not authenticated', async () => {
    // Mock user as not authenticated
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    });

    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    expect(cartService.getCartItems).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('cart-length').textContent).toBe('0');
    });
  });

  it('should add item to cart when user is authenticated', async () => {
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    const addButton = screen.getByTestId('add-to-cart');
    
    await act(async () => {
      addButton.click();
    });

    expect(cartService.addToCart).toHaveBeenCalledWith(mockUser.id, expect.objectContaining({
      id: 'test-id',
      name: 'Test Product'
    }));
    expect(cartService.getCartItems).toHaveBeenCalledTimes(2); // Initial load + after add
  });

  it('should remove item from cart when user is authenticated', async () => {
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    const removeButton = screen.getByTestId('remove-from-cart');
    
    await act(async () => {
      removeButton.click();
    });

    expect(cartService.removeFromCart).toHaveBeenCalledWith(mockUser.id, 'test-id');
    expect(cartService.getCartItems).toHaveBeenCalledTimes(2); // Initial load + after remove
  });

  it('should update item quantity when user is authenticated', async () => {
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    const updateButton = screen.getByTestId('update-quantity');
    
    await act(async () => {
      updateButton.click();
    });

    expect(cartService.updateQuantity).toHaveBeenCalledWith(mockUser.id, 'test-id', 2);
    expect(cartService.getCartItems).toHaveBeenCalledTimes(2); // Initial load + after update
  });

  it('should clear cart when user is authenticated', async () => {
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    const clearButton = screen.getByTestId('clear-cart');
    
    await act(async () => {
      clearButton.click();
    });

    expect(cartService.clearCart).toHaveBeenCalledWith(mockUser.id);
    expect(cartService.getCartItems).toHaveBeenCalledTimes(2); // Initial load + after clear
  });

  it('should handle loading state correctly', async () => {
    // Mock initial loading state
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: true
    });

    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    // Initially should not be loading cart since user is still loading
    expect(screen.getByTestId('loading').textContent).toBe('Not Loading');
    
    // Now simulate user loading complete
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    });

    // Re-render with updated user loading state
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    // Now cart should be loading
    expect(screen.getByTestId('loading').textContent).toBe('Loading');

    // Wait for cart loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not Loading');
    });
  });
});