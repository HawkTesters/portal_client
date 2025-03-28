import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import AssessmentListingPage from "@/features/assessments/components/assessment-listing";
import AssessmentTableAction from "@/features/assessments/components/assessment-tables/assessment-table-action";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { getServerSession } from "next-auth"; // Import NextAuth's server session helper
import authConfig from "@/lib/auth.config";
import { UserType } from "@prisma/client";

export const metadata = {
  title: "Dashboard: Assessments",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);
  // This key is used to invoke suspense if any of the search params changed.
  const key = serialize({ ...searchParams });

  const session = await getServerSession(authConfig);
  const isAdmin = session?.user?.userType === UserType.ADMIN;

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Assessments"
            description="Manage assessments (Server side table functionalities.)"
          />
          {isAdmin && (
            <Link
              href="/dashboard/assessment/new"
              className={cn(buttonVariants(), "text-xs md:text-sm")}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Link>
          )}
        </div>
        <Separator />
        <AssessmentTableAction />
        <Suspense
          key={key}
          fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
        >
          <AssessmentListingPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
