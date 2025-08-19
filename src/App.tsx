import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { WishlistProvider } from './hooks/useWishlist';
import { NotificationProvider } from './contexts/NotificationContext';
import errorHandler from './lib/errorHandler';

// Lazy load components for better performance
const Index = React.lazy(() => import('./pages/Index'));
const About = React.lazy(() => import('./pages/About'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Orders = React.lazy(() => import('./pages/Orders'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const CustomerPortal = React.lazy(() => import('./pages/customer/CustomerPortal'));
const FarmerPortal = React.lazy(() => import('./pages/farmer/FarmerPortal'));
const FarmerDashboard = React.lazy(() => import('./pages/farmer/FarmerDashboard'));
const AddProduct = React.lazy(() => import('./pages/farmer/AddProduct'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorHandler.handleError(error, 'ErrorBoundary');
    console.error('Error caught by boundary:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Google Translate widget loader
  React.useEffect(() => {
    // Persistently shift page based on actual translation state
    const updateShiftFromCookie = () => {
      try {
        // Prefer the real Google combo value if available
        const combo = document.querySelector<HTMLSelectElement>('#google_translate_element select, .goog-te-combo');
        let isTranslated = false;

        if (combo && combo.value) {
          isTranslated = combo.value !== 'en';
        } else {
          // Fallback to cookie if combo not yet present
          const m = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
          const cookieLang: string | null = m?.[1] ?? null; // null => cookie not set
          isTranslated = cookieLang !== null ? cookieLang !== 'en' : false;

          // Sync localStorage with cookie if cookie is present; clear if not
          if (cookieLang !== null) {
            if (cookieLang !== 'en') { try { localStorage.setItem('gtShiftActive', '1'); } catch {} }
            else { try { localStorage.removeItem('gtShiftActive'); } catch {} }
          } else {
            try { localStorage.removeItem('gtShiftActive'); } catch {}
          }
        }

        if (isTranslated) document.documentElement.classList.add('gt-shifted');
        else document.documentElement.classList.remove('gt-shifted');
      } catch {}
    };
    updateShiftFromCookie();
    const shiftTimer = window.setInterval(updateShiftFromCookie, 1500);

    // Remove Google's overlay frames/balloons if they appear (without affecting translation)
    const removeGoogleOverlays = () => {
      const selectors = [
        'iframe.goog-te-banner-frame',
        '.goog-te-banner-frame',
        '#goog-gt-tt',
        'iframe.goog-te-balloon-frame',
        '.goog-te-balloon-frame',
        'iframe.goog-te-menu-frame',
        '.goog-te-menu-frame',
      ];
      document.querySelectorAll(selectors.join(',')).forEach((el) => {
        try { el.parentElement?.removeChild(el); } catch {}
      });
      // As an extra guard, strip any table rows/cells inside tooltip container if it somehow persists
      const tip = document.getElementById('goog-gt-tt');
      if (tip) {
        tip.querySelectorAll('table, tr, td').forEach((n) => {
          try { (n as HTMLElement).remove(); } catch {}
        });
        try { tip.remove(); } catch {}
      }
    };

    // Observe DOM to remove overlays added later
    const observer = new MutationObserver(() => removeGoogleOverlays());
    try {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    } catch {}

    // Initial pass
    removeGoogleOverlays();

    // Define the global init callback required by Google's script
    (window as any).googleTranslateElementInit = () => {
      const g: any = (window as any).google;
      if (!g || !g.translate) return;

      const initOnce = () => {
        // Avoid duplicate initialization and ensure container exists
        if (document.getElementById('gt-el-loaded')) return true;
        const container = document.getElementById('google_translate_element');
        if (!container) return false;
        new g.translate.TranslateElement(
          {
            pageLanguage: 'en',
            // Allowed: English (original), Hindi, Marathi, Gujarati
            includedLanguages: 'en,hi,mr,gu',
            layout: g.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
        const marker = document.createElement('meta');
        marker.id = 'gt-el-loaded';
        document.head.appendChild(marker);
        return true;
      };

      if (!initOnce()) {
        // Retry for a short period until the container is mounted
        let attempts = 0;
        const timer = setInterval(() => {
          attempts += 1;
          if (initOnce() || attempts > 20) {
            clearInterval(timer);
          }
        }, 150);
      }
    };

    // Inject the Google Translate script once
    if (!document.getElementById('google-translate-script')) {
      const s = document.createElement('script');
      s.id = 'google-translate-script';
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      s.async = true;
      document.body.appendChild(s);
    } else {
      // If already present (e.g., due to HMR), try initializing again
      (window as any).googleTranslateElementInit?.();
    }

    // Cleanup observer and timers on unmount
    return () => {
      try { observer.disconnect(); } catch {}
      try { window.clearInterval(shiftTimer); } catch {}
    };
  }, []);

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CartProvider>
            <WishlistProvider>
              <React.Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/customer" element={<CustomerPortal />} />
                  <Route path="/farmer" element={<FarmerPortal />} />
                  <Route path="/farmer/login" element={<FarmerPortal />} />
                  <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
                  <Route path="/farmer/add-product" element={<AddProduct />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </React.Suspense>
            </WishlistProvider>
          </CartProvider>
        </Router>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
