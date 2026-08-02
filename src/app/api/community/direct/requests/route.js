import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getCommunityUser,
  isBlockedBetweenUsers,
  checkRateLimit,
  sortedUserPair,
} from "@/lib/community/permissions";

// ─── GET /api/community/direct/requests ───────────────────────────────────────
// List pending DM requests sent TO this user
export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("community_direct_conversations")
    .select("id, user_one_id, user_two_id, requested_by, status, created_at")
    .or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Server error" }, { status: 500 });

  // Only show requests received (not sent by user)
  const received = (data || []).filter((c) => c.requested_by !== userId);

  // Enrich with requester profile
  const requesterIds = received.map((r) => r.requested_by);
  let profiles = [];
  if (requesterIds.length > 0) {
    const { data: pData } = await supabaseAdmin
      .from("user_profiles")
      .select("clerk_user_id, full_name, exam, target_year")
      .in("clerk_user_id", requesterIds);
    profiles = pData || [];
  }
  const profileMap = Object.fromEntries(profiles.map((p) => [p.clerk_user_id, p]));

  const enriched = received.map((r) => ({
    ...r,
    requesterProfile: profileMap[r.requested_by] || { full_name: "Unknown" },
  }));

  return NextResponse.json({ requests: enriched });
}

// ─── POST /api/community/direct/requests ──────────────────────────────────────
// Send a DM request to another user
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const communityUser = await getCommunityUser(userId);
  if (!communityUser) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (communityUser.isSuspended)
    return NextResponse.json({ error: "Your community access has been suspended" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { targetUserId } = body;
  if (!targetUserId || typeof targetUserId !== "string")
    return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
  if (targetUserId === userId)
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

  // Verify target user exists
  const targetUser = await getCommunityUser(targetUserId);
  if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Check block status
  const blocked = await isBlockedBetweenUsers(userId, targetUserId);
  if (blocked) return NextResponse.json({ error: "Cannot message this user" }, { status: 403 });

  // Rate limit
  const { allowed } = await checkRateLimit(userId, "dm_request");
  if (!allowed) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

  // Canonical ordering prevents duplicate conversations
  const [userOneId, userTwoId] = sortedUserPair(userId, targetUserId);

  // Check if conversation already exists
  const { data: existing } = await supabaseAdmin
    .from("community_direct_conversations")
    .select("id, status")
    .eq("user_one_id", userOneId)
    .eq("user_two_id", userTwoId)
    .maybeSingle();

  if (existing) {
    if (existing.status === "ACTIVE")
      return NextResponse.json({ error: "Already have an active conversation" }, { status: 409 });
    if (existing.status === "PENDING")
      return NextResponse.json({ error: "Request already pending" }, { status: 409 });
    if (existing.status === "BLOCKED")
      return NextResponse.json({ error: "Cannot message this user" }, { status: 403 });
    if (existing.status === "DECLINED") {
      // Allow re-request after decline
      const { error } = await supabaseAdmin
        .from("community_direct_conversations")
        .update({ status: "PENDING", requested_by: userId, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
      return NextResponse.json({ conversationId: existing.id, status: "requested" });
    }
  }

  const { data: conv, error } = await supabaseAdmin
    .from("community_direct_conversations")
    .insert({ user_one_id: userOneId, user_two_id: userTwoId, requested_by: userId, status: "PENDING" })
    .select("id")
    .single();

  if (error) {
    console.error("[DM_REQUEST_POST]", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }

  return NextResponse.json({ conversationId: conv.id, status: "requested" }, { status: 201 });
}
