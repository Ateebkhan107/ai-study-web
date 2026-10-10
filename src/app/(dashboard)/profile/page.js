import { auth } from "@clerk/nextjs/server";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import { getProfilePageData } from "@/services/profile.server";
import { getActiveSubscriptionsForUser, isSubscriptionActive, normalizeExamTrack } from "@/lib/accessControl";

function getPlanFromSubscriptions(subscriptions) {
  const activeSubs = subscriptions.filter((subscription) => isSubscriptionActive(subscription));
  if (activeSubs.some((subscription) => subscription.plan === "ai_mode")) return "AI_MODE";
  return activeSubs.length > 0 ? "PRO" : "FREE";
}

export default async function ProfilePage() {
  const { userId, sessionClaims } = await auth();
  const profile = userId ? await getProfilePageData(userId, sessionClaims) : null;
  const examTrack = normalizeExamTrack(profile?.current_track || profile?.exam);
  const subscriptions = userId ? await getActiveSubscriptionsForUser(userId, examTrack) : [];
  const plan = getPlanFromSubscriptions(subscriptions);

  return <ProfilePageClient initialProfile={profile} plan={plan} />;
}
