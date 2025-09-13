import { supabase } from '@/lib/supabase';
import { handleApiError, ApiError } from './apiError';
import { UserRole } from '@/types/auth';

// Base types
type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

type ApiResponse<T> = {
  data: T;
  count?: number;
  error?: never;
} | {
  data?: never;
  error: ApiError;
};

// Product types
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  unit: string;
  category_id: string;
  category?: ProductCategory;
  seller_id: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Order types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// User types
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private async handleResponse<T>(
    query: any // This will be a Supabase query builder or a promise
  ): Promise<ApiResponse<T>> {
    try {
      // Execute the query if it's a query builder
      const { data, error } = 'then' in query 
        ? await query 
        : await query.single ? await query.single() : await query;
      
      if (error) {
        throw new ApiError({
          message: error.message || 'An error occurred',
          code: error.code || 'UNKNOWN_ERROR',
          details: error.details || error.message || 'No error details available',
          hint: error.hint,
        });
      }
      
      if (!data) {
        throw new ApiError({
          message: 'No data returned from the server',
          code: 'NO_DATA',
          details: 'The query executed successfully but returned no data',
        });
      }
      
      return { data };
    } catch (error) {
      if (error instanceof ApiError) {
        return { error };
      }
      
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        error: new ApiError({
          message: errorMessage,
          code: 'UNKNOWN_ERROR',
          details: errorMessage,
        }),
      };
    }
  }

  // Auth methods
  async signIn(email: string, password: string) {
    return this.handleResponse(
      supabase.auth.signInWithPassword({ email, password })
    );
  }

  async signUp(email: string, password: string, userData: Partial<UserProfile>) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name || '',
        },
      },
    });

    if (authError) {
      return { error: new ApiError(authError) };
    }

    if (!authData.user) {
      return { error: new ApiError('Failed to create user') };
    }

    // Create user profile
    const profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = {
      user_id: authData.user.id,
      email,
      full_name: userData.full_name || '',
      phone: userData.phone || '',
      address: userData.address || '',
      role: 'farmer', // Default role
    };

    return this.handleResponse(
      supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single()
    );
  }

  // Product methods
  async getProducts(params: PaginationParams = {}) {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    return this.handleResponse(
      supabase
        .from('products')
        .select('*, category:categories(*)', { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to)
    );
  }

  async getProductById(id: string) {
    return this.handleResponse(
      supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single()
    );
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    return this.handleResponse(
      supabase
        .from('products')
        .insert([product])
        .select()
        .single()
    );
  }

  async updateProduct(id: string, updates: Partial<Product>) {
    return this.handleResponse(
      supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async deleteProduct(id: string) {
    return this.handleResponse(
      supabase
        .from('products')
        .delete()
        .eq('id', id)
    );
  }

  // Order methods
  async getOrders(params: PaginationParams & { status?: OrderStatus } = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'created_at', 
      sortOrder = 'desc',
      status
    } = params;
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('orders')
      .select('*, order_items(*, product:products(*))', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (status) {
      query = query.eq('status', status);
    }

    return this.handleResponse(query.range(from, to));
  }

  async getOrderById(id: string) {
    return this.handleResponse(
      supabase
        .from('orders')
        .select('*, order_items(*, product:products(*))')
        .eq('id', id)
        .single()
    );
  }

  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_items'>) {
    return this.handleResponse(
      supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()
    );
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    return this.handleResponse(
      supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
    );
  }

  // User profile methods
  async getUserProfile(userId: string) {
    return this.handleResponse(
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
    );
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    return this.handleResponse(
      supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()
    );
  }
}

export const apiClient = new ApiClient();
export default apiClient;
