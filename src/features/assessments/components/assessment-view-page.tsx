import FormCardSkeleton from "@/components/form-card-skeleton";
import PageContainer from "@/components/layout/page-container";
import AssessmentExtraInfo from "@/features/assessments/assessment-extra-info";
import AssessmentForm from "@/features/assessments/components/assessment-form";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type TAssessmentViewPageProps = {
  assessmentId: string;
};

export default async function AssessmentViewPage({
  assessmentId,
}: TAssessmentViewPageProps) {
  let assessment = null;
  let pageTitle = "View Assessment"; // Changed title for view

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/assessments/${assessmentId}?view=true`
  );
  if (!res.ok) {
    notFound();
  }
  assessment = await res.json();

  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<FormCardSkeleton />}>
          {/* In view mode, the form might render in a read-only way */}
          <AssessmentForm
            initialData={assessment}
            pageTitle={pageTitle}
            readOnly
          />
          <AssessmentExtraInfo assessmentId={assessment.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
