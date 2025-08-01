import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ProductsSection } from '@/components/ProductsSection';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { databaseSetup } from '@/lib/databaseSetup';

// Mock dependencies
jest.mock('@/hooks/useCart');
jest.mock('@/hooks/useWishlist');
jest.mock('@/lib/useSupabaseUser');
jest.mock('@/lib/databaseSetup');

// Mock products data
const mockProducts = [
  {
    id: 'product-1',
    name: 'Organic Apples',
    price: 5.99,
    image: '/images/apple.jpg',
    category: 'fruits',
    description: 'Fresh organic apples',
    isOrganic: true,
    inStock: true
  },
  {
    id: 'product-2',
    name: 'Carrots',
    price: 2.99,
    image: '/images/carrot.jpg',
    category: 'vegetables',
    description: 'Fresh carrots',
    isOrganic: false,
    inStock: true
  }
];

describe('ProductsSection Component', () => {
  // Mock implementations
  const mockAddToCart = jest.fn();
  const mockAddToWishlist = jest.fn();
  const mockCheckDatabase = jest.fn();
  const mockTestCartFunctionality = jest.fn();
  const mockUser = { id: 'test-user-id', email: 'test@example.com' };
  
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
      loading: false
    });

    // Mock useWishlist
    (useWishlist as jest.Mock).mockReturnValue({
      wishlist: [],
      addToWishlist: mockAddToWishlist,
      loading: false
    });

    // Mock databaseSetup
    (databaseSetup.checkAndCreateTables as jest.Mock).mockResolvedValue(true);
    (databaseSetup.testInsert as jest.Mock).mockResolvedValue(true);

    // Mock global fetch for products
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockProducts)
    });
  });

  it('should render products correctly', async () => {
    await act(async () => {
      render(<ProductsSection />);
    });

    await waitFor(() => {
      expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      expect(screen.getByText('Carrots')).toBeInTheDocument();
    });
  });

  it('should add product to cart when authenticated', async () => {
    await act(async () => {
      render(<ProductsSection />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Add to Cart')).toHaveLength(2);
    });

    const addToCartButtons = screen.getAllByText('Add to Cart');
    await act(async () => {
      fireEvent.click(addToCartButtons[0]);
    });

    expect(mockAddToCart).toHaveBeenCalledWith(expect.objectContaining({
      id: 'product-1',
      name: 'Organic Apples'
    }));
  });

  it('should add product to wishlist when authenticated', async () => {
    await act(async () => {
      render(<ProductsSection />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Add to Wishlist')).toHaveLength(2);
    });

    const addToWishlistButtons = screen.getAllByText('Add to Wishlist');
    await act(async () => {
      fireEvent.click(addToWishlistButtons[0]);
    });

    expect(mockAddToWishlist).toHaveBeenCalledWith(expect.objectContaining({
      id: 'product-1',
      name: 'Organic Apples'
    }));
  });

  it('should not add to cart when not authenticated', async () => {
    // Mock user as not authenticated
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    });

    await act(async () => {
      render(<ProductsSection />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Add to Cart')).toHaveLength(2);
    });

    const addToCartButtons = screen.getAllByText('Add to Cart');
    await act(async () => {
      fireEvent.click(addToCartButtons[0]);
    });

    expect(mockAddToCart).not.toHaveBeenCalled();
    expect(screen.getByText('Please sign in to add items to your cart')).toBeInTheDocument();
  });

  it('should not add to wishlist when not authenticated', async () => {
    // Mock user as not authenticated
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    });

    await act(async () => {
      render(<ProductsSection />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Add to Wishlist')).toHaveLength(2);
    });

    const addToWishlistButtons = screen.getAllByText('Add to Wishlist');
    await act(async () => {
      fireEvent.click(addToWishlistButtons[0]);
    });

    expect(mockAddToWishlist).not.toHaveBeenCalled();
    expect(screen.getByText('Please sign in to add items to your wishlist')).toBeInTheDocument();
  });

  it('should filter products by category', async () => {
    await act(async () => {
      render(<ProductsSection />);
    });

    await waitFor(() => {
      expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      expect(screen.getByText('Carrots')).toBeInTheDocument();
    });

    // Find and click the fruits category filter
    const fruitsCategoryButton = screen.getByText('Fruits');
    await act(async () => {
      fireEvent.click(fruitsCategoryButton);
    });

    // Should only show apple product
    expect(screen.getByText('Organic Apples')).toBeInTheDocument();
    expect(screen.queryByText('Carrots')).not.toBeInTheDocument();

    // Click All to reset filter
    const allCategoryButton = screen.getByText('All');
    await act(async () => {
      fireEvent.click(allCategoryButton);
    });

    // Should show all products again
    expect(screen.getByText('Organic Apples')).toBeInTheDocument();
    expect(screen.getByText('Carrots')).toBeInTheDocument();
  });

  it('should filter products by search term', async () => {
    await act(async () => {
      render(<ProductsSection />);
    });

    await waitFor(() => {
      expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      expect(screen.getByText('Carrots')).toBeInTheDocument();
    });

    // Find search input and type "apple"
    const searchInput = screen.getByPlaceholderText('Search products...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'apple' } });
    });

    // Should only show apple product
    expect(screen.getByText('Organic Apples')).toBeInTheDocument();
    expect(screen.queryByText('Carrots')).not.toBeInTheDocument();

    // Clear search
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '' } });
    });

    // Should show all products again
    expect(screen.getByText('Organic Apples')).toBeInTheDocument();
    expect(screen.getByText('Carrots')).toBeInTheDocument();
  });

  it('should filter organic products', async () => {
    await act(async () => {
      render(<ProductsSection />);
    });

    await waitFor(() => {
      expect(screen.getByText('Organic Apples')).toBeInTheDocument();
      expect(screen.getByText('Carrots')).toBeInTheDocument();
    });

    // Find and click the organic filter
    const organicFilterButton = screen.getByLabelText('Organic only');
    await act(async () => {
      fireEvent.click(organicFilterButton);
    });

    // Should only show organic product
    expect(screen.getByText('Organic Apples')).toBeInTheDocument();
    expect(screen.queryByText('Carrots')).not.toBeInTheDocument();

    // Uncheck organic filter
    await act(async () => {
      fireEvent.click(organicFilterButton);
    });

    // Should show all products again
    expect(screen.getByText('Organic Apples')).toBeInTheDocument();
    expect(screen.getByText('Carrots')).toBeInTheDocument();
  });

  it('should handle database check functionality', async () => {
    // Mock the implementation of checkDatabase
    Object.defineProperty(window, 'checkDatabase', {
      value: mockCheckDatabase,
      writable: true,
    });

    await act(async () => {
      render(<ProductsSection />);
    });

    // Find and click the Check Database button
    const checkDatabaseButton = screen.getByText('Check Database');
    await act(async () => {
      fireEvent.click(checkDatabaseButton);
    });

    expect(databaseSetup.checkAndCreateTables).toHaveBeenCalled();
    expect(databaseSetup.testInsert).toHaveBeenCalled();
  });

  it('should handle test cart functionality', async () => {
    // Mock the implementation of testCartFunctionality
    Object.defineProperty(window, 'testCartFunctionality', {
      value: mockTestCartFunctionality,
      writable: true,
    });

    await act(async () => {
      render(<ProductsSection />);
    });

    // Find and click the Test Cart button
    const testCartButton = screen.getByText('Test Cart');
    await act(async () => {
      fireEvent.click(testCartButton);
    });

    expect(mockAddToCart).toHaveBeenCalled();
  });

  it('should handle error when fetching products', async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await act(async () => {
      render(<ProductsSection />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error loading products')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching products', async () => {
    // Create a promise that doesn't resolve immediately
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    // Mock fetch to return a pending promise
    global.fetch = jest.fn().mockReturnValue(promise);

    await act(async () => {
      render(<ProductsSection />);
    });

    // Should show loading state
    expect(screen.getByText('Loading products...')).toBeInTheDocument();

    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: jest.fn().mockResolvedValue(mockProducts)
      });
    });

    // Should show products
    await waitFor(() => {
      expect(screen.getByText('Organic Apples')).toBeInTheDocument();
    });
  });
});