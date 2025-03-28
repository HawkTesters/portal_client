"use client";

import { CellAction } from "./cell-action";
import { Client } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";


// Extend the Client type to include counts of users and assessments
export type ClientWithCounts = Client & {
  users: any[];
  assessments: any[];
};

export const baseColumns: ColumnDef<ClientWithCounts>[] = [
  {
    accessorKey: "name",
    header: "NAME",
  },
  {
    id: "users",
    header: "USERS",
    cell: ({ row }) => {
      const userCount = row.original.users?.length || 0;
      return <span>{userCount}</span>;
    },
  },
  {
    id: "assessments",
    header: "ASSESSMENTS",
    cell: ({ row }) => {
      const assessmentCount = row.original.assessments?.length || 0;
      return <span>{assessmentCount}</span>;
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