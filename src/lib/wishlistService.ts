import { supabase } from "../integrations/supabase/supabaseClient";

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
}

export const wishlistService = {
  // Get wishlist items for a user
  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    console.log('Getting wishlist items for user:', userId);
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching wishlist items:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return [];
    }
    
    console.log('Wishlist items retrieved:', data);
    return data || [];
  },

  // Add item to wishlist
  async addToWishlist(userId: string, item: Omit<WishlistItem, 'user_id' | 'product_id'>): Promise<boolean> {
    console.log('Adding item to wishlist:', { userId, item });
    
    try {
      // Check if item already exists in wishlist
      const { data: existing, error: checkError } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', item.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking existing wishlist item:', checkError);
        return false;
      }

      if (existing) {
        console.log('Item already exists in wishlist');
        // Item already exists, no need to add again
        return true;
      }

      console.log('Inserting new wishlist item');
              // Insert new item
        const wishlistItemData = {
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category,
          description: item.description,
          user_id: userId,
          product_id: item.id,
          is_organic: item.is_organic || false,
          in_stock: item.in_stock || true
        };
      console.log('Wishlist item data to insert:', wishlistItemData);
      
      const { error } = await supabase
        .from('wishlist_items')
        .insert([wishlistItemData]);
      
      if (error) {
        console.error('Error adding item to wishlist:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        return false;
      }
      
      console.log('Successfully added wishlist item');
      return true;
    } catch (error) {
      console.error('Unexpected error in addToWishlist:', error);
      return false;
    }
  },

  // Remove item from wishlist
  async removeFromWishlist(userId: string, itemId: string): Promise<boolean> {
    console.log('Removing item from wishlist:', { userId, itemId });
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', itemId);
    
    if (error) {
      console.error('Error removing item from wishlist:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return false;
    }
    
    return true;
  },

  // Clear wishlist for a user
  async clearWishlist(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error clearing wishlist:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return false;
    }
    
    return true;
  }
}; 