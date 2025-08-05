import { supabase } from "../integrations/supabase/supabaseClient";
import { ProductVariant } from "./productsData";
import errorHandler from "./errorHandler";

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  is_organic?: boolean;
  in_stock?: boolean;
  quantity: number;
  user_id: string;
  selectedVariant?: ProductVariant; // Make optional to avoid database issues
}

export const cartService = {
  // Test function to check database connection and table existence
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing cart database connection...');
      const { data, error } = await supabase
        .from('cart_items')
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

  // Get cart items for a user
  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        errorHandler.handleError(error, 'CartService.getCartItems');
        return [];
      }
      
      return data || [];
    } catch (error) {
      errorHandler.handleError(error as Error, 'CartService.getCartItems');
      return [];
    }
  },

  // Add item to cart
  async addToCart(userId: string, item: Omit<CartItem, 'user_id' | 'quantity' | 'product_id'>, quantity: number = 1): Promise<boolean> {
    try {
      // Check if item already exists in cart (using the unique variant ID)
      const { data: existing, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', item.id) // Use the unique variant ID for checking
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        errorHandler.handleError(checkError, 'CartService.addToCart.check');
        return false;
      }

      if (existing) {
        // Update quantity if item exists
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('user_id', userId)
          .eq('product_id', item.id); // Use unique variant ID
        
        if (error) {
          errorHandler.handleError(error, 'CartService.addToCart.update');
          return false;
        }
      } else {
        // Insert new item
        const cartItemData = {
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category,
          description: item.description,
          user_id: userId, 
          quantity,
          product_id: item.id, // Store the unique variant ID
          is_organic: item.is_organic || false,
          in_stock: item.in_stock || true,
          selectedVariant: item.selectedVariant // Re-enabled now that column exists
        };
        
        const { error } = await supabase
          .from('cart_items')
          .insert([cartItemData]);
        
        if (error) {
          errorHandler.handleError(error, 'CartService.addToCart.insert');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      errorHandler.handleError(error as Error, 'CartService.addToCart');
      return false;
    }
  },

  // Remove item from cart
  async removeFromCart(userId: string, itemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', itemId); // Use the unique variant ID
      
      if (error) {
        errorHandler.handleError(error, 'CartService.removeFromCart');
        return false;
      }
      
      return true;
    } catch (error) {
      errorHandler.handleError(error as Error, 'CartService.removeFromCart');
      return false;
    }
  },

  // Update quantity
  async updateQuantity(userId: string, itemId: string, quantity: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', userId)
        .eq('product_id', itemId); // Use the unique variant ID
      
      if (error) {
        errorHandler.handleError(error, 'CartService.updateQuantity');
        return false;
      }
      
      return true;
    } catch (error) {
      errorHandler.handleError(error as Error, 'CartService.updateQuantity');
      return false;
    }
  },

  // Clear cart
  async clearCart(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        errorHandler.handleError(error, 'CartService.clearCart');
        return false;
      }
      
      return true;
    } catch (error) {
      errorHandler.handleError(error as Error, 'CartService.clearCart');
      return false;
    }
  }
}; 