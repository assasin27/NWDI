import { supabase } from '../integrations/supabase/supabaseClient';

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  category: string;
  unit: string;
  image?: string;
  image_url?: string;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

const clampQuantity = (value: unknown): number => {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || Number.isNaN(numeric)) {
    return 0;
  }
  return Math.max(0, Math.floor(numeric));
};

const deriveInStock = (quantity: number, inStock: unknown): boolean => {
  if (quantity <= 0) {
    return false;
  }

  if (typeof inStock === 'boolean') {
    return inStock;
  }

  return quantity > 0;
};

// Map database fields to Product interface fields
const mapDatabaseProduct = (dbProduct: any): Product => {
  const quantity = clampQuantity(dbProduct.quantity);

  return {
    ...dbProduct,
    quantity,
    in_stock: deriveInStock(quantity, dbProduct.in_stock),
    image: dbProduct.image_url || dbProduct.image, // Map image_url to image
  };
};

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

       return (data || []).map(mapDatabaseProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get products by category
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products by category:', error);
        return [];
      }

      return (data || []).map(mapDatabaseProduct);
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

       return data ? mapDatabaseProduct(data) : null;
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
    unit?: string;
    image_url?: string;
    quantity?: number;
    in_stock?: boolean;
  }): Promise<Product | null> {
    try {
      // Get or create category ID
      const categoryId = await this.getCategoryIdByName(productData.category);
      if (!categoryId) {
        console.error('Failed to get or create category');
        return null;
      }

      const quantity = clampQuantity(productData.quantity);

      const insertData = {
        name: productData.name,
        price: productData.price,
        description: productData.description || '',
        category_id: categoryId,  // Use category_id, not category
        unit: productData.unit || 'kg',
        image_url: productData.image_url || '',
        quantity,
        in_stock: deriveInStock(quantity, productData.in_stock),
      };

      const { data, error } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        return null;
      }

      return data ? mapDatabaseProduct(data) : null;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  },

  // Update product
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      // Filter out undefined values
      const cleanUpdates: Record<string, any> = {};
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof Product] !== undefined) {
          cleanUpdates[key] = updates[key as keyof Product];
        }
      });

      if (cleanUpdates.quantity !== undefined) {
        const normalizedQuantity = clampQuantity(cleanUpdates.quantity);
        cleanUpdates.quantity = normalizedQuantity;
        cleanUpdates.in_stock = deriveInStock(normalizedQuantity, cleanUpdates.in_stock);
      } else if (cleanUpdates.in_stock !== undefined) {
        cleanUpdates.in_stock = !!cleanUpdates.in_stock;
      }

      const { data, error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', productId)
        .select();

      if (error) {
        console.error('Error updating product:', error);
        return null;
      }

      // Return first item if array, handle the case where multiple rows might be returned
      const product = Array.isArray(data) ? data[0] : data;
      return product ? mapDatabaseProduct(product) : null;
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

       return (data || []).map(mapDatabaseProduct);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  // Get product categories from categories table
  async getProductCategories(): Promise<{ id: string; name: string }[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching product categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching product categories:', error);
      return [];
    }
  },

  // Get or create category by name
  async getCategoryIdByName(categoryName: string): Promise<string | null> {
    try {
      // First try to find existing category
      const { data: existing, error: searchError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .single();

      if (existing) {
        return existing.id;
      }

      // If not found, create new category
      if (searchError?.code === 'PGRST116') {
        const { data: newCategory, error: createError } = await supabase
          .from('categories')
          .insert([{ name: categoryName }])
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating category:', createError);
          return null;
        }

        return newCategory?.id || null;
      }

      return null;
    } catch (error) {
      console.error('Error getting category ID:', error);
      return null;
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