"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserType } from "@prisma/client";

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface AssessmentTeamManagerProps {
  assessmentId: string;
}

export default function AssessmentTeamManager({
  assessmentId,
}: AssessmentTeamManagerProps) {
  const [assignedTeamMembers, setAssignedTeamMembers] = useState<TeamMember[]>(
    []
  );
  const [availableTeamMembers, setAvailableTeamMembers] = useState<
    TeamMember[]
  >([]);
  const router = useRouter();

  const { data: session } = useSession();
  const isClientUser = session?.user?.userType === UserType.CLIENT;
  const defaultClientId = isClientUser ? session?.user?.clientId : "";

  async function fetchAssignedTeamMembers() {
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/team`);
      if (res.ok) {
        const data = await res.json();
        setAssignedTeamMembers(data.teamMembers);
      } else {
        toast.error("Failed to fetch assigned team members");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching assigned team members");
    }
  }

  async function fetchAvailableTeamMembers() {
    try {
      const res = await fetch(`/api/team`);
      if (res.ok) {
        const data = await res.json();
        setAvailableTeamMembers(data);
      } else {
        toast.error("Failed to fetch available team members");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching available team members");
    }
  }

  useEffect(() => {
    fetchAssignedTeamMembers();
    fetchAvailableTeamMembers();
  }, [assessmentId]);

  // Exclude team members already assigned from the available list.
  const filteredAvailableTeamMembers = availableTeamMembers.filter(
    (member) =>
      !assignedTeamMembers.some((assigned) => assigned.id === member.id)
  );

  async function handleAddTeamMember(teamMemberId: string) {
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamMemberId }),
      });
      if (res.ok) {
        toast.success("Team member added successfully");
        // Refresh the assigned team members list after successful addition.
        fetchAssignedTeamMembers();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to add team member");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding team member");
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Assigned Team Members</h2>
      {assignedTeamMembers.length > 0 ? (
        <ul className="space-y-2">
          {assignedTeamMembers.map((member) => (
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

      {!isClientUser && (
        <>
          <h2 className="text-xl font-bold mt-8 mb-4">
            Available Team Members
          </h2>
          {filteredAvailableTeamMembers.length > 0 ? (
            <ul className="space-y-2">
              {filteredAvailableTeamMembers.map((member) => (
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
                      handleAddTeamMember(member.id);
                    }}
                  >
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No available team members found.</p>
          )}
        </>
      )}
    </div>
  );
}
