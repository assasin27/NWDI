import { ApiClient } from './apiClient';
import { BaseResponse } from '../types/api';
import {
  FarmerDashboardStats,
  FarmerProfile,
  Product,
  ProductFilter,
  Order,
  OrderStatus,
  DateRange
} from '../types/farmer';

export class FarmerService {
  private api: ApiClient;
  private baseUrl = '/api/farmer';

  constructor(api: ApiClient) {
    this.api = api;
  }

  // Dashboard Statistics
  async getDashboardStats(dateRange?: DateRange): Promise<BaseResponse<FarmerDashboardStats>> {
    const params = dateRange ? { params: { from: dateRange.from, to: dateRange.to } } : {};
    return this.api.get(`${this.baseUrl}/stats`, params);
  }

  // Profile Management
  async getFarmerProfile(): Promise<BaseResponse<FarmerProfile>> {
    return this.api.get(`${this.baseUrl}/profile`);
  }

  async updateFarmerProfile(profile: Partial<FarmerProfile>): Promise<BaseResponse<FarmerProfile>> {
    return this.api.put(`${this.baseUrl}/profile`, profile);
  }

  // Product Management
  async getProducts(filter?: ProductFilter): Promise<BaseResponse<Product[]>> {
    return this.api.get(`${this.baseUrl}/products`, filter);
  }

  async getProduct(id: string): Promise<BaseResponse<Product>> {
    return this.api.get(`${this.baseUrl}/products/${id}`);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<BaseResponse<Product>> {
    return this.api.post(`${this.baseUrl}/products`, product);
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<BaseResponse<Product>> {
    return this.api.put(`${this.baseUrl}/products/${id}`, product);
  }

  async deleteProduct(id: string): Promise<BaseResponse<void>> {
    return this.api.delete(`${this.baseUrl}/products/${id}`);
  }

  async updateProductStock(id: string, quantity: number): Promise<BaseResponse<Product>> {
    return this.api.patch(`${this.baseUrl}/products/${id}/stock`, { quantity });
  }

  // Order Management
  async getOrders(status?: OrderStatus): Promise<BaseResponse<Order[]>> {
    const params = status ? { params: { status } } : {};
    return this.api.get(`${this.baseUrl}/orders`, params);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<BaseResponse<Order>> {
    return this.api.patch(`${this.baseUrl}/orders/${orderId}/status`, { status });
  }

  // Analytics
  async getSalesAnalytics(dateRange: DateRange): Promise<BaseResponse<any>> {
    return this.api.get(`${this.baseUrl}/analytics/sales`, dateRange);
  }

  async getInventoryAnalytics(): Promise<BaseResponse<any>> {
    return this.api.get(`${this.baseUrl}/analytics/inventory`);
  }

  async getCustomerAnalytics(dateRange: DateRange): Promise<BaseResponse<any>> {
    return this.api.get(`${this.baseUrl}/analytics/customers`, dateRange);
  }

  // Document Management
  async uploadCertification(file: File): Promise<BaseResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post(`${this.baseUrl}/certifications`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
}
