import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // Replace with actual API call
      return [];
    },
  });

  const columns = [
    {
      accessorKey: 'name',
      header: 'Product Name',
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <div className="font-medium">
          ₹{row.original.price.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => (
        <div className="font-medium">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              {
                'bg-green-100 text-green-800': row.original.status === 'in_stock',
                'bg-yellow-100 text-yellow-800': row.original.status === 'low_stock',
                'bg-red-100 text-red-800': row.original.status === 'out_of_stock',
              }
            )}
          >
            {row.original.stock}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="outline" size="sm">
            View History
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Manage your products and stock levels
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="fruits">Fruits</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="grains">Grains</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export</Button>
          </div>
          <DataTable 
            columns={columns} 
            data={products || []} 
            searchKey="name"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;