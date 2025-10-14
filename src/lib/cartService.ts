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

  // Add item to cart
  async addToCart(userId: string, productId: string, quantity: number = 1, variant?: ProductVariant): Promise<{ success: boolean; message: string; item?: CartItem }> {
    try {
      // Accept full product object
      const response = await apiService.addToCart(productId);
      if (response.error) {
        errorHandler.handleError(response.error, 'CartService.addToCart');
        return { success: false, message: 'Failed to add item to cart' };
      }
      return { 
        success: true, 
        message: response.isUpdate ? 'Cart item updated' : 'Item added to cart', 
        item: response.data 
      };
    } catch (error) {
      errorHandler.handleError(error as Error, 'CartService.addToCart');
      return { success: false, message: 'An error occurred while adding to cart' };
    }
  },

  // Remove item from cart
  async removeFromCart(userId: string, productId: string, variant?: ProductVariant): Promise<boolean> {
    try {
      const response = await apiService.removeFromCart(userId, productId, variant);
      
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

  // Update item quantity
  async updateQuantity(userId: string, productId: string, quantity: number, variant?: ProductVariant): Promise<boolean> {
    try {
      const response = await apiService.updateQuantity(userId, productId, quantity, variant);
      
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