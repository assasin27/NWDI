export interface FarmerProfile {
  id: string;
  user_id: string;
  farm_name: string;
  farm_address: string;
  phone: string;
  description?: string;
  certification?: string;
  created_at: string;
  updated_at: string;
}

export interface FarmerDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  revenueChange: number;
  ordersChange: number;
}

export interface Product {
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
  created_at: string;
  updated_at: string;
}

export interface ProductFilter {
  category?: string;
  search?: string;
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: Product;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  from?: string;
  to?: string;
}

export interface SalesAnalytics {
  totalSales: number;
  salesGrowth: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
  }>;
}

export interface InventoryAnalytics {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  stockValue: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  customerSatisfaction: number;
}