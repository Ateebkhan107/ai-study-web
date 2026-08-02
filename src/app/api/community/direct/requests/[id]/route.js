import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ─── PATCH /api/community/direct/requests/[id] ────────────────────────────────
// Accept or decline a DM request
export async function PATCH(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: convId } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;
  if (!["ACTIVE", "DECLINED"].includes(action))
    return NextResponse.json({ error: "action must be ACTIVE or DECLINED" }, { status: 400 });

  // Fetch conversation and verify user is the recipient (not the requester)
  const { data: conv } = await supabaseAdmin
    .from("community_direct_conversations")
    .select("id, user_one_id, user_two_id, requested_by, status")
    .eq("id", convId)
    .maybeSingle();

  if (!conv) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  // Only a participant can respond, and only the NON-requester
  const isParticipant = conv.user_one_id === userId || conv.user_two_id === userId;
  if (!isParticipant) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  if (conv.requested_by === userId)
    return NextResponse.json({ error: "Cannot respond to your own request" }, { status: 400 });

  if (conv.status !== "PENDING")
    return NextResponse.json({ error: "Request already responded to" }, { status: 409 });

  const { error } = await supabaseAdmin
    .from("community_direct_conversations")
    .update({ status: action, updated_at: new Date().toISOString() })
    .eq("id", convId);

  if (error) {
    console.error("[DM_REQUEST_PATCH]", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: action });
}
