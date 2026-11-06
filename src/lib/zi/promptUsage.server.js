import "server-only";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const FREE_ZI_PROMPT_LIMIT = 3;
export class ZiUsageError extends Error {
  constructor() {
    super("Zi usage accounting is temporarily unavailable.");
    this.code = "ZI_USAGE_UNAVAILABLE";
  }
}

// Only trusted server callers supply the Clerk owner. No browser RPC access.
export async function promptUsageOperation(userId, operation, requestId = null, client = supabaseAdmin) {
  if (!userId) throw new ZiUsageError();
  const { data, error } = await client.rpc("zi_trial_prompt_usage", {
    p_owner: userId, p_operation: operation, p_request: requestId,
  });
  if (error || !data || !Number.isInteger(data.used) || !Number.isInteger(data.pending) ||
      data.used < 0 || data.pending < 0 || data.limit !== FREE_ZI_PROMPT_LIMIT ||
      data.remaining !== Math.max(0, data.limit - data.used - data.pending) ||
      (operation === "reserve" && (typeof data.allowed !== "boolean" || (data.allowed && data.requestId !== requestId))) ||
      (["dispatch", "consume"].includes(operation) && data.state !== (operation === "dispatch" ? "dispatched" : "consumed"))) {
    throw new ZiUsageError();
  }
  return { ...data, available: true };
}

export async function getZiFreePromptsUsage(userId) {
  try {
    return await promptUsageOperation(userId, "read");
  } catch {
    return { used: 0, pending: 0, limit: FREE_ZI_PROMPT_LIMIT, remaining: 0, available: false };
  }
}

export async function reserveZiFreePrompt(userId) {
  return promptUsageOperation(userId, "reserve", randomUUID());
}
