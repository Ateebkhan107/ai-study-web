// Server integration only. Callers supply Clerk-verified identity. No client
// progress, XP amount, goal type or arbitrary event crosses this API.
// Unapplied SQL and PostgreSQL 17.6 verification are prerequisites to enabling.
export function goalRewardsEnabled() {
  return process.env.GOAL_REWARDS_TRANSACTIONAL === "true" || process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED === "true";
}

export async function reconcileGoalRewards(db, userId) {
  if (!userId || typeof userId !== "string") throw new Error("Verified identity required");
  if (!goalRewardsEnabled()) return { status: "pending_migration" };
  const { data, error } = await db.rpc("prepzii_deliver_goal_rewards", { p_user: userId });
  // Never fall back to progress persistence plus a separate XP write.
  if (error) throw new Error("Goal reward delivery pending", { cause: error });
  return { status: "delivered", receipt: data };
}

export async function recordFormulaAccess(db, userId, bookId) {
  if (!userId || !bookId) throw new Error("Verified resource access required");
  if (!goalRewardsEnabled()) return { status: "pending_migration" };
  // Call only AFTER Clerk, entitlement and resource lookup succeed. This means
  // book access, not proof of learning; once per book and UTC day.
  const { data, error } = await db.rpc("prepzii_record_formula_access", {
    p_user: userId, p_book: String(bookId),
  });
  if (error) throw new Error("Formula activity persistence failed", { cause: error });
  return { status: "recorded", receipt: data };
}
