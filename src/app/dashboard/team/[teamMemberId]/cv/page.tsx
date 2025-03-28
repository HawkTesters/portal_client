// /app/cv/[userId]/page.tsx
import CVPage from "@/features/cv/page";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { teamMemberId: string };
}) {
  const { teamMemberId } = await params;

  // Query all structured fields and related records for the CV
  const cvRecord = await prisma.cV.findUnique({
    where: { userId: teamMemberId },
    include: {
      education: true,
      experience: true,
      services: true,
      achievements: true,
      testimonials: true,
      userCertifications: {
        include: { certification: true },
      },
    },
  });

  if (!cvRecord) {
    notFound();
  }

  console.log("REC: ", cvRecord);
  // Pass the entire CV record to the CVPage component
  return <CVPage cvData={cvRecord} />;
}
