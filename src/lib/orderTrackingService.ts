import { supabase } from '../integrations/supabase/supabaseClient';

export interface OrderStatus {
  id: string;
  order_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  status_message: string;
  tracking_number?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  updated_at: string;
  updated_by: string;
}

export interface TrackingInfo {
  order_id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  last_location: string;
  estimated_delivery: string;
  events: Array<{
    timestamp: string;
    location: string;
    status: string;
    description: string;
  }>;
}

interface OrderDetails {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  shipping_address: string;
  tracking_number?: string;
  estimated_delivery?: string;
  items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

// Helper function to check if table exists
const isTableNotFoundError = (error: { code?: string; message?: string }): boolean => {
  return error?.code === '42P01' || 
         error?.message?.includes('does not exist') ||
         error?.message?.includes('relation') ||
         error?.code === 'PGRST200';
};

export const orderTrackingService = {
  // Get order status history
  async getOrderStatusHistory(orderId: string): Promise<OrderStatus[]> {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('updated_at', { ascending: false });

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Order status history table does not exist yet. Returning empty array.');
          return [];
        }
        console.error('Error fetching order status history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching order status history:', error);
      return [];
    }
  },

  // Update order status
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus['status'],
    statusMessage: string,
    trackingNumber?: string,
    estimatedDelivery?: string,
    updatedBy: string = 'system'
  ): Promise<boolean> {
    try {
      // Add to status history
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status,
          status_message: statusMessage,
          tracking_number: trackingNumber,
          estimated_delivery: estimatedDelivery,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy
        });

      if (historyError && !isTableNotFoundError(historyError)) {
        console.error('Error adding to status history:', historyError);
      }

      // Update main order
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status,
          tracking_number: trackingNumber,
          estimated_delivery: estimatedDelivery,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) {
        if (isTableNotFoundError(orderError)) {
          console.log('Orders table does not exist yet. Cannot update order status.');
          return false;
        }
        console.error('Error updating order status:', orderError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  },

  // Get order details
  async getOrder(orderId: string): Promise<OrderDetails | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Orders table does not exist yet. Returning null.');
          return null;
        }
        console.error('Error fetching order:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  // Get customer orders
  async getCustomerOrders(customerId: string): Promise<OrderDetails[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Orders table does not exist yet. Returning empty array.');
          return [];
        }
        console.error('Error fetching customer orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  },

  // Track shipment (mock implementation)
  async trackShipment(trackingNumber: string, carrier: string): Promise<TrackingInfo | null> {
    try {
      // Mock tracking info - in real app, this would call carrier API
      const mockTrackingInfo: TrackingInfo = {
        order_id: 'mock-order-id',
        tracking_number: trackingNumber,
        carrier,
        status: 'in_transit',
        last_location: 'Mumbai, India',
        estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          {
            timestamp: new Date().toISOString(),
            location: 'Mumbai, India',
            status: 'in_transit',
            description: 'Package picked up by courier'
          }
        ]
      };

      return mockTrackingInfo;
    } catch (error) {
      console.error('Error tracking shipment:', error);
      return null;
    }
  },

  // Send status update email (mock implementation)
  async sendStatusUpdateEmail(
    orderId: string,
    status: string,
    statusMessage: string,
    trackingNumber?: string
  ): Promise<void> {
    try {
      // Mock email sending - in real app, this would send actual email
      console.log(`Mock email sent for order ${orderId}: ${status} - ${statusMessage}`);
    } catch (error) {
      console.error('Error sending status update email:', error);
    }
  },

  // Get orders by status
  async getOrdersByStatus(status: OrderStatus['status']): Promise<OrderDetails[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Orders table does not exist yet. Returning empty array.');
          return [];
        }
        console.error('Error fetching orders by status:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      return [];
    }
  },

  // Cancel order
  async cancelOrder(orderId: string, reason: string, cancelledBy: string = 'system'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_by: cancelledBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Orders table does not exist yet. Cannot cancel order.');
          return false;
        }
        console.error('Error cancelling order:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return false;
    }
  },

  // Process refund (mock implementation)
  async processRefund(orderId: string, amount: number, reason: string): Promise<boolean> {
    try {
      // Mock refund processing - in real app, this would process actual refund
      console.log(`Mock refund processed for order ${orderId}: ${amount} - ${reason}`);
      return true;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  },

  // Mark order as delivered
  async markAsDelivered(orderId: string, deliveredBy: string = 'system'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          actual_delivery: new Date().toISOString(),
          delivered_by: deliveredBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Orders table does not exist yet. Cannot mark as delivered.');
          return false;
        }
        console.error('Error marking order as delivered:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      return false;
    }
  },

  // Get delivery statistics
  async getDeliveryStatistics(): Promise<{
    totalOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    averageDeliveryTime: number;
  }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, created_at, actual_delivery');

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Orders table does not exist yet. Returning default statistics.');
          return {
            totalOrders: 0,
            deliveredOrders: 0,
            pendingOrders: 0,
            cancelledOrders: 0,
            averageDeliveryTime: 0
          };
        }
        console.error('Error fetching delivery statistics:', error);
        return {
          totalOrders: 0,
          deliveredOrders: 0,
          pendingOrders: 0,
          cancelledOrders: 0,
          averageDeliveryTime: 0
        };
      }

      const totalOrders = orders.length;
      const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
      const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(o.status)).length;
      const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

      // Calculate average delivery time
      const deliveredWithDates = orders.filter(o => o.status === 'delivered' && o.actual_delivery);
      let averageDeliveryTime = 0;
      
      if (deliveredWithDates.length > 0) {
        const totalTime = deliveredWithDates.reduce((sum, order) => {
          const created = new Date(order.created_at);
          const delivered = new Date(order.actual_delivery);
          return sum + (delivered.getTime() - created.getTime());
        }, 0);
        
        averageDeliveryTime = totalTime / deliveredWithDates.length / (1000 * 60 * 60 * 24); // Convert to days
      }

      return {
        totalOrders,
        deliveredOrders,
        pendingOrders,
        cancelledOrders,
        averageDeliveryTime
      };
    } catch (error) {
      console.error('Error getting delivery statistics:', error);
      return {
        totalOrders: 0,
        deliveredOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        averageDeliveryTime: 0
      };
    }
  },

  // Generate tracking URL
  generateTrackingUrl(trackingNumber: string, carrier: string): string {
    const carrierUrls = {
      'fedex': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'usps': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      'dhl': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
      'bluedart': `https://www.bluedart.com/tracking?trackingNumber=${trackingNumber}`,
      'dtdc': `https://www.dtdc.in/tracking.asp?strCnno=${trackingNumber}`
    };

    return carrierUrls[carrier.toLowerCase()] || `#tracking/${trackingNumber}`;
  },

  // Get recent orders for dashboard
  async getRecentOrders(limit: number = 10): Promise<OrderDetails[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Orders table does not exist yet. Returning empty array.');
          return [];
        }
        console.error('Error fetching recent orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  }
}; 