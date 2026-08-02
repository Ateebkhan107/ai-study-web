import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { canManageJoinRequests } from "@/lib/community/permissions";

// ─── GET /api/community/groups/[id]/requests ─────────────────────────────────
// Owner/admin: list pending join requests
export async function GET(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;

  const canManage = await canManageJoinRequests(groupId, userId);
  if (!canManage) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "PENDING";

  if (!["PENDING", "ACCEPTED", "REJECTED"].includes(status))
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("community_join_requests")
    .select("id, user_id, status, created_at, reviewed_at, reviewed_by")
    .eq("group_id", groupId)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[REQUESTS_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // Enrich with display names from user_profiles
  const userIds = (data || []).map((r) => r.user_id);
  let profiles = [];
  if (userIds.length > 0) {
    const { data: pData } = await supabaseAdmin
      .from("user_profiles")
      .select("clerk_user_id, full_name, exam, target_year")
      .in("clerk_user_id", userIds);
    profiles = pData || [];
  }
  const profileMap = Object.fromEntries(profiles.map((p) => [p.clerk_user_id, p]));

  const enriched = (data || []).map((r) => ({
    ...r,
    requester: profileMap[r.user_id] || { full_name: "Unknown", exam: "", target_year: null },
  }));

  return NextResponse.json({ requests: enriched });
}

// ─── PATCH /api/community/groups/[id]/requests ────────────────────────────────
// Accept or reject a join request
export async function PATCH(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;

  const canManage = await canManageJoinRequests(groupId, userId);
  if (!canManage) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { requestId, action } = body;
  if (!requestId || !["ACCEPTED", "REJECTED"].includes(action))
    return NextResponse.json({ error: "requestId and action (ACCEPTED|REJECTED) required" }, { status: 400 });

  // Verify request belongs to this group
  const { data: req } = await supabaseAdmin
    .from("community_join_requests")
    .select("id, user_id, status")
    .eq("id", requestId)
    .eq("group_id", groupId)
    .maybeSingle();

  if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (req.status !== "PENDING") return NextResponse.json({ error: "Request already reviewed" }, { status: 409 });

  // Update request status
  const { error: reqErr } = await supabaseAdmin
    .from("community_join_requests")
    .update({ status: action, reviewed_by: userId, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (reqErr) {
    console.error("[REQUEST_PATCH]", reqErr);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }

  if (action === "ACCEPTED") {
    // Add as MEMBER
    const { error: memberErr } = await supabaseAdmin.from("community_group_members").upsert(
      { group_id: groupId, user_id: req.user_id, role: "MEMBER", status: "ACTIVE" },
      { onConflict: "group_id,user_id" }
    );
    if (memberErr) console.error("[REQUEST_ACCEPT_MEMBER]", memberErr);

    // Update member count
    const { data: group } = await supabaseAdmin
      .from("community_groups")
      .select("member_count")
      .eq("id", groupId)
      .maybeSingle();
    if (group) {
      await supabaseAdmin
        .from("community_groups")
        .update({ member_count: (group.member_count || 0) + 1, updated_at: new Date().toISOString() })
        .eq("id", groupId);
    }
  }

  return NextResponse.json({ success: true, action });
}
