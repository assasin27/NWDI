import React, { createContext, useContext, useState, useEffect } from "react";
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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<UICartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: userLoading } = useSupabaseUser();

  // Load cart from database when user changes
  useEffect(() => {
    if (user?.id && !userLoading) {
      loadCart();
    } else if (!user && !userLoading) {
      // Clear cart when user logs out
      setCart([]);
    }
  }, [user?.id, userLoading]);

  const loadCart = async () => {
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
      errorHandler.handleError(error as Error, 'useCart.loadCart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: Omit<UICartItem, "quantity">): Promise<boolean> => {
    if (!user?.id) {
      errorHandler.handleError('User not authenticated', 'useCart.addToCart');
      return false;
    }

    setLoading(true);
    try {
      // Create a unique ID for the cart item that includes the variant
      const uniqueCartItemId = item.selectedVariant 
        ? `${item.id}-${item.selectedVariant.name}` 
        : item.id;

      const cartItemData = {
        id: uniqueCartItemId, // Use unique ID for variant-specific items
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        description: item.description,
        is_organic: item.isOrganic,
        in_stock: item.inStock,
        selectedVariant: item.selectedVariant
      };

      const success = await cartService.addToCart(user.id, cartItemData);
      
      if (success) {
        await loadCart(); // Reload cart to get updated state
      }
      return success;
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
