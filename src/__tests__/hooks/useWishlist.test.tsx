import * as React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useWishlist, WishlistProvider } from '@/hooks/useWishlist';
import { wishlistService } from '@/lib/wishlistService';
import { useSupabaseUser } from '@/lib/useSupabaseUser';

// Mock dependencies
jest.mock('@/lib/wishlistService');
jest.mock('@/lib/useSupabaseUser');

// Test component that uses the useWishlist hook
const TestComponent = () => {
  const { wishlist, addToWishlist, removeFromWishlist, loading } = useWishlist();

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="wishlist-length">{wishlist.length}</div>
      <button data-testid="add-to-wishlist" onClick={() => addToWishlist({
        id: 'test-id',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        category: 'test',
        description: 'Test description',
        isOrganic: false,
        inStock: true
      })}>Add to Wishlist</button>
      <button data-testid="remove-from-wishlist" onClick={() => removeFromWishlist('test-id')}>Remove from Wishlist</button>
    </div>
  );
};

describe('useWishlist hook', () => {
  const mockUser = { id: 'test-user-id', email: 'test@example.com' };
  const mockWishlistItems = [
    {
      product_id: 'test-id',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      category: 'test',
      description: 'Test description',
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

    // Mock wishlistService methods
    (wishlistService.getWishlistItems as jest.Mock).mockResolvedValue(mockWishlistItems);
    (wishlistService.addToWishlist as jest.Mock).mockResolvedValue(true);
    (wishlistService.removeFromWishlist as jest.Mock).mockResolvedValue(true);
  });

  it('should load wishlist items when user is authenticated', async () => {
    await act(async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );
    });

    expect(wishlistService.getWishlistItems).toHaveBeenCalledWith(mockUser.id);
    await waitFor(() => {
      expect(screen.getByTestId('wishlist-length').textContent).toBe('1');
    });
  });

  it('should not load wishlist items when user is not authenticated', async () => {
    // Mock user as not authenticated
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    });

    await act(async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );
    });

    expect(wishlistService.getWishlistItems).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('wishlist-length').textContent).toBe('0');
    });
  });

  it('should add item to wishlist when user is authenticated', async () => {
    await act(async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );
    });

    const addButton = screen.getByTestId('add-to-wishlist');
    
    await act(async () => {
      addButton.click();
    });

    expect(wishlistService.addToWishlist).toHaveBeenCalledWith(mockUser.id, expect.objectContaining({
      id: 'test-id',
      name: 'Test Product'
    }));
    expect(wishlistService.getWishlistItems).toHaveBeenCalledTimes(2); // Initial load + after add
  });

  it('should remove item from wishlist when user is authenticated', async () => {
    await act(async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );
    });

    const removeButton = screen.getByTestId('remove-from-wishlist');
    
    await act(async () => {
      removeButton.click();
    });

    expect(wishlistService.removeFromWishlist).toHaveBeenCalledWith(mockUser.id, 'test-id');
    expect(wishlistService.getWishlistItems).toHaveBeenCalledTimes(2); // Initial load + after remove
  });

  it('should handle loading state correctly', async () => {
    // Mock initial loading state
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: true
    });

    await act(async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );
    });

    // Initially should not be loading wishlist since user is still loading
    expect(screen.getByTestId('loading').textContent).toBe('Not Loading');
    
    // Now simulate user loading complete
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    });

    // Re-render with updated user loading state
    await act(async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );
    });

    // Now wishlist should be loading
    expect(screen.getByTestId('loading').textContent).toBe('Loading');

    // Wait for wishlist loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not Loading');
    });
  });

  it('should handle error when loading wishlist items', async () => {
    // Mock getWishlistItems to throw an error
    (wishlistService.getWishlistItems as jest.Mock).mockRejectedValue(new Error('Failed to load wishlist'));

    await act(async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );
    });

    expect(wishlistService.getWishlistItems).toHaveBeenCalledWith(mockUser.id);
    await waitFor(() => {
      expect(screen.getByTestId('wishlist-length').textContent).toBe('0');
    });
  });

  it('should handle error when adding to wishlist', async () => {
    // Mock addToWishlist to throw an error
    (wishlistService.addToWishlist as jest.Mock).mockRejectedValue(new Error('Failed to add to wishlist'));

    await act(async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );
    });

    const addButton = screen.getByTestId('add-to-wishlist');
    
    await act(async () => {
      addButton.click();
    });

    expect(wishlistService.addToWishlist).toHaveBeenCalled();
    // Wishlist should remain unchanged
    expect(screen.getByTestId('wishlist-length').textContent).toBe('1');
  });
});