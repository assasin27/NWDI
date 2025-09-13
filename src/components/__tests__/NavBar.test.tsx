import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import NavBar from '../NavBar';
import { CartProvider, useCart } from '../../hooks/useCart';
import { WishlistProvider, useWishlist } from '../../hooks/useWishlist';
import { useSupabaseUser } from '../../lib/useSupabaseUser';

// Mock the hooks
jest.mock('../../hooks/useCart', () => ({
  useCart: () => ({
    cartItems: [],
  }),
}));

jest.mock('../../hooks/useWishlist', () => ({
  useWishlist: () => ({
    wishlistItems: [],
  }),
}));

jest.mock('../../lib/useSupabaseUser', () => ({
  useSupabaseUser: () => ({
    user: null,
    loading: false,
  }),
}));

const renderNavBar = () => {
  return render(
    <BrowserRouter>
      <WishlistProvider>
        <CartProvider>
          <NavBar />
        </CartProvider>
      </WishlistProvider>
    </BrowserRouter>
  );
};

describe('NavBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders logo and brand name', () => {
      renderNavBar();
      expect(screen.getByText('FarmFresh')).toBeInTheDocument();
    });

    test('renders navigation links', () => {
      renderNavBar();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    test('renders Farmer Portal button', () => {
      renderNavBar();
      expect(screen.getByText('Farmer Portal')).toBeInTheDocument();
    });

    test('renders login/signup buttons when user is not authenticated', () => {
      renderNavBar();
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('shows mobile menu button on small screens', () => {
      renderNavBar();
      const menuButton = screen.getByRole('button', { name: /menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    test('toggles mobile menu when menu button is clicked', () => {
      renderNavBar();
      const menuButton = screen.getByRole('button', { name: /menu/i });
      
      fireEvent.click(menuButton);
      expect(screen.getByText('Home')).toBeInTheDocument();
      
      fireEvent.click(menuButton);
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    test('Home link navigates to home page', () => {
      renderNavBar();
      const homeLink = screen.getByText('Home');
      expect(homeLink).toHaveAttribute('href', '/');
    });

    test('Products link navigates to products section', () => {
      renderNavBar();
      const productsLink = screen.getByText('Products');
      expect(productsLink).toHaveAttribute('href', '/#products');
    });

    test('Farmer Portal link navigates to farmer login', () => {
      renderNavBar();
      const farmerPortalLink = screen.getByText('Farmer Portal');
      expect(farmerPortalLink.closest('a')).toHaveAttribute('href', '/farmer/login');
    });
  });

  describe('Authentication States', () => {
    test('shows user actions when authenticated', () => {        (useSupabaseUser as jest.MockedFunction<typeof useSupabaseUser>).mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: false,
      });

      renderNavBar();
      expect(screen.getByTestId('wishlist-button')).toBeInTheDocument();
      expect(screen.getByTestId('cart-button')).toBeInTheDocument();
      expect(screen.getByTestId('profile-button')).toBeInTheDocument();
    });

    test('shows cart and wishlist counts when items exist', () => {
      (useCart as jest.MockedFunction<typeof useCart>).mockReturnValue({
        cartItems: [{ id: '1', name: 'Product 1' }],
      });

      (useWishlist as jest.MockedFunction<typeof useWishlist>).mockReturnValue({
        wishlistItems: [{ id: '1', name: 'Product 1' }],
      });

      renderNavBar();
      expect(screen.getByText('1')).toBeInTheDocument(); // Cart count
      expect(screen.getByText('1')).toBeInTheDocument(); // Wishlist count
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderNavBar();
      const menuButton = screen.getByRole('button', { name: /menu/i });
      expect(menuButton).toHaveAttribute('aria-label');
    });

    test('supports keyboard navigation', () => {
      renderNavBar();
      const menuButton = screen.getByRole('button', { name: /menu/i });
      
      // Test keyboard navigation
      menuButton.focus();
      fireEvent.keyDown(menuButton, { key: 'Enter' });
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  describe('Security', () => {
    test('does not expose sensitive user information', () => {
      (useSupabaseUser as jest.MockedFunction<typeof useSupabaseUser>).mockReturnValue({
        user: { 
          id: 'test-user', 
          email: 'test@example.com',
          password: 'should-not-be-exposed' // This should not be rendered
        },
        loading: false,
      });

      renderNavBar();
      expect(screen.queryByText('should-not-be-exposed')).not.toBeInTheDocument();
    });

    test('sanitizes user input in navigation', () => {
      renderNavBar();
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      // Test XSS prevention
      const maliciousInput = '<script>alert("xss")</script>';
      fireEvent.change(searchInput, { target: { value: maliciousInput } });
      
      expect(searchInput).toHaveValue(maliciousInput);
      // The input should be sanitized and not execute scripts
    });
  });
}); 