import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getCommunityUser,
  isGroupMember,
  getUserGroupCount,
  MAX_GROUPS_PER_USER,
  checkRateLimit,
} from "@/lib/community/permissions";

// ─── POST /api/community/groups/[id]/join ─────────────────────────────────────
// PUBLIC group → join directly
// PRIVATE group → create join request
export async function POST(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;

  const communityUser = await getCommunityUser(userId);
  if (!communityUser) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (communityUser.isSuspended)
    return NextResponse.json({ error: "Your community access has been suspended" }, { status: 403 });

  // Get group
  const { data: group } = await supabaseAdmin
    .from("community_groups")
    .select("id, exam_track, privacy, is_frozen")
    .eq("id", groupId)
    .maybeSingle();

  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  if (group.is_frozen) return NextResponse.json({ error: "This group is frozen" }, { status: 403 });
  if (group.exam_track !== communityUser.examTrack)
    return NextResponse.json({ error: "You can only join groups for your exam track" }, { status: 403 });

  // Check if already a member
  const existing = await isGroupMember(groupId, userId);
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });

  // Removed/Left users may re-request but count toward group limit
  const groupCount = await getUserGroupCount(userId);
  if (groupCount >= MAX_GROUPS_PER_USER)
    return NextResponse.json({ error: `Maximum ${MAX_GROUPS_PER_USER} groups allowed` }, { status: 400 });

  // Rate limit join requests
  const { allowed } = await checkRateLimit(userId, "join_request");
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  if (group.privacy === "PUBLIC") {
    // Join directly
    const { error } = await supabaseAdmin.from("community_group_members").upsert(
      { group_id: groupId, user_id: userId, role: "MEMBER", status: "ACTIVE" },
      { onConflict: "group_id,user_id" }
    );
    if (error) {
      console.error("[JOIN_PUBLIC]", error);
      return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
    }

    // Update member count
    await supabaseAdmin.rpc("increment_community_member_count", { gid: groupId }).catch(() => {
      // Fallback: manual update
      supabaseAdmin
        .from("community_groups")
        .update({ member_count: supabaseAdmin.raw("member_count + 1"), updated_at: new Date().toISOString() })
        .eq("id", groupId);
    });

    return NextResponse.json({ status: "joined" }, { status: 200 });
  } else {
    // PRIVATE — check for existing pending request
    const { data: existingReq } = await supabaseAdmin
      .from("community_join_requests")
      .select("id, status")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .eq("status", "PENDING")
      .maybeSingle();

    if (existingReq) return NextResponse.json({ error: "Request already pending" }, { status: 409 });

    const { error } = await supabaseAdmin
      .from("community_join_requests")
      .insert({ group_id: groupId, user_id: userId, status: "PENDING" });

    if (error) {
      console.error("[JOIN_PRIVATE]", error);
      return NextResponse.json({ error: "Failed to send join request" }, { status: 500 });
    }

    return NextResponse.json({ status: "requested" }, { status: 200 });
  }
}
