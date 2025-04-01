"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface AssessmentExtraInfoProps {
  assessmentId: string;
}

// Constrain TData to objects with an id property
export function DataTableWrapper<TData extends { id: string }>() {
  return DataTable as unknown as typeof DataTable<TData, unknown>;
}

const columns: ColumnDef<TeamMember>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            // Prevent the row click if button is clicked
            e.stopPropagation();
            router.push(`/dashboard/team/${row.original.id}`);
          }}
        >
          View
        </Button>
      );
    },
  },
];

export default function AssessmentExtraInfo({
  assessmentId,
}: AssessmentExtraInfoProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        // Adjust the endpoint to return team members associated with the assessment.
        const res = await fetch(`/api/assessments/${assessmentId}/team`);
        if (res.ok) {
          const data = await res.json();
          setTeamMembers(data.teamMembers);
        } else {
          toast.error("Failed to fetch team members");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching team members");
      }
    }
    fetchTeamMembers();
  }, [assessmentId]);

  if (teamMembers.length === 0) {
    return (
      <p className="p-4">No team members associated with this assessment.</p>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Team Members Associated with this Assessment
      </h2>
      {teamMembers.length > 0 ? (
        <ul className="space-y-2">
          {teamMembers.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between border p-2 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => router.push(`/dashboard/team/${member.id}`)}
            >
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/team/${member.id}/cv`);
                }}
              >
                View
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No team members are currently assigned.</p>
      )}
    </div>
  );
}
