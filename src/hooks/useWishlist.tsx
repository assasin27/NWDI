import React, { createContext, useContext, useState, useEffect } from "react";
import { wishlistService, WishlistItem } from "../lib/wishlistService";
import { useSupabaseUser } from "../lib/useSupabaseUser";
import { ProductVariant } from "../lib/productsData";
import { errorHandler } from "../lib/errorHandler";

// Interface for the wishlist items as used in the UI (without database-specific fields)
export interface UIWishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  isOrganic?: boolean;
  inStock?: boolean;
  selectedVariant?: ProductVariant;
}

interface WishlistContextType {
  wishlist: UIWishlistItem[];
  addToWishlist: (item: UIWishlistItem) => Promise<boolean>;
  removeFromWishlist: (id: string) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<UIWishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: userLoading } = useSupabaseUser();

  const deriveInStock = (item: { inStock?: boolean; in_stock?: boolean; quantity?: number }) => {
    if (typeof item.inStock === 'boolean') return item.inStock;
    if (typeof item.in_stock === 'boolean') return item.in_stock;
    if (typeof item.quantity === 'number') return item.quantity > 0;
    return true;
  };

  // Load wishlist from database when user changes
  useEffect(() => {
    if (user?.id && !userLoading) {
      loadWishlist();
    } else if (!user && !userLoading) {
      // Clear wishlist when user logs out
      setWishlist([]);
    }
  }, [user?.id, userLoading]);

  const loadWishlist = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Test database connection first
      const connectionTest = await wishlistService.testConnection();
      
      const wishlistItems = await wishlistService.getWishlistItems(user.id);
      // Map database items to UI items
      const uiWishlistItems: UIWishlistItem[] = wishlistItems.map(item => ({
        id: item.product_id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        description: item.description,
        isOrganic: item.is_organic,
        inStock: deriveInStock({ in_stock: item.in_stock }),
        selectedVariant: item.selectedVariant
      }));
      setWishlist(uiWishlistItems);
    } catch (error) {
      errorHandler.handleError(error as Error, 'useWishlist.loadWishlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (item: UIWishlistItem): Promise<boolean> => {
    if (!user?.id) {
      errorHandler.handleError('User not authenticated', 'useWishlist.addToWishlist');
      return false;
    }

    setLoading(true);
    try {
      const success = await wishlistService.addToWishlist(user.id, {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        description: item.description,
        is_organic: item.isOrganic,
        in_stock: deriveInStock(item),
        selectedVariant: item.selectedVariant
      });
      if (success) {
        await loadWishlist(); // Reload wishlist to get updated state
      }
      return success;
    } catch (error) {
      errorHandler.handleError(error as Error, 'useWishlist.addToWishlist');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: string): Promise<boolean> => {
    if (!user?.id) {
      errorHandler.handleError('User not authenticated', 'useWishlist.removeFromWishlist');
      return false;
    }

    setLoading(true);
    try {
      const success = await wishlistService.removeFromWishlist(user.id, id);
      if (success) {
        await loadWishlist(); // Reload wishlist to get updated state
      }
      return success;
    } catch (error) {
      errorHandler.handleError(error as Error, 'useWishlist.removeFromWishlist');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearWishlist = async (): Promise<boolean> => {
    if (!user?.id) {
      errorHandler.handleError('User not authenticated', 'useWishlist.clearWishlist');
      return false;
    }

    setLoading(true);
    try {
      const success = await wishlistService.clearWishlist(user.id);
      if (success) {
        setWishlist([]);
      }
      return success;
    } catch (error) {
      errorHandler.handleError(error as Error, 'useWishlist.clearWishlist');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, clearWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};
