import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { ApiService } from '@/lib/apiService';
const apiService = new ApiService();
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/supabaseClient';

// Types
type TimeRange = '24h' | '7days' | '30days' | '90days' | 'all';

interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

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
    data: dashboardStatsData = defaultStats, 
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery<DashboardStats, Error>({
    queryKey: ['dashboardStats', timeRange],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Fetch orders for the current user (farmer)
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*, order_items(*, products(*))')
          .eq('seller_id', user.id);

        if (ordersError) throw ordersError;

        // Fetch products for the current user (farmer)
        const { data: products, error: productsError } = await supabase
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
        const outOfStockItems = products.filter(p => p.stock_quantity <= 0).length;

        return {
          totalRevenue,
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalProducts,
          lowStockItems,
          outOfStockItems,
          revenueChange: 0, // Implement based on time range
          ordersChange: 0   // Implement based on time range
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

  // Process data with proper null checks
  const stats = dashboardStatsData || defaultStats;

  // Fetch recent orders
  const { 
    data: recentOrders, 
    isLoading: isLoadingOrders,
    error: ordersError
  } = useQuery<RecentOrder[], Error>({
    queryKey: ['recentOrders', timeRange],
    queryFn: async (): Promise<RecentOrder[]> => {
      try {
        // Get current user ID from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get recent orders for the current farmer with order items and customer info
        const { data: orders, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(
              *,
              products(*)
            ),
            user_profiles!orders_user_id_fkey(
              full_name,
              email
            )
          `)
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        // Transform the orders to match the RecentOrder type
        return (orders || []).map((order: any) => ({
          id: order.id,
          customer_name: order.user_profiles?.full_name || 'Customer',
          customer_email: order.user_profiles?.email || '',
          total_amount: order.total_amount || 0,
          status: order.status || 'pending',
          created_at: order.created_at,
          items: (order.order_items || []).map((item: any) => ({
            product_name: item.products?.name || 'Unknown Product',
            quantity: item.quantity || 0,
            price: item.price || 0
          }))
        }));
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        toast.error('Failed to load recent orders');
        return [];
      }
    },
    staleTime: REFRESH_INTERVAL,
  });

  // Fetch stock alerts
  // Fetch stock alerts for the farmer's products
  const { 
    data: stockAlerts = [],
    isLoading: isLoadingAlerts,
    error: alertsError
  } = useQuery<StockAlert[]>({
    queryKey: ['stockAlerts'],
    queryFn: async (): Promise<StockAlert[]> => {
      try {
        // Get current user ID from Supabase auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('User not authenticated');

        // Fetch products that are low or out of stock for the current farmer
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            stock_quantity,
            min_stock_level,
            max_stock_level,
            unit,
            updated_at
          `)
          .eq('seller_id', user.id)
          .or('stock_quantity.lte.5,stock_quantity.eq.0')
          .order('stock_quantity', { ascending: true });

        if (productsError) throw productsError;

        // Transform products to stock alerts
        return (products || []).map((product): StockAlert => {
          const isOutOfStock = (product.stock_quantity || 0) <= 0;
          const minStock = product.min_stock_level || 5;
          const currentStock = product.stock_quantity || 0;
          
          return {
            id: `alert-${product.id}-${Date.now()}`,
            product_id: product.id,
            product_name: product.name,
            current_stock: currentStock,
            min_stock_level: minStock,
            max_stock_level: product.max_stock_level || 100,
            alert_type: isOutOfStock ? 'out_of_stock' : 'low_stock',
            created_at: product.updated_at || new Date().toISOString(),
            is_resolved: false,
            message: isOutOfStock
              ? `${product.name} is out of stock`
              : `${product.name} is running low (${currentStock} ${product.unit || 'units'} remaining)`,
            unit: product.unit || 'units'
          };
        });
      } catch (error) {
        console.error('Error fetching stock alerts:', error);
        toast.error('Failed to load stock alerts');
        return [];
      }
    },
    staleTime: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    retry: 2
  });

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }),
        queryClient.invalidateQueries({ queryKey: ['recentOrders'] }),
        queryClient.invalidateQueries({ queryKey: ['stockAlerts'] })
      ]);
      toast.success('Dashboard data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  // Handle sort
  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Define columns for recent orders table with proper typing
  const orderColumns = useMemo(() => [
    {
      id: 'orderId',
      header: 'Order ID',
      accessorKey: 'id',
      cell: (info: any) => (
        <div className="font-medium">#{info.getValue().substring(0, 8)}</div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorKey: 'customer_name',
      cell: (info: any) => info.getValue() || 'Guest',
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'created_at',
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'total_amount',
      cell: (info: any) => `$${Number(info.getValue()).toFixed(2)}`,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => (
        <StatusBadge status={info.getValue()} />
      ),
    },
  ] as const, []);

  // Stock alerts columns are defined below

  // Filter and sort recent orders
  const sortedAndFilteredOrders = useMemo(() => {
    if (!recentOrders) return [];
    
    let result = [...recentOrders];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        (order.customer_name?.toLowerCase() || '').includes(query) ||
        (order.customer_email?.toLowerCase() || '').includes(query) ||
        (order.status?.toLowerCase() || '').includes(query) ||
        (order.id?.toLowerCase() || '').includes(query)
      );
    }
    
    // Apply sorting if sortConfig is provided
    if (sortConfig) {
      return [...orders].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === undefined || bValue === undefined) return 0;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return orders;
  }, [recentOrders, searchQuery, sortConfig]);

  // Handle error states
  useEffect(() => {
    const error = statsError || ordersError || alertsError;
    if (error) {
      toast.error(error.message || 'An error occurred while loading data');
    }
  }, [statsError, ordersError, alertsError]);

  // Recent orders columns
  const recentOrderColumns = useMemo(() => [
    {
      id: 'id',
      header: 'Order ID',
      cell: (order: RecentOrder) => (
        <span className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
      ),
      sortable: true,
    },
    {
      id: 'customer_name',
      header: 'Customer',
      cell: (order: RecentOrder) => (
        <div>
          <div className="font-medium">{order.customer_name}</div>
          <div className="text-sm text-muted-foreground">{order.customer_email}</div>
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
      cell: (order: RecentOrder) => formatDate(order.created_at, { month: 'short', day: 'numeric' }),
      sortable: true,
    },
  ], []);

  // Stock alerts columns
  const stockAlertColumns = useMemo(() => [
    {
      id: 'product_name',
      header: 'Product',
      cell: (alert: StockAlert) => (
        <div>
          <div className="font-medium">{alert.product_name}</div>
          <div className="text-sm text-muted-foreground">
            Stock: {alert.current_stock} {alert.unit}
          </div>
        </div>
      ),
    },
    {
      id: 'alert_type',
      header: 'Status',
      cell: (alert: StockAlert) => (
        <StockStatusBadge 
          status={alert.alert_type} 
          className={alert.alert_type === 'out_of_stock' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (alert: StockAlert) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/farmer/products/${alert.product_id}`)}
        >
          View Product
        </Button>
      ),
    },
  ], [navigate]);

  // Loading state
  if (isLoadingStats && !dashboardStatsData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCard 
              key={i}
              title="Loading..."
              value="0"
              description="Loading..."
              icon={<div className="h-5 w-5 bg-muted rounded-full" />}
              isLoading
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  const hasError = statsError || ordersError || alertsError;
  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Error Loading Dashboard
            </CardTitle>
            <CardDescription>
              {statsError?.message || ordersError?.message || alertsError?.message || 'Failed to load dashboard data. Please try again.'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Farmer Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! Here's what's happening with your farm today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
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
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            description={`${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}% from last period`}
            icon={<IndianRupee className="h-4 w-4" />}
            trend={{
              value: `${stats.revenueChange}%`,
              isPositive: stats.revenueChange >= 0,
            }}
            isLoading={isLoadingStats}
          />
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders.toString()}
            description={`${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange}% from last period`}
            icon={<ShoppingCart className="h-4 w-4" />}
            trend={{
              value: `${stats.ordersChange}%`,
              isPositive: stats.ordersChange >= 0,
            }}
            isLoading={isLoadingStats}
          />
          <StatsCard
            title="Pending Orders"
            value={stats.pendingOrders.toString()}
            description={`${stats.pendingOrders} waiting for processing`}
            icon={<Clock className="h-4 w-4" />}
            isLoading={isLoadingStats}
          />
          <StatsCard
            title="Stock Alerts"
            value={(stats.lowStockItems + stats.outOfStockItems).toString()}
            description={`${stats.lowStockItems} low, ${stats.outOfStockItems} out of stock`}
            icon={<AlertTriangle className="h-4 w-4" />}
            isLoading={isLoadingStats}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/farmer/orders')}>
                View All Orders
              </Button>
              <Button onClick={() => navigate('/farmer/products/add')} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Recent Orders Card */}
              <DashboardCard 
                title="Recent Orders"
                description="Latest orders from your customers"
                className="col-span-4"
                action={{
                  label: 'View all orders',
                  onClick: () => navigate('/farmer/orders'),
                }}
                isLoading={isLoadingOrders}
                loadingSkeleton={
                  <Card className="col-span-4 h-[400px] animate-pulse">
                    <CardHeader>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full mb-2 rounded-lg" />
                      ))}
                    </CardContent>
                  </Card>
                }
              >
                {recentOrders.length > 0 ? (
                  <DataTable
                    columns={orderColumns}
                    data={recentOrders.slice(0, 5)}
                    keyField="id"
                    onRowClick={(order) => navigate(`/farmer/orders/${order.id}`)}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    rowClassName="hover:bg-accent/50 cursor-pointer"
                  />
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No recent orders</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/farmer/products')}>
                      Add Products
                    </Button>
                  </div>
                )}
              </DashboardCard>

              {/* Stock Alerts Card */}
              <DashboardCard 
                title="Stock Alerts"
                description="Items that need attention"
                className="col-span-3"
                action={{
                  label: 'Manage inventory',
                  onClick: () => navigate('/farmer/inventory'),
                }}
                isLoading={isLoadingAlerts}
                loadingSkeleton={
                  <Card className="col-span-3 h-[400px] animate-pulse">
                    <CardHeader>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full mb-3 rounded-lg" />
                      ))}
                    </CardContent>
                  </Card>
                }
              >
                {stockAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {stockAlerts.slice(0, 5).map((alert) => (
                      <div 
                        key={alert.id}
                        className={`p-3 border rounded-lg ${
                          alert.alert_type === 'out_of_stock' 
                            ? 'bg-red-50 border-red-100' 
                            : 'bg-yellow-50 border-yellow-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-full ${
                            alert.alert_type === 'out_of_stock' 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{alert.product_name}</p>
                            <p className={`text-sm ${
                              alert.alert_type === 'out_of_stock' 
                                ? 'text-red-700' 
                                : 'text-yellow-700'
                            }`}>
                              {alert.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>Stock: {alert.current_stock} {alert.unit}</span>
                              <span>•</span>
                              <span>Min: {alert.min_stock_level} {alert.unit}</span>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-7" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/farmer/products/${alert.product_id}`);
                            }}
                          >
                            Restock
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                    <p className="text-muted-foreground">No stock alerts</p>
                    <p className="text-xs text-muted-foreground mt-1">All products are well stocked</p>
                  </div>
                )}
              </DashboardCard>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <DashboardCard 
              title="Recent Orders"
              description="View and manage your recent orders"
            >
              <DataTable
                columns={orderColumns}
                data={sortedAndFilteredOrders}
                keyField="id"
                onRowClick={(order) => navigate(`/farmer/orders/${order.id}`)}
                sortConfig={sortConfig}
                onSort={handleSort}
                isLoading={isLoadingOrders}
                emptyState={
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No orders found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? 'Try a different search term' : 'Start selling to see orders here'}
                    </p>
                  </div>
                }
              />
            </DashboardCard>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <DashboardCard 
              title="Stock Alerts"
              description="Manage your inventory items that need attention"
              action={{
                label: 'View all inventory',
                onClick: () => navigate('/farmer/inventory'),
              }}
            >
              <DataTable
                columns={stockAlertColumns}
                data={stockAlerts}
                keyField="id"
                onRowClick={(alert) => navigate(`/farmer/products/${alert.product_id}`)}
                isLoading={isLoadingAlerts}
                emptyState={
                  <div className="text-center py-8">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                    <p className="text-muted-foreground">No stock alerts</p>
                    <p className="text-sm text-muted-foreground mt-1">All products are well stocked</p>
                  </div>
                }
              />
            </DashboardCard>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <DashboardCard 
              title="Sales Analytics"
              description="Track your sales performance and trends"
            >
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Sales analytics coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Track your sales performance with detailed analytics
                  </p>
                </div>
              </div>
            </DashboardCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedFarmerDashboard;
