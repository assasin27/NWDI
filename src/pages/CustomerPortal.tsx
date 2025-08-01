import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from '../hooks/useCart';
import { WishlistProvider } from '../hooks/useWishlist';
import NavBar from '../components/NavBar';
import CartDrawer from '../components/CartDrawer';
import Index from './Index';
import NotFound from './NotFound';
import Login from './Login';
import Signup from './Signup';
import Profile from './Profile';
import Wishlist from './Wishlist';
import Cart from './Cart';

const CustomerPortal: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
          <NavBar onCartClick={() => setIsCartOpen(true)} />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CartDrawer 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
          />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
};

export default CustomerPortal; 