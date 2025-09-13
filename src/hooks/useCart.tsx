import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService, CartItem } from "../lib/cartService";
import { useSupabaseUser } from "../lib/useSupabaseUser";
import { ProductVariant } from "../lib/productsData";
import { errorHandler } from "../lib/errorHandler";

// Interface for the cart items as used in the UI (without database-specific fields)
export interface UICartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  isOrganic?: boolean;
  inStock?: boolean;
  quantity: number;
  selectedVariant?: ProductVariant;
}

interface CartContextType {
  cart: UICartItem[];
  addToCart: (item: Omit<UICartItem, "quantity">) => Promise<boolean>;
  removeFromCart: (id: string) => Promise<boolean>;
  updateQuantity: (id: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  const [cart, setCart] = useState<UICartItem[]>([]);
  const [loading, setLoading] = useState(false);  const { user, loading: userLoading } = useSupabaseUser();

  const loadCart = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const cartItems = await cartService.getCartItems(user.id);
      
      // Map database items to UI items
      const uiCartItems: UICartItem[] = cartItems.map(item => ({
        id: item.product_id, // Use product_id as the unique identifier
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        description: item.description,
        isOrganic: item.is_organic,
        inStock: item.in_stock,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant // This might be undefined from database
      }));
      
      setCart(uiCartItems);
    } catch (error) {
      errorHandler.handleError(error as Error, 'useCart.loadCart');    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const addToCart = async (item: Omit<UICartItem, "quantity">): Promise<boolean> => {
    if (!user?.id) {
      errorHandler.handleError('User not authenticated', 'useCart.addToCart');
      return false;
    }
    
    setLoading(true);
    try {
      // Call cartService.addToCart with the correct parameters
      const result = await cartService.addToCart(
        user.id,
        item.id,
        1, // Default quantity
        item.selectedVariant
      );
      
      if (result.success) {
        await loadCart(); // Reload cart to get updated state
      }
      return result.success;
    } catch (error) {
      errorHandler.handleError(error as Error, 'useCart.addToCart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (id: string): Promise<boolean> => {
    if (!user?.id) {
      console.error('User not authenticated');
      return false;
    }

    setLoading(true);
    try {
      const success = await cartService.removeFromCart(user.id, id);
      if (success) {
        await loadCart(); // Reload cart to get updated state
      }
      return success;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number): Promise<boolean> => {
    if (!user?.id) {
      console.error('User not authenticated');
      return false;
    }

    setLoading(true);
    try {
      const success = await cartService.updateQuantity(user.id, id, quantity);
      if (success) {
        await loadCart(); // Reload cart to get updated state
      }
      return success;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('User not authenticated');
      return false;
    }

    setLoading(true);
    try {
      const success = await cartService.clearCart(user.id);
      if (success) {
        setCart([]);
      }
      return success;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};
