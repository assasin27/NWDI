import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  LogOut,
  Package,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useSupabaseUser } from '../lib/useSupabaseUser';
import { supabase } from '../integrations/supabase/supabaseClient';

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { cart: cartItems } = useCart();
  const { wishlist: wishlistItems } = useWishlist();
  const { user, loading } = useSupabaseUser();
  const location = useLocation();
  const navigate = useNavigate();

  const isFarmerRoute = location.pathname.startsWith('/farmer');
  const isHomePage = location.pathname === '/';

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      closeUserMenu();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (isHomePage) {
      // If on homepage, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on other pages, navigate to homepage first, then scroll
      navigate('/', { state: { scrollTo: sectionId } });
    }
    closeMenu();
  };

  const scrollToTop = () => {
    if (isHomePage) {
      // If on homepage, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If on other pages, navigate to homepage
      navigate('/');
    }
    closeMenu();
  };

  const cartItemCount = cartItems?.length || 0;
  const wishlistItemCount = wishlistItems?.length || 0;

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button 
              onClick={scrollToTop}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent hidden sm:block">
                Nareshwadi
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={scrollToTop}
              className="text-gray-700 hover:text-green-600 transition-colors text-lg font-medium relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button 
              onClick={() => scrollToSection('products')}
              className="text-gray-700 hover:text-green-600 transition-colors text-lg font-medium relative group"
            >
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-green-600 transition-colors text-lg font-medium relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-green-600 transition-colors text-lg font-medium relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </button>
            
            {/* Farmer Portal Button */}
            <Button
              asChild
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Link to="/farmer/login">
                <Package className="w-4 h-4 mr-2" />
                Farmer Portal
              </Link>
            </Button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/wishlist" className="relative">
                  <Button variant="ghost" size="icon" className="relative hover:bg-red-50 transition-colors duration-300">
                    <Heart className="h-5 w-5" />
                    {wishlistItemCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                        {wishlistItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors" data-testid="cart-button">
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      data-testid="cart-count"
                    >
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                
                {/* User Dropdown Menu */}
                <div className="relative user-menu-container">
                  <Button
                    variant="ghost"
                    onClick={toggleUserMenu}
                    className="flex items-center gap-2 hover:bg-blue-50 transition-colors duration-300"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm font-medium">
                      {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.user_metadata?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={closeUserMenu}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                        >
                          <User className="h-4 w-4 mr-3" />
                          My Profile
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={closeUserMenu}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors duration-200"
                        >
                          <Heart className="h-4 w-4 mr-3" />
                          Wishlist
                          {wishlistItemCount > 0 && (
                            <Badge className="ml-auto h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                              {wishlistItemCount}
                            </Badge>
                          )}
                        </Link>
                        <Link
                          to="/cart"
                          onClick={closeUserMenu}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors duration-200"
                        >
                          <ShoppingCart className="h-4 w-4 mr-3" />
                          Cart
                          {cartItemCount > 0 && (
                            <Badge className="ml-auto h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-green-500 text-white">
                              {cartItemCount}
                            </Badge>
                          )}
                        </Link>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-300">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-300">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-gray-700 hover:bg-gray-100 transition-colors duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 shadow-lg">
              <button 
                onClick={scrollToTop}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-300"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('products')}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-300"
              >
                Products
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-300"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-300"
              >
                Contact
              </button>
              
              {/* Farmer Portal Button for Mobile */}
              <Link 
                to="/farmer/login" 
                className="block px-3 py-2 text-base font-medium text-orange-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-all duration-300"
                onClick={closeMenu}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Farmer Portal
              </Link>

              {user ? (
                <>
                  <div className="border-t border-gray-200/50 pt-3 mt-3">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-300"
                      onClick={closeMenu}
                    >
                      <User className="h-5 w-5 mr-2" />
                      My Profile
                    </Link>
                    <Link 
                      to="/wishlist" 
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-300"
                      onClick={closeMenu}
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Wishlist
                      {wishlistItemCount > 0 && (
                        <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                          {wishlistItemCount}
                        </Badge>
                      )}
                    </Link>
                    <Link 
                      to="/cart" 
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-300"
                      onClick={closeMenu}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Cart
                      {cartItemCount > 0 && (
                        <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-green-500 text-white">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        closeMenu();
                      }}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-300"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200/50 pt-3 mt-3 space-y-2">
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-300"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 rounded-md transition-all duration-300"
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Backdrop for user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={closeUserMenu}
        />
      )}
    </nav>
  );
};

export default NavBar;
