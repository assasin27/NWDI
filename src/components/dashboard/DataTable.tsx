import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { ReactNode } from "react";

export interface Column<T> {
  id: string;
  header: string | ((sortConfig: SortConfig | null) => ReactNode);
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  sortConfig?: SortConfig | null;
  onSort?: (key: string) => void;
  isLoading?: boolean;
  emptyState?: ReactNode;
  skeletonRows?: number;
  className?: string;
  rowClassName?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  onRowClick,
  sortConfig,
  onSort,
  isLoading = false,
  emptyState,
  skeletonRows = 5,
  className,
  rowClassName,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const renderHeader = (column: Column<T>) => {
    if (typeof column.header === 'function') {
      return column.header(sortConfig);
    }

    if (column.sortable) {
      const isSorted = sortConfig?.key === column.id;
      const isAsc = sortConfig?.direction === 'asc';
      
      return (
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 px-2 font-medium", column.headerClassName)}
          onClick={() => handleSort(column.id)}
        >
          {column.header}
          {isSorted ? (
            isAsc ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )
          ) : column.sortable ? (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          ) : null}
        </Button>
      );
    }

    return column.header;
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.headerClassName}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={column.cellClassName}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <div className="py-8 text-center">{emptyState}</div>;
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead 
                key={index} 
                className={cn(
                  column.headerClassName,
                  column.sortable && "cursor-pointer hover:bg-accent/50"
                )}
                onClick={() => column.sortable && handleSort(column.id)}
              >
                {renderHeader(column)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={String(row[keyField])}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-accent/50",
                rowClassName
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column, colIndex) => (
                <TableCell 
                  key={colIndex} 
                  className={cn("py-3", column.className, column.cellClassName)}
                >
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
