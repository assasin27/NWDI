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
