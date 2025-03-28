"use client";

import { CellAction } from "./cell-action";
import { Assessment, Client } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import React from "react";


export type AssessmentWithClient = Assessment & { client: Client };

const baseColumns: ColumnDef<AssessmentWithClient>[] = [
  {
    accessorKey: "title",
    header: "TITLE",
  },
  {
    accessorKey: "certificate",
    header: "CERTIFICATE",
    cell: ({ row }) => {
      const url = row.getValue("certificate") as string;
      console.log("URL", url);
      return url ? (
        <a
          href={url.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600"
        >
          View Certification
        </a>
      ) : (
        "N/A"
      );
    },
  },
  {
    accessorKey: "executiveReport",
    header: "EXECUTIVE REPORT",
    cell: ({ row }) => {
      const url = row.getValue("executiveReport") as string;
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600"
        >
          View Executive Report
        </a>
      ) : (
        "N/A"
      );
    },
  },
  {
    accessorKey: "technicalReport",
    header: "TECHNICAL REPORT",
    cell: ({ row }) => {
      const url = row.getValue("technicalReport") as string;
      console.log("URL", url)
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600"
        >
          View Technical Report
        </a>
      ) : (
        "N/A"
      );
    },
  },
  {
    id: "status",
    header: "STATUS",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusClasses = clsx(
        "px-2 py-1 rounded-md text-white font-medium text-center w-fit",
        {
          "bg-green-400": status === "ACTIVE",
          "bg-gray-400": status === "PROGRAMMED",
          "bg-red-400": status === "ON_HOLD",
          "bg-blue-400": status === "COMPLETED",
        }
      );
      return <span className={statusClasses}>{status}</span>;
    },
  },
  {
    id: "client",
    header: "CLIENT",
    cell: ({ row }) => {
      return row.original.client ? row.original.client.name : "N/A";
    },
  },
  {
    accessorKey: "deadline",
    header: "DEADLINE",
    cell: ({ row }) => {
      const date = new Date(row.getValue("deadline") as string);
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