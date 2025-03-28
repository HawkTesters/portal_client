import { notFound } from "next/navigation";
import TeamForm from "./team-form";

type TTeamViewPageProps = {
  teamMemberId: string;
};

export default async function TeamViewPage({
  teamMemberId,
}: TTeamViewPageProps) {
  let teamMember = null;
  let pageTitle = "Create New Team Member";

  if (teamMemberId !== "new") {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/users/${teamMemberId}`);
    if (!res.ok) {
      notFound();
    }
    teamMember = await res.json();
    pageTitle = "Edit Team Member";
  }

  return <TeamForm initialData={teamMember} pageTitle={pageTitle} />;
}
