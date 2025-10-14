import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { useQuery } from '@tanstack/react-query';
import { mockProducts } from '@/lib/mockData';
import type { AdminProduct } from '@/types/admin';

export default function ProductsManagement() {
  const { data: products, isLoading } = useQuery<AdminProduct[]>({
    queryKey: ['products'],
    queryFn: async () => {
      // Using mock data
      return mockProducts;
    },
  });

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Products Management</h2>
      <DataTable columns={columns} data={products || []} />
    </div>
  );
}