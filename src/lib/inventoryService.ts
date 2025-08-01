import { supabase } from "../integrations/supabase/supabaseClient";

export interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  unit: string;
  last_updated: string;
  supplier_id?: string;
  cost_price: number;
  selling_price: number;
  location?: string;
  expiry_date?: string;
}

export interface StockAlert {
  id: string;
  product_id: string;
  product_name: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'expiry_warning';
  message: string;
  current_stock: number;
  created_at: string;
  is_resolved: boolean;
}

// Helper function to check if table exists
const isTableNotFoundError = (error: { code?: string; message?: string }): boolean => {
  return error?.code === '42P01' || 
         error?.message?.includes('does not exist') ||
         error?.message?.includes('relation');
};

export const inventoryService = {
  // Get all inventory items
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Inventory table does not exist yet. Returning empty array.');
          return [];
        }
        console.error('Error fetching inventory items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      return [];
    }
  },

  // Get inventory item by product ID
  async getInventoryItem(productId: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Inventory table does not exist yet.');
          return null;
        }
        console.error('Error fetching inventory item:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      return null;
    }
  },

  // Update stock quantity
  async updateStock(productId: string, quantity: number, operation: 'add' | 'subtract'): Promise<boolean> {
    try {
      // Get current inventory item
      const currentItem = await this.getInventoryItem(productId);
      if (!currentItem) {
        console.error('Inventory item not found for product:', productId);
        return false;
      }

      let newStock = currentItem.current_stock;
      if (operation === 'add') {
        newStock += quantity;
      } else if (operation === 'subtract') {
        newStock = Math.max(0, newStock - quantity);
      }

      // Update inventory
      const { error } = await supabase
        .from('inventory')
        .update({
          current_stock: newStock,
          last_updated: new Date().toISOString()
        })
        .eq('product_id', productId);

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Inventory table does not exist yet. Cannot update stock.');
          return false;
        }
        console.error('Error updating stock:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      return false;
    }
  },

  // Add new inventory item
  async addInventoryItem(item: Omit<InventoryItem, 'id' | 'last_updated'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('inventory')
        .insert({
          ...item,
          last_updated: new Date().toISOString()
        });

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Inventory table does not exist yet. Cannot add item.');
          return false;
        }
        console.error('Error adding inventory item:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      return false;
    }
  },

  // Update inventory item
  async updateInventoryItem(productId: string, updates: Partial<InventoryItem>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          ...updates,
          last_updated: new Date().toISOString()
        })
        .eq('product_id', productId);

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Inventory table does not exist yet. Cannot update item.');
          return false;
        }
        console.error('Error updating inventory item:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      return false;
    }
  },

  // Check and create stock alerts
  async checkStockAlerts(productId: string, currentStock: number, minStockLevel: number): Promise<void> {
    try {
      // Check if stock is low
      if (currentStock <= minStockLevel) {
        const alertType = currentStock === 0 ? 'out_of_stock' : 'low_stock';
        const message = currentStock === 0 
          ? `Product is out of stock` 
          : `Stock is low (${currentStock} remaining)`;

        await this.createStockAlert({
          product_id: productId,
          product_name: '', // Will be filled by the calling function
          alert_type: alertType,
          message,
          current_stock: currentStock,
          is_resolved: false
        });
      }
    } catch (error) {
      console.error('Error checking stock alerts:', error);
    }
  },

  // Create stock alert
  async createStockAlert(alert: Omit<StockAlert, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .insert({
          ...alert,
          created_at: new Date().toISOString()
        });

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Stock alerts table does not exist yet. Cannot create alert.');
          return false;
        }
        console.error('Error creating stock alert:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating stock alert:', error);
      return false;
    }
  },

  // Get stock alerts
  async getStockAlerts(resolved?: boolean): Promise<StockAlert[]> {
    try {
      let query = supabase
        .from('stock_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (resolved !== undefined) {
        query = query.eq('is_resolved', resolved);
      }

      const { data, error } = await query;

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Stock alerts table does not exist yet. Returning empty array.');
          return [];
        }
        console.error('Error fetching stock alerts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      return [];
    }
  },

  // Resolve stock alert
  async resolveStockAlert(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .update({ is_resolved: true })
        .eq('id', alertId);

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Stock alerts table does not exist yet. Cannot resolve alert.');
          return false;
        }
        console.error('Error resolving stock alert:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error resolving stock alert:', error);
      return false;
    }
  },

  // Get low stock items
  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .lt('current_stock', supabase.raw('min_stock_level'))
        .order('last_updated', { ascending: false });

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Inventory table does not exist yet. Returning empty array.');
          return [];
        }
        console.error('Error fetching low stock items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return [];
    }
  },

  // Get out of stock items
  async getOutOfStockItems(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('current_stock', 0)
        .order('last_updated', { ascending: false });

      if (error) {
        if (isTableNotFoundError(error)) {
          console.log('Inventory table does not exist yet. Returning empty array.');
          return [];
        }
        console.error('Error fetching out of stock items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching out of stock items:', error);
      return [];
    }
  },

  // Get inventory summary
  async getInventorySummary(): Promise<{
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
  }> {
    try {
      const items = await this.getInventoryItems();
      const lowStockItems = await this.getLowStockItems();
      const outOfStockItems = await this.getOutOfStockItems();

      const totalValue = items.reduce((sum, item) => {
        return sum + (item.current_stock * item.selling_price);
      }, 0);

      return {
        totalItems: items.length,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length,
        totalValue
      };
    } catch (error) {
      console.error('Error getting inventory summary:', error);
      return {
        totalItems: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        totalValue: 0
      };
    }
  },

  // Bulk update inventory
  async bulkUpdateInventory(updates: Array<{
    productId: string;
    quantity: number;
    operation: 'add' | 'subtract';
  }>): Promise<boolean> {
    try {
      for (const update of updates) {
        await this.updateStock(update.productId, update.quantity, update.operation);
      }
      return true;
    } catch (error) {
      console.error('Error bulk updating inventory:', error);
      return false;
    }
  },

  // Export inventory report
  async exportInventoryReport(): Promise<string> {
    try {
      const items = await this.getInventoryItems();
      const summary = await this.getInventorySummary();

      const csvData = [
        ['Product ID', 'Product Name', 'Current Stock', 'Min Stock Level', 'Max Stock Level', 'Unit', 'Cost Price', 'Selling Price', 'Location', 'Last Updated'],
        ...items.map(item => [
          item.product_id,
          item.product_name,
          item.current_stock.toString(),
          item.min_stock_level.toString(),
          item.max_stock_level.toString(),
          item.unit,
          item.cost_price.toString(),
          item.selling_price.toString(),
          item.location || '',
          item.last_updated
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return 'Inventory report exported successfully';
    } catch (error) {
      console.error('Error exporting inventory report:', error);
      return 'Failed to export inventory report';
    }
  }
}; 