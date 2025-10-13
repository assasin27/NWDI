import { supabase } from "../integrations/supabase/supabaseClient";
import { ProductVariant } from "./productsData";
import errorHandler from "./errorHandler";

export interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  is_organic?: boolean;
  in_stock?: boolean;
  user_id: string;
  selectedVariant?: ProductVariant;
}

export const wishlistService = {
  // Test function to check database connection and table existence
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing wishlist database connection...');
      const { data, error } = await supabase
        .from('wishlist')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('Database connection test successful');
      return true;
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  },

  // Get wishlist items for a user
  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        errorHandler.handleError(error, 'WishlistService.getWishlistItems');
        return [];
      }
      
      return data || [];
    } catch (error) {
      errorHandler.handleError(error as Error, 'WishlistService.getWishlistItems');
      return [];
    }
  },

  // Add item to wishlist (uses UUID product_id; variants tracked in selectedVariant JSONB)
  async addToWishlist(userId: string, item: Omit<WishlistItem, 'user_id' | 'product_id'>): Promise<boolean> {
    try {
      // Check if item already exists in wishlist for the same product and variant (if any)
      const { data: existing, error: checkError } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', item.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116' && (checkError as any).status !== 406) { // treat 406 as not found
        errorHandler.handleError(checkError, 'WishlistService.addToWishlist.check');
        return false;
      }

      if (existing) {
        // Item already exists, no need to add again
        return true;
      }

      // Insert new item
      const wishlistItemData = {
        name: item.name,
        price: item.price,
        image: item.image || '',
        category: item.category || 'Misc',
        description: item.description || '',
        user_id: userId,
        product_id: item.id, // UUID product id
        is_organic: item.is_organic || false,
        in_stock: item.in_stock || true
      };
      
      const { error } = await supabase
        .from('wishlist')
        .insert([wishlistItemData]);
      
      if (error) {
        errorHandler.handleError(error, 'WishlistService.addToWishlist.insert');
        return false;
      }
      
      return true;
    } catch (error) {
      errorHandler.handleError(error as Error, 'WishlistService.addToWishlist');
      return false;
    }
  },

  // Remove item from wishlist (removes by product UUID only; caller should pass correct variant if needed)
  async removeFromWishlist(userId: string, itemId: string, variantName?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', itemId);
      
      if (error) {
        errorHandler.handleError(error, 'WishlistService.removeFromWishlist');
        return false;
      }
      
      return true;
    } catch (error) {
      errorHandler.handleError(error as Error, 'WishlistService.removeFromWishlist');
      return false;
    }
  },

  // Clear wishlist for a user
  async clearWishlist(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        errorHandler.handleError(error, 'WishlistService.clearWishlist');
        return false;
      }
      
      return true;
    } catch (error) {
      errorHandler.handleError(error as Error, 'WishlistService.clearWishlist');
      return false;
    }
  }
}; 