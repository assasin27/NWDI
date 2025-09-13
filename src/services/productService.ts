import { ApiClient } from './apiClient';
import { supabase } from '@/lib/supabase';
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

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalValue: number;
}

interface IProductService {
  getProducts(farmerId: string, options?: PaginationOptions): Promise<PaginatedResponse<Product>>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(productData: ProductFormData & { farmer_id: string }): Promise<Product>;
  updateProduct(id: string, updates: Partial<ProductFormData | Product>): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  uploadImage(file: File, path: string): Promise<string>;
  subscribeToProducts(
    farmerId: string,
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: any;
      old?: any;
    }) => void
  ): () => void;
  getProductStats(farmerId: string): Promise<ProductStats>;
  getLowStockProducts(farmerId: string, limit?: number): Promise<Product[]>;
}

export class ProductService implements IProductService {
  private readonly db;

  constructor(private readonly apiClient: ApiClient) {
    this.db = supabase;
  }

  public async getProducts(
    farmerId: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResponse<Product>> {
    const {
      search = '',
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    try {
      let query = this.db
        .from('products')
        .select('*', { count: 'exact' })
        .eq('farmer_id', farmerId);

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  public async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await this.db
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  public async createProduct(productData: ProductFormData & { farmer_id: string }): Promise<Product> {
    try {
      const { data, error } = await this.db
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
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  public async updateProduct(id: string, updates: Partial<ProductFormData | Product>): Promise<Product> {
    try {
      const updateData = { ...updates };
      
      if ('price' in updateData && updateData.price !== undefined) {
        updateData.price = parseFloat(updateData.price as unknown as string);
      }
      
      const { data, error } = await this.db
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
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  public async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await this.db
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  public async uploadImage(file: File, path: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await this.db.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = this.db.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  public subscribeToProducts(
    farmerId: string, 
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: any;
      old?: any;
    }) => void
  ): () => void {
    const subscription = this.db
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

    return () => subscription.unsubscribe();
  }

  public async getProductStats(farmerId: string): Promise<ProductStats> {
    try {
      const { data, error } = await this.db
        .rpc('get_farmer_product_stats', { farmer_id: farmerId })
        .single();

      if (error) throw error;
      
      return {
        totalProducts: data.total_products || 0,
        activeProducts: data.active_products || 0,
        lowStockProducts: data.low_stock_products || 0,
        totalValue: data.total_value || 0
      };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw error;
    }
  }

  public async getLowStockProducts(farmerId: string, limit = 5): Promise<Product[]> {
    try {
      const { data, error } = await this.db
        .from('products')
        .select('*')
        .eq('farmer_id', farmerId)
        .lte('quantity', this.db.rpc('get_min_stock_level'))
        .order('quantity', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }
}
