import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns.ts';
import { useProducts } from '@/hooks/useProducts';

export default function InventoryManagement() {
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
    return <div>Loading inventory...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory</h2>
      </div>
      <DataTable columns={columns} data={products || []} />
    </div>
  );
}