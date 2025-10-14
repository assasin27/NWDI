import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Loader2, Plus, UserPlus } from 'lucide-react';
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Replace with actual API call
      return [];
    },
  });

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <div className="font-medium">
          <span className="capitalize">{row.original.role}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="font-medium">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              {
                'bg-green-100 text-green-800': row.original.status === 'active',
                'bg-yellow-100 text-yellow-800': row.original.status === 'pending',
                'bg-red-100 text-red-800': row.original.status === 'inactive',
              }
            )}
          >
            {row.original.status}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: ({ row }) => (
        <div className="font-medium">
          {new Date(row.original.lastLogin).toLocaleDateString()}
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
          <Button 
            variant="outline" 
            size="sm"
            className={row.original.status === 'active' ? 'text-red-600' : 'text-green-600'}
          >
            {row.original.status === 'active' ? 'Deactivate' : 'Activate'}
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
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </div>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable 
            columns={columns} 
            data={users || []} 
            searchKey="name"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;