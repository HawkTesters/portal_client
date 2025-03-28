// app/features/certifications/certification-table-columns.ts
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Certification } from "@prisma/client";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<Certification>[] = [
  {
    accessorKey: "href",
    header: "Certification URL",
    cell: ({ row }) => {
      const url = row.getValue("href") as string;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600"
        >
          {url}
        </a>
      );
    },
  },
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => {
      const logo = row.getValue("logo") as string;
      const alt = row.original.alt;
      return <img src={logo} alt={alt} width="50" />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
