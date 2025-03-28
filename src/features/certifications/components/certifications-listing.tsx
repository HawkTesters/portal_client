// app/certifications/listing/page.tsx
import { prisma } from "@/lib/prisma";
import CertificationListingClient from "./certifications-listing-client";

export default async function CertificationListingPage() {
  const certifications = await prisma.certification.findMany({
    orderBy: { id: "asc" },
  });
  return <CertificationListingClient certifications={certifications} />;
}
