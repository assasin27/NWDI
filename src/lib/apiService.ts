// API Service for Django Backend
// Use environment variable VITE_API_BASE_URL so dev/prod can point to different backends.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
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
    return this.request('/users/');
  }

  async getUser(id: string) {
    return this.request(`/users/${id}/`);
  }

  async createUser(userData: any) {
    return this.request('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Product Management
  async getProducts() {
    return this.request('/products/');
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}/`);
  }

  async createProduct(productData: any) {
    return this.request('/products/', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}/`, {
      method: 'DELETE',
    });
  }

  // Order Management
  async getOrders() {
    return this.request('/orders/');
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}/`);
  }

  async createOrder(orderData: any) {
    return this.request('/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, orderData: any) {
    return this.request(`/orders/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id: string) {
    return this.request(`/orders/${id}/`, {
      method: 'DELETE',
    });
  }

  // Category Management
  async getCategories() {
    return this.request('/products/categories/');
  }

  async createCategory(categoryData: any) {
    return this.request('/products/categories/', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  // Seller Profile Management
  async getSellerProfiles() {
    return this.request('/users/seller-profiles/');
  }

  async getSellerProfile(id: string) {
    return this.request(`/users/seller-profiles/${id}/`);
  }

  async createSellerProfile(profileData: any) {
    return this.request('/users/seller-profiles/', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateSellerProfile(id: string, profileData: any) {
    return this.request(`/users/seller-profiles/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Review Management
  async getReviews() {
    return this.request('/reviews/');
  }

  async createReview(reviewData: any) {
    return this.request('/reviews/', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Notification Management
  async getNotifications() {
    return this.request('/notifications/');
  }

  async createNotification(notificationData: any) {
    return this.request('/notifications/', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  // Dashboard Statistics
  async getDashboardStats() {
    return this.request('/dashboard/stats/');
  }

  async getRecentOrders(limit: number = 10) {
    return this.request(`/orders/?limit=${limit}`);
  }

  async getOrdersByStatus(status: string) {
    return this.request(`/orders/?status=${status}`);
  }
}

export const apiService = new ApiService(); 