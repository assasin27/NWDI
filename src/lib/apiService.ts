// API Service for Supabase
import { supabase } from '@/lib/supabase';

// For production monitoring
let performanceMetrics: {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  totalResponseTime: number;
} = {
  requestCount: 0,
  errorCount: 0,
  averageResponseTime: 0,
  totalResponseTime: 0
};

export interface ApiResponse<T> {
  data?: T;
  error?: string | any;
  message?: string;
  status?: number;
  success?: boolean;
  isUpdate?: boolean;
}

export interface ValidationRule {
  field: string;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface PaginationParams {
  limit?: number;
  page?: number;
  id?: string;
}

export interface OrderData {
  user_id: string;
  total_amount: number;
  status?: string;
  shipping_address?: string;
  payment_method?: string;
  [key: string]: any;
}

// Logger for production environment
const logger: { error: (message: string, error?: any) => void; info: (message: string, data?: any) => void; warn: (message: string, data?: any) => void } = {
  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error);
    performanceMetrics.errorCount++;
  },
  info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data || '');
  },
  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '');
  }
};

export class ApiService {
  // Cache implementation for improved performance
  private cache: Map<string, {data: any, expiry: number}> = new Map();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  // Rate limiting
  private rateLimits: Map<string, {count: number, resetTime: number}> = new Map();
  private readonly RATE_LIMIT = 100;
  private readonly RATE_WINDOW = 60 * 1000; // 1 minute

  // Performance monitoring methods
  getPerformanceMetrics() {
    return {
      ...performanceMetrics,
      timestamp: new Date().toISOString()
    };
  }
  
  resetPerformanceMetrics() {
    performanceMetrics = {
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      totalResponseTime: 0
    };
    return { success: true, message: 'Performance metrics reset successfully' };
  }

  // Method to get data from cache or fetch it
  private async getFromCacheOrFetch<T>(
    cacheKey: string, 
    fetchFn: () => Promise<{data: T, error: any}>,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): Promise<{data: T, error: any}> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return { data: cached.data, error: null };
    }
    
    // If not in cache or expired, fetch fresh data
    try {
      const startTime = Date.now();
      const result = await fetchFn();
      const endTime = Date.now();
      
      // Update performance metrics
      const duration = endTime - startTime;
      performanceMetrics.requestCount++;
      performanceMetrics.totalResponseTime += duration;
      performanceMetrics.averageResponseTime = 
        performanceMetrics.totalResponseTime / performanceMetrics.requestCount;
      
      // Cache the result if successful
      if (result && !result.error) {
        this.cache.set(cacheKey, {
          data: result.data,
          expiry: Date.now() + ttl
        });
      }
      
      return result;
    } catch (error) {
      logger.error('Error in getFromCacheOrFetch:', error);
      return { data: null as any, error };
    }
  }

  // Method to invalidate cache entries
  invalidateCache(keyPattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Check if a request should be rate limited
  private checkRateLimit(clientId: string = 'default'): boolean {
    const now = Date.now();
    const clientLimit = this.rateLimits.get(clientId) || { count: 0, resetTime: now + this.RATE_WINDOW };
    
    // Reset the counter if the window has passed
    if (now > clientLimit.resetTime) {
      clientLimit.count = 0;
      clientLimit.resetTime = now + this.RATE_WINDOW;
    }
    
    // Increment the counter
    clientLimit.count++;
    this.rateLimits.set(clientId, clientLimit);
    
    // Check if rate limit exceeded
    return clientLimit.count > this.RATE_LIMIT;
  }

  // Check database connection status
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.rpc('health_check');
      return this.handleResponse({ data, error });
    } catch (error) {
      return this.handleResponse({ error });
    }
  }

  // Helper to handle Supabase responses with improved error handling
  private handleResponse<T>(response: { data?: any, error?: any }): ApiResponse<T> {
    if (response.error) {
      logger.error('API Error:', response.error);
      return {
        error: response.error.message || 'An unknown error occurred',
        status: response.error.status || 500,
        success: false
      };
    }
    
    return {
      data: response.data,
      status: 200,
      success: true
    };
  }

  // Get current user role
  async getCurrentUserRole(): Promise<ApiResponse<string>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw authError || new Error('No user found');
      }

      // Try farmer_profiles first
      const { data: farmerProfile, error: farmerError } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (farmerProfile) {
        return this.handleResponse({ data: 'farmer' });
      }

      // If not a farmer, check regular profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      return this.handleResponse({ data: profile?.role || 'guest' });
    } catch (error) {
      return this.handleResponse({ error });
    }
  }

  // Get order IDs for a specific seller
  private async getSellerOrderIds(sellerId: string): Promise<string[]> {
    try {
      // First, get all products for this seller
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', sellerId);
        
      if (productsError || !products) {
        logger.error('Error fetching seller products:', productsError);
        return [];
      }
      
      const productIds = products.map(p => p.id);
      if (productIds.length === 0) return [];
      
      // Then get all order items for these products
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('order_id')
        .in('product_id', productIds);
        
      if (itemsError || !orderItems) {
        logger.error('Error fetching order items:', itemsError);
        return [];
      }
      
      // Return unique order IDs
      return [...new Set(orderItems.map(oi => oi.order_id))];
    } catch (error) {
      logger.error('Error in getSellerOrderIds:', error);
      return [];
    }
  }

  // Dashboard Statistics with role-based filtering
  async getDashboardStats(): Promise<ApiResponse<{
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
    revenueChange: number;
    ordersChange: number;
    averageOrderValue: number;
    conversionRate: number;
  }>> {
    // Default response
    const defaultResponse = {
      data: {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        totalProducts: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        revenueChange: 0,
        ordersChange: 0,
        averageOrderValue: 0,
        conversionRate: 0
      },
      status: 200,
      success: true
    };

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) return { ...defaultResponse, error: 'Authentication required' };
      
      // Get seller profile if exists
      const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      const sellerId = sellerProfile?.id;

      // Execute queries in parallel
      const [
        { count: totalOrders = 0 },
        { count: pendingOrders = 0 },
        { count: deliveredOrders = 0 },
        { data: orderItems = [] },
        { count: totalProducts = 0 },
        { count: lowStockItems = 0 },
        { count: outOfStockItems = 0 }
      ] = await Promise.all([
        // Total orders count
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq(sellerId ? 'seller_id' : 'user_id', sellerId || user.id),
        
        // Pending orders count
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
          .eq(sellerId ? 'seller_id' : 'user_id', sellerId || user.id),
        
        // Delivered orders count
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'delivered')
          .eq(sellerId ? 'seller_id' : 'user_id', sellerId || user.id),
        
        // Order items for revenue calculation
        supabase
          .from('order_items')
          .select('price, quantity')
          .eq(sellerId ? 'seller_id' : 'user_id', sellerId || user.id),
        
        // Total products count (only for sellers)
        sellerId 
          ? supabase
              .from('products')
              .select('id', { count: 'exact', head: true })
              .eq('seller_id', sellerId)
          : { count: 0 },
        
        // Low stock items count (only for sellers)
        sellerId
          ? supabase
              .from('products')
              .select('id', { count: 'exact', head: true })
              .eq('seller_id', sellerId)
              .lte('stock_quantity', 10)
              .gt('stock_quantity', 0)
          : { count: 0 },
        
        // Out of stock items count (only for sellers)
        sellerId
          ? supabase
              .from('products')
              .select('id', { count: 'exact', head: true })
              .eq('seller_id', sellerId)
              .eq('stock_quantity', 0)
          : { count: 0 }
      ]);

      // Calculate total revenue from order items
      const totalRevenue = orderItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * (item.quantity || 1));
      }, 0);
      
      // Calculate metrics with safe defaults
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // For now, set these to 0 - can be implemented with actual data later
      const revenueChange = 0;
      const ordersChange = 0;
      const conversionRate = 0;

      return {
        data: {
          totalRevenue,
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalProducts,
          lowStockItems,
          outOfStockItems,
          revenueChange,
          ordersChange,
          averageOrderValue,
          conversionRate
        },
        status: 200,
        success: true
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return {
        ...defaultResponse,
        error: 'Failed to load dashboard statistics',
        status: 500,
        success: false
      };
    }
  }

  // Update product
  async updateProduct(id: string, productData: any): Promise<{ data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      logger.error('Error updating product:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to update product' 
      };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        logger.error('Password reset error:', error);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      logger.error('Unexpected error in resetPassword:', error);
      return { error: 'Failed to send password reset email' };
    }
  }
  
  // Get previous period stats for comparison
  private async getPreviousPeriodStats() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount,created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      return { data: data || [], error: null };
    } catch (error) {
      logger.error('Error getting previous period stats:', error);
      return { data: [], error };
    }
  }

  // Wishlist methods - using 'wishlist' table
  async testWishlistConnection(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      return {};
    } catch (error) {
      logger.error('Error testing wishlist connection:', error);
      return { error: 'Failed to connect to wishlist' };
    }
  }

  async getWishlistItems(userId: string): Promise<{ data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return { data };
    } catch (error) {
      logger.error('Error fetching wishlist items:', error);
      return { error: 'Failed to fetch wishlist items' };
    }
  }

  async addToWishlist(userId: string, item: any): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .insert([{ ...item, user_id: userId }]);
      
      if (error) throw error;
      return {};
    } catch (error) {
      logger.error('Error adding to wishlist:', error);
      return { error: 'Failed to add item to wishlist' };
    }
  }

  async removeFromWishlist(userId: string, itemId: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);
      
      if (error) throw error;
      return {};
    } catch (error) {
      logger.error('Error removing from wishlist:', error);
      return { error: 'Failed to remove item from wishlist' };
    }
  }

  async clearWishlist(userId: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      return {};
    } catch (error) {
      logger.error('Error clearing wishlist:', error);
      return { error: 'Failed to clear wishlist' };
    }
  }

  // Track login attempts by email
  private loginAttempts: Map<string, { count: number, lastAttempt: number }> = new Map();
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOGIN_ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

  // Authentication methods
  async logout(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return {};
    } catch (error) {
      logger.error('Logout error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to log out' };
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<any>> {
    const attemptKey = `login_${email.toLowerCase().trim()}`;
    const now = Date.now();
    
    // Check for existing session first
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        logger.info('User already has an active session');
        return {
          data: { user: session.user },
          status: 200,
          success: true
        };
      }
    } catch (sessionError) {
      logger.error('Error checking session:', sessionError);
    }

    // Rate limiting check
    const attempt = this.loginAttempts.get(attemptKey) || { count: 0, lastAttempt: 0 };
    
    // Reset counter if last attempt was outside the time window
    if (now - attempt.lastAttempt > this.LOGIN_ATTEMPT_WINDOW) {
      this.loginAttempts.set(attemptKey, { count: 1, lastAttempt: now });
    } else {
      // Check if max attempts reached
      if (attempt.count >= this.MAX_LOGIN_ATTEMPTS) {
        logger.warn(`Too many login attempts for ${email}`);
        return {
          error: 'Too many login attempts. Please try again later.',
          status: 429,
          success: false
        };
      }
      // Increment attempt count
      this.loginAttempts.set(attemptKey, { 
        count: attempt.count + 1, 
        lastAttempt: now 
      });
    }

    try {
      // Sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      
      if (error) {
        logger.error(`Login failed for ${email}:`, error.message);
        return {
          error: error.message || 'Invalid email or password',
          status: 401,
          success: false
        };
      }

      // Reset login attempts on successful login
      this.loginAttempts.delete(attemptKey);
      logger.info(`User ${email} logged in successfully`);

      // Check if a farmer profile exists with timeout
      const profileResult = await Promise.race([
        this.getOrCreateFarmerProfile(data.user.id, data.user.email, data.user.user_metadata?.full_name),
        new Promise<ApiResponse<any>>((_, reject) => 
          setTimeout(() => reject(new Error('Profile check timed out')), 10000)
        )
      ]);

      if (!profileResult.success) {
        logger.error('Profile check failed:', profileResult.error);
        // Don't log out the user, just return the profile error
        return profileResult;
      }

      return {
        data: {
          user: data.user,
          profile: profileResult.data
        },
        status: 200,
        success: true
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      logger.error('Login error:', errorMessage);
      return {
        error: errorMessage,
        status: 500,
        success: false
      };
    }
  }

  // Helper method to get or create farmer profile with error handling
private async getOrCreateFarmerProfile(
  userId: string, 
  email: string, 
  fullName?: string
): Promise<ApiResponse<any>> {
  try {
    // First try to get existing profile
    const { data: farmerProfile, error: fetchError } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If profile exists, return it
    if (farmerProfile && !fetchError) {
      return { data: farmerProfile, success: true };
    }

    // If we get here, profile doesn't exist, so create one
    const { data: newProfile, error: createError } = await supabase
      .from('farmer_profiles')
      .insert([
        {
          user_id: userId,
          email: email,
          name: fullName || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select('*')
      .single();

    if (createError) {
      throw new Error(`Failed to create profile: ${createError.message}`);
    }

    return { data: newProfile, success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process profile';
    logger.error('Profile error:', errorMessage);
    return {
      error: errorMessage,
      status: 500,
      success: false
    };
  }
}

  async updateUserMetadata(metadata: Record<string, any>): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });

      if (error) {
        return {
          error: error.message,
          status: 400,
          success: false
        };
      }

      return {
        data: data.user,
        status: 200,
        success: true
      };
    } catch (error) {
      logger.error('Update user metadata error:', error);
      return {
        error: 'Failed to update user metadata',
        status: 500,
        success: false
      };
    }
  }
  
  async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return {
          error: error.message,
          status: 401,
          success: false
        };
      }
      
      if (!session) {
        return {
          data: null,
          status: 401,
          success: false
        };
      }
      
      return {
        data: session.user,
        status: 200,
        success: true
      };
    } catch (error) {
      logger.error('Get current user error:', error);
      return {
        error: 'Failed to get current user',
        status: 500,
        success: false
      };
    }
  }

  // Cart methods
  async testCartConnection(): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      return { data: true, success: true };
    } catch (error) {
      logger.error('Error testing cart connection:', error);
      return { error, success: false };
    }
  }

  async getCartItems(userId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:product_id (*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      logger.error('Error getting cart items:', error);
      return { error, success: false };
    }
  }

  async addToCart(product: any): Promise<ApiResponse<any>> {
    try {
      // Check if item already exists in cart
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('product_id', product.product_id)
        .eq('user_id', product.user_id);
      if (fetchError) throw fetchError;
      if (existingItems && existingItems.length > 0) {
        // Update quantity if item exists
        const { data, error } = await supabase
          .from('cart_items')
          .update({ 
            quantity: (existingItems[0].quantity || 1) + (product.quantity || 1),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItems[0].id)
          .select();
        if (error) throw error;
        return { data: data?.[0], success: true, isUpdate: true };
      } else {
        // Add new item to cart with all required fields
        const { data, error } = await supabase
          .from('cart_items')
          .insert([product])
          .select();
        if (error) throw error;
        return { data: data?.[0], success: true, isUpdate: false };
      }
    } catch (error) {
      logger.error('Error adding to cart:', error);
      return { error, success: false };
    }
  }

  async removeFromCart(userId: string, productId: string, variant?: any): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', userId);
      
      if (error) throw error;
      return { data: true, success: true };
    } catch (error) {
      logger.error('Error removing from cart:', error);
      return { error, success: false };
    }
  }

  async updateQuantity(userId: string, productId: string, quantity: number, variant?: any): Promise<ApiResponse<any>> {
    try {
      if (quantity <= 0) {
        // If quantity is 0 or less, remove the item from cart
        return this.removeFromCart(userId, productId, variant);
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', productId)
        .eq('user_id', userId)
        .select();
      
      if (error) throw error;
      return { data: data?.[0], success: true };
    } catch (error) {
      logger.error('Error updating cart quantity:', error);
      return { error, success: false };
    }
  }

  async clearCart(userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      return { data: true, success: true };
    } catch (error) {
      logger.error('Error clearing cart:', error);
      return { error, success: false };
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();
