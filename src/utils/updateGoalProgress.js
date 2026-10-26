"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { reconcileGoalRewards } from "@/lib/goalRewards.mjs";

// Compatibility entry point: clients request delivery of persisted activity;
// neither a supplied goal type nor an amount constitutes activity evidence.
export async function updateGoalProgress(userId) {
  const { userId: actor } = await auth();
  if (!actor) throw new Error("Unauthorized");
  if (userId !== actor) throw new Error("Forbidden");
  return reconcileGoalRewards(supabaseAdmin, actor);
}
