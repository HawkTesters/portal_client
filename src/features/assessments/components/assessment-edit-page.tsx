import { notFound } from "next/navigation";
import AssessmentForm from "./assessment-form";
import AssessmentTeamManager from "../assessment-team-manager";

type TAssessmentEditPageProps = {
  assessmentId: string;
};

export default async function AssessmentEditPage({
  assessmentId,
}: TAssessmentEditPageProps) {
  let assessment = null;
  let pageTitle = "Create New Assessment";

  if (assessmentId !== "new") {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/assessments/${assessmentId}`);
    if (!res.ok) {
      notFound();
    }
    assessment = await res.json();
    pageTitle = "Edit Assessment";
  }

  return (
    <>
      <AssessmentForm initialData={assessment} pageTitle={pageTitle} />
      {/* Team Manager component lets users see current team members and add new ones */}
      {assessment && <AssessmentTeamManager assessmentId={assessment.id} />}
    </>
  );
}
