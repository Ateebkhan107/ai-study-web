import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { canAccessConversation } from "@/lib/community/permissions";

// ─── DELETE /api/community/direct/conversations/[id]/messages/[msgId] ─────────
export async function DELETE(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: convId, msgId } = await params;

  // Verify participant access
  const conv = await canAccessConversation(convId, userId);
  if (!conv) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  // Fetch message
  const { data: message } = await supabaseAdmin
    .from("community_direct_messages")
    .select("id, sender_id, is_deleted")
    .eq("id", msgId)
    .eq("conversation_id", convId)
    .maybeSingle();

  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
  if (message.is_deleted) return NextResponse.json({ error: "Already deleted" }, { status: 409 });

  // Only the sender can delete their own DM
  if (message.sender_id !== userId)
    return NextResponse.json({ error: "Cannot delete another user's message" }, { status: 403 });

  const { error } = await supabaseAdmin
    .from("community_direct_messages")
    .update({ is_deleted: true, content: "[Message deleted]", updated_at: new Date().toISOString() })
    .eq("id", msgId);

  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });

  return NextResponse.json({ success: true });
}
