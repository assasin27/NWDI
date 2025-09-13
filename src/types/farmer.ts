export interface FarmerDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  ordersByStatus: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recentSales: {
    date: string;
    revenue: number;
  }[];
}

export interface FarmerProfile {
  id: string;
  userId: string;
  farmName: string;
  description: string;
  region: string;
  certification: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  rating: number;
  totalReviews: number;
  certificationDocuments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  category: string;
  imageUrl: string;
  certification: string;
  region: string;
  isOrganic: boolean;
  unit: string;
  variants?: ProductVariant[];
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
}

export interface ProductFilter {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isOrganic?: boolean;
  sortBy?: 'price' | 'name' | 'quantity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  variant?: ProductVariant;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface DateRange {
  from: string;
  to: string;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByDay: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  salesByCategory: {
    category: string;
    revenue: number;
    orders: number;
  }[];
}

export interface InventoryAnalytics {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: Product[];
  stockByCategory: {
    category: string;
    quantity: number;
    value: number;
  }[];
  recentStockUpdates: {
    productId: string;
    productName: string;
    oldQuantity: number;
    newQuantity: number;
    updatedAt: string;
  }[];
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  topCustomers: {
    userId: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
  }[];
  customersByRegion: {
    region: string;
    customers: number;
    revenue: number;
  }[];
}
