import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GroupUpdateSchema } from "@/lib/validations";
import { isGroupOwner } from "@/lib/community/permissions";
import { getCommunityGroupForUser } from "@/services/community.server";

// ─── GET /api/community/groups/[id] ──────────────────────────────────────────
export async function GET(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const result = await getCommunityGroupForUser(id, userId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GROUP_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─── PATCH /api/community/groups/[id] ────────────────────────────────────────
// Only the owner can update group name / description / privacy
export async function PATCH(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const owner = await isGroupOwner(id, userId);
  if (!owner) return NextResponse.json({ error: "Only the group owner can edit settings" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = GroupUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const updates = { ...parsed.data };
  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("community_groups")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[GROUP_PATCH]", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ group: data });
}

// ─── DELETE /api/community/groups/[id] ───────────────────────────────────────
// Only the owner can delete the group
export async function DELETE(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const owner = await isGroupOwner(id, userId);
  if (!owner) return NextResponse.json({ error: "Only the group owner can delete this group" }, { status: 403 });

  const { error } = await supabaseAdmin.from("community_groups").delete().eq("id", id);
  if (error) {
    console.error("[GROUP_DELETE]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
