// app/certifications/[certificationId]/edit/page.tsx
import { notFound } from "next/navigation";
import CertificationForm from "./certifications-form";

type TCertificationEditPageProps = {
  certificationId: string;
};

export default async function CertificationEditPage({
  certificationId,
}: TCertificationEditPageProps) {
  let certification = null;
  let pageTitle = "Create New Certification";

  if (certificationId !== "new") {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/certifications/${certificationId}`);
    if (!res.ok) {
      notFound();
    }
    certification = await res.json();
    pageTitle = "Edit Certification";
  }

  return (
    <CertificationForm initialData={certification} pageTitle={pageTitle} />
  );
}
