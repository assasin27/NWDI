import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Product } from '../../types';

interface InventoryTableProps {
  items: Product[];
  onItemClick?: (item: Product) => void;
}

export const InventoryTable = React.memo(function InventoryTable({
  items,
  onItemClick
}: InventoryTableProps) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aStock = a.quantity || 0;
      const bStock = b.quantity || 0;
      if (aStock === bStock) return 0;
      return aStock < bStock ? -1 : 1;
    });
  }, [items]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedItems.map((item) => (
          <TableRow
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={onItemClick ? 'cursor-pointer hover:bg-muted/50' : ''}
          >
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>${item.price?.toFixed(2)}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>
              {(item.quantity || 0) <= (item.min_stock_level || 10) ? (
                <span className="text-red-500">Low Stock</span>
              ) : (
                <span className="text-green-500">In Stock</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});
