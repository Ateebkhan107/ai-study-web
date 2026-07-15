import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getCurrentSubscription() {
  const { userId } = await auth();

  if (!userId) return null;

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("status", "active")
    .single();

  if (error || !data) return null;

  return data;
}

export async function isUserPro() {
  const subscription = await getCurrentSubscription();

  if (!subscription) return false;

  return new Date(subscription.expires_at) > new Date();
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