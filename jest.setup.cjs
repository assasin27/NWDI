// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
require('@testing-library/jest-dom');

// Mock import.meta.env for Vite environment variables
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_SUPABASE_URL: 'https://test.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'test-key',
        PROD: false,
        DEV: true,
        MODE: 'test'
      }
    }
  },
  writable: true
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  root = null;
  rootMargin = '';
  thresholds = [];
  takeRecords() { return []; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
});

// Mock window.alert
Object.defineProperty(window, 'alert', {
  value: jest.fn(),
  writable: true
});

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
  writable: true
});

// Mock window.prompt
Object.defineProperty(window, 'prompt', {
  value: jest.fn(),
  writable: true
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: useLayoutEffect does nothing on the server'))
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: useLayoutEffect does nothing on the server'))
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
});

// Mock fetch
global.fetch = jest.fn();

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: jest.fn().mockResolvedValue({ data: [], error: null }),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
};

// Mock the supabaseClient module
jest.mock('@/integrations/supabase/supabaseClient', () => ({
  supabase: mockSupabase,
}));

// Mock the cartService
jest.mock('@/lib/cartService', () => ({
  cartService: {
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    getCartItems: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
  },
}));

// Mock the wishlistService
jest.mock('@/lib/wishlistService', () => ({
  wishlistService: {
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    getWishlistItems: jest.fn(),
    clearWishlist: jest.fn(),
  },
}));

// Mock the useSupabaseUser hook
jest.mock('@/lib/useSupabaseUser', () => ({
  useSupabaseUser: jest.fn(() => ({
    user: null,
    loading: false,
    signOut: jest.fn(),
  })),
}));

// Mock the useCart hook
jest.mock('@/hooks/useCart', () => ({
  useCart: jest.fn(() => ({
    cart: [],
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
    cartCount: 0,
    loading: false,
  })),
  CartProvider: ({ children }) => children,
}));

// Mock the useWishlist hook
jest.mock('@/hooks/useWishlist', () => ({
  useWishlist: jest.fn(() => ({
    wishlist: [],
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    clearWishlist: jest.fn(),
    wishlistCount: 0,
    loading: false,
  })),
  WishlistProvider: ({ children }) => children,
}));

// Mock the NotificationContext
jest.mock('@/contexts/NotificationContext', () => ({
  useNotification: jest.fn(() => ({
    showNotification: jest.fn(),
  })),
  NotificationProvider: ({ children }) => children,
}));

// Suppress console errors during tests
console.error = jest.fn();