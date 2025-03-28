import FormCardSkeleton from "@/components/form-card-skeleton";
import PageContainer from "@/components/layout/page-container";
import { Suspense } from "react";
import TeamMemberViewPage from "@/features/team/components/team-view-page";

export const metadata = {
  title: "Dashboard: Team Member View",
};

type PageProps = { params: Promise<{ teamMemberId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<FormCardSkeleton />}>
          <TeamMemberViewPage teamMemberId={params.teamMemberId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
