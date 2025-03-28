// app/certifications/[certificationId]/page.tsx
import FormCardSkeleton from "@/components/form-card-skeleton";
import PageContainer from "@/components/layout/page-container";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CertificationForm from "./certifications-form";

type TCertificationViewPageProps = {
  certificationId: string;
};

export default async function CertificationViewPage({
  certificationId,
}: TCertificationViewPageProps) {
  let certification = null;
  let pageTitle = "View Certification";

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/certifications/${certificationId}?view=true`
  );
  if (!res.ok) {
    notFound();
  }
  certification = await res.json();

  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<FormCardSkeleton />}>
          {/* In view mode, the form is rendered read-only */}
          <CertificationForm
            initialData={certification}
            pageTitle={pageTitle}
            readOnly
          />
        </Suspense>
      </div>
    </PageContainer>
  );
}
