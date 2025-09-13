import { apiService } from '@/lib/apiService';

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'processing' | 'out_for_delivery' | 'delivered';
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export const orderService = {
  // Create a new order
  async createOrder(orderData: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      price: number;
    }>;
  }): Promise<Order | null> {
    return await apiService.createOrder(orderData);
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    const response = await apiService.getOrderById(orderId);
    if (response.error) {
      return null;
    }
    return response.data;
  },

  // Get orders for a customer
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const response = await apiService.getCustomerOrders(customerId);
    if (response.error) {
      return [];
    }
    return response.data;
  },

  // Get all orders (for farmer)
  async getAllOrders(): Promise<Order[]> {
    const response = await apiService.getAllOrders();
    if (response.error) {
      return [];
    }
    return response.data;
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    const response = await apiService.updateOrderStatus(orderId, status);
    if (response.error) {
      return null;
    }
    return response.data;
  },

  // Get order statistics
  async getOrderStats(): Promise<{
    totalOrders: number;
    processingOrders: number;
    outForDelivery: number;
    delivered: number;
  }> {
    const response = await apiService.getOrderStats();
    if (response.error) {
      return { 
        totalOrders: 0, 
        processingOrders: 0, 
        outForDelivery: 0, 
        delivered: 0 
      };
    }
    return response.data;
  },

  // Delete order (for cleanup)
  async deleteOrder(orderId: string): Promise<boolean> {
    const response = await apiService.deleteOrder(orderId);
    if (response.error) {
      return false;
    }
    return true;
  },
};