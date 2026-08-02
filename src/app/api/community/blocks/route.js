import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCommunityUser } from "@/lib/community/permissions";

// ─── GET /api/community/blocks ────────────────────────────────────────────────
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("community_user_blocks")
    .select("id, blocked_user_id, created_at")
    .eq("blocker_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Server error" }, { status: 500 });

  // Enrich with blocked user profiles
  const blockedIds = (data || []).map((b) => b.blocked_user_id);
  let profiles = [];
  if (blockedIds.length > 0) {
    const { data: pData } = await supabaseAdmin
      .from("user_profiles")
      .select("clerk_user_id, full_name, exam")
      .in("clerk_user_id", blockedIds);
    profiles = pData || [];
  }
  const profileMap = Object.fromEntries(profiles.map((p) => [p.clerk_user_id, p]));

  const blocks = (data || []).map((b) => ({
    ...b,
    blockedUser: profileMap[b.blocked_user_id] || { full_name: "Unknown" },
  }));

  return NextResponse.json({ blocks });
}

// ─── POST /api/community/blocks ───────────────────────────────────────────────
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { targetUserId } = body;
  if (!targetUserId) return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
  if (targetUserId === userId) return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });

  // Verify target exists
  const target = await getCommunityUser(targetUserId);
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { error } = await supabaseAdmin
    .from("community_user_blocks")
    .upsert({ blocker_id: userId, blocked_user_id: targetUserId }, { onConflict: "blocker_id,blocked_user_id" });

  if (error) {
    console.error("[BLOCK_POST]", error);
    return NextResponse.json({ error: "Failed to block user" }, { status: 500 });
  }

  // Block any active conversation between them
  await supabaseAdmin
    .from("community_direct_conversations")
    .update({ status: "BLOCKED", updated_at: new Date().toISOString() })
    .or(
      `and(user_one_id.eq.${userId},user_two_id.eq.${targetUserId}),and(user_one_id.eq.${targetUserId},user_two_id.eq.${userId})`
    )
    .in("status", ["ACTIVE", "PENDING"]);

  return NextResponse.json({ success: true });
}

// ─── DELETE /api/community/blocks ─────────────────────────────────────────────
export async function DELETE(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { targetUserId } = body;
  if (!targetUserId) return NextResponse.json({ error: "targetUserId required" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("community_user_blocks")
    .delete()
    .eq("blocker_id", userId)
    .eq("blocked_user_id", targetUserId);

  if (error) return NextResponse.json({ error: "Failed to unblock" }, { status: 500 });

  return NextResponse.json({ success: true });
}
