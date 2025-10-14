import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Analytics = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      // Replace with actual API call
      return {
        revenue: {
          total: 150000,
          growth: 12.5,
        },
        orders: {
          total: 245,
          growth: 8.3,
        },
        customers: {
          total: 189,
          growth: 15.2,
        },
        avgOrderValue: {
          total: 612.24,
          growth: 4.1,
        },
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <Select defaultValue="7d">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analyticsData?.revenue.total.toLocaleString()}</div>
            <p className={`text-xs ${analyticsData?.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analyticsData?.revenue.growth >= 0 ? '+' : ''}{analyticsData?.revenue.growth}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.orders.total}</div>
            <p className={`text-xs ${analyticsData?.orders.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analyticsData?.orders.growth >= 0 ? '+' : ''}{analyticsData?.orders.growth}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.customers.total}</div>
            <p className={`text-xs ${analyticsData?.customers.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analyticsData?.customers.growth >= 0 ? '+' : ''}{analyticsData?.customers.growth}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analyticsData?.avgOrderValue.total.toFixed(2)}</div>
            <p className={`text-xs ${analyticsData?.avgOrderValue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analyticsData?.avgOrderValue.growth >= 0 ? '+' : ''}{analyticsData?.avgOrderValue.growth}% from previous period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add charts and detailed analytics here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Daily revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {/* Add revenue chart here */}
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Chart placeholder
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add top products list here */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm font-medium">Product {i}</span>
                  <span className="text-sm text-muted-foreground">₹{(1000 * (6-i)).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;