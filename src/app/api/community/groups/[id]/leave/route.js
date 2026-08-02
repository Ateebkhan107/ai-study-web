import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isGroupMember, isGroupOwner } from "@/lib/community/permissions";

// ─── POST /api/community/groups/[id]/leave ────────────────────────────────────
export async function POST(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;

  const membership = await isGroupMember(groupId, userId);
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 400 });

  // Owner cannot leave — they must transfer ownership or delete the group
  const owner = await isGroupOwner(groupId, userId);
  if (owner)
    return NextResponse.json(
      { error: "Owners cannot leave. Transfer ownership or delete the group." },
      { status: 400 }
    );

  const { error } = await supabaseAdmin
    .from("community_group_members")
    .update({ status: "LEFT" })
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) {
    console.error("[LEAVE]", error);
    return NextResponse.json({ error: "Failed to leave group" }, { status: 500 });
  }

  // Decrement member count
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
