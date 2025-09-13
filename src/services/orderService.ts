import { ApiClient } from './apiClient';
import { BaseResponse } from '../types/api';
import { Order, OrderFilter, OrderItem, OrderStatus } from '../types/order';

export class OrderService {
  private api: ApiClient;
  private endpoint = '/api/v1/orders';

  constructor(api: ApiClient) {
    this.api = api;
  }

  public async getOrders(filter?: OrderFilter): Promise<BaseResponse<Order[]>> {
    const params = filter ? this.buildFilterParams(filter) : {};
    return this.api.get(this.endpoint, { params });
  }

  public async getOrder(id: string): Promise<BaseResponse<Order>> {
    return this.api.get(`${this.endpoint}/${id}`);
  }

  public async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<BaseResponse<Order>> {
    return this.api.post(this.endpoint, order);
  }

  public async updateOrderStatus(id: string, status: OrderStatus): Promise<BaseResponse<Order>> {
    return this.api.put(`${this.endpoint}/${id}/status`, { status });
  }

  public async cancelOrder(id: string, reason?: string): Promise<BaseResponse<Order>> {
    return this.api.post(`${this.endpoint}/${id}/cancel`, { reason });
  }

  public async getOrderItems(orderId: string): Promise<BaseResponse<OrderItem[]>> {
    return this.api.get(`${this.endpoint}/${orderId}/items`);
  }

  private buildFilterParams(filter: OrderFilter): Record<string, string> {
    const params: Record<string, string> = {};

    if (filter.status) params.status = filter.status;
    if (filter.fromDate) params.fromDate = filter.fromDate;
    if (filter.toDate) params.toDate = filter.toDate;
    if (filter.minAmount) params.minAmount = filter.minAmount.toString();
    if (filter.maxAmount) params.maxAmount = filter.maxAmount.toString();
    if (filter.sortBy) params.sortBy = filter.sortBy;
    if (filter.sortOrder) params.sortOrder = filter.sortOrder;
    if (filter.page) params.page = filter.page.toString();
    if (filter.limit) params.limit = filter.limit.toString();

    return params;
  }

  public async getFarmerOrders(farmerId: string, filter?: OrderFilter): Promise<BaseResponse<Order[]>> {
    const params = filter ? this.buildFilterParams(filter) : {};
    return this.api.get(`${this.endpoint}/farmer/${farmerId}`, { params });
  }

  public async getCustomerOrders(customerId: string, filter?: OrderFilter): Promise<BaseResponse<Order[]>> {
    const params = filter ? this.buildFilterParams(filter) : {};
    return this.api.get(`${this.endpoint}/customer/${customerId}`, { params });
  }
}
