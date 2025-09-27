export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image_url: string;
  category: string;
  category_name?: string;
  is_organic: boolean;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
  total_sold?: number;
}

export interface AdminOrder {
  id: string;
  user: string;
  customer_email?: string;
  customer_name?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  items_count?: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface AdminAnalytics {
  overview: {
    total_orders: number;
    total_revenue: number;
    total_products: number;
    low_stock_products: number;
  };
  sales_data: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  top_products: Array<{
    product_name: string;
    total_sold: number;
    total_revenue: number;
  }>;
}

export interface AdminProfile {
  id: string;
  user: string;
  user_email?: string;
  farm_name: string;
  description: string;
  region: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_orders?: number;
  last_order_date?: string;
}
