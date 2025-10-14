import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns.ts';
import { useUsers } from '@/hooks/useUsers';

export default function UserManagement() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Users</h2>
      </div>
      <DataTable columns={columns} data={users || []} />
    </div>
  );
}