// app/features/clients/components/client-listing.server.tsx
import { searchParamsCache } from "@/lib/searchparams";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import ClientListingClient from "./client-listing-client";

export default async function ClientListingPage() {
  const page = searchParamsCache.get("page");
  const search = searchParamsCache.get("q");
  const pageLimit = searchParamsCache.get("limit");

  const skip = page ? (Number(page) - 1) * (Number(pageLimit) || 10) : 0;
  const take = pageLimit ? Number(pageLimit) : 10;

  const where = search
    ? {
        name: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }
    : {};

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { users: true, assessments: true },
    }),
    prisma.client.count({ where }),
  ]);

  return <ClientListingClient clients={clients} total={total} />;
}
