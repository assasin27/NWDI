import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { AdminProduct } from "@/types/admin";

export const columns: ColumnDef<AdminProduct>[] = [
  {
    accessorKey: "name",
    header: "Product Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `₹${row.getValue("price")}`,
  },
  {
    accessorKey: "quantity",
    header: "Stock",
  },
  {
    accessorKey: "in_stock",
    header: "Status",
    cell: ({ row }) => {
      const inStock = row.getValue("in_stock") as boolean;
      return (
        <Badge variant={inStock ? "default" : "secondary"}>
          {inStock ? "In Stock" : "Out of Stock"}
        </Badge>
      );
    },
  },
];