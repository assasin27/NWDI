import { apiClient } from '@/lib/apiClient';
import { Product, Order, AnalyticsData } from '@/types/admin';

export interface AdminProduct extends Product {
  category_name?: string;
  total_sold?: number;
}

export interface AdminOrder extends Order {
  customer_email?: string;
  customer_name?: string;
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

class AdminService {
  // Product Management
  async getProducts(params?: {
    search?: string;
    category?: string;
    in_stock?: boolean;
    page?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.in_stock !== undefined) queryParams.append('in_stock', params.in_stock.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    return apiClient.get<AdminProduct[]>(`/admin/products/?${queryParams.toString()}`);
  }

  async getProduct(id: string) {
    return apiClient.get<AdminProduct>(`/admin/products/${id}/`);
  }

  async createProduct(productData: Partial<AdminProduct>) {
    return apiClient.post<AdminProduct>('/admin/products/', productData);
  }

  async updateProduct(id: string, productData: Partial<AdminProduct>) {
    return apiClient.put<AdminProduct>(`/admin/products/${id}/`, productData);
  }

  async deleteProduct(id: string) {
    return apiClient.delete(`/admin/products/${id}/`);
  }

  async getLowStockProducts() {
    return apiClient.get<AdminProduct[]>('/admin/products/low_stock/');
  }

  async getOutOfStockProducts() {
    return apiClient.get<AdminProduct[]>('/admin/products/out_of_stock/');
  }

  // Order Management
  async getOrders(params?: {
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.page) queryParams.append('page', params.page.toString());

    return apiClient.get<AdminOrder[]>(`/admin/orders/?${queryParams.toString()}`);
  }

  async getOrder(id: string) {
    return apiClient.get<AdminOrder>(`/admin/orders/${id}/`);
  }

  async updateOrderStatus(id: string, status: string) {
    return apiClient.put<AdminOrder>(`/admin/orders/${id}/status/`, { status });
  }

  async getPendingOrders() {
    return apiClient.get<AdminOrder[]>('/admin/orders/pending_orders/');
  }

  async getTodayOrders() {
    return apiClient.get<AdminOrder[]>('/admin/orders/today_orders/');
  }

  // Analytics
  async getAnalytics(days: number = 30) {
    return apiClient.get<AdminAnalytics>(`/admin/analytics/?days=${days}`);
  }

  async exportSales(startDate: string, endDate: string) {
    return apiClient.get(`/admin/export/sales/?start_date=${startDate}&end_date=${endDate}`, {
      responseType: 'blob'
    });
  }

  async getProductPerformance(startDate: string, endDate: string) {
    return apiClient.get<AdminProduct[]>(`/admin/analytics/product_performance/?start_date=${startDate}&end_date=${endDate}`);
  }

  // Profile Management
  async getAdminProfile() {
    return apiClient.get('/admin/profile/');
  }

  async updateAdminProfile(profileData: any) {
    return apiClient.put('/admin/profile/', profileData);
  }

  // User Management
  async getUsers(params?: {
    search?: string;
    page?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());

    return apiClient.get(`/admin/users/?${queryParams.toString()}`);
  }

  async getUser(id: string) {
    return apiClient.get(`/admin/users/${id}/`);
  }

  async updateUser(id: string, userData: any) {
    return apiClient.put(`/admin/users/${id}/`, userData);
  }

  async deleteUser(id: string) {
    return apiClient.delete(`/admin/users/${id}/`);
  }
}

export const adminService = new AdminService();
