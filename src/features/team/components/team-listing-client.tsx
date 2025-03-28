"use client";

import { getColumns } from "./team-tables/columns";
import { DataTable as TeamMemberTable } from "@/components/ui/table/data-table";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";

interface TeamMemberListingClientProps {
  teamMembers: User[];
  total: number;
}

export default function TeamMemberListingClient({
  teamMembers,
  total,
}: TeamMemberListingClientProps) {
  const router = useRouter();

  return (
    <TeamMemberTable
      getColumns={getColumns}
      data={teamMembers}
      totalItems={total}
      onRowClick={(row) => {
        router.push(`/dashboard/team/${row.id}`);
      }}
    />
  );
}
