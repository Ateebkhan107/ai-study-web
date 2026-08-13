import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isGroupMember, isGroupAdmin, isGroupOwner } from "@/lib/community/permissions";
import { GroupMemberUpdateSchema, GroupMemberRemoveSchema } from "@/lib/validations";

// ─── GET /api/community/groups/[id]/members ──────────────────────────────────
export async function GET(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;

  const membership = await isGroupMember(groupId, userId);
  if (!membership) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("community_group_members")
    .select("id, user_id, role, status, joined_at")
    .eq("group_id", groupId)
    .eq("status", "ACTIVE")
    .order("joined_at", { ascending: true });

  if (error) return NextResponse.json({ error: "Server error" }, { status: 500 });

  // Enrich with profiles
  const userIds = (data || []).map((m) => m.user_id);
  let profiles = [];
  if (userIds.length > 0) {
    const { data: pData } = await supabaseAdmin
      .from("user_profiles")
      .select("clerk_user_id, full_name, exam, target_year")
      .in("clerk_user_id", userIds);
    profiles = pData || [];
  }
  const profileMap = Object.fromEntries(profiles.map((p) => [p.clerk_user_id, p]));

  const members = (data || []).map((m) => ({
    ...m,
    profile: profileMap[m.user_id] || { full_name: "Unknown" },
  }));

  return NextResponse.json({ members });
}

// ─── PATCH /api/community/groups/[id]/members ────────────────────────────────
// Promote/demote a member's role (owner only)
export async function PATCH(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;

  const owner = await isGroupOwner(groupId, userId);
  if (!owner) return NextResponse.json({ error: "Only the owner can change roles" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = GroupMemberUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { targetUserId, role } = parsed.data;

  if (targetUserId === userId)
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });

  const targetMembership = await isGroupMember(groupId, targetUserId);
  if (!targetMembership) return NextResponse.json({ error: "User is not a member" }, { status: 404 });
  if (targetMembership.role === "OWNER")
    return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("community_group_members")
    .update({ role })
    .eq("group_id", groupId)
    .eq("user_id", targetUserId);

  if (error) return NextResponse.json({ error: "Failed to update role" }, { status: 500 });

  return NextResponse.json({ success: true, role });
}

// ─── DELETE /api/community/groups/[id]/members ───────────────────────────────
// Remove a member (owner can remove anyone; admin can remove MEMBER only)
export async function DELETE(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;

  const isAdmin = await isGroupAdmin(groupId, userId);
  if (!isAdmin) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = GroupMemberRemoveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { targetUserId } = parsed.data;
  if (targetUserId === userId) return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });

  const targetMembership = await isGroupMember(groupId, targetUserId);
  if (!targetMembership) return NextResponse.json({ error: "User is not a member" }, { status: 404 });
  if (targetMembership.role === "OWNER")
    return NextResponse.json({ error: "Cannot remove the group owner" }, { status: 400 });

  // Admins can only remove MEMBERs, not other ADMINs
  const callerIsOwner = await isGroupOwner(groupId, userId);
  if (!callerIsOwner && targetMembership.role === "ADMIN")
    return NextResponse.json({ error: "Only the owner can remove admins" }, { status: 403 });

  const { error } = await supabaseAdmin
    .from("community_group_members")
    .update({ status: "REMOVED" })
    .eq("group_id", groupId)
    .eq("user_id", targetUserId);

  if (error) return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });

  // Update member count
  const { data: group } = await supabaseAdmin
    .from("community_groups")
    .select("member_count")
    .eq("id", groupId)
    .maybeSingle();
  if (group && group.member_count > 0) {
    await supabaseAdmin
      .from("community_groups")
      .update({ member_count: group.member_count - 1, updated_at: new Date().toISOString() })
      .eq("id", groupId);
  }

  return NextResponse.json({ success: true });
}
