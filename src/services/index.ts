import { ApiClient } from './apiClient';
import { CartService } from './cartService';
import { FarmerService } from './farmerService';
import { NotificationService } from './notificationService';
import { OrderService } from './orderService';
import { ProductService } from './productService';
import { UserService } from './userService';
import { environment } from '../config/environment';

// Create singleton API client
const apiClient = new ApiClient({
  baseURL: environment.apiUrl,
  defaultHeaders: {
    'Accept': 'application/json',
    'X-App-Version': '1.0.0',
  },
});

// Create service instances
export const cartService = new CartService(apiClient);
export const farmerService = new FarmerService(apiClient);
export const notificationService = new NotificationService(apiClient);
export const orderService = new OrderService(apiClient);
export const productService = new ProductService(apiClient);
export const userService = new UserService(apiClient);

// Export service classes for testing
export {
  ApiClient,
  CartService,
  FarmerService,
  NotificationService,
  OrderService,
  ProductService,
  UserService,
};
