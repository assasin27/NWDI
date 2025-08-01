import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/hooks/useCart';
import { WishlistProvider } from '@/hooks/useWishlist';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Cart from '@/pages/Cart';
import Wishlist from '@/pages/Wishlist';
import Orders from '@/pages/Orders';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

const CustomerPortal = () => {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen bg-background">
          <NavBar onCartClick={() => setCartOpen(true)} />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
};

export default CustomerPortal; 