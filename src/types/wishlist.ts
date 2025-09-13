export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  description?: string;
  is_organic: boolean;
  in_stock: boolean;
  selected_variant?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
