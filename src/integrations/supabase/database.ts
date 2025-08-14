import { supabase } from './supabaseClient';

// Note: Generated Supabase types currently do not include the 'products' table.
// Avoid referencing it at the type level to prevent TS errors.

// Products
export const getProducts = async (categoryId?: string) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      seller:farmers (
        id,
        farm_name,
        region,
        certification
      )
    `);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:farmers (
        id,
        farm_name,
        region,
        certification,
        description
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

// Orders
export const createOrder = async (order: {
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
  }>;
  shippingAddress: string;
}) => {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: order.userId,
      shipping_address: order.shippingAddress,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(
      order.items.map((item) => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.productName,
        product_price: item.productPrice,
        quantity: item.quantity,
      }))
    );

  if (itemsError) throw itemsError;

  return orderData;
};

// Reviews
export const getProductReviews = async (productId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
      *,
      user:users (
        id,
        first_name,
        last_name
      )
    `
    )
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const addReview = async (review: {
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
}) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: review.productId,
      user_id: review.userId,
      rating: review.rating,
      comment: review.comment || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// User Profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select(
      `
      *,
      seller_profile:seller_profiles (
        id,
        farm_name,
        description,
        region,
        certification
      )
    `
    )
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Real-time Subscriptions
export const subscribeToOrderUpdates = (orderId: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('order_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
