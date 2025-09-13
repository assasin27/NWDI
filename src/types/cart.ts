export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    imageUrl: string;
    quantity: number; // Available stock
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
  };
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}
