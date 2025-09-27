import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  IndianRupee,
  Package, 
  TrendingUp,
  Users,
  ShoppingCart,
  AlertTriangle,
  CheckCircle, 
  Clock,
  Truck,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  LogOut
} from 'lucide-react';
import { apiService } from '../../lib/apiService';

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

const FarmerDashboard: React.FC = () => {
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
interface InventoryItem {
  id: string;
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  selling_price: number;
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
}

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      await loadStats();
      
      // Load recent orders
      await loadRecentOrders();
      
      // Load inventory items
      await loadInventoryItems();
      
      // Load stock alerts
      await loadStockAlerts();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadStats = async () => {
    try {
      // Get orders statistics
      const ordersResponse = await apiService.getOrders();
      
      if (ordersResponse.data) {
        const orders = ordersResponse.data;
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
        const totalOrders = orders.length;
        const pendingOrders = orders.filter((o: any) => ['pending', 'confirmed', 'processing'].includes(o.status)).length;
        const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;

        setStats(prev => ({
          ...prev,
          totalRevenue,
          totalOrders,
          pendingOrders,
          deliveredOrders
        }));
      }

      // Get products statistics
      const productsResponse = await apiService.getProducts();
      
      if (productsResponse.data) {
        const products = productsResponse.data;
        const totalProducts = products.length;
        const lowStockItems = products.filter((p: any) => p.quantity <= 10).length;
        const outOfStockItems = products.filter((p: any) => p.quantity === 0).length;

        setStats(prev => ({
          ...prev,
          totalProducts,
          lowStockItems,
          outOfStockItems
        }));
      }

    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const response = await apiService.getRecentOrders(10);
      if (response.data) {
        setRecentOrders(response.data);
      }
    } catch (error) {
      console.error('Error loading recent orders:', error);
    }
  };

  const loadInventoryItems = async () => {
    try {
      const response = await apiService.getProducts();
      if (response.data) {
        // Transform products to inventory items format
        const items = response.data.map((product: any) => ({
          id: product.id,
          product_name: product.name,
          current_stock: product.quantity,
          min_stock_level: 10, // Default minimum stock level
          selling_price: product.price,
          last_updated: product.updated_at
        }));
        setInventoryItems(items);
      }
    } catch (error) {
      console.error('Error loading inventory items:', error);
    }
  };

  const loadStockAlerts = async () => {
    try {
      const response = await apiService.getProducts();
      if (response.data) {
        // Create stock alerts based on low stock products
        const alerts = response.data
          .filter((product: any) => product.quantity <= 10)
          .map((product: any) => ({
            id: product.id,
            product_name: product.name,
            current_stock: product.quantity,
            min_stock_level: 10,
            alert_type: product.quantity === 0 ? 'out_of_stock' : 'low_stock',
            created_at: product.updated_at,
            is_resolved: false
          }));
        setStockAlerts(alerts);
      }
    } catch (error) {
      console.error('Error loading stock alerts:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await apiService.updateOrder(orderId, { status });
      
      if (response.data) {
        await loadRecentOrders();
        await loadStats();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleUpdateStock = async (productId: string, quantity: number, operation: 'add' | 'subtract') => {
    try {
      // Get current product
      const productResponse = await apiService.getProduct(productId);
      if (productResponse.data) {
        const currentQuantity = productResponse.data.quantity;
        const newQuantity = operation === 'add' ? currentQuantity + quantity : Math.max(0, currentQuantity - quantity);
        
        const response = await apiService.updateProduct(productId, { quantity: newQuantity });
        if (response.data) {
          await loadInventoryItems();
          await loadStockAlerts();
          await loadStats();
        }
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      // For now, just reload stock alerts
      // In a real implementation, you might want to mark alerts as resolved in the database
      await loadStockAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const exportInventoryReport = async () => {
    try {
      const response = await apiService.getProducts();
      if (response.data) {
        // Create CSV content
        const headers = ['Product ID', 'Product Name', 'Current Stock', 'Price', 'Category', 'Last Updated'];
        const csvContent = [
          headers.join(','),
          ...response.data.map((product: any) => [
            product.id,
            product.name,
            product.quantity,
            product.price,
            product.category?.name || 'N/A',
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
      <div className="px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
      {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
            <p className="text-gray-600 text-sm lg:text-base">Manage your products, orders, and inventory</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 w-full lg:w-auto">
            <Button
              onClick={() => navigate('/farmer/add-product')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button
              variant="outline"
              onClick={exportInventoryReport}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/farmer')}
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                <IndianRupee className="h-4 w-4 lg:h-5 lg:w-5" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-green-100 text-xs lg:text-sm">All time earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-blue-100 text-xs lg:text-sm">Orders received</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                <Package className="h-4 w-4 lg:h-5 lg:w-5" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-yellow-100 text-xs lg:text-sm">Active products</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5" />
                Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">{stockAlerts.length}</div>
              <p className="text-red-100 text-xs lg:text-sm">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Inventory</span>
              <span className="sm:hidden">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Alerts</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
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
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>Manage product stock levels</CardDescription>
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
                            onClick={() => handleUpdateStock(item.product_id, 1, 'add')}
                          >
                            +1
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStock(item.product_id, 1, 'subtract')}
                          >
                            -1
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStock(item.product_id, 10, 'add')}
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
  );
};

export default FarmerDashboard; 