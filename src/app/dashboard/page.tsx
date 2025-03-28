import { getServerSession } from "next-auth";
import authConfig from "@/lib/auth.config"; // your NextAuthOptions
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return redirect("/");
  } else {
    console.log("REDIRECTING HERE");
    redirect("/dashboard/hawktesters");
  }
}
