import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import PageWrapper from "@/components/PageWrapper";
import GroupPage from "@/components/community/GroupPage";

export const metadata = {
  title: "Study Group — PrepZii Community",
};

export default async function GroupDetailPage({ params }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <GroupPage groupId={id} currentUserId={userId} />
    </div>
  );
}
