import { useState, useEffect } from 'react';
import { StatsCards } from '../components/dashboard/StatsCards';
import { RecentOrders } from '../components/dashboard/RecentOrders';
import { TopProducts } from '../components/dashboard/TopProducts';
import { supabase } from '@/lib/supabase';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch these from your API
        // This is a mock implementation
        const [
          { count: ordersCount },
          { count: customersCount },
          { count: productsCount },
          { data: revenueData },
        ] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('customers').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.rpc('get_total_revenue'),
        ]);

        setStats({
          totalOrders: ordersCount || 0,
          totalRevenue: revenueData?.[0]?.total_revenue || 0,
          totalCustomers: customersCount || 0,
          totalProducts: productsCount || 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Dashboard</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Overview of your farm's performance and recent activity.
        </p>
      </div>
      
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  );
};
