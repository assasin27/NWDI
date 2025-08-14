import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  IndianRupee,
  Package,
  ShoppingCart,
  AlertTriangle,
  Clock,
  BarChart3,
  Settings,
  Plus,
  Download,
  LogOut
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { apiService, ApiResponse } from '../../lib/apiService';
import { supabase } from '../../integrations/supabase/supabaseClient';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

interface InventoryItem {
  id: string;
  product_name: string;
  description: string;
  category: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  selling_price: number;
  unit: string;
  image_url: string;
  last_updated: string;
}

interface StockAlert {
  id: string;
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  alert_type: string;
  created_at: string;
  is_resolved: boolean;
  message: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  image_url: string;
  min_stock_level: number;
  max_stock_level: number;
  unit: string;
  updated_at: string;
}

function FarmerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newProduct, setNewProduct] = useState<Partial<InventoryItem>>({
    product_name: '',
    description: '',
    category: '',
    current_stock: 0,
    min_stock_level: 10,
    selling_price: 0,
    unit: 'kg',
    image_url: '',
  });

  const validateForm = (product: Partial<InventoryItem>): boolean => {
    const errors: Record<string, string> = {};
    
    if (!product.product_name?.trim()) {
      errors.product_name = 'Product name is required';
    }
    if (product.current_stock === undefined || product.current_stock < 0) {
      errors.current_stock = 'Stock must be 0 or more';
    }
    if (!product.selling_price || product.selling_price <= 0) {
      errors.selling_price = 'Price must be greater than 0';
    }
    if (!product.category) {
      errors.category = 'Category is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduct = async () => {
    if (!validateForm(newProduct)) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await apiService.createProduct({
        name: newProduct.product_name || '',
        description: newProduct.description || '',
        category: newProduct.category || '',
        quantity: newProduct.current_stock || 0,
        price: newProduct.selling_price || 0,
        image_url: newProduct.image_url || '',
        min_stock_level: newProduct.min_stock_level || 10,
        unit: newProduct.unit || 'kg'
      });
      
      if (response.data) {
        await loadInventoryItems();
        setNewProduct({
          product_name: '',
          description: '',
          category: '',
          current_stock: 0,
          min_stock_level: 10,
          selling_price: 0,
          unit: 'kg',
          image_url: '',
        });
        setFormErrors({});
        toast.success('Product added successfully!');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (id: string) => {
    if (!editingProduct) return;
    
    if (!validateForm(editingProduct)) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await apiService.updateProduct(id, {
        name: editingProduct.product_name,
        description: editingProduct.description,
        category: editingProduct.category,
        quantity: editingProduct.current_stock,
        price: editingProduct.selling_price,
        image_url: editingProduct.image_url,
        min_stock_level: editingProduct.min_stock_level,
        unit: editingProduct.unit || 'kg'
      });
      
      if (response.data) {
        await loadInventoryItems();
        setEditingProduct(null);
        toast.success('Product updated successfully!');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await apiService.deleteProduct(id);
      if (response.data) {
        await loadInventoryItems();
        toast.success('Product deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. Please try again.');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadRecentOrders(),
        loadInventoryItems(),
        loadStockAlerts()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await apiService.updateOrder(orderId, { status });
      
      if (response && response.data) {
        await loadRecentOrders();
        await loadStats();
        toast.success('Order status updated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadStats = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Auth error:', userError);
        toast.error('You must be logged in to view dashboard stats');
        return;
      }

      // Get orders for this seller
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', user.id);

      if (ordersError) throw ordersError;

      // Calculate order stats
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length || 0;
      const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0;

      // Get products for this seller
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id);

      if (productsError) throw productsError;

      // Calculate product stats
      const totalProducts = products?.length || 0;
      const lowStockItems = products?.filter(p => (p.stock_quantity || 0) <= 10 && (p.stock_quantity || 0) > 0).length || 0;
      const outOfStockItems = products?.filter(p => (p.stock_quantity || 0) <= 0).length || 0;

      // Update stats state
      setStats({
        totalRevenue,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalProducts,
        lowStockItems,
        outOfStockItems
      });

    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const loadRecentOrders = async () => {
    try {
      const response = await apiService.getRecentOrders(10) as ApiResponse<RecentOrder[]>;
      if (response && response.data) {
        setRecentOrders(response.data);
      } else {
        console.error('Unexpected response format:', response);
        setRecentOrders([]);
      }
    } catch (error) {
      console.error('Error loading recent orders:', error);
      toast.error('Failed to load recent orders');
      setRecentOrders([]);
    }
  };

  const loadInventoryItems = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Auth error:', userError);
        toast.error('You must be logged in to view inventory');
        return;
      }

      // Fetch products with category name
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories (name)
        `)
        .eq('seller_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;

      // Map to InventoryItem type
      const items: InventoryItem[] = (products || []).map((product: any) => ({
        id: product.id,
        product_name: product.name || 'Unnamed Product',
        description: product.description || '',
        category: product.category?.name || 'Uncategorized',
        current_stock: product.stock_quantity || 0,
        min_stock_level: product.min_stock_level || 10,
        max_stock_level: product.max_stock_level || 100,
        selling_price: product.price || 0,
        unit: product.unit || 'unit',
        image_url: product.image_url || '',
        last_updated: product.updated_at || new Date().toISOString()
      }));

      setInventoryItems(items);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast.error('Failed to load inventory items');
    } 
    setInventoryItems([]);
  };

  const loadStockAlerts = async (): Promise<void> => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Auth error:', userError);
        toast.error('You must be logged in to view stock alerts');
        return;
      }

      // Fetch products that are low or out of stock for this seller
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .or(`stock_quantity.lte.min_stock_level,stock_quantity.is.null`)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;

      // Map to StockAlert type
      const alerts: StockAlert[] = (products || []).map((product: any) => {
        const stock = product.stock_quantity || 0;
        const minStock = product.min_stock_level || 10;
        const isOutOfStock = stock <= 0;
        
        return {
          id: `alert-${product.id}`,
          product_name: product.name || 'Unnamed Product',
          current_stock: stock,
          min_stock_level: minStock,
          alert_type: isOutOfStock ? 'out_of_stock' : 'low_stock',
          created_at: product.updated_at || new Date().toISOString(),
          is_resolved: false,
          message: isOutOfStock 
            ? `${product.name} is out of stock!`
            : `${product.name} is running low on stock (${stock} remaining, min: ${minStock})`
        };
      });
      
      setStockAlerts(alerts);
    } catch (error) {
      console.error('Error loading stock alerts:', error);
      toast.error('Failed to load stock alerts');
      setStockAlerts([]);
    }
  };

  const handleUpdateStock = async (productId: string, quantity: number, operation: 'add' | 'subtract'): Promise<void> => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Auth error:', userError);
        toast.error('You must be logged in to update stock');
        return;
      }

      // Get current product data
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('seller_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!product) {
        toast.error('Product not found');
        return;
      }

      // Calculate new stock quantity
      const currentStock = product.stock_quantity || 0;
      const newQuantity = operation === 'add'
        ? currentStock + quantity
        : Math.max(0, currentStock - quantity);

      // Update product in database
      const { error: updateError } = await supabase
        .from('products')
        .update({
          stock_quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('seller_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setInventoryItems(prev =>
        prev.map(item => {
          if (item.id !== productId) return item;
          const updatedItem = { 
            ...item, 
            current_stock: newQuantity,
            last_updated: new Date().toISOString() 
          };
          
          // Show appropriate toast message
          if (newQuantity <= 0) {
            toast.error(`${updatedItem.product_name} is out of stock!`);
          } else if (newQuantity <= (item.min_stock_level ?? 5)) {
            toast.warning(`Low stock alert for ${updatedItem.product_name}!`);
          } else {
            toast.success(`Updated stock for ${updatedItem.product_name}`);
          }
          
          return updatedItem;
        })
      );

      // Refresh related data
      await Promise.all([
        loadStockAlerts(),
        loadStats()
      ]);
      
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      // In a real app, you would call an API to resolve the alert
      // For now, we'll just remove it from the local state
      setStockAlerts(prev => prev.filter((alert: StockAlert) => alert.id !== alertId));
      toast.success('Alert resolved successfully');
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const exportInventoryReport = async () => {
    try {
      const response = await apiService.getProducts() as ApiResponse<any>;
      if (response.data) {
        const raw = Array.isArray(response.data)
          ? (response.data as any[])
          : ((response.data as any).results ?? []);
        const normalized = raw.map((p: any, idx: number) => ({
          id: String(p.id ?? p.product_id ?? p.uuid ?? `p-${Date.now()}-${idx}`),
          name: p.name ?? p.product_name ?? 'Unnamed Product',
          quantity: typeof p.quantity === 'number' ? p.quantity : (typeof p.current_stock === 'number' ? p.current_stock : 0),
          price: Number(p.price ?? p.selling_price ?? 0),
          category: (p.category && typeof p.category === 'object' ? p.category.name : p.category) ?? 'N/A',
          updated_at: p.updated_at ?? p.last_updated ?? new Date().toISOString(),
        }));
        // Create CSV content
        const headers = ['Product ID', 'Product Name', 'Current Stock', 'Price', 'Category', 'Last Updated'];
        const csvContent = [
          headers.join(','),
          ...normalized.map((product) => [
            product.id,
            product.name,
            product.quantity,
            product.price,
            product.category,
            product.updated_at
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting inventory report:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
      <div className="px-4 py-8">
      {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
            <p className="text-gray-600">Manage your products, orders, and inventory</p>
            </div>
          <div className="flex gap-4">
              <Button
                onClick={() => navigate('/farmer/add-product')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
              <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              {/* Removed duplicate Export Report button (export available in Inventory tab) */}
            <Button
                variant="outline"
              onClick={() => navigate('/farmer')}
              >
              <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-green-100 text-sm">All time earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-blue-100 text-sm">Orders received</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-yellow-100 text-sm">Active products</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockAlerts.length}</div>
              <p className="text-red-100 text-sm">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-gray-600">₹{order.total_amount}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                          >
                            Ship
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stock Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Stock Alerts
                  </CardTitle>
                  <CardDescription>Items needing attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stockAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium">{alert.product_name}</p>
                          <p className="text-sm text-red-600">{alert.message}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
          </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Manage and track all customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.customer_name} - {order.customer_email}</p>
                          <p className="text-sm text-gray-600">₹{order.total_amount}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.product_name} x {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>Manage product stock levels</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={exportInventoryReport}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                      <div>
                          <h3 className="font-semibold">{item.product_name}</h3>
                          <p className="text-sm text-gray-600">Current Stock: {item.current_stock} {item.unit}</p>
                          <p className="text-sm text-gray-600">Min Level: {item.min_stock_level}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStock(item.id, 1, 'add')}
                          >
                            +1
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStock(item.id, 1, 'subtract')}
                          >
                            -1
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStock(item.id, 10, 'add')}
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.current_stock <= item.min_stock_level
                              ? 'bg-red-500'
                              : item.current_stock <= item.min_stock_level * 2
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min((item.current_stock / item.max_stock_level) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Alerts</CardTitle>
                <CardDescription>Manage stock alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stockAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{alert.product_name}</h3>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                          <p className="text-sm text-gray-600">Current Stock: {alert.current_stock}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            alert.alert_type === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                            alert.alert_type === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {alert.alert_type.replace('_', ' ')}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
                <CardDescription>Configure your dashboard preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="refresh-interval">Auto Refresh Interval (minutes)</Label>
                    <Input
                      id="refresh-interval"
                      type="number"
                      defaultValue="5"
                      min="1"
                      max="60"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alert-threshold">Low Stock Alert Threshold</Label>
                    <Input
                      id="alert-threshold"
                      type="number"
                      defaultValue="10"
                      min="1"
                    />
            </div>
                  <Button className="w-full">
                    Save Settings
                  </Button>
        </div>
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>
      </div>
    </div>
    </>
  );
}

export default FarmerDashboard;