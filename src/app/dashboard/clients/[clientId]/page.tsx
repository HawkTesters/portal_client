import FormCardSkeleton from "@/components/form-card-skeleton";
import PageContainer from "@/components/layout/page-container";
import { Suspense } from "react";
import ClientViewPage from "@/features/clients/components/client-view-page";

export const metadata = {
  title: "Dashboard: Client View",
};

type PageProps = { params: Promise<{ clientId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<FormCardSkeleton />}>
          <ClientViewPage clientId={params.clientId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
