import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isGroupAdmin } from "@/lib/community/permissions";

// ─── DELETE /api/community/groups/[id]/messages/[msgId] ───────────────────────
// Users can delete their own messages; admins/owners can soft-delete any message
export async function DELETE(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId, msgId } = await params;

  // Fetch the message
  const { data: message } = await supabaseAdmin
    .from("community_group_messages")
    .select("id, sender_id, group_id, is_deleted")
    .eq("id", msgId)
    .eq("group_id", groupId)
    .maybeSingle();

  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
  if (message.is_deleted) return NextResponse.json({ error: "Already deleted" }, { status: 409 });

  const isOwnMessage = message.sender_id === userId;
  const adminAccess = await isGroupAdmin(groupId, userId);

  if (!isOwnMessage && !adminAccess)
    return NextResponse.json({ error: "Cannot delete another user's message" }, { status: 403 });

  const { error } = await supabaseAdmin
    .from("community_group_messages")
    .update({ is_deleted: true, content: "[Message deleted]", updated_at: new Date().toISOString() })
    .eq("id", msgId);

  if (error) {
    console.error("[MESSAGE_DELETE]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
