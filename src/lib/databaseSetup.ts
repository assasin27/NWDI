import { supabase } from "../integrations/supabase/supabaseClient";

export const databaseSetup = {
  // Check if tables exist and create them if they don't
  async checkAndCreateTables(): Promise<boolean> {
    try {
      console.log('Checking database tables...');
      
      // Check if cart_items table exists
      const { data: cartData, error: cartError } = await supabase
        .rpc('get_table_info', { table_name: 'cart_items' });
      
      // Check if wishlist table exists
      const { data: wishlistData, error: wishlistError } = await supabase
        .rpc('get_table_info', { table_name: 'wishlist' });

      // Check if orders table exists
      const { data: ordersData, error: ordersError } = await supabase
        .rpc('get_table_info', { table_name: 'orders' });

      // Check if order_items table exists
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .rpc('get_table_info', { table_name: 'order_items' });

      // Check if products table exists
      const { data: productsData, error: productsError } = await supabase
        .rpc('get_table_info', { table_name: 'products' });

      // Check if user_profiles table exists
      const { data: userProfilesData, error: userProfilesError } = await supabase
        .rpc('get_table_info', { table_name: 'user_profiles' });

      let tablesCreated = true;

      // Create cart_items table if it doesn't exist
      if (!cartData || cartData.length === 0 || cartError) {
        console.log('cart_items table does not exist. Creating table...');
        const { error: createCartError } = await supabase
          .rpc('create_cart_items_table');
        
        if (createCartError) {
          console.error('Failed to create cart_items table:', createCartError);
          tablesCreated = false;
        }
      }
      
      // Create wishlist table if it doesn't exist
      if (!wishlistData || wishlistData.length === 0 || wishlistError) {
        console.log('wishlist table does not exist. Creating table...');
        const { error: createWishlistError } = await supabase
          .rpc('create_wishlist_table');
        
        if (createWishlistError) {
          console.error('Failed to create wishlist_items table:', createWishlistError);
          tablesCreated = false;
        }
      }

      // Create orders table if it doesn't exist
      if (!ordersData || ordersData.length === 0 || ordersError) {
        console.log('orders table does not exist. Creating table...');
        const { error: createOrdersError } = await supabase
          .rpc('create_orders_table');
        
        if (createOrdersError) {
          console.error('Failed to create orders table:', createOrdersError);
          tablesCreated = false;
        }
      }

      // Create order_items table if it doesn't exist
      if (!orderItemsData || orderItemsData.length === 0 || orderItemsError) {
        console.log('order_items table does not exist. Creating table...');
        const { error: createOrderItemsError } = await supabase
          .rpc('create_order_items_table');
        
        if (createOrderItemsError) {
          console.error('Failed to create order_items table:', createOrderItemsError);
          tablesCreated = false;
        }
      }

      // Create products table if it doesn't exist
      if (!productsData || productsData.length === 0 || productsError) {
        console.log('products table does not exist. Creating table...');
        const { error: createProductsError } = await supabase
          .rpc('create_products_table');
        
        if (createProductsError) {
          console.error('Failed to create products table:', createProductsError);
          tablesCreated = false;
        }
      }

      // Create user_profiles table if it doesn't exist
      if (!userProfilesData || userProfilesData.length === 0 || userProfilesError) {
        console.log('user_profiles table does not exist. Creating table...');
        const { error: createUserProfilesError } = await supabase
          .rpc('create_user_profiles_table');
        
        if (createUserProfilesError) {
          console.error('Failed to create user_profiles table:', createUserProfilesError);
          tablesCreated = false;
        }
      }

      if (tablesCreated) {
        console.log('Database tables exist and are accessible.');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking database tables:', error);
      return false;
    }
  },

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing database connection...');
      const { data, error } = await supabase
        .from('cart_items')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('Database connection successful.');
      return true;
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  },

  // Get table information
  async getTableInfo(): Promise<void> {
    try {
      console.log('Getting table information...');
      
      // Check cart_items table
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .limit(1);
      
      if (cartError) {
        console.error('Error accessing cart_items table:', cartError);
      } else {
        console.log('cart_items table is accessible');
      }

      // Check wishlist table
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist')
        .select('*')
        .limit(1);
      
      if (wishlistError) {
        console.error('Error accessing wishlist table:', wishlistError);
      } else {
        console.log('wishlist table is accessible');
      }

      // Check orders table
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
      
      if (ordersError) {
        console.error('Error accessing orders table:', ordersError);
      } else {
        console.log('orders table is accessible');
      }

      // Check order_items table
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select('*')
        .limit(1);
      
      if (orderItemsError) {
        console.error('Error accessing order_items table:', orderItemsError);
      } else {
        console.log('order_items table is accessible');
      }

      // Check products table
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (productsError) {
        console.error('Error accessing products table:', productsError);
      } else {
        console.log('products table is accessible');
      }

      // Check user_profiles table
      const { data: userProfilesData, error: userProfilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);
      
      if (userProfilesError) {
        console.error('Error accessing user_profiles table:', userProfilesError);
      } else {
        console.log('user_profiles table is accessible');
      }
    } catch (error) {
      console.error('Error getting table information:', error);
    }
  },

  // Test inserting a sample item
  async testInsert(): Promise<boolean> {
    try {
      console.log('Testing insert functionality...');
      
      const testItem = {
        user_id: 'test-user-id',
        product_id: 'test-product',
        name: 'Test Product',
        price: 100,
        image: 'test-image.jpg',
        category: 'test',
        description: 'Test description',
        quantity: 1,
        is_organic: false,
        in_stock: true
      };

      console.log('Attempting to insert test item:', testItem);

      const { data, error } = await supabase
        .from('cart_items')
        .insert([testItem])
        .select();
      
      if (error) {
        console.error('Insert test failed:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        return false;
      }
      
      console.log('Insert test successful. Data returned:', data);
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('product_id', 'test-product');
      
      if (deleteError) {
        console.error('Cleanup failed:', deleteError);
      } else {
        console.log('Test data cleaned up successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Insert test error:', error);
      return false;
    }
  }
};