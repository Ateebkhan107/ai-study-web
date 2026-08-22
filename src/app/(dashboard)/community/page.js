import { cookies } from "next/headers";
import PageWrapper from "@/components/PageWrapper";
import CommunityHub from "@/components/community/CommunityHub";

export const metadata = {
  title: "Study Community — PrepZii",
  description: "Connect with JEE and NEET aspirants. Join study groups, chat, and collaborate.",
};

export default async function CommunityPage() {
  const cookieStore = await cookies();
  const examTrack = String(cookieStore.get("prepzii_track")?.value || "JEE").toUpperCase() === "NEET"
    ? "NEET"
    : "JEE";

  return (
    <PageWrapper>
      <CommunityHub examTrack={examTrack} />
    </PageWrapper>
  );
}
