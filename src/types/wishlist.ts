export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    inStock: boolean;
    is_organic: boolean;
    seller_id: string;
  };
}

export interface WishlistResponse {
  success: boolean;
  data?: WishlistItem[];
  error?: string;
  message?: string;
}

export interface AddToWishlistRequest {
  user_id: string;
  product_id: string;
}

export interface RemoveFromWishlistRequest {
  user_id: string;
  product_id: string;
}