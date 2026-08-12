import { auth } from "@clerk/nextjs/server";
import { getSubscriptionForUser, isSubscriptionActive } from "@/lib/accessControl";

export async function getCurrentSubscription() {
  const { userId } = await auth();

  if (!userId) return null;

  return getSubscriptionForUser(userId);
}

export async function isUserPro() {
  const subscription = await getCurrentSubscription();

  return isSubscriptionActive(subscription);
}

export async function getCurrentPlan() {
  const subscription = await getCurrentSubscription();

  return subscription?.plan ?? "free";
}

export async function daysRemaining() {
  const subscription = await getCurrentSubscription();

  if (!subscription) return 0;

  const diff =
    new Date(subscription.expires_at).getTime() -
    Date.now();

  return Math.max(
    0,
    Math.ceil(diff / (1000 * 60 * 60 * 24))
  );
}
