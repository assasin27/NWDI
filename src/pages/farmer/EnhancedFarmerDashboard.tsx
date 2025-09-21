import React, { useState, useCallback, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  IndianRupee, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  Clock, 
  BarChart3, 
  Plus, 
  Download, 
  Search,
  RefreshCw,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  DashboardCard, 
  DataTable, 
  StatsCard, 
  StatusBadge,
  OrderStatusBadge,
  StockStatusBadge
} from '@/components/dashboard';
import { ApiService } from '@/lib/apiService';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// Types
type TimeRange = '24h' | '7days' | '30days' | '90days' | 'all';

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  unit?: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  revenueChange: number;
  ordersChange: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
  product_name: string;
  quantity: number;
  price: number;
}

interface StockAlert {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  alert_type: 'low_stock' | 'out_of_stock';
  created_at: string;
  is_resolved: boolean;
  message: string;
  unit: string;
}

// Constants
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface EnhancedFarmerDashboardProps {
  tab?: 'dashboard' | 'inventory' | 'orders';
}

const apiService = new ApiService();

const EnhancedFarmerDashboard: React.FC<EnhancedFarmerDashboardProps> = ({ tab = 'dashboard' }) => {
  // Navigation and state management
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ 
    key: string; 
    direction: 'asc' | 'desc' 
  } | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');

  // Default dashboard stats
  const defaultStats: DashboardStats = {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    revenueChange: 0,
    ordersChange: 0
  };

  // Fetch dashboard stats
  const { 
    data: dashboardStats = defaultStats, 
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery<DashboardStats, Error>({
    queryKey: ['dashboardStats', timeRange],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        // Get current user ID from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Fetch orders for the current user (farmer)
        const { data: orders = [], error: ordersError } = await supabase
          .from('orders')
          .select('*, order_items(*, products(*))')
          .eq('seller_id', user.id);

        if (ordersError) throw ordersError;

        // Fetch products for the current user (farmer)
        const { data: products = [], error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id);

        if (productsError) throw productsError;

        // Calculate stats
        const totalRevenue = orders
          .filter(order => order.status === 'delivered')
          .reduce((sum, order) => sum + (order.total_amount || 0), 0);

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
        const totalProducts = products.length;
        
        const lowStockItems = products.filter(p => 
          p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level
        ).length;
        
        const outOfStockItems = products.filter(p => p.stock_quantity === 0).length;

        // Calculate changes (simplified for example)
        const revenueChange = 0; // You would calculate this based on previous period
        const ordersChange = 0;  // You would calculate this based on previous period

        return {
          totalRevenue,
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalProducts,
          lowStockItems,
          outOfStockItems,
          revenueChange,
          ordersChange
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard stats');
        return defaultStats;
      }
    },
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL
  });

  // Fetch recent orders
  const { 
    data: recentOrders = [], 
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery<RecentOrder[], Error>({
    queryKey: ['recentOrders', timeRange],
    queryFn: async (): Promise<RecentOrder[]> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, products(*))')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        toast.error('Failed to load recent orders');
        return [];
      }
    },
    staleTime: REFRESH_INTERVAL,
  });

  // Fetch stock alerts
  const { 
    data: stockAlerts = [],
    isLoading: isLoadingAlerts,
    error: alertsError,
    refetch: refetchAlerts
  } = useQuery<StockAlert[], Error>({
    queryKey: ['stockAlerts'],
    queryFn: async (): Promise<StockAlert[]> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id);

        if (productsError) throw productsError;

        // Generate stock alerts based on product stock levels
        const alerts: StockAlert[] = [];
        
        products.forEach(product => {
          if (product.stock_quantity === 0) {
            alerts.push({
              id: `out-${product.id}`,
              product_id: product.id,
              product_name: product.name,
              current_stock: product.stock_quantity,
              min_stock_level: product.min_stock_level,
              max_stock_level: product.max_stock_level,
              alert_type: 'out_of_stock',
              created_at: new Date().toISOString(),
              is_resolved: false,
              message: `${product.name} is out of stock`,
              unit: product.unit || 'units'
            });
          } else if (product.stock_quantity <= product.min_stock_level) {
            alerts.push({
              id: `low-${product.id}`,
              product_id: product.id,
              product_name: product.name,
              current_stock: product.stock_quantity,
              min_stock_level: product.min_stock_level,
              max_stock_level: product.max_stock_level,
              alert_type: 'low_stock',
              created_at: new Date().toISOString(),
              is_resolved: false,
              message: `${product.name} is low in stock (${product.stock_quantity} ${product.unit || 'units'} remaining)`,
              unit: product.unit || 'units'
            });
          }
        });

        return alerts;
      } catch (error) {
        console.error('Error fetching stock alerts:', error);
        toast.error('Failed to load stock alerts');
        return [];
      }
    },
    staleTime: REFRESH_INTERVAL,
  });

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchOrders(),
        refetchAlerts()
      ]);
      toast.success('Dashboard refreshed');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchStats, refetchOrders, refetchAlerts]);

  // Handle search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle time range change
  const handleTimeRangeChange = useCallback((value: string) => {
    setTimeRange(value as TimeRange);
  }, []);

  // Handle sort
  const handleSort = useCallback((key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...recentOrders];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.customer_name.toLowerCase().includes(query) ||
        order.customer_email.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        if (a[key as keyof RecentOrder] < b[key as keyof RecentOrder]) {
          return direction === 'asc' ? -1 : 1;
        }
        if (a[key as keyof RecentOrder] > b[key as keyof RecentOrder]) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [recentOrders, searchQuery, sortConfig]);

  // Handle error states
  if (statsError || ordersError || alertsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">
            {statsError?.message || ordersError?.message || alertsError?.message}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingStats || isLoadingOrders || isLoadingAlerts) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  // Render the dashboard
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Farmer Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your farm today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(dashboardStats.totalRevenue)}
            description={`${dashboardStats.revenueChange >= 0 ? '+' : ''}${dashboardStats.revenueChange}% from last period`}
            icon={<IndianRupee />}
            trend={{ value: `${dashboardStats.revenueChange >= 0 ? '+' : ''}${dashboardStats.revenueChange}%`, isPositive: dashboardStats.revenueChange >= 0 }}
          />
          <StatsCard
            title="Total Orders"
            value={dashboardStats.totalOrders.toString()}
            description={`${dashboardStats.ordersChange >= 0 ? '+' : ''}${dashboardStats.ordersChange}% from last period`}
            icon={<ShoppingCart />}
            trend={{ value: `${dashboardStats.ordersChange >= 0 ? '+' : ''}${dashboardStats.ordersChange}%`, isPositive: dashboardStats.ordersChange >= 0 }}
          />
          <StatsCard
            title="Pending Orders"
            value={dashboardStats.pendingOrders.toString()}
            description={`${Math.round((dashboardStats.pendingOrders / dashboardStats.totalOrders) * 100) || 0}% of total`}
            icon={<Clock />}
            variant="warning"
          />
          <StatsCard
            title="Total Products"
            value={dashboardStats.totalProducts.toString()}
            description={`${dashboardStats.lowStockItems} low stock, ${dashboardStats.outOfStockItems} out of stock`}
            icon={<Package />}
            variant={dashboardStats.outOfStockItems > 0 ? 'error' : 'default'}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue={tab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    {recentOrders.length} orders found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredAndSortedOrders.length > 0 ? (
                      filteredAndSortedOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer_name} • {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                            <OrderStatusBadge status={order.status} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No orders found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" onClick={() => navigate('/farmer/orders')}>
                    View all orders <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Stock Alerts</CardTitle>
                  <CardDescription>
                    {stockAlerts.length} items need attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stockAlerts.length > 0 ? (
                      stockAlerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{alert.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {alert.message}
                            </p>
                            <div className="mt-2 w-full bg-secondary rounded-full h-2">
                              <div 
                                className={`h-full rounded-full ${
                                  alert.alert_type === 'out_of_stock' 
                                    ? 'bg-red-500' 
                                    : 'bg-yellow-500'
                                }`}
                                style={{
                                  width: `${Math.min(100, (alert.current_stock / alert.max_stock_level) * 100)}%`
                                }}
                              />
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/farmer/products/${alert.product_id}`)}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Restock
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
                        <p className="text-muted-foreground">All products are well stocked</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/farmer/products')}
                  >
                    Manage Inventory
                  </Button>
                  {stockAlerts.length > 5 && (
                    <Button 
                      variant="ghost"
                      onClick={() => navigate('/farmer/inventory/alerts')}
                    >
                      View All Alerts
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <DashboardCard 
              title="Stock Alerts"
              description="Manage your inventory items that need attention"
              action={{
                label: 'Add Product',
                icon: <Plus />,
                onClick: () => navigate('/farmer/products/new')
              }}
            >
              <DataTable
                columns={[
                  {
                    id: 'product',
                    header: 'Product',
                    cell: (alert: StockAlert) => (
                      <div>
                        <p className="font-medium">{alert.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.current_stock} {alert.unit} remaining
                        </p>
                      </div>
                    ),
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (alert: StockAlert) => (
                      <StatusBadge 
                        status={alert.alert_type === 'out_of_stock' ? 'out_of_stock' : 'low_stock'}
                      />
                    ),
                  },
                  {
                    id: 'message',
                    header: 'Message',
                    cell: (alert: StockAlert) => alert.message,
                  },
                  {
                    id: 'action',
                    header: '',
                    cell: (alert: StockAlert) => (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/farmer/products/${alert.product_id}`)}
                      >
                        Manage
                      </Button>
                    ),
                    className: 'text-right',
                  },
                ]}
                data={stockAlerts}
                keyField="id"
                isLoading={isLoadingAlerts}
                emptyState={
                  <div className="text-center py-8">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                    <h3 className="text-lg font-medium">No stock alerts</h3>
                    <p className="text-muted-foreground">All your products are well stocked</p>
                    <Button className="mt-4" onClick={() => navigate('/farmer/products/new')}>
                      <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                  </div>
                }
              />
            </DashboardCard>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <DashboardCard 
              title="Recent Orders"
              description="View and manage your recent orders"
              action={{
                label: 'View All',
                icon: <ArrowUpRight />,
                onClick: () => navigate('/farmer/orders')
              }}
            >
              <DataTable
                columns={[
                  {
                    id: 'id',
                    header: 'Order ID',
                    cell: (order: RecentOrder) => `#${order.id.slice(0, 8)}`,
                    sortable: true,
                  },
                  {
                    id: 'customer_name',
                    header: 'Customer',
                    cell: (order: RecentOrder) => (
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                      </div>
                    ),
                    sortable: true,
                  },
                  {
                    id: 'total_amount',
                    header: 'Amount',
                    cell: (order: RecentOrder) => formatCurrency(order.total_amount),
                    sortable: true,
                    className: 'text-right',
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (order: RecentOrder) => <OrderStatusBadge status={order.status} />,
                    sortable: true,
                  },
                  {
                    id: 'created_at',
                    header: 'Date',
                    cell: (order: RecentOrder) => formatDate(order.created_at),
                    sortable: true,
                  },
                ]}
                data={recentOrders}
                keyField="id"
                isLoading={isLoadingOrders}
                emptyState={
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No orders yet</h3>
                    <p className="text-muted-foreground">Your recent orders will appear here</p>
                  </div>
                }
              />
            </DashboardCard>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Coming soon. View your sales and performance analytics here.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">This feature is coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedFarmerDashboard;
