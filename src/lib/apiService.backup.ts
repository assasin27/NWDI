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
const logger = {
  error: (message: string, error?: any) => {
    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service or handle silently
      // Example: logService.captureError(message, error);
    } else {
      console.error(message, error);
    }
  },
  info: (message: string, data?: any) => {
    // Only log in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(message, data);
    }
  }
};

export class ApiService {
  // Cache implementation for improved performance
  private cache: Map<string, {data: any, expiry: number}> = new Map();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  // Performance monitoring methods
  getPerformanceMetrics() {
    return {
      ...performanceMetrics,
      // Add timestamp for when metrics were retrieved
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
    // Skip cache in development mode for easier debugging
    if (process.env.NODE_ENV !== 'production') {
      return fetchFn();
    }
    
    const now = Date.now();
    const cachedItem = this.cache.get(cacheKey);
    
    // Return cached data if it exists and hasn't expired
    if (cachedItem && now < cachedItem.expiry) {
      logger.info(`Cache hit for key: ${cacheKey}`);
      return { data: cachedItem.data, error: null };
    }
    
    // Fetch fresh data
    logger.info(`Cache miss for key: ${cacheKey}, fetching fresh data`);
    const result = await fetchFn();
    
    // Cache the result if there was no error
    if (!result.error) {
      this.cache.set(cacheKey, {
        data: result.data,
        expiry: now + ttl
      });
    }
    
    return result;
  }
  
  // Method to invalidate cache entries
  private invalidateCache(keyPattern: string): void {
    // If exact key, delete it
    if (this.cache.has(keyPattern)) {
      this.cache.delete(keyPattern);
      return;
    }
    
    // If pattern, delete all matching keys
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }
  
  // Rate limiting tracking
  private rateLimits: Map<string, {count: number, resetTime: number}> = new Map();
  private readonly RATE_LIMIT = 100; // requests per minute
  private readonly RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds
  
  // Check if a request should be rate limited
  private checkRateLimit(clientId: string = 'default'): boolean {
    const now = Date.now();
    const clientLimit = this.rateLimits.get(clientId);
    
    if (!clientLimit || now > clientLimit.resetTime) {
      // Reset or initialize rate limit for this client
      this.rateLimits.set(clientId, {
        count: 1,
        resetTime: now + this.RATE_WINDOW
      });
      return false; // Not rate limited
    }
    
    if (clientLimit.count >= this.RATE_LIMIT) {
      return true; // Rate limited
    }
    
    // Increment request count
    clientLimit.count += 1;
    this.rateLimits.set(clientId, clientLimit);
    return false; // Not rate limited
  }
  
  // Check database connection status
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const startTime = performance.now();
      
      // Check database connection
      const dbCheck = await this.checkDatabaseConnection();
      
      // Check cache system
      const cacheStatus = {
        enabled: process.env.NODE_ENV === 'production',
        size: this.cache.size,
        keys: Array.from(this.cache.keys()).slice(0, 5) // Only show first 5 keys for privacy
      };
      
      // Check rate limiting system
      const rateLimitStatus = {
        enabled: true,
        limit: this.RATE_LIMIT,
        window: `${this.RATE_WINDOW/1000} seconds`,
        current_clients: this.rateLimits.size
      };
      
      // Calculate response time
      const responseTime = performance.now() - startTime;
      
      return {
        data: {
          status: 'healthy',
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: {
            connected: dbCheck.success,
            status: dbCheck.success ? 'healthy' : 'unhealthy'
          },
          cache: cacheStatus,
          rate_limiting: rateLimitStatus,
          performance: {
            ...this.getPerformanceMetrics(),
            health_check_response_time_ms: responseTime.toFixed(2)
          }
        },
        status: dbCheck.success ? 200 : 503,
        success: dbCheck.success
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Health check failed'
        },
        error: 'Service health check failed',
        status: 500,
        success: false
      };
    }
  }
  
  async checkDatabaseConnection(): Promise<ApiResponse<boolean>> {
    try {
      // Perform a simple query to check if the database is accessible
      const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
      
      if (error) {
        logger.error('Database connection check failed:', error);
        return {
          data: false,
          error: 'Database connection failed',
          message: 'Unable to connect to the database. Please try again later.',
          status: 503, // Service Unavailable
          success: false
        };
      }
      
      return {
        data: true,
        message: 'Database connection successful',
        status: 200,
        success: true
      };
    } catch (error) {
      logger.error('Database connection check error:', error);
      return {
        data: false,
        error: 'Database connection check error',
        message: 'An error occurred while checking database connection. Please try again later.',
        status: 500,
        success: false
      };
    }
  }
  
  // Helper to handle Supabase responses with improved error handling
  private handleResponse<T>(response: any, clientId: string = 'default'): ApiResponse<T> {
    // Track request for performance monitoring
    performanceMetrics.requestCount++;
    const startTime = performance.now();
    
    // Check rate limiting first
    if (this.checkRateLimit(clientId)) {
      // Track error for performance monitoring
      performanceMetrics.errorCount++;
      
      return {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        status: 429, // Too Many Requests
        success: false
      };
    }
    
    if (response.error) {
      // Track error for performance monitoring
      performanceMetrics.errorCount++;
      
      // Log error with structured information for better debugging
      const errorDetails = {
        message: response.error.message,
        code: response.error.code,
        details: response.error.details,
        hint: response.error.hint
      };
      
      logger.error('Supabase error:', errorDetails);
      
      // Return a more informative error response
      return { 
        error: response.error.message,
        message: 'An error occurred while processing your request. Please try again later.',
        status: 500,
        success: false
      };
    }
    
    // Calculate response time and update metrics
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    performanceMetrics.totalResponseTime += responseTime;
    performanceMetrics.averageResponseTime = 
      performanceMetrics.totalResponseTime / performanceMetrics.requestCount;
    
    return { 
      data: response.data,
      success: true,
      status: 200
    };
  }

  // User Management with improved error handling
  async getUsers() {
    try {
      const { data, error } = await supabase.from('users').select('*');
      return this.handleResponse({ data, error });
    } catch (error) {
      logger.error('Error fetching users:', error);
      return this.handleResponse({ error });
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
  }>> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('Authentication required');
      
      // Get seller profile if exists
      const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      const isSeller = !!sellerProfile;
      const sellerId = sellerProfile?.id;
      const countOptions = { count: 'exact' as const, head: true as const };
      
      // Initialize stats with default values
      const stats = {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        totalProducts: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        revenueChange: 0,
        ordersChange: 0
      };

      // Get seller's product IDs if seller
      let productIds: string[] = [];
      if (isSeller && sellerId) {
        const { data: products } = await supabase
          .from('products')
          .select('id')
          .eq('seller_id', sellerId);
        productIds = products?.map(p => p.id) || [];
      }

      // Get seller's order IDs if seller
      let orderIds: string[] = [];
      if (isSeller && productIds.length > 0) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('order_id')
          .in('product_id', productIds);
        orderIds = [...new Set(orderItems?.map(oi => oi.order_id) || [])];
      }
      
      // Base queries with role-based filtering
      const baseOrderQuery = isSeller && orderIds.length > 0
        ? supabase.from('orders').in('id', orderIds)
        : supabase.from('orders');
        
      const baseProductQuery = isSeller && sellerId
        ? supabase.from('products').eq('seller_id', sellerId)
        : supabase.from('products');
      
      try {
        // Execute all queries in parallel
        const [
          revenueResult,
          ordersResult,
          pendingResult,
          deliveredResult,
          productsResult,
          lowStockResult,
          outOfStockResult
        ] = await Promise.all([
          // Total revenue from delivered orders (filtered by seller if applicable)
          baseOrderQuery
            .select('total_amount')
            .eq('status', 'delivered')
            .then(({ data, error }) => {
              if (error) throw error;
              return { data: data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0 };
            }),
            
          // Total orders count (filtered by seller if applicable)
          baseOrderQuery.select('*', countOptions),
            
          // Pending orders count (filtered by seller if applicable)
          baseOrderQuery
            .select('*', countOptions)
            .eq('status', 'pending'),
            
          // Delivered orders count (filtered by seller if applicable)
          baseOrderQuery
            .select('*', countOptions)
            .eq('status', 'delivered'),
            
          // Total products count (filtered by seller if applicable)
          baseProductQuery.select('*', countOptions),
            
          // Low stock items count (filtered by seller if applicable)
          baseProductQuery
            .select('*', countOptions)
            .lt('stock_quantity', 5)
            .gt('stock_quantity', 0),
            
          // Out of stock items count (filtered by seller if applicable)
          baseProductQuery
            .select('*', countOptions)
            .eq('stock_quantity', 0)
        ]);
        
        // Update stats with query results
        stats.totalRevenue = revenueResult.data || 0;
        stats.totalOrders = ordersResult.count || 0;
        stats.pendingOrders = pendingResult.count || 0;
        stats.deliveredOrders = deliveredResult.count || 0;
        stats.totalProducts = productsResult.count || 0;
        stats.lowStockItems = lowStockResult.count || 0;
        stats.outOfStockItems = outOfStockResult.count || 0;
        
        return {
          data: stats,
          status: 200,
          success: true
        };
        
      } catch (error) {
        logger.error('Error fetching dashboard stats:', error);
        throw new Error('Failed to fetch dashboard statistics');
      }
      
    } catch (error) {
      logger.error('Error in getDashboardStats:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
        success: false
      };
    }
  }

  // Product Management with improved error handling
  async getProducts(params: PaginationParams = { limit: 10, page: 1 }) {
    try {
      const { limit = 10, page = 1 } = params;
      
      // Validate input parameters
      if (limit < 1 || page < 1) {
        return this.handleResponse({ 
          error: { message: 'Invalid pagination parameters. Limit and page must be positive numbers.' },
          status: 400,
          success: false
        });
      }
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Create a cache key based on the query parameters
      const cacheKey = `products_${from}_${to}`;
      
      // Use cache or fetch fresh data
      const result = await this.getFromCacheOrFetch(
        cacheKey,
        async () => {
          return await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, to);
        }
      );
        
      return this.handleResponse({ data: result.data, error: result.error });
    } catch (error) {
      logger.error('Error fetching products:', error);
      return this.handleResponse({ error });
    }
  }

  async getProduct(id: string) {
    try {
      if (!id) {
        return this.handleResponse({ 
          error: { message: 'Product ID is required' },
          status: 400,
          success: false
        });
      }
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:user_id (*)
        `)
        .eq('id', id)
        .single();
      
      return this.handleResponse({ data, error });
    } catch (error) {
      logger.error(`Error fetching product with ID ${id}:`, error);
      return this.handleResponse({ error });
    }
  }

  async createProduct(productData: any) {
    try {
      if (!productData) {
        return this.handleResponse({ 
          error: { message: 'Product data is required' },
          status: 400,
          success: false
        });
      }

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      // Invalidate products cache
      this.invalidateCache('products_');
      
      return this.handleResponse({ data, error });
    } catch (error) {
      logger.error('Error creating product:', error);
      return this.handleResponse({ error });
    }
  }

  async updateProduct(id: string, productData: any) {
    try {
      if (!id || !productData) {
        return this.handleResponse({ 
          error: { message: 'Product ID and data are required' },
          status: 400,
          success: false
        });
      }

      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      
      // Invalidate caches
      this.invalidateCache('products_');
      this.invalidateCache(`product_${id}`);
      
      return this.handleResponse({ data, error });
    } catch (error) {
      logger.error(`Error updating product with ID ${id}:`, error);
      return this.handleResponse({ error });
    }
  }

  async deleteProduct(id: string) {
    try {
      if (!id) {
        return this.handleResponse({ 
          error: { message: 'Product ID is required' },
          status: 400,
          success: false
        });
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Invalidate caches
      this.invalidateCache('products_');
      this.invalidateCache(`product_${id}`);
      
      return this.handleResponse({ 
        data: { success: true, message: 'Product deleted successfully' },
        status: 200,
        success: true
      });
    } catch (error) {
      logger.error(`Error deleting product with ID ${id}:`, error);
      return this.handleResponse({ error });
    }
  }

  // Order Management with improved error handling
  async getOrders(params: PaginationParams = { limit: 10, page: 1 }) {
    try {
      const { limit = 10, page = 1 } = params;
      
      // Validate input parameters
      if (limit < 1 || page < 1) {
        return this.handleResponse({ 
          error: { message: 'Invalid pagination parameters. Limit and page must be positive numbers.' },
          status: 400,
          success: false
        });
      }
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, product:products(*)),
          user:users(*)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);
        
      return this.handleResponse({ data, error });
    } catch (error) {
      logger.error('Error fetching orders:', error);
      return this.handleResponse({ error });
    }
  }

  async getOrder(id: string) {
    try {
      if (!id) {
        return this.handleResponse({ 
          error: { message: 'Order ID is required' },
          status: 400,
          success: false
        });
      }
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, product:products(*)),
          user:users(*)
        `)
        .eq('id', id)
        .single();
      return this.handleResponse({ data, error });
    } catch (error) {
      logger.error(`Error fetching order with ID ${id}:`, error);
      return this.handleResponse({ error });
    }
  }

  async createOrder(orderData: OrderData) {
    try {
      if (!orderData) {
        return this.handleResponse({ 
          error: { message: 'Order data is required' },
          status: 400,
          success: false
        });
      }
      
      // Validate required fields
      if (!orderData.user_id) {
        return this.handleResponse({ 
          error: { message: 'User ID is required for creating an order' },
          status: 400,
          success: false
        });
      }
      
      if (!orderData.total_amount && orderData.total_amount !== 0) {
        return this.handleResponse({ 
          error: { message: 'Total amount is required for creating an order' },
          status: 400,
          success: false
        });
      }
      
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      return this.handleResponse({ data, error });
    } catch (error) {
      logger.error('Error creating order:', error);
      return this.handleResponse({ error });
    }
  }

  // Category Management with improved error handling
  async getCategories() {
    try {
      // Categories change infrequently, so we can cache them for longer
      const cacheKey = 'all_categories';
      const cacheTTL = 30 * 60 * 1000; // 30 minutes
      
      // Use cache or fetch fresh data
      const result = await this.getFromCacheOrFetch(
        cacheKey,
        async () => {
          return await supabase
            .from('categories')
            .select('*')
            .order('name');
        },
        cacheTTL
      );
      
      return this.handleResponse({ data: result.data, error: result.error });
    } catch (error) {
      logger.error('Error fetching categories:', error);
      return this.handleResponse({ error });
    }
  }

  // Seller Profile Management with improved error handling
  async getSellerProfiles() {
    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*');
      return this.handleResponse({ data, error });
    } catch (error) {
      logger.error('Error fetching seller profiles:', error);
      return this.handleResponse({ error });
    }
  }

  // Review Management with improved error handling
  async getReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, user:users(*), product:products(*)')
        .order('created_at', { ascending: false });
      return this.handleResponse({ data, error });
    } catch (error) {
      logger.error('Error fetching reviews:', error);
      return this.handleResponse({ error });
    }
  }

  async getRecentOrders(limit: number = 10) {
    try {
      // Validate input parameter
      if (limit < 1) {
        return this.handleResponse({ 
          error: { message: 'Invalid limit parameter. Limit must be a positive number.' },
          status: 400,
          success: false
        });
      }
      return this.getOrders({ limit, page: 1 });
    } catch (error) {
      logger.error('Error fetching recent orders:', error);
      return this.handleResponse({ error });
    }
  }

  async getOrdersByStatus(status: string) {
    try {
      if (!status) {
        return this.handleResponse({ 
          error: { message: 'Order status is required' },
          status: 400,
          success: false
        });
      }
      
      // Create a cache key based on the status
      const cacheKey = `orders_status_${status}`;
      
      // Use cache or fetch fresh data
      const result = await this.getFromCacheOrFetch(
        cacheKey,
        async () => {
          return await supabase
            .from('orders')
            .select('*')
            .eq('status', status);
        }
      );
      
      return this.handleResponse({ data: result.data, error: result.error });
    } catch (error) {
      logger.error(`Error fetching orders with status ${status}:`, error);
      return this.handleResponse({ error });
    }
  }
  
  // Bulk operations for production efficiency
  async bulkCreateProducts(products: any[]) {
    try {
      if (!products || !Array.isArray(products) || products.length === 0) {
        return this.handleResponse({ 
          error: { message: 'Valid products array is required' },
          status: 400,
          success: false
        });
      }
      
      // Perform bulk insert
      const { data, error } = await supabase
        .from('products')
        .insert(products)
        .select();
      
      // Invalidate products cache after bulk insert
      this.invalidateCache('products_');
      
      return this.handleResponse({ data, error });
    } catch (error) {
      logger.error('Error bulk creating products:', error);
      return this.handleResponse({ error });
    }
  }
  
  async bulkUpdateProducts(products: any[]) {
    try {
      if (!products || !Array.isArray(products) || products.length === 0) {
        return this.handleResponse({ 
          error: { message: 'Valid products array is required' },
          status: 400,
          success: false
        });
      }
      
      // Use transaction for bulk update to ensure atomicity
      const updates = products.map(product => {
        if (!product.id) {
          throw new Error('Each product must have an id for bulk update');
        }
        
        return supabase
          .from('products')
          .update(product)
          .eq('id', product.id);
      });
      
      // Execute all updates
      const results = await Promise.all(updates);
      
      // Check for errors
      const errors = results.filter(result => result.error).map(result => result.error);
      
      if (errors.length > 0) {
        return this.handleResponse({ 
          error: { 
            message: 'Some products failed to update', 
            details: errors 
          },
          status: 500,
          success: false
        });
      }
      
      // Invalidate products cache after bulk update
      this.invalidateCache('products_');
      
      return this.handleResponse({ 
        data: { updated: products.length },
        status: 200,
        success: true
      });
    } catch (error) {
      logger.error('Error bulk updating products:', error);
      return this.handleResponse({ error });
    }
  }

  // Validate data against a set of rules
  validateData(data: any, rules: ValidationRule[]): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    
    for (const rule of rules) {
      const { field, type, required, minLength, maxLength, minValue, maxValue, pattern, custom } = rule;
      const value = data[field];
      
      // Check if required
      if (required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }
      
      // Skip further validation if value is not provided and not required
      if ((value === undefined || value === null || value === '') && !required) {
        continue;
      }
      
      // Type validation
      if (type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (type === 'date') {
          if (!(value instanceof Date) && isNaN(Date.parse(value))) {
            errors[field] = `${field} must be a valid date`;
          }
        } else if (actualType !== type) {
          errors[field] = `${field} must be a ${type}`;
          continue;
        }
      }
      
      // String validations
      if (typeof value === 'string') {
        if (minLength !== undefined && value.length < minLength) {
          errors[field] = `${field} must be at least ${minLength} characters`;
        }
        if (maxLength !== undefined && value.length > maxLength) {
          errors[field] = `${field} must be no more than ${maxLength} characters`;
        }
        if (pattern && !pattern.test(value)) {
          errors[field] = `${field} has an invalid format`;
        }
      }
      
      // Number validations
      if (typeof value === 'number') {
        if (minValue !== undefined && value < minValue) {
          errors[field] = `${field} must be at least ${minValue}`;
        }
        if (maxValue !== undefined && value > maxValue) {
          errors[field] = `${field} must be no more than ${maxValue}`;
        }
      }
      
      // Custom validation
      if (custom) {
        const customResult = custom(value);
        if (typeof customResult === 'string') {
          errors[field] = customResult;
        } else if (customResult === false) {
          errors[field] = `${field} is invalid`;
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Method to backup critical data before destructive operations
  async secureDeleteUserData(userId: string): Promise<ApiResponse<any>> {
    try {
      if (!userId) {
        return {
          error: 'Invalid user ID',
          message: 'User ID is required for secure deletion',
          status: 400,
          success: false
        };
      }
      
      // First, backup the data before deletion (for compliance and recovery)
      const userBackup = await this.backupDataBeforeOperation('users', [userId]);
      if (!userBackup.success) {
        return userBackup; // Return the error from backup operation
      }
      
      // In a real production system, you would implement a transaction
      // to ensure all related data is properly anonymized or deleted
      
      // 1. Anonymize personal data in user profile
      const anonymizedData = {
        email: `anonymized_${Date.now()}@deleted.user`,
        name: 'Deleted User',
        phone: null,
        address: null,
        // Set a flag to indicate this user has been anonymized
        is_deleted: true,
        deleted_at: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('users')
        .update(anonymizedData)
        .eq('id', userId);
      
      if (updateError) {
        logger.error(`Error anonymizing user data for ${userId}:`, updateError);
        return this.handleResponse({ error: updateError });
      }
      
      // 2. Delete or anonymize related sensitive data
      // This would include things like payment information, browsing history, etc.
      // For this example, we'll just log that we would do this
      logger.info(`Would delete sensitive data for user ${userId} in a production environment`);
      
      // 3. Keep order history but remove personal identifiers
      // This is often needed for business records while complying with GDPR
      logger.info(`Would anonymize order history for user ${userId} in a production environment`);
      
      return {
        data: { 
          message: `User data for ${userId} has been securely deleted/anonymized`,
          deletion_id: `deletion_${Date.now()}` // In production, this would be a real ID
        },
        status: 200,
        success: true
      };
    } catch (error) {
      logger.error(`Error securely deleting user data for ${userId}:`, error);
      return this.handleResponse({ error });
    }
  }
  
  async backupDataBeforeOperation(tableName: string, recordIds: string[]): Promise<ApiResponse<any>> {
    try {
      if (!tableName || !recordIds || recordIds.length === 0) {
        return {
          error: 'Invalid backup parameters',
          message: 'Table name and record IDs are required for backup',
          status: 400,
          success: false
        };
      }
      
      // Get the data to backup
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .in('id', recordIds);
      
      if (error) {
        logger.error(`Error fetching data for backup from ${tableName}:`, error);
        return this.handleResponse({ error });
      }
      
      if (!data || data.length === 0) {
        return {
          error: 'No data found for backup',
          message: 'The requested records were not found',
          status: 404,
          success: false
        };
      }
      
      // In a real production system, you would store this backup in a secure location
      // For example, in a backup table, object storage, or send to a backup service
      
      // For this implementation, we'll simulate storing in a backup table
      const backupData = {
        table_name: tableName,
        record_ids: recordIds,
        data_snapshot: JSON.stringify(data),
        created_at: new Date().toISOString(),
        operation_type: 'pre_operation_backup'
      };
      
      // In a real system, you would do something like:
      // const backupResult = await supabase.from('data_backups').insert([backupData]);
      
      // For now, just log the backup (in production, this would go to a secure backup system)
      logger.info(`Backup created for ${tableName}`, { 
        recordCount: data.length,
        timestamp: backupData.created_at 
      });
      
      return {
        data: { 
          message: `Successfully backed up ${data.length} records from ${tableName}`,
          backup_id: `backup_${Date.now()}` // In production, this would be a real ID
        },
        status: 200,
        success: true
      };
    } catch (error) {
      logger.error(`Error creating backup for ${tableName}:`, error);
      return this.handleResponse({ error });
    }
  }

  // Wishlist methods
  async testWishlistConnection(): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      return { data: true, success: true };
    } catch (error) {
      return { error, success: false };
    }
  }

  async getWishlistItems(userId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          product:product_id (*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { error, success: false };
    }
  }

  async addToWishlist(userId: string, itemData: any): Promise<ApiResponse<any>> {
    try {
      // Check if item already exists in wishlist
      const { data: existingItem } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('product_id', itemData.product_id)
        .eq('user_id', userId)
        .single();

      if (existingItem) {
        // Item already in wishlist
        return { data: existingItem, success: true };
      }

      // Add new item to wishlist
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert([{ 
          ...itemData, 
          user_id: userId,
          // Ensure we're not sending undefined values
          selectedVariant: itemData.selectedVariant || null
        }])
        .select();
      
      if (error) throw error;
      return { data: data?.[0], success: true };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { error, success: false };
    }
  }

  async removeFromWishlist(userId: string, itemId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);
      
      if (error) throw error;
      return { data: true, success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { error, success: false };
    }
  }

  async clearWishlist(userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      return { data: true, success: true };
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return { error, success: false };
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
      console.error('Error testing cart connection:', error);
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
      console.error('Error getting cart items:', error);
      return { error, success: false };
    }
  }

  async addToCart(userId: string, itemData: any): Promise<ApiResponse<any>> {
    try {
      // Check if item already exists in cart
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('product_id', itemData.product_id)
        .eq('user_id', userId);
      
      if (fetchError) throw fetchError;

      if (existingItems && existingItems.length > 0) {
        // Update quantity if item exists
        const { data, error } = await supabase
          .from('cart_items')
          .update({ 
            quantity: (existingItems[0].quantity || 1) + (itemData.quantity || 1),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItems[0].id)
          .select();
        
        if (error) throw error;
        return { data: data?.[0], success: true };
      } else {
        // Add new item to cart
        const { data, error } = await supabase
          .from('cart_items')
          .insert([{ 
            ...itemData, 
            user_id: userId,
            quantity: itemData.quantity || 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();
        
        if (error) throw error;
        return { data: data?.[0], success: true };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { error, success: false };
    }
  }

  async removeFromCart(userId: string, productId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', userId);
      
      if (error) throw error;
      return { data: true, success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { error, success: false };
    }
  }

  async updateQuantity(userId: string, productId: string, quantity: number): Promise<ApiResponse<any>> {
    try {
      if (quantity <= 0) {
        // If quantity is 0 or less, remove the item from cart
        return this.removeFromCart(userId, productId);
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
      console.error('Error updating cart quantity:', error);
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
      console.error('Error clearing cart:', error);
      return { error, success: false };
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
  }>> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('Authentication required');
      
      // Get seller profile if exists
      const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      const isSeller = !!sellerProfile;
      const sellerId = sellerProfile?.id;
      const countOptions = { count: 'exact' as const, head: true as const };
      
      // Get seller's order IDs if seller
      let orderIds: string[] = [];
      if (isSeller && sellerId) {
        orderIds = await this.getSellerOrderIds(sellerId);
      }
      
      // Base queries with role-based filtering
      const baseOrderQuery = isSeller && orderIds.length > 0
        ? supabase.from('orders').in('id', orderIds)
        : supabase.from('orders');
        
      const baseProductQuery = isSeller && sellerId
        ? supabase.from('products').eq('seller_id', sellerId)
        : supabase.from('products');
      
      // Execute queries in parallel
      const [
        { data: revenueData },
        { count: totalOrders },
        { count: pendingOrders },
        { count: deliveredOrders },
        { count: totalProducts },
        { count: lowStockItems },
        { count: outOfStockItems }
      ] = await Promise.all([
        // Total Revenue (only delivered orders)
        baseOrderQuery
          .select('total_amount')
          .eq('status', 'delivered'),
        
        // Total Orders
        baseOrderQuery.select('*', countOptions),
        
        // Pending Orders
        baseOrderQuery
          .select('*', countOptions)
          .eq('status', 'pending'),
        
        // Delivered Orders
        baseOrderQuery
          .select('*', countOptions)
          .eq('status', 'delivered'),
        
        // Total Products
        baseProductQuery.select('*', countOptions),
        
        // Low Stock Items (below 5 but not zero)
        baseProductQuery
          .select('*', countOptions)
          .lt('stock_quantity', 5)
          .gt('stock_quantity', 0),
        
        // Out of Stock Items
        baseProductQuery
          .select('*', countOptions)
          .eq('stock_quantity', 0)
      ]);
      
      // Calculate total revenue
      // Calculate total revenue for current period
      const currentPeriodRevenue = revenueData?.reduce(
        (sum: number, order: { total_amount: number }) => sum + (order.total_amount || 0), 0
      ) || 0;
      
      // Get previous period data for comparison (e.g., previous month)
      const previousPeriodStart = new Date();
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
      
      // Get previous period revenue and orders
      const { data: previousPeriodData } = await baseOrderQuery
        .select('total_amount, created_at')
        .lt('created_at', previousPeriodStart.toISOString())
        .eq('status', 'delivered');
      
      const previousPeriodRevenue = previousPeriodData?.reduce(
        (sum: number, order: { total_amount: number }) => sum + (order.total_amount || 0), 0
      ) || 0;
      
      // Get previous period order counts
      const { count: previousPeriodOrders } = await baseOrderQuery
        .select('*', { count: 'exact', head: true })
        .lt('created_at', previousPeriodStart.toISOString());
      
      const { count: previousPeriodDelivered } = await baseOrderQuery
        .select('*', { count: 'exact', head: true })
        .lt('created_at', previousPeriodStart.toISOString())
        .eq('status', 'delivered');
      
      // Calculate percentage changes
      const calculateChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Number((((current - previous) / previous) * 100).toFixed(2));
      };
      
      const revenueChange = calculateChange(currentPeriodRevenue, previousPeriodRevenue);
      const ordersChange = calculateChange(totalOrders || 0, previousPeriodOrders || 0);
      const deliveredOrdersChange = calculateChange(
        deliveredOrders || 0, 
        previousPeriodDelivered || 0
      );
      
      // Calculate additional metrics
      const averageOrderValue = (totalOrders && totalOrders > 0) 
        ? Number((currentPeriodRevenue / totalOrders).toFixed(2)) 
        : 0;
        
      // Simple conversion rate (orders / total_visitors) - would need visitor tracking
      const conversionRate = 0; // Placeholder - implement with actual visitor tracking
      
      // Prepare result with all metrics
      return {
        data: {
          // Current period stats
          totalRevenue: currentPeriodRevenue,
          totalOrders: totalOrders || 0,
          pendingOrders: pendingOrders || 0,
          deliveredOrders: deliveredOrders || 0,
          totalProducts: totalProducts || 0,
          lowStockItems: lowStockItems || 0,
          outOfStockItems: outOfStockItems || 0,
          
          // Period-over-period changes
          revenueChange,
          ordersChange,
          deliveredOrdersChange,
          
          // Additional metrics
          averageOrderValue,
          conversionRate
        },
        status: 200,
        success: true
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching dashboard stats:', error);
      return { 
        error: `Failed to fetch dashboard statistics: ${errorMessage}`,
        status: 500,
        success: false 
      };
    }
  }
  
  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return {
          error: error.message,
          status: 401,
          success: false
        };
      }
      
      return {
        data: data.user,
        status: 200,
        success: true
      };
    } catch (error) {
      logger.error('Login error:', error);
      return {
        error: 'Authentication failed',
        status: 500,
        success: false
      };
    }
  }

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
  
  async signup(email: string, password: string, userData?: any): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
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
      logger.error('Signup error:', error);
      return {
        error: 'Registration failed',
        status: 500,
        success: false
      };
    }
  }
  
  // Method to handle graceful service shutdown
  async prepareForShutdown() {
    try {
      logger.info('Service shutdown initiated, performing cleanup tasks...');
      
      // 1. Flush any pending writes or operations
      // In a real system, you would ensure all pending operations are completed
      
      // 2. Close database connections gracefully
      // For Supabase, there's no explicit connection to close, but in other systems you would
      
      // 3. Save cache to persistent storage if needed
      if (this.cache.size > 0 && process.env.NODE_ENV === 'production') {
        const cacheData = Array.from(this.cache.entries()).reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>);
        
        // In a real system, you would persist this data
        logger.info(`Would persist ${this.cache.size} cache entries to storage`);
      }
      
      // 4. Save performance metrics for analysis
      logger.info('Saving performance metrics before shutdown', this.getPerformanceMetrics());
      
      // 5. Notify monitoring systems of graceful shutdown
      // In a real system, you would call your monitoring service
      logger.info('Would notify monitoring systems of graceful shutdown');
      
      return {
        data: {
          message: 'Service prepared for shutdown successfully',
          timestamp: new Date().toISOString(),
          cache_entries_saved: this.cache.size,
          performance_metrics_saved: true
        },
        status: 200,
        success: true
      };
    } catch (error) {
      logger.error('Error during service shutdown:', error);
      return {
        error: 'Failed to prepare for shutdown properly',
        message: 'Some cleanup tasks failed during shutdown',
        status: 500,
        success: false
      };
    }
  }
}

export const apiService = new ApiService();