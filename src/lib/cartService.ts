import { ProductVariant } from "./productsData";
import errorHandler from "./errorHandler";
import { apiService } from "./apiService";

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
      const response = await apiService.testCartConnection();
      
      if (response.error) {
        console.error('Database connection test failed:', response.error);
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
      const response = await apiService.getCartItems(userId);
      
      if (response.error) {
        errorHandler.handleError(response.error, 'CartService.getCartItems');
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      errorHandler.handleError(error as Error, 'CartService.getCartItems');
      return [];
    }
  },

  // Add item to cart (uses UUID product_id; variants tracked in selectedVariant JSONB)
  async addToCart(userId: string, item: Omit<CartItem, 'user_id' | 'quantity' | 'product_id'>, quantity: number = 1): Promise<boolean> {
    try {
      // Check if item already exists in cart (same product UUID and same variant, if any)
      const { data: existing, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', item.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116' && (checkError as any).status !== 406) { // treat 406 as not found
        errorHandler.handleError(checkError, 'CartService.addToCart.check');
        return false;
      }

      if (existing) {
        // Update quantity if item exists
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('user_id', userId)
          .eq('product_id', item.id);
        
        if (error) {
          errorHandler.handleError(error, 'CartService.addToCart.update');
          return false;
        }
      } else {
        // Insert new item
        const cartItemData = {
          name: item.name,
          price: item.price,
          image: item.image || '',
          category: item.category || 'Misc',
          description: item.description || '',
          user_id: userId, 
          quantity,
          product_id: item.id, // UUID product id
          is_organic: item.is_organic || false,
          in_stock: item.in_stock || true
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
      return { success: false, message: 'An error occurred while adding to cart' };
    }
  },

  // Remove item from cart (removes by product UUID and optional variant)
  async removeFromCart(userId: string, itemId: string, variantName?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', itemId);
      
      if (response.error) {
        errorHandler.handleError(response.error, 'CartService.removeFromCart');
        return false;
      }
      
      return true;
    } catch (error) {
      errorHandler.handleError(error as Error, 'CartService.removeFromCart');
      return false;
    }
  },

  // Update quantity
  async updateQuantity(userId: string, itemId: string, quantity: number, variantName?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', userId)
        .eq('product_id', itemId);
      
      if (response.error) {
        errorHandler.handleError(response.error, 'CartService.updateQuantity');
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
      const response = await apiService.clearCart(userId);
      
      if (response.error) {
        errorHandler.handleError(response.error, 'CartService.clearCart');
        return false;
      }
      
      return true;
    } catch (error) {
      errorHandler.handleError(error as Error, 'CartService.clearCart');
      return false;
    }
  }
};