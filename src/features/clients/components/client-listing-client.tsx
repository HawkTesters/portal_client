"use client";

import { useRouter } from "next/navigation";
import { DataTable as ClientTable } from "@/components/ui/table/data-table";
import { Client } from "@prisma/client";
import { getColumns } from "./client-tables/columns";

interface ClientListingClientProps {
  clients: Client[];
  total: number;
}

export default function ClientListingClient({
  clients,
  total,
}: ClientListingClientProps) {
  const router = useRouter();

  return (
    <ClientTable
      getColumns={getColumns}
      data={clients}
      totalItems={total}
      onRowClick={(row) => {
        router.push(`/dashboard/clients/${row.id}`);
      }}
    />
  );
}
