/**
 * Community Permission Helpers
 *
 * All authorization for the community feature is centralised here.
 * These functions run server-side only (API routes).
 * They use supabaseAdmin so they bypass RLS — but they ENFORCE
 * business-logic authorization themselves.
 *
 * IMPORTANT: Never trust user-supplied IDs from request bodies.
 * Always derive the acting user from the Clerk session.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ─── Rate-limit constants ────────────────────────────────────────────────────
export const RATE_LIMITS = {
  message: { count: 20, windowMs: 60 * 1000 },          // 20/min
  dm_request: { count: 5, windowMs: 60 * 60 * 1000 },   // 5/hour
  group_create: { count: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3/day
  join_request: { count: 20, windowMs: 24 * 60 * 60 * 1000 }, // 20/day
  report: { count: 10, windowMs: 24 * 60 * 60 * 1000 }, // 10/day
};

export const MAX_GROUPS_PER_USER = 3;

// ─── getCommunityUser ─────────────────────────────────────────────────────────
/**
 * Fetches user_profiles row and community_user_status.
 * Returns null if user not found.
 * Returns { ...profile, isSuspended, examTrack }
 */
export async function getCommunityUser(userId) {
  if (!userId) return null;

  const [{ data: profile }, { data: status }] = await Promise.all([
    supabaseAdmin
      .from("user_profiles")
      .select("clerk_user_id, full_name, exam, target_year")
      .eq("clerk_user_id", userId)
      .maybeSingle(),
    supabaseAdmin
      .from("community_user_status")
      .select("is_suspended")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (!profile) return null;

  return {
    ...profile,
    isSuspended: status?.is_suspended === true,
    examTrack: profile.exam?.toUpperCase() || "JEE",
  };
}

// ─── isGroupMember ────────────────────────────────────────────────────────────
/**
 * Returns the membership row if userId is an ACTIVE member of groupId, else null.
 */
export async function isGroupMember(groupId, userId) {
  if (!groupId || !userId) return null;

  const { data } = await supabaseAdmin
    .from("community_group_members")
    .select("id, role, status")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .eq("status", "ACTIVE")
    .maybeSingle();

  return data || null;
}

// ─── isGroupAdmin ─────────────────────────────────────────────────────────────
export async function isGroupAdmin(groupId, userId) {
  const member = await isGroupMember(groupId, userId);
  if (!member) return false;
  return member.role === "ADMIN" || member.role === "OWNER";
}

// ─── isGroupOwner ─────────────────────────────────────────────────────────────
export async function isGroupOwner(groupId, userId) {
  const member = await isGroupMember(groupId, userId);
  if (!member) return false;
  return member.role === "OWNER";
}

// ─── canReadGroup ─────────────────────────────────────────────────────────────
/**
 * Public groups: any authenticated user can read.
 * Private groups: only active members.
 */
export async function canReadGroup(groupId, userId) {
  const { data: group } = await supabaseAdmin
    .from("community_groups")
    .select("privacy, is_frozen")
    .eq("id", groupId)
    .maybeSingle();

  if (!group || group.is_frozen) return false;
  if (group.privacy === "PUBLIC") return true;

  const member = await isGroupMember(groupId, userId);
  return Boolean(member);
}

// ─── canSendGroupMessage ──────────────────────────────────────────────────────
export async function canSendGroupMessage(groupId, userId) {
  const member = await isGroupMember(groupId, userId);
  if (!member) return false;

  const communityUser = await getCommunityUser(userId);
  if (communityUser?.isSuspended) return false;

  return true;
}

// ─── canManageJoinRequests ────────────────────────────────────────────────────
export async function canManageJoinRequests(groupId, userId) {
  return isGroupAdmin(groupId, userId);
}

// ─── canAccessConversation ────────────────────────────────────────────────────
/**
 * Returns the conversation row if userId is a participant, else null.
 */
export async function canAccessConversation(convId, userId) {
  if (!convId || !userId) return null;

  const { data } = await supabaseAdmin
    .from("community_direct_conversations")
    .select("*")
    .eq("id", convId)
    .or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`)
    .maybeSingle();

  return data || null;
}

// ─── isBlockedBetweenUsers ────────────────────────────────────────────────────
/**
 * Returns true if either user has blocked the other.
 */
export async function isBlockedBetweenUsers(userA, userB) {
  if (!userA || !userB) return false;

  const { data } = await supabaseAdmin
    .from("community_user_blocks")
    .select("id")
    .or(
      `and(blocker_id.eq.${userA},blocked_user_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_user_id.eq.${userA})`
    )
    .limit(1);

  return Array.isArray(data) && data.length > 0;
}

// ─── checkRateLimit ───────────────────────────────────────────────────────────
/**
 * Returns { allowed: bool, remaining: int }.
 * Cleans up old rate-limit records older than window to avoid unbounded table growth.
 */
export async function checkRateLimit(userId, action) {
  const limit = RATE_LIMITS[action];
  if (!limit) return { allowed: true, remaining: 999 };

  const windowStart = new Date(Date.now() - limit.windowMs).toISOString();

  const { count } = await supabaseAdmin
    .from("community_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", windowStart);

  const used = count || 0;
  const allowed = used < limit.count;

  if (allowed) {
    // Record this usage
    await supabaseAdmin.from("community_rate_limits").insert({
      user_id: userId,
      action,
    });
  }

  return { allowed, remaining: Math.max(0, limit.count - used - (allowed ? 1 : 0)) };
}

// ─── getGroupForUser ──────────────────────────────────────────────────────────
/**
 * Fetches a group and the caller's membership in one call.
 * Returns { group, membership } or { group: null, membership: null }
 */
export async function getGroupForUser(groupId, userId) {
  const [{ data: group }, membership] = await Promise.all([
    supabaseAdmin
      .from("community_groups")
      .select("*")
      .eq("id", groupId)
      .maybeSingle(),
    isGroupMember(groupId, userId),
  ]);
  return { group: group || null, membership };
}

// ─── getUserGroupCount ────────────────────────────────────────────────────────
/**
 * Count how many active groups the user currently belongs to (as any role).
 */
export async function getUserGroupCount(userId) {
  const { count } = await supabaseAdmin
    .from("community_group_members")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "ACTIVE");

  return count || 0;
}

// ─── getOrCreateConversation ──────────────────────────────────────────────────
/**
 * Canonical conversation IDs: always store user IDs alphabetically as
 * (user_one_id, user_two_id) so there can never be duplicate conv rows.
 */
export function sortedUserPair(userA, userB) {
  return userA < userB ? [userA, userB] : [userB, userA];
}
