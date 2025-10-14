import { type ColumnDef } from "@tanstack/react-table"
import { User } from "@/types/user"

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "User ID",
  },
  {
   accessorKey: "firstName",
    header: "Name",
   cell: ({ row }) => {
     const firstName = row.getValue("firstName")
     const lastName = row.getValue("lastName")
     return `${firstName} ${lastName}`
   },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
     const date = new Date(row.getValue("updatedAt"))
      return date.toLocaleDateString("en-IN")
    },
  },
]