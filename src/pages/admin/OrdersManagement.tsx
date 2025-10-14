import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Loader2 } from 'lucide-react';
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

interface Order {
  id: string;
  status: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  created_at: string;
  updated_at: string;
}

const OrdersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // Replace with actual API call
      return [];
    },
  });

  const columns = [
    {
      accessorKey: 'id',
      header: 'Order ID',
    },
    {
      accessorKey: 'customer.name',
      header: 'Customer',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
        const statusClass =
          status === 'completed'
            ? 'bg-green-100 text-green-800'
            : status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : status === 'cancelled'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800';

        return (
          <div className="font-medium">
            <span className={`${base} ${statusClass}`}>
              {status}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => (
        <div className="font-medium">
          ₹{row.original.total.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => (
        <div className="font-medium">
          {new Date(row.original.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            View
          </Button>
          <Button variant="outline" size="sm">
            Edit
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
          <CardTitle>Orders Management</CardTitle>
          <CardDescription>
            Manage and track all orders in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export</Button>
          </div>
          <DataTable 
            columns={columns} 
            data={orders || []} 
            searchKey="customer.name"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersManagement;