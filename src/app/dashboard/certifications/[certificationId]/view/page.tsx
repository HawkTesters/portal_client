import FormCardSkeleton from "@/components/form-card-skeleton";
import PageContainer from "@/components/layout/page-container";
import CertificationViewPage from "@/features/certifications/components/certifications-view-page";
import { Suspense } from "react";

export const metadata = {
  title: "Dashboard : Certification View",
};

type PageProps = { params: Promise<{ certificationId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<FormCardSkeleton />}>
          <CertificationViewPage certificationId={params.certificationId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
