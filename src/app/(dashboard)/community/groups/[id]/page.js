import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import GroupPage from "@/components/community/GroupPage";
import { getDisplayNameFromClaims } from "@/lib/auth";
import { getCommunityGroupForUser, listCommunityGroupsForUser } from "@/services/community.server";

export const metadata = {
  title: "Study Group — PrepZii Community",
};

export default async function GroupDetailPage({ params }) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const [groupData, mineData] = await Promise.all([
    getCommunityGroupForUser(id, userId),
    listCommunityGroupsForUser(userId, { type: "mine", limit: 50 }),
  ]);

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] min-h-[520px] flex-col">
      <GroupPage
        groupId={id}
        currentUserId={userId}
        currentUserName={getDisplayNameFromClaims(sessionClaims) || "Someone"}
        initialGroup={groupData.group || null}
        initialMembership={groupData.membership || null}
        initialError={groupData.error || null}
        initialMyGroups={mineData.groups || []}
      />
    </div>
  );
}
