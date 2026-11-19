import { cookies } from "next/headers";
import AnalyticsPageClient from "@/components/analytics/AnalyticsPageClient";
import { getAnalyticsForUser } from "@/services/analytics.server";
import { getProfileAccessProfile, normalizeExamTrack } from "@/lib/accessControl";
import { auth } from "@clerk/nextjs/server";

export default async function AnalyticsPage() {
  const { userId } = await auth();
  const activeTrack = userId
    ? (await getProfileAccessProfile(userId)).examTrack
    : normalizeExamTrack((await cookies()).get("prepzii_track")?.value);
  let initialStats = null;
  let initialAccess = false;

  if (userId) {
    const result = await getAnalyticsForUser(userId, activeTrack);
    initialStats = result.stats;
    initialAccess = result.allowed;
  }

  return (
    <AnalyticsPageClient
      key={activeTrack}
      initialStats={initialStats}
      initialTrack={initialStats?.track || activeTrack}
      initialAdvancedAnalyticsAllowed={initialAccess}
    />
  );
}
