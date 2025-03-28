"use client";

import { CellAction } from "./cell-action";
import { User } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";


// Extend the User type to include the related CV and Client.
export type TeamMember = User & {
  cv: { bio: string | null } | null;
  client: { name: string } | null;
};

const baseColumns: ColumnDef<TeamMember>[] = [
  {
    accessorKey: "name",
    header: "NAME",
  },
  {
    accessorKey: "email",
    header: "EMAIL",
  },
  {
    id: "client",
    header: "CLIENT",
    cell: ({ row }) => {
      return row.original.client ? row.original.client.name : "N/A";
    },
  },
  {
    id: "cv",
    header: "CV",
    cell: ({ row }) => {
      return row.original.cv ? (
        <a
          href={`/dashboard/team/${row.original.id}/cv`} // Assuming userId is the same as team member id
          className="underline text-blue-600"
        >
          View CV
        </a>
      ) : (
        "N/A"
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "CREATED AT",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string);
      return date.toLocaleDateString();
    },
  },
];


// Export a function that returns the final columns array based on userType.
// No hooks are called here.
export function getColumns(userType?: string): ColumnDef<any, unknown>[] {
  return [
    ...baseColumns,
    ...(userType === "ADMIN"
      ? [
          {
            id: "actions",
            cell: ({ row }) => <CellAction data={row.original} />,
          },
        ]
      : []),
  ];
}