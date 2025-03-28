// app/features/team-members/components/team-member-listing.server.tsx
import { searchParamsCache } from "@/lib/searchparams";
import { prisma } from "@/lib/prisma";
import { Prisma, UserType } from "@prisma/client";
import TeamMemberListingClient from "./team-listing-client";

export default async function TeamMemberListingPage() {
  const page = searchParamsCache.get("page");
  const search = searchParamsCache.get("q");
  const pageLimit = searchParamsCache.get("limit");

  const skip = page ? (Number(page) - 1) * (Number(pageLimit) || 10) : 0;
  const take = pageLimit ? Number(pageLimit) : 10;

  const where = {
    userType: UserType.TEAM,
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              email: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {}),
  };

  const [teamMembers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { cv: true, client: true },
    }),
    prisma.user.count({ where }),
  ]);

  return <TeamMemberListingClient teamMembers={teamMembers} total={total} />;
}
