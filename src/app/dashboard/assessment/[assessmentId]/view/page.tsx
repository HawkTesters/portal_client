import FormCardSkeleton from "@/components/form-card-skeleton";
import PageContainer from "@/components/layout/page-container";
import { Suspense } from "react";
import AssessmentViewPage from "@/features/assessments/components/assessment-view-page";

export const metadata = {
  title: "Dashboard : Product View",
};

type PageProps = { params: Promise<{ assessmentId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<FormCardSkeleton />}>
          <AssessmentViewPage assessmentId={params.assessmentId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
