/**
 * Quick test to verify Supabase connection and add sample data
 * Run this to populate the database with test products and orders
 */

import { supabase } from '../integrations/supabase/supabaseClient';

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Error testing connection:', error);
    return false;
  }
};

export const addSampleProducts = async () => {
  console.log('📦 Adding sample products to Supabase...');
  
  const sampleProducts = [
    {
      name: 'Organic Tomatoes',
      description: 'Fresh, pesticide-free tomatoes from Nareshwadi farm',
      price: 45.50,
      quantity: 25,
      image_url: 'https://via.placeholder.com/300x300?text=Tomatoes',
      certification: 'Organic',
      region: 'Nareshwadi',
      category: 'Vegetables',
      in_stock: true,
    },
    {
      name: 'Fresh Spinach',
      description: 'Leafy green spinach, organically grown',
      price: 30.00,
      quantity: 15,
      image_url: 'https://via.placeholder.com/300x300?text=Spinach',
      certification: 'Organic',
      region: 'Nareshwadi',
      category: 'Leafy Greens',
      in_stock: true,
    },
    {
      name: 'Sweet Carrots',
      description: 'Sweet orange carrots, fresh from farm',
      price: 35.00,
      quantity: 30,
      image_url: 'https://via.placeholder.com/300x300?text=Carrots',
      certification: 'Organic',
      region: 'Nareshwadi',
      category: 'Vegetables',
      in_stock: true,
    },
    {
      name: 'Bell Peppers (Red)',
      description: 'Fresh red bell peppers',
      price: 50.00,
      quantity: 12,
      image_url: 'https://via.placeholder.com/300x300?text=RedPeppers',
      certification: 'Organic',
      region: 'Nareshwadi',
      category: 'Vegetables',
      in_stock: true,
    },
    {
      name: 'Cucumber',
      description: 'Fresh crisp cucumber',
      price: 25.00,
      quantity: 20,
      image_url: 'https://via.placeholder.com/300x300?text=Cucumber',
      certification: 'Organic',
      region: 'Nareshwadi',
      category: 'Vegetables',
      in_stock: true,
    },
  ];

  try {
    const { data, error } = await supabase.from('products').insert(sampleProducts);
    
    if (error) {
      console.error('❌ Error adding products:', error);
      return false;
    }
    
    console.log('✅ Sample products added successfully!', data);
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
};

export const addSampleOrders = async () => {
  console.log('📋 Adding sample orders to Supabase...');
  
  try {
    // First, get some products
    const { data: products } = await supabase.from('products').select('id, name, price').limit(3);
    
    if (!products || products.length === 0) {
      console.log('⚠️  No products found. Add products first.');
      return false;
    }

    const sampleOrders = [
      {
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'processing',
        shipping_address: JSON.stringify({
          name: 'Raj Kumar',
          email: 'raj@example.com',
          address: '123 Main St, Nareshwadi, India',
        }),
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        status: 'shipped',
        shipping_address: JSON.stringify({
          name: 'Priya Singh',
          email: 'priya@example.com',
          address: '456 Oak Ave, Nareshwadi, India',
        }),
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        status: 'delivered',
        shipping_address: JSON.stringify({
          name: 'Amit Patel',
          email: 'amit@example.com',
          address: '789 Pine Rd, Nareshwadi, India',
        }),
      },
    ];

    const { data, error } = await supabase.from('orders').insert(sampleOrders);
    
    if (error) {
      console.error('❌ Error adding orders:', error);
      return false;
    }
    
    console.log('✅ Sample orders added successfully!', data);
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
};

export const checkDatabaseStatus = async () => {
  console.log('\n📊 Database Status Report:');
  
  try {
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    
    console.log(`✅ Products in database: ${productCount}`);
    console.log(`✅ Orders in database: ${orderCount}`);
    
    return { productCount, orderCount };
  } catch (error) {
    console.error('❌ Error checking database status:', error);
    return null;
  }
};
