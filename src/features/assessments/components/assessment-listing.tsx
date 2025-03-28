// app/features/assessments/components/assessment-listing.tsx

import AssessmentListingClient from "./assessment-listing-client";
import { prisma } from "@/lib/prisma";
import { searchParamsCache } from "@/lib/searchparams";
import { Prisma } from "@prisma/client";

export default async function AssessmentListingPage() {
  // Retrieve search parameters from the global cache.
  const page = searchParamsCache?.get("page");
  const search = searchParamsCache?.get("q");
  const pageLimit = searchParamsCache?.get("limit");

  // Build pagination and search filters.
  const skip = page ? (Number(page) - 1) * (Number(pageLimit) || 10) : 0;
  const take = pageLimit ? Number(pageLimit) : 10;

  const where = search
    ? {
        title: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }
    : {};

  // Fetch assessments and the total count.
  const [assessments, total] = await Promise.all([
    prisma.assessment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
    prisma.assessment.count({ where }),
  ]);

  return <AssessmentListingClient assessments={assessments} total={total} />;
}
