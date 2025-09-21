import { supabase } from '@/lib/supabase';
import { WishlistItem } from '../types/wishlist';
import { errorHandler } from '../lib/errorHandler';

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
      }      return data || [];
    } catch (error) {
      errorHandler.handleError(error as Error, 'WishlistService.getWishlistItems');
      return [];
    }
  }

  public async addToWishlist(userId: string, item: Omit<WishlistItem, 'id' | 'user_id'>): Promise<WishlistItem> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{ ...item, user_id: userId }])
        .select()
        .single();      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          errorHandler.handleError(error as Error, 'WishlistService.addToWishlist - Duplicate item');
          throw new Error('Item already in wishlist');
        }
        throw error;
      }

      return data;
    } catch (error) {
      errorHandler.handleError(error as Error, 'WishlistService.addToWishlist');
      throw new Error('Failed to add item to wishlist');
    }
  }

  public async removeFromWishlist(userId: string, productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .match({ user_id: userId, product_id: productId });      if (error) {
        throw error;
      }
    } catch (error) {
      errorHandler.handleError(error as Error, 'WishlistService.removeFromWishlist');
      throw new Error('Failed to remove item from wishlist');
    }
  }

  public async clearWishlist(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId);      if (error) {
        throw error;
      }
    } catch (error) {
      errorHandler.handleError(error as Error, 'WishlistService.clearWishlist');
      throw new Error('Failed to clear wishlist');
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
      }      return !!data;
    } catch (error) {
      errorHandler.handleError(error as Error, 'WishlistService.isInWishlist');
      return false;
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
