// app/features/certifications/certification-listing-client.tsx
"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/table/data-table";
import { Certification } from "@prisma/client";
import { columns } from "./certifications-tables/columns";

type CertificationListingClientProps = {
  certifications: Certification[];
};

export default function CertificationListingClient({
  certifications,
}: CertificationListingClientProps) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={certifications}
      onRowClick={(row) => {
        router.push(`/dashboard/certifications/${row.id}/view`);
      }}
    />
  );
}
