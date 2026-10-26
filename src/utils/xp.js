import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { claimBadge } from "@/lib/integrity.server.mjs";
// Compatibility symbol: an arbitrary numeric delta is no longer a reward proof.
// Test, PYQ and goal rewards commit with their authoritative DB transactions.
export async function addXP(userId, source) {
 if(!source || source.kind!=="BADGE" || !source.id) throw Error("Verified reward source required");
 return claimBadge(supabaseAdmin,userId,source.id);
}
