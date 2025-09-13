import { ApiClient } from './apiClient';
import { BaseResponse } from '../types/api';
import { Cart, CartItem } from '../types/cart';

export class CartService {
  private api: ApiClient;
  private endpoint = '/api/v1/cart';

  constructor(api: ApiClient) {
    this.api = api;
  }

  public async getCart(userId: string): Promise<BaseResponse<Cart>> {
    return this.api.get(`${this.endpoint}/${userId}`);
  }

  public async addToCart(userId: string, item: Omit<CartItem, 'id'>): Promise<BaseResponse<Cart>> {
    return this.api.post(`${this.endpoint}/${userId}/items`, item);
  }

  public async updateCartItem(userId: string, itemId: string, quantity: number): Promise<BaseResponse<Cart>> {
    return this.api.put(`${this.endpoint}/${userId}/items/${itemId}`, { quantity });
  }

  public async removeFromCart(userId: string, itemId: string): Promise<BaseResponse<Cart>> {
    return this.api.delete(`${this.endpoint}/${userId}/items/${itemId}`);
  }

  public async clearCart(userId: string): Promise<BaseResponse<void>> {
    return this.api.delete(`${this.endpoint}/${userId}`);
  }

  public async moveToWishlist(userId: string, itemId: string, item: CartItem): Promise<BaseResponse<void>> {
    return this.api.post(`${this.endpoint}/${userId}/items/${itemId}/move-to-wishlist`, { item });
  }

  public async validateCartItems(userId: string): Promise<BaseResponse<{ 
    valid: boolean;
    invalidItems: string[];
    outOfStockItems: string[];
  }>> {
    return this.api.get(`${this.endpoint}/${userId}/validate`);
  }
}
