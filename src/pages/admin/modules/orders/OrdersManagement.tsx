import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns.ts';
import { useQuery } from '@tanstack/react-query';
import { mockOrders } from '@/lib/mockData';
import { Order } from '@/types/order';

export default function OrdersManagement() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      // Using mock data
      return mockOrders;
    },
  });

  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders</h2>
      </div>
      <DataTable columns={columns} data={orders || []} />
    </div>
  );
}