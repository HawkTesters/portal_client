"use client";

import { useRouter } from "next/navigation";
import { DataTable as AssessmentTable } from "@/components/ui/table/data-table";
import { Assessment, Client } from "@prisma/client";
import { getColumns } from "./assessment-tables/columns";

type AssessmentWithClient = Assessment & { client: Client };

export default function AssessmentListingClient({
  assessments,
  total,
}: {
  assessments: AssessmentWithClient[];
  total: number;
}) {
  const router = useRouter();
  
  return (
    <AssessmentTable
      getColumns={getColumns}
      data={assessments}
      totalItems={total}
      onRowClick={(row) => {
        router.push(`/dashboard/assessment/${row.id}`);
      }}
    />
  );
}
