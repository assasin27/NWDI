import { supabase } from '../integrations/supabase/supabaseClient';
import { Product, ProductFormData } from '../types/product';

interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const productService = {
  // Fetch all products for the current farmer with pagination and search
  async getProducts(farmerId: string, options: { 
    search?: string; 
    page?: number; 
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      search = '',
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('farmer_id', farmerId);

    // Apply search
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;
    
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  // Fetch a single product by ID
  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new product
  async createProduct(productData: ProductFormData & { farmer_id: string }): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...productData,
        price: parseFloat(productData.price as unknown as string),
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing product
  async updateProduct(id: string, updates: Partial<ProductFormData | Product>): Promise<Product> {
    const updateData = { ...updates };
    
    // Convert price to number if it exists
    if ('price' in updateData && updateData.price !== undefined) {
      updateData.price = parseFloat(updateData.price as unknown as string);
    }
    
    const { data, error } = await supabase
      .from('products')
      .update({ 
        ...updateData,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a product
  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Upload product image
  async uploadImage(file: File, path: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Subscribe to product changes
  subscribeToProducts(
    farmerId: string, 
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: any;
      old?: any;
    }) => void
  ): () => void {
    const subscription = supabase
      .channel('products')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `farmer_id=eq.${farmerId}`,
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  // Get product statistics
  async getProductStats(farmerId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_farmer_product_stats', { farmer_id: farmerId })
      .single();

    if (error) throw error;
    return data;
  },

  // Get low stock products
  async getLowStockProducts(farmerId: string, limit = 5) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('farmer_id', farmerId)
      .lte('quantity', supabase.rpc('get_min_stock_level'))
      .order('quantity', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};
