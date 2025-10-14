import { type ColumnDef } from "@tanstack/react-table"
import { Product } from "@/types/product"

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: "Product ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
      }).format(price)
      return formatted
    },
  },
  {
   accessorKey: "quantity",
    header: "Stock",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
]