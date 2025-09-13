import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productService, orderService } from '../services';
import { Order, Product } from '../types';
import { BaseResponse } from '../types/api';
import { PaginatedResponse } from '../types/common';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockItems: number;
}

export type TimeRange = '24h' | '7days' | '30days' | '90days' | 'all';

export function useDashboardStats(timeRange: TimeRange) {
  return useQuery({
    queryKey: ['dashboardStats', timeRange],
    queryFn: async () => {
      const [ordersRes, productsRes] = await Promise.all([
        orderService.getOrders({ fromDate: getDateFromRange(timeRange) }),
        productService.getProducts('', { page: 1, limit: 100 })
      ]);

      const orders = (ordersRes as BaseResponse<Order[]>).data || [];
      const products = productsRes.data || [];

      return {
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        totalOrders: orders.length,
        totalProducts: products.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        lowStockItems: products.filter(p => (p.quantity || 0) <= (p.min_stock_level || 10)).length
      };
    }
  });
}

export function useInventoryItems(search: string = '') {
  return useQuery({
    queryKey: ['inventory', search],
    queryFn: async () => {
      const response = await productService.getProducts(search, { page: 1, limit: 100 });
      const products = response.data || [];

      let items = response.data || [];
      if (search) {
        const searchLower = search.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower)
        );
      }

      return items;
    }
  });
}

export function useRecentOrders() {
  return useQuery({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      const response = await orderService.getOrders({ 
        limit: 10, 
        sortBy: 'date',
        sortOrder: 'desc'
      });

      if (response.error) {
        throw new Error('Failed to fetch recent orders');
      }

      return response.data || [];
    }
  });
}

function getDateFromRange(range: TimeRange): string {
  const now = new Date();
  switch (range) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case '7days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case '90days':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(0).toISOString(); // All time
  }
}
