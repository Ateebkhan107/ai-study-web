import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import PageWrapper from "@/components/PageWrapper";
import CommunityHub from "@/components/community/CommunityHub";
import { listCommunityGroupsForUser } from "@/services/community.server";

export const metadata = {
  title: "Study Community — PrepZii",
  description: "Connect with JEE and NEET aspirants. Join study groups, chat, and collaborate.",
};

export default async function CommunityPage() {
  const [cookieStore, { userId }] = await Promise.all([cookies(), auth()]);
  const examTrack = String(cookieStore.get("prepzii_track")?.value || "JEE").toUpperCase() === "NEET"
    ? "NEET"
    : "JEE";
  const initialDiscover = userId
    ? await listCommunityGroupsForUser(userId, { type: "discover", page: 1, limit: 12 })
    : { groups: [], page: 1, limit: 12 };

  return (
    <PageWrapper>
      <CommunityHub
        examTrack={examTrack}
        initialGroups={initialDiscover.groups || []}
        initialHasMore={(initialDiscover.groups || []).length === 12}
      />
    </PageWrapper>
  );
}
