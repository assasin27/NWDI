import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';


// Mock hooks used by NavBar to control auth/cart/wishlist state
jest.mock('../../hooks/useCart', () => ({
  useCart: () => ({ cart: [] }),
}));

jest.mock('../../hooks/useWishlist', () => ({
  useWishlist: () => ({ wishlist: [] }),
}));

const renderNav = (user: any) => {
  let NavBar: any;
  jest.isolateModules(() => {
    jest.doMock('../../lib/useSupabaseUser', () => ({
      useSupabaseUser: () => ({ user, loading: false }),
    }));
    NavBar = require('../NavBar').default;
  });

  const App = () => (
    <BrowserRouter>
      <NavBar />
    </BrowserRouter>
  );
  return render(<App />);
};

// Small helper to check DOM order (is A before B)
const isBefore = (a: Element, b: Element) => {
  return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
};

describe('Language selector in NavBar', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    // Ensure no stray combo from previous tests
    document.querySelectorAll('.goog-te-combo').forEach((n) => n.remove());
  });

  test('logged-out: Language button appears to the left of Login', async () => {
    const { container } = renderNav(null);

    const langBtn = screen.getByRole('button', { name: /select language|language/i });
    const loginLink = screen.getByText('Login').closest('a') as HTMLAnchorElement;

    expect(langBtn).toBeInTheDocument();
    expect(loginLink).toBeInTheDocument();
    expect(isBefore(langBtn, loginLink)).toBe(true);

    // Hidden google container exists
    const hiddenContainer = container.querySelector('#google_translate_element');
    expect(hiddenContainer).toBeInTheDocument();
  });

  test('logged-in: Language button appears to the left of Wishlist', async () => {
    const { container } = renderNav({ id: 'u1', email: 'u@example.com' });

    const langBtn = screen.getByRole('button', { name: /select language|language/i });
    const wishlistLink = container.querySelector('a[href="/wishlist"]') as HTMLAnchorElement;

    expect(langBtn).toBeInTheDocument();
    expect(wishlistLink).toBeInTheDocument();
    expect(isBefore(langBtn, wishlistLink)).toBe(true);

    // Hidden google container exists
    const hiddenContainer = container.querySelector('#google_translate_element');
    expect(hiddenContainer).toBeInTheDocument();
  });

  test('dropdown shows expected languages and triggers Google combo change', async () => {
    renderNav(null);

    // Inject a fake Google combo select to observe changes
    const combo = document.createElement('select');
    combo.className = 'goog-te-combo';
    document.body.appendChild(combo);
    const onChange = jest.fn();
    combo.addEventListener('change', onChange);

    const langBtn = screen.getByRole('button', { name: /select language|language/i });
    fireEvent.click(langBtn);

    // Menu entries
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('हिंदी (Hindi)')).toBeInTheDocument();
    expect(screen.getByText('मराठी (Marathi)')).toBeInTheDocument();
    expect(screen.getByText('ગુજરાતી (Gujarati)')).toBeInTheDocument();
    expect(screen.getByText(/Marwadi \(Not available\)/)).toBeInTheDocument();

    // Click Hindi and ensure the hidden select receives the change
    fireEvent.click(screen.getByText('हिंदी (Hindi)'));
    expect(combo.value).toBe('hi');
    expect(onChange).toHaveBeenCalledTimes(1);

    // Persistent shift should be ON while translated
    expect(document.documentElement.classList.contains('gt-shifted')).toBe(true);
    expect(localStorage.getItem('gtShiftActive')).toBe('1');

    // Switch back to English -> shift should be removed
    fireEvent.click(langBtn);
    fireEvent.click(screen.getByText('English'));
    expect(document.documentElement.classList.contains('gt-shifted')).toBe(false);
    expect(localStorage.getItem('gtShiftActive')).toBeNull();
  });

  test('navbar has sticky id for offset while translated', async () => {
    renderNav(null);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('id', 'site-navbar');
    // Note: JSDOM doesn't compute CSS, but we ensure sticky/top classes are present
    expect(nav.getAttribute('class') || '').toMatch(/sticky/);
    expect(nav.getAttribute('class') || '').toMatch(/top-0/);
  });
});
