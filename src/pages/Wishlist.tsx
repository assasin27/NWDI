import React, { useState, useEffect } from 'react';
import { ProductCard } from "../components/ProductCard";
import { useWishlist } from "../hooks/useWishlist";
import { useCart } from "../hooks/useCart";
import { useSupabaseUser } from "../lib/useSupabaseUser";
import { useNotification } from "../contexts/NotificationContext";
import { Loader2, Heart, Trash2 } from 'lucide-react';
import { Product } from "../lib/productsData";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";

const Wishlist: React.FC = () => {
  const { wishlist, addToWishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user, loading: userLoading } = useSupabaseUser();
  const { showNotification } = useNotification();
  const [clearing, setClearing] = useState(false);

  const handleAddToCart = (product: Product) => {
    if (userLoading) return;
    
    if (!user) {
      showNotification('Please log in to add items to cart', 'error');
      return;
    }

    addToCart(product);
    showNotification(`${product.name} added to cart!`, 'success');
  };

  const handleAddToWishlist = (product: Product) => {
    if (userLoading) return;
    
    if (!user) {
      showNotification('Please log in to add items to wishlist', 'error');
      return;
    }

    addToWishlist(product);
  };

  const handleRemoveFromWishlist = (product: Product) => {
    removeFromWishlist(product.id);
    showNotification(`${product.name} removed from wishlist`, 'info');
  };

  const handleClearWishlist = async () => {
    if (wishlist.length === 0) {
      showNotification('Wishlist is already empty', 'info');
      return;
    }

    setClearing(true);
    try {
      await clearWishlist();
      showNotification('Wishlist cleared successfully', 'success');
    } catch (error) {
      showNotification('Failed to clear wishlist', 'error');
    } finally {
      setClearing(false);
    }
  };

  if (userLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            </div>
            <p className="text-gray-600">Your saved items for later purchase</p>
            
            {/* Clear Wishlist Button */}
            {wishlist.length > 0 && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleClearWishlist}
                  disabled={clearing}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  {clearing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Wishlist
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500">Start adding items to your wishlist to see them here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  onAddToWishlist={() => handleAddToWishlist(product)}
                  onRemoveFromWishlist={() => handleRemoveFromWishlist(product)}
                  isWishlisted={true}
                  loading={userLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
