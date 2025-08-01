import React, { createContext, useContext, useState, useEffect } from "react";
import { wishlistService, WishlistItem } from "../lib/wishlistService";
import { useSupabaseUser } from "../lib/useSupabaseUser";

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
        inStock: item.in_stock
      }));
      setWishlist(uiWishlistItems);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (item: UIWishlistItem): Promise<boolean> => {
    if (!user?.id) {
      console.error('User not authenticated');
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
        in_stock: item.inStock
      });
      if (success) {
        await loadWishlist(); // Reload wishlist to get updated state
      }
      return success;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: string): Promise<boolean> => {
    if (!user?.id) {
      console.error('User not authenticated');
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
      console.error('Error removing from wishlist:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearWishlist = async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('User not authenticated');
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
      console.error('Error clearing wishlist:', error);
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
