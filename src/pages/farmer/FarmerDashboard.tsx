import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  OrderStatus, 
  DateRange, 
  FarmerDashboardStats,
  Product,
  Order,
  SalesAnalytics,
  InventoryAnalytics,
  CustomerAnalytics
} from '@/types/farmer';
import {
  useFarmerStats,
  useFarmerProducts,
  useFarmerOrders,
  useFarmerAnalytics
} from '@/hooks/useFarmer';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Main dashboard content component
const FarmerDashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Convert date range to required format
  const dateRangeParam: DateRange | undefined = dateRange[0] && dateRange[1] ? {
    startDate: dateRange[0],
    endDate: dateRange[1],
    from: format(dateRange[0], 'yyyy-MM-dd'),
    to: format(dateRange[1], 'yyyy-MM-dd')
  } : undefined;

  // Fetch data using custom hooks
  const statsQuery = useFarmerStats(dateRangeParam);
  const { products, isLoading: productsLoading } = useFarmerProducts();
  const { orders, isLoading: ordersLoading } = useFarmerOrders();
  const { 
    sales: salesData, 
    inventory: inventoryData, 
    customers: customersData, 
    isLoading: analyticsLoading 
  } = useFarmerAnalytics(dateRangeParam || { startDate: new Date(), endDate: new Date(), from: '', to: '' });

  const stats = statsQuery.data;
  const isLoading = statsQuery.isLoading || productsLoading || ordersLoading || analyticsLoading;

  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <Button onClick={() => navigate('/farmer/profile')}>Profile Settings</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loader">Loading...</div>
          </div>
        ) : (
          <>
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Revenue</CardTitle>
                    <CardDescription>Last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats?.totalRevenue.toFixed(2) || '0.00'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Orders</CardTitle>
                    <CardDescription>Current period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Active Products</CardTitle>
                    <CardDescription>Currently listed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Low Stock Alert</CardTitle>
                    <CardDescription>Products to restock</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                      {stats?.lowStockProducts || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={() => navigate('/farmer/products/new')}>
                    Add New Product
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {products?.map((product) => (
                    <Card key={product.id}>
                      <CardHeader>
                        <CardTitle className="truncate">{product.name}</CardTitle>
                        <CardDescription>${product.price.toFixed(2)} per {product.unit}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Stock:</span>
                            <Badge variant={product.quantity < product.minStockLevel ? "destructive" : "default"}>
                              {product.quantity}
                            </Badge>
                          </div>
                          <Button 
                            className="w-full" 
                            variant="outline"
                            onClick={() => navigate(`/farmer/products/${product.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 gap-4 p-4 font-medium">
                    <div>Order ID</div>
                    <div>Customer</div>
                    <div>Items</div>
                    <div>Total</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                  {orders?.map((order) => (
                    <div key={order.id} className="grid grid-cols-6 gap-4 p-4 border-t">
                      <div className="font-mono text-sm">{order.id.slice(0, 8)}</div>
                      <div>{order.customerName}</div>
                      <div>{order.items.length} items</div>
                      <div>${order.totalAmount.toFixed(2)}</div>
                      <div>
                        <Badge variant={order.status === 'delivered' ? 'secondary' : 
                          order.status === 'cancelled' ? 'destructive' : 'default'}>
                          {order.status}
                        </Badge>
                      </div>
                      <div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/farmer/orders/${order.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Trends</CardTitle>
                    <CardDescription>Last 30 days of sales data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      {salesData?.revenueByDay && salesData.revenueByDay.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesData.revenueByDay}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#0C8599" name="Revenue" />
                            <Line type="monotone" dataKey="orders" stroke="#FD7E14" name="Orders" />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No sales data available for the selected period
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

// Main dashboard component
const FarmerDashboard: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <FarmerDashboardContent />
        <Toaster position="top-right" richColors />
      </div>
    </QueryClientProvider>
  );
};

export default FarmerDashboard;
