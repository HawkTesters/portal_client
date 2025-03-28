import { Metadata } from "next";
import SignInViewPage from "@/features/auth/components/sigin-view";

export const metadata: Metadata = {
  title: "Hawktesters Portal | Sign In",
  description: "Sign In page for authentication.",
};

export default async function Page() {

  return <SignInViewPage />;
}
