import { supabase } from "../integrations/supabase/supabaseClient";

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
}

export const cartService = {
  // Get cart items for a user
  async getCartItems(userId: string): Promise<CartItem[]> {
    console.log('Getting cart items for user:', userId);
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching cart items:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return [];
    }
    
    console.log('Cart items retrieved:', data);
    return data || [];
  },

  // Add item to cart
  async addToCart(userId: string, item: Omit<CartItem, 'user_id' | 'quantity' | 'product_id'>, quantity: number = 1): Promise<boolean> {
    console.log('Adding item to cart:', { userId, item, quantity });
    
    try {
      // Check if item already exists in cart
      const { data: existing, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', item.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking existing cart item:', checkError);
        return false;
      }

      if (existing) {
        console.log('Updating existing cart item quantity');
        // Update quantity if item exists
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('user_id', userId)
          .eq('product_id', item.id);
        
        if (error) {
          console.error('Error updating cart item:', error);
          console.error('Error details:', error.message, error.details, error.hint);
          return false;
        }
      } else {
        console.log('Inserting new cart item');
        // Insert new item
        const cartItemData = {
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category,
          description: item.description,
          user_id: userId, 
          quantity,
          product_id: item.id,
          is_organic: item.is_organic || false,
          in_stock: item.in_stock || true
        };
        console.log('Cart item data to insert:', cartItemData);
        
        const { error } = await supabase
          .from('cart_items')
          .insert([cartItemData]);
        
        if (error) {
          console.error('Error adding item to cart:', error);
          console.error('Error details:', error.message, error.details, error.hint);
          return false;
        }
      }
      
      console.log('Successfully added/updated cart item');
      return true;
    } catch (error) {
      console.error('Unexpected error in addToCart:', error);
      return false;
    }
  },

  // Remove item from cart
  async removeFromCart(userId: string, itemId: string): Promise<boolean> {
    console.log('Removing item from cart:', { userId, itemId });
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', itemId);
    
    if (error) {
      console.error('Error removing item from cart:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return false;
    }
    
    return true;
  },

  // Update item quantity
  async updateQuantity(userId: string, itemId: string, quantity: number): Promise<boolean> {
    if (quantity <= 0) {
      return this.removeFromCart(userId, itemId);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', itemId);
    
    if (error) {
      console.error('Error updating item quantity:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return false;
    }
    
    return true;
  },

  // Clear cart for a user
  async clearCart(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error clearing cart:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return false;
    }
    
    return true;
  }
}; 