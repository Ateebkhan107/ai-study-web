import { cookies } from "next/headers";
import AnalyticsPageClient from "@/components/analytics/AnalyticsPageClient";
import { getAnalyticsForUser } from "@/services/analytics.server";
import { normalizeTrack } from "@/lib/analyticsHelpers";
import { auth } from "@clerk/nextjs/server";

export default async function AnalyticsPage() {
  const [{ userId }, cookieStore] = await Promise.all([auth(), cookies()]);
  const activeTrack = normalizeTrack(cookieStore.get("prepzii_track")?.value || "JEE");
  let initialStats = null;
  let initialAccess = false;

  if (userId) {
    const result = await getAnalyticsForUser(userId, activeTrack);
    initialStats = result.stats;
    initialAccess = result.allowed;
  }

  return (
    <AnalyticsPageClient
      initialStats={initialStats}
      initialTrack={initialStats?.track || activeTrack}
      initialAdvancedAnalyticsAllowed={initialAccess}
    />
  );
}
