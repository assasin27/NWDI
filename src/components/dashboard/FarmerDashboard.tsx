import React, { useState, useMemo, useCallback } from 'react';
import { useDashboardStats, useInventoryItems, useRecentOrders, TimeRange } from '../../hooks/useDashboard';
import { DashboardMetric } from './DashboardMetric';
import { InventoryTable } from './InventoryTable';
import { RecentOrdersTable } from './RecentOrdersTable';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DollarSign, Package, ShoppingCart, AlertTriangle } from 'lucide-react';

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7 days', value: '7days' },
  { label: 'Last 30 days', value: '30days' },
  { label: 'Last 90 days', value: '90days' },
  { label: 'All time', value: 'all' },
];

export function FarmerDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: stats, isLoading: statsLoading } = useDashboardStats(timeRange);
  const { data: inventory = [], isLoading: inventoryLoading } = useInventoryItems(searchTerm);
  const { data: recentOrders = [], isLoading: ordersLoading } = useRecentOrders();

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleTimeRangeChange = useCallback((value: TimeRange) => {
    setTimeRange(value);
  }, []);

  if (statsLoading || inventoryLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground text-sm text-center">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetric
          title="Total Revenue"
          value={`$${stats?.totalRevenue.toFixed(2)}`}
          description={`For the selected period`}
          icon={<DollarSign />}
        />
        <DashboardMetric
          title="Total Orders"
          value={stats?.totalOrders}
          description={`For the selected period`}
          icon={<ShoppingCart />}
        />
        <DashboardMetric
          title="Total Products"
          value={stats?.totalProducts}
          icon={<Package />}
        />
        <DashboardMetric
          title="Low Stock Items"
          value={stats?.lowStockItems}
          description="Items needing restock"
          icon={<AlertTriangle />}
        />
      </div>

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <Card className="p-6">
            <div className="mb-4">
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="max-w-sm"
              />
            </div>
            <InventoryTable items={inventory} />
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card className="p-6">
            <RecentOrdersTable orders={recentOrders} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
