import { supabase } from '../integrations/supabase/supabaseClient';

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  unit: string;
  image?: string;

  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export const productService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    const response = await apiService.getAllProducts();
    if (response.error) {
      console.error('Error fetching products:', response.error);
      return [];
    }
    return response.data || [];
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await apiService.getProductsByCategory(category);
    if (response.error) {
      console.error('Error fetching products by category:', response.error);
      return [];
    }
    return response.data || [];
  },

  // Get product by ID
  async getProductById(productId: string): Promise<Product | null> {
    const response = await apiService.getProductById(productId);
    if (response.error) {
      console.error('Error fetching product:', response.error);
      return null;
    }
    return response.data;
  },

  // Add new product
  async addProduct(productData: {
    name: string;
    price: number;
    description?: string;
    category: string;
    unit: string;
    image?: string;
  
    in_stock?: boolean;
  }): Promise<Product | null> {
    const response = await apiService.addProduct(productData);
    if (response.error) {
      console.error('Error adding product:', response.error);
      return null;
    }
    return response.data;
  },

  // Update product
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    const response = await apiService.updateProduct(productId, updates);
    if (response.error) {
      console.error('Error updating product:', response.error);
      return null;
    }
    return response.data;
  },

  // Delete product
  async deleteProduct(productId: string): Promise<boolean> {
    const response = await apiService.deleteProduct(productId);
    if (response.error) {
      console.error('Error deleting product:', response.error);
      return false;
    }
    return true;
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiService.searchProducts(query);
    if (response.error) {
      console.error('Error searching products:', response.error);
      return [];
    }
    return response.data || [];
  },

  // Get product categories
  async getProductCategories(): Promise<string[]> {
    const response = await apiService.getProductCategories();
    if (response.error) {
      console.error('Error fetching product categories:', response.error);
      return [];
    }
    return response.data || [];
  },

  // Update product stock status
  async updateProductStock(productId: string, inStock: boolean): Promise<boolean> {
    const response = await apiService.updateProductStock(productId, inStock);
    if (response.error) {
      console.error('Error updating product stock:', response.error);
      return false;
    }
    return true;
  },

  // Get products count
  async getProductsCount(): Promise<number> {
    const response = await apiService.getProductsCount();
    if (response.error) {
      console.error('Error getting products count:', response.error);
      return 0;
    }
    return response.data.count || 0;
  },

  // Get products statistics
  async getProductStats(): Promise<{
    totalProducts: number;
  
    inStockProducts: number;
    outOfStockProducts: number;
  }> {
    const response = await apiService.getProductStats();
    if (response.error) {
      console.error('Error getting product stats:', response.error);
      return {
        totalProducts: 0,
        inStockProducts: 0,
        outOfStockProducts: 0,
      };
    }
    return response.data;
  },
};