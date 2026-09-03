import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GroupCreateSchema } from "@/lib/validations";
import { listCommunityGroupsForUser } from "@/services/community.server";
import {
  getCommunityUser,
  getUserGroupCount,
  MAX_GROUPS_PER_USER,
  checkRateLimit,
} from "@/lib/community/permissions";

// ─── GET /api/community/groups ────────────────────────────────────────────────
// List groups for the user's exam track with optional pagination + search
export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);

  try {
    const result = await listCommunityGroupsForUser(userId, {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      search: searchParams.get("q") || "",
      type: searchParams.get("type") || "discover",
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }

    return NextResponse.json(result);
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

  const { name, description, privacy } = parsed.data;

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
