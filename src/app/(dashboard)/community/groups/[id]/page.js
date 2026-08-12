import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import GroupPage from "@/components/community/GroupPage";

export const metadata = {
  title: "Study Group — PrepZii Community",
};

export default async function GroupDetailPage({ params }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const userName = user?.fullName || user?.firstName || "Someone";

  const { id } = await params;

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] min-h-[520px] flex-col">
      <GroupPage groupId={id} currentUserId={userId} currentUserName={userName} />
    </div>
  );
}
