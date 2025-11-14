// API Service for Django Backend
// Use environment variable VITE_API_BASE_URL so dev/prod can point to different backends.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private buildUrl(endpoint: string): string {
    const trimmed = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const [path, query] = trimmed.split('?');
    const sanitizedPath = path.replace(/\/+$/, '');
    const querySuffix = query ? `?${query}` : '';
    return `${API_BASE_URL}/${sanitizedPath}${querySuffix}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { headers: optionHeaders, ...restOptions } = options;
      const method = (restOptions.method || 'GET').toString().toUpperCase();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...supabaseHeaders,
        ...((optionHeaders as Record<string, string>) || {}),
      };

      if (
        isSupabaseRest &&
        ['POST', 'PUT', 'PATCH'].includes(method) &&
        headers.Prefer === undefined
      ) {
        headers.Prefer = 'return=representation';
      }

      const response = await fetch(this.buildUrl(endpoint), {
        ...restOptions,
        method,
        headers,
      });

      const text = await response.text();
      let data: any = undefined;
      try {
        data = text ? JSON.parse(text) : undefined;
      } catch (err) {
        // not JSON - keep raw text
        data = text;
      }

      if (!response.ok) {
        const errMsg = data && data.detail ? data.detail : `HTTP ${response.status}`;
        throw new Error(errMsg);
      }

      return { data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // User Management
  async getUsers() {
    return this.request('/user_profiles?select=*');
  }

  async getUser(id: string) {
    return this.request(`/user_profiles?id=eq.${id}&select=*`);
  }

  async createUser(userData: any) {
    return this.request('/user_profiles', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Product Management
  async getProducts() {
    return this.request('/products?select=*');
  }

  async getProduct(id: string) {
    return this.request(`/products?id=eq.${id}&select=*`);
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products?id=eq.${id}`, {
      method: 'DELETE',
    });
  }

  // Order Management
  async getOrders() {
    return this.request('/orders?select=*');
  }

  async getOrder(id: string) {
    return this.request(`/orders?id=eq.${id}&select=*`);
  }

  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, orderData: any) {
    return this.request(`/orders?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id: string) {
    return this.request(`/orders?id=eq.${id}`, {
      method: 'DELETE',
    });
  }

  // Category Management
  async getCategories() {
    return this.request('/categories?select=*');
  }

  async createCategory(categoryData: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  // Seller Profile Management
  async getSellerProfiles() {
    return this.request('/seller_profiles?select=*');
  }

  async getSellerProfile(id: string) {
    return this.request(`/seller_profiles?id=eq.${id}&select=*`);
  }

  async createSellerProfile(profileData: any) {
    return this.request('/seller_profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateSellerProfile(id: string, profileData: any) {
    return this.request(`/seller_profiles?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Review Management
  async getReviews() {
    return this.request('/reviews?select=*');
  }

  async createReview(reviewData: any) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Notification Management
  async getNotifications() {
    return this.request('/notifications?select=*');
  }

  async createNotification(notificationData: any) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  // Dashboard Statistics
  async getDashboardStats() {
    return this.request('/dashboard_stats?select=*');
  }

  async getRecentOrders(limit: number = 10) {
    return this.request(`/orders?select=*&limit=${limit}`);
  }

  async getOrdersByStatus(status: string) {
    return this.request(`/orders?select=*&status=eq.${status}`);
  }
}

export const apiService = new ApiService(); 