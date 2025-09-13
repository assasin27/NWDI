import { supabase } from '@/lib/supabase';
import { WishlistItem } from '../types/wishlist';
import { handleError } from '../utils/errorHandler';

export class WishlistService {
  private readonly tableName = 'wishlist_items';

  constructor() {
    this.validateTable();
  }

  private async validateTable() {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .select('*')
        .limit(1);

      if (error?.code === '42P01') {
        console.error('Wishlist table does not exist. Please run migrations.');
        throw new Error('Wishlist table not found');
      }
    } catch (error) {
      console.error('Error validating wishlist table:', error);
      throw error;
    }
  }

  public async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw handleError('Failed to fetch wishlist items', error);
    }
  }

  public async addToWishlist(userId: string, item: Omit<WishlistItem, 'id' | 'user_id'>): Promise<WishlistItem> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{ ...item, user_id: userId }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw handleError('Item already in wishlist', error, 'DUPLICATE_ITEM');
        }
        throw error;
      }

      return data;
    } catch (error) {
      throw handleError('Failed to add item to wishlist', error);
    }
  }

  public async removeFromWishlist(userId: string, productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .match({ user_id: userId, product_id: productId });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw handleError('Failed to remove item from wishlist', error);
    }
  }

  public async clearWishlist(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw handleError('Failed to clear wishlist', error);
    }
  }

  public async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id')
        .match({ user_id: userId, product_id: productId })
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      return !!data;
    } catch (error) {
      throw handleError('Failed to check wishlist status', error);
    }
  }

  // Subscribe to real-time wishlist changes
  public subscribeToWishlist(userId: string, callback: (payload: any) => void): () => void {
    const subscription = supabase
      .channel('wishlist_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}
