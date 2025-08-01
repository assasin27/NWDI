import { supabase } from "../integrations/supabase/supabaseClient";
import { emailService } from "./emailService";

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

export const orderTrackingService = {
  // Get order status history
  async getOrderStatusHistory(orderId: string): Promise<OrderStatus[]> {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('updated_at', { ascending: true });

      if (error) {
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
      // Update order status
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
        console.error('Error updating order status:', orderError);
        return false;
      }

      // Add status history entry
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert([{
          order_id: orderId,
          status,
          status_message: statusMessage,
          tracking_number: trackingNumber,
          estimated_delivery: estimatedDelivery,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy
        }]);

      if (historyError) {
        console.error('Error adding status history:', historyError);
        return false;
      }

      // Send email notification
      await this.sendStatusUpdateEmail(orderId, status, statusMessage, trackingNumber);

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  },

  // Get order by ID
  async getOrder(orderId: string): Promise<any> {
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
  async getCustomerOrders(customerId: string): Promise<any[]> {
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
        console.error('Error fetching customer orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  },

  // Track shipment
  async trackShipment(trackingNumber: string, carrier: string): Promise<TrackingInfo | null> {
    try {
      // This would integrate with shipping carrier APIs
      // For now, we'll simulate tracking info
      const response = await fetch(`/api/shipping/track?tracking=${trackingNumber}&carrier=${carrier}`);
      
      if (!response.ok) {
        throw new Error('Failed to track shipment');
      }

      const trackingInfo = await response.json();
      return trackingInfo;
    } catch (error) {
      console.error('Error tracking shipment:', error);
      return null;
    }
  },

  // Send status update email
  async sendStatusUpdateEmail(
    orderId: string,
    status: string,
    statusMessage: string,
    trackingNumber?: string
  ): Promise<void> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) return;

      await emailService.sendOrderStatusUpdate(
        orderId,
        order.customer_email,
        status,
        trackingNumber
      );
    } catch (error) {
      console.error('Error sending status update email:', error);
    }
  },

  // Get orders by status
  async getOrdersByStatus(status: OrderStatus['status']): Promise<any[]> {
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
      const success = await this.updateOrderStatus(
        orderId,
        'cancelled',
        `Order cancelled: ${reason}`,
        undefined,
        undefined,
        cancelledBy
      );

      if (success) {
        // Process refund if payment was made
        const order = await this.getOrder(orderId);
        if (order && order.payment_status === 'paid') {
          // Trigger refund process
          await this.processRefund(orderId, order.total_amount, reason);
        }
      }

      return success;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return false;
    }
  },

  // Process refund
  async processRefund(orderId: string, amount: number, reason: string): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  },

  // Mark order as delivered
  async markAsDelivered(orderId: string, deliveredBy: string = 'system'): Promise<boolean> {
    try {
      const success = await this.updateOrderStatus(
        orderId,
        'delivered',
        'Order has been delivered successfully',
        undefined,
        undefined,
        deliveredBy
      );

      if (success) {
        // Update actual delivery date
        const { error } = await supabase
          .from('orders')
          .update({
            actual_delivery: new Date().toISOString()
          })
          .eq('id', orderId);

        if (error) {
          console.error('Error updating actual delivery date:', error);
        }
      }

      return success;
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
        .select('status, created_at, actual_delivery')
        .not('status', 'is', null);

      if (error) {
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
  async getRecentOrders(limit: number = 10): Promise<any[]> {
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