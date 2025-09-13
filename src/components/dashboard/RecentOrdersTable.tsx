import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Order } from '../../types';

interface RecentOrdersTableProps {
  orders: Order[];
  onOrderClick?: (order: Order) => void;
}

export const RecentOrdersTable = React.memo(function RecentOrdersTable({
  orders,
  onOrderClick
}: RecentOrdersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            onClick={() => onOrderClick?.(order)}
            className={onOrderClick ? 'cursor-pointer hover:bg-muted/50' : ''}
          >
            <TableCell className="font-medium">#{order.id}</TableCell>
            <TableCell>{order.customerId}</TableCell>
            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'}
              `}>
                {order.status}
              </span>
            </TableCell>
            <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});
