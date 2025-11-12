import { supabase } from '../integrations/supabase/supabaseClient';

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'returned';
  shipping_address: string | Record<string, any>;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

type RawOrderRecord = {
  id: string;
  user_id: string;
  status: string;
  shipping_address?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: Array<{
    id: string;
    order_id: string;
    product_id: string | null;
    product_name: string;
    product_price?: number | null;
    price?: number | null;
    quantity?: number | null;
    created_at: string;
  }>;
  user?: {
    id: string;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
};

const ORDER_SELECT = `
  *,
  user:users!orders_user_id_fkey (
    id,
    email,
    first_name,
    last_name
  ),
  order_items (*)
`;

const mapOrderRecord = (record: RawOrderRecord): Order => {
  const { user, order_items: rawItems = [] } = record;

  const items: OrderItem[] = rawItems.map((item) => ({
    id: item.id,
    order_id: item.order_id,
    product_id: item.product_id ?? null,
    product_name: item.product_name,
    quantity: item.quantity ?? 0,
    price:
      item.product_price ??
      item.price ??
      0,
    created_at: item.created_at,
  }));

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
    0
  );

  const shippingAddressRaw = record.shipping_address ?? '';
  let shippingAddress: string | Record<string, any> = shippingAddressRaw || 'Not Provided';

  if (typeof shippingAddressRaw === 'string') {
    try {
      const parsed = JSON.parse(shippingAddressRaw);
      shippingAddress = parsed;
    } catch {
      shippingAddress = shippingAddressRaw || 'Not Provided';
    }
  }

  let addressDerivedName = '';
  let addressDerivedEmail = '';
  if (shippingAddress && typeof shippingAddress === 'object' && !Array.isArray(shippingAddress)) {
    const addrObj = shippingAddress as Record<string, any>;
    addressDerivedName =
      addrObj.name ||
      addrObj.fullName ||
      addrObj.contact_name ||
      addrObj.recipient ||
      [addrObj.houseBuilding, addrObj.street, addrObj.city].filter(Boolean).join(', ');
    addressDerivedEmail = addrObj.email || addrObj.contact_email || '';
  }

  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  const userEmail = user?.email || '';

  const customerName = userName || userEmail || addressDerivedName || 'Customer';

  return {
    id: record.id,
    customer_id: record.user_id,
    customer_name: customerName,
    customer_email: userEmail || addressDerivedEmail || '',
    total_amount: totalAmount,
    status: (record.status as Order['status']) || 'pending',
    shipping_address: shippingAddress,
    created_at: record.created_at,
    updated_at: record.updated_at,
    items,
  };
};

export const orderService = {
  // Create a new order
  async createOrder(orderData: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    shipping_address?: string | Record<string, any>;
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      price: number;
    }>;
  }): Promise<Order | null> {
    try {
      // Convert shipping address to string if it's an object
      const shippingAddressStr = typeof orderData.shipping_address === 'object' 
        ? JSON.stringify(orderData.shipping_address)
        : (orderData.shipping_address || '');

      // Ensure we always provide a non-empty shipping address string
      const shippingValue =
        typeof shippingAddressStr === 'string' && shippingAddressStr.trim().length > 0
          ? shippingAddressStr
          : 'Not Provided';

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: orderData.customer_id,
          status: 'pending',
          shipping_address: shippingValue,
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
        product_price: item.price,
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
        .select(ORDER_SELECT)
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        return null;
      }

      return mapOrderRecord(order as RawOrderRecord);
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
        .select(ORDER_SELECT)
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching customer orders:', ordersError);
        return [];
      }

      return (orders as RawOrderRecord[]).map(mapOrderRecord);
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
        .select(ORDER_SELECT)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching all orders:', ordersError);
        return [];
      }

      return (orders as RawOrderRecord[]).map(mapOrderRecord);
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