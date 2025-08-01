import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { CartProvider } from './hooks/useCart';
import { WishlistProvider } from './hooks/useWishlist';
import { NotificationProvider } from './contexts/NotificationContext';
import CustomerPortal from './pages/CustomerPortal';
import FarmerPortal from './pages/farmer/FarmerPortal';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotificationProvider>
          <CartProvider>
            <WishlistProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <div className="App">
                  <Routes>
                    <Route path="/*" element={<CustomerPortal />} />
                    <Route path="/farmer/*" element={<FarmerPortal />} />
                  </Routes>
                  <Toaster />
                  <Sonner />
                </div>
              </Router>
            </WishlistProvider>
          </CartProvider>
        </NotificationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
