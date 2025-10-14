import { type ColumnDef } from "@tanstack/react-table"
import { Order } from "@/types/order"

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
   accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => {
     const amount = parseFloat(row.getValue("totalAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
      }).format(amount)
      return formatted
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
     const date = new Date(row.getValue("createdAt"))
      return date.toLocaleDateString("en-IN")
    },
  },
]