import { supabase } from '../integrations/supabase/supabaseClient';

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
    try {
      // Start a transaction
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: orderData.customer_id,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          total_amount: orderData.total_amount,
          status: 'processing',
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return null;
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        return null;
      }

      // Return the complete order with items
      return await this.getOrderById(order.id);
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        return null;
      }

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        return null;
      }

      return {
        ...order,
        items: items || [],
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  // Get orders for a customer
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching customer orders:', ordersError);
        return [];
      }

      // Fetch items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return {
            ...order,
            items: items || [],
          };
        })
      );

      return ordersWithItems;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  },

  // Get all orders (for farmer)
  async getAllOrders(): Promise<Order[]> {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching all orders:', ordersError);
        return [];
      }

      // Fetch items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return {
            ...order,
            items: items || [],
          };
        })
      );

      return ordersWithItems;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  },

  // Get order statistics
  async getOrderStats(): Promise<{
    totalOrders: number;
    processingOrders: number;
    outForDelivery: number;
    delivered: number;
  }> {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('status');

      if (!orders) return { totalOrders: 0, processingOrders: 0, outForDelivery: 0, delivered: 0 };

      const stats = {
        totalOrders: orders.length,
        processingOrders: orders.filter(o => o.status === 'processing').length,
        outForDelivery: orders.filter(o => o.status === 'out_for_delivery').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return { totalOrders: 0, processingOrders: 0, outForDelivery: 0, delivered: 0 };
    }
  },

  // Delete order (for cleanup)
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Error deleting order:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  },
}; 