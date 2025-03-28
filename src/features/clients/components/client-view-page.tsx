import { notFound } from "next/navigation";
import ClientForm from "./client-form";

type TClientViewPageProps = {
  clientId: string;
};

export default async function ClientViewPage({
  clientId,
}: TClientViewPageProps) {
  let client = null;
  let pageTitle = "Create New Client";

  console.log(clientId);

  if (clientId !== "new") {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/clients/${clientId}`);
    if (!res.ok) {
      notFound();
    }
    client = await res.json();
    pageTitle = "Edit Client";
  }

  return <ClientForm initialData={client} pageTitle={pageTitle} />;
}
