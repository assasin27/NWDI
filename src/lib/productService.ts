import { supabase } from '../integrations/supabase/supabaseClient';
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category_id: string;
  quantity?: number;
  unit: string;
  image_url?: string;

  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

async function handleSupabaseResponse<T>(response: PostgrestSingleResponse<T>): Promise<T | null> {
  if (response.error) {
    console.error('Supabase error:', response.error);
    return null;
  }
  return response.data;
}

async function getCategoryId(categoryName: string): Promise<string | null> {
  const { data, error } = await supabase.from('categories').select('id').eq('name', categoryName).single();
  if (error || !data) {
    console.error('Error fetching category ID:', error);
    return null;
  }
  return data.id;
}

export const productService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (response.error) {
        console.error('Error fetching products:', response.error);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get products by category
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      const response = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (response.error) {
        console.error('Error fetching products by category:', response.error);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  },

  // Get product by ID
  async getProductById(productId: string): Promise<Product | null> {
    try {
      console.log('Product ID:', productId); // Ensure this logs a valid ID
      const response = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      return handleSupabaseResponse(response);
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
    categoryId: string;
    quantity?: number;
    unit: string;
    image_url?: string;
    in_stock?: boolean;
  }): Promise<Product | null> {
    try {
      // Basic validation
      const validationErrors: string[] = [];
      if (!productData.name || !productData.name.trim()) validationErrors.push('name is required');
      if (!productData.categoryId || !productData.categoryId.trim()) validationErrors.push('categoryId is required');
      if (!productData.unit || !productData.unit.trim()) validationErrors.push('unit is required');
      if (typeof productData.price !== 'number' || !isFinite(productData.price) || productData.price < 0) validationErrors.push('price must be a non-negative number');
      if (productData.quantity !== undefined && (!Number.isInteger(productData.quantity) || productData.quantity < 0)) validationErrors.push('quantity must be an integer >= 0');
      if (productData.image_url !== undefined && productData.image_url !== null && typeof productData.image_url !== 'string') validationErrors.push('image_url must be a string');

      if (validationErrors.length) {
        const msg = `Validation error: ${validationErrors.join('; ')}`;
        console.error(msg);
        throw new Error(msg);
      }

      // Prepare the product data with proper types
      // Build sanitized payload (only known fields)
      const productToAdd: Record<string, any> = {
        name: productData.name.trim(),
        price: Number(productData.price) || 0,
        description: productData.description?.trim() || null,
        category_id: productData.categoryId.trim(),
        quantity: productData.quantity !== undefined ? Number(productData.quantity) : 0,
        unit: productData.unit.trim(),
        image_url: productData.image_url?.trim() || null,
        in_stock: productData.in_stock !== undefined ? productData.in_stock : true,
      };

      // Insert the product
      const response = await supabase
        .from('products')
        .insert([productToAdd])
        .select('*')  // Explicitly select all columns to ensure we get the complete record
        .single();

      return handleSupabaseResponse(response);
    } catch (error) {
      console.error('Error in addProduct:', error);
      throw error; // Re-throw to allow error handling in the component
    }
  },

  // Add new product with category selection
  async addProductWithCategory(productData: {
    name: string;
    price: number;
    description?: string;
    categoryId: string;
    quantity?: number;
    unit: string;
    image_url?: string;
    in_stock?: boolean;
  }): Promise<Product | null> {
    try {
      // Basic validation
      const validationErrors: string[] = [];
      if (!productData.name || !productData.name.trim()) validationErrors.push('name is required');
      if (!productData.categoryId || !productData.categoryId.trim()) validationErrors.push('categoryId is required');
      if (!productData.unit || !productData.unit.trim()) validationErrors.push('unit is required');
      if (typeof productData.price !== 'number' || !isFinite(productData.price) || productData.price < 0) validationErrors.push('price must be a non-negative number');
      if (productData.quantity !== undefined && (!Number.isInteger(productData.quantity) || productData.quantity < 0)) validationErrors.push('quantity must be an integer >= 0');
      if (productData.image_url !== undefined && productData.image_url !== null && typeof productData.image_url !== 'string') validationErrors.push('image_url must be a string');

      if (validationErrors.length) {
        const msg = `Validation error: ${validationErrors.join('; ')}`;
        console.error(msg);
        throw new Error(msg);
      }

      // Use the provided categoryId directly
      const categoryId = productData.categoryId;

      // Build sanitized payload
      const productToAdd: Record<string, any> = {
        name: productData.name.trim(),
        price: Number(productData.price) || 0,
        description: productData.description?.trim() || null,
        category_id: categoryId,  // Ensure this is category_id
        quantity: productData.quantity !== undefined ? Number(productData.quantity) : 0,
        unit: productData.unit.trim(),
        image_url: productData.image_url?.trim() || null,  // Use image_url instead of image
        in_stock: productData.in_stock !== undefined ? productData.in_stock : true,
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productToAdd])
        .select('*')
        .single();

      if (error) {
        console.error('Error adding product:', error);
        throw error;
      }

      return data as Product;
    } catch (error) {
      console.error('Error in addProductWithCategory:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      console.log('Product ID:', productId); // Ensure this logs a valid ID
      const response = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      return handleSupabaseResponse(response);
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  },

  // Delete product
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      console.log('Product ID:', productId); // Ensure this logs a valid ID
      const response = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (response.error) {
        console.error('Error deleting product:', response.error);
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
      const response = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (response.error) {
        console.error('Error searching products:', response.error);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  // Get product categories
  async getProductCategories(): Promise<string[]> {
    try {
      const response = await supabase
        .from('products')
        .select('category_id')
        .order('category_id');

      if (response.error) {
        console.error('Error fetching product categories:', response.error);
        return [];
      }

      const categories = [...new Set(response.data?.map(p => p.category_id) || [])];
      return categories;
    } catch (error) {
      console.error('Error fetching product categories:', error);
      return [];
    }
  },

  // Fetch categories
  async fetchCategories(): Promise<{ id: string; name: string }[]> {
    try {
      const response = await supabase
        .from('categories')
        .select('id, name');

      if (response.error) {
        console.error('Error fetching categories:', response.error);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Update product stock status
  async updateProductStock(productId: string, inStock: boolean): Promise<boolean> {
    try {
      console.log('Product ID:', productId); // Ensure this logs a valid ID
      const response = await supabase
        .from('products')
        .update({ in_stock: inStock })
        .eq('id', productId);

      if (response.error) {
        console.error('Error updating product stock:', response.error);
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
      const response = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (response.error) {
        console.error('Error getting products count:', response.error);
        return 0;
      }

      return response.count || 0;
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
      const response = await supabase
        .from('products')
        .select('in_stock');

      if (response.error) {
        console.error('Error getting product stats:', response.error);
        return {
          totalProducts: 0,
          inStockProducts: 0,
          outOfStockProducts: 0,
        };
      }

      const stats = {
        totalProducts: response.data?.length || 0,

        inStockProducts: response.data?.filter(p => p.in_stock).length || 0,
        outOfStockProducts: response.data?.filter(p => !p.in_stock).length || 0,
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

  // Initialize categories
  async initializeCategories(): Promise<void> {
    try {
      // Add categories to the category table
      const response = await supabase
        .from('categories')
        .insert([
          { name: 'Fruits' },
          { name: 'Vegetables' },
          { name: 'Dairy' },
        ]);

      if (response.error) {
        console.error('Error initializing categories:', response.error);
        return;
      }

      // Update products with category IDs
      const fruitsCat = await supabase.from('categories').select('id').eq('name', 'Fruits').single();
      const fruitsId = fruitsCat.data?.id || null;
      const fruitsResponse = await supabase
        .from('products')
        .update({ category_id: fruitsId })
        .eq('category_id', 'Fruits');

      const vegCat = await supabase.from('categories').select('id').eq('name', 'Vegetables').single();
      const vegId = vegCat.data?.id || null;
      const vegetablesResponse = await supabase
        .from('products')
        .update({ category_id: vegId })
        .eq('category_id', 'Vegetables');

      const dairyCat = await supabase.from('categories').select('id').eq('name', 'Dairy').single();
      const dairyId = dairyCat.data?.id || null;
      const dairyResponse = await supabase
        .from('products')
        .update({ category_id: dairyId })
        .eq('category_id', 'Dairy');

      if (fruitsResponse.error || vegetablesResponse.error || dairyResponse.error) {
        console.error('Error updating products with category IDs:', fruitsResponse.error || vegetablesResponse.error || dairyResponse.error);
        return;
      }
    } catch (error) {
      console.error('Error initializing categories:', error);
    }
  },
};