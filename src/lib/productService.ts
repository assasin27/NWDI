import { supabase } from '@/integrations/supabase/client';

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
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products by category:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  },

  // Get product by ID
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
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
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
    
          in_stock: productData.in_stock !== undefined ? productData.in_stock : true,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  },

  // Update product
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  },

  // Delete product
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  // Get product categories
  async getProductCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .order('category');

      if (error) {
        console.error('Error fetching product categories:', error);
        return [];
      }

      const categories = [...new Set(data?.map(p => p.category) || [])];
      return categories;
    } catch (error) {
      console.error('Error fetching product categories:', error);
      return [];
    }
  },

  // Update product stock status
  async updateProductStock(productId: string, inStock: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ in_stock: inStock })
        .eq('id', productId);

      if (error) {
        console.error('Error updating product stock:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating product stock:', error);
      return false;
    }
  },

  // Get products count
  async getProductsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error getting products count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting products count:', error);
      return 0;
    }
  },

  // Get products statistics
  async getProductStats(): Promise<{
    totalProducts: number;
  
    inStockProducts: number;
    outOfStockProducts: number;
  }> {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('in_stock');

      if (!products) {
        return {
          totalProducts: 0,
          inStockProducts: 0,
          outOfStockProducts: 0,
        };
      }

      const stats = {
        totalProducts: products.length,

        inStockProducts: products.filter(p => p.in_stock).length,
        outOfStockProducts: products.filter(p => !p.in_stock).length,
      };

      return stats;
    } catch (error) {
      console.error('Error getting product stats:', error);
      return {
        totalProducts: 0,
        inStockProducts: 0,
        outOfStockProducts: 0,
      };
    }
  },
}; 