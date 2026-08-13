import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GroupCreateSchema } from "@/lib/validations";
import {
  getCommunityUser,
  getUserGroupCount,
  MAX_GROUPS_PER_USER,
  checkRateLimit,
} from "@/lib/community/permissions";

async function attachActiveMemberCounts(groups) {
  const groupIds = (groups || []).map((group) => group.id).filter(Boolean);
  if (groupIds.length === 0) return groups || [];

  const { data: activeMembers, error } = await supabaseAdmin
    .from("community_group_members")
    .select("group_id")
    .in("group_id", groupIds)
    .eq("status", "ACTIVE");

  if (error) throw error;

  const countMap = new Map();
  for (const member of activeMembers || []) {
    countMap.set(member.group_id, (countMap.get(member.group_id) || 0) + 1);
  }

  return (groups || []).map((group) => ({
    ...group,
    member_count: countMap.get(group.id) || 0,
  }));
}

// ─── GET /api/community/groups ────────────────────────────────────────────────
// List groups for the user's exam track with optional pagination + search
export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const communityUser = await getCommunityUser(userId);
  if (!communityUser) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
  const search = searchParams.get("q") || "";
  const type = searchParams.get("type") || "discover"; // "discover" | "mine"
  const offset = (page - 1) * limit;

  try {
    if (type === "mine") {
      // Groups the user is an active member of
      const { data, error } = await supabaseAdmin
        .from("community_group_members")
        .select(
          `role, status, joined_at,
           community_groups (id, name, description, exam_track, privacy, owner_id, member_count, created_at)`
        )
        .eq("user_id", userId)
        .eq("status", "ACTIVE")
        .order("joined_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const groups = (data || []).map((m) => ({
        ...m.community_groups,
        myRole: m.role,
      }));

      return NextResponse.json({ groups: await attachActiveMemberCounts(groups), page, limit });
    }

    // Discover: groups matching user's exam track (excluding ones they're in)
    let query = supabaseAdmin
      .from("community_groups")
      .select("id, name, description, exam_track, privacy, owner_id, member_count, created_at")
      .eq("exam_track", communityUser.examTrack)
      .eq("is_frozen", false)
      .order("member_count", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data: groups, error } = await query;
    if (error) throw error;

    // Attach membership info for each group
    const groupIds = (groups || []).map((g) => g.id);
    let memberships = [];
    if (groupIds.length > 0) {
      const { data: mData } = await supabaseAdmin
        .from("community_group_members")
        .select("group_id, role, status")
        .eq("user_id", userId)
        .in("group_id", groupIds);
      memberships = mData || [];
    }

    const membershipMap = Object.fromEntries(memberships.map((m) => [m.group_id, m]));

    const groupsWithCounts = await attachActiveMemberCounts(groups || []);

    const enriched = groupsWithCounts.map((g) => ({
      ...g,
      myRole: membershipMap[g.id]?.role || null,
      myStatus: membershipMap[g.id]?.status || null,
    }));

    return NextResponse.json({ groups: enriched, page, limit });
  } catch (err) {
    console.error("[COMMUNITY_GROUPS_GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/community/groups ───────────────────────────────────────────────
// Create a new group
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const communityUser = await getCommunityUser(userId);
  if (!communityUser) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (communityUser.isSuspended)
    return NextResponse.json({ error: "Your community access has been suspended" }, { status: 403 });

  // Rate limit: 3 groups per day
  const { allowed } = await checkRateLimit(userId, "group_create");
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });

  // Group count limit
  const count = await getUserGroupCount(userId);
  if (count >= MAX_GROUPS_PER_USER)
    return NextResponse.json(
      { error: `You can only be in up to ${MAX_GROUPS_PER_USER} groups.` },
      { status: 400 }
    );

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GroupCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { name, description, privacy, category, avatar_url } = parsed.data;

  // User can only create groups for their own exam track
  const examTrack = communityUser.examTrack;

  try {
    const { data: group, error: groupErr } = await supabaseAdmin
      .from("community_groups")
      .insert({ name, description: description || null, exam_track: examTrack, privacy, owner_id: userId, member_count: 1 })
      .select()
      .single();

    if (groupErr) throw groupErr;

    // Add creator as OWNER member
    const { error: memberErr } = await supabaseAdmin.from("community_group_members").insert({
      group_id: group.id,
      user_id: userId,
      role: "OWNER",
      status: "ACTIVE",
    });

    if (memberErr) throw memberErr;

    return NextResponse.json({ group }, { status: 201 });
  } catch (err) {
    console.error("[COMMUNITY_GROUPS_POST]", err);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
