"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/page-container";
import ProfileCreateForm from "./profile-create-form";

export default function ProfileViewPage() {
  const { data: session, status } = useSession();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/users/${session.user.id}`)
        .then((res) => res.json())
        .then((data) => setInitialData(data))
        .catch((err) => console.error("Error fetching user data:", err));
    }
  }, [session]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <ProfileCreateForm categories={[]} initialData={initialData} />
      </div>
    </PageContainer>
  );
}
