// pages/index.tsx (Next.js)
import { hawktesters } from "@/app/constants/data";
import { CompanyOverview } from "@/features/hawktesters/page";

// <--- your translations if separate

export default function Home() {
  return <CompanyOverview data={hawktesters} />;
}
