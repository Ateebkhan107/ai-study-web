import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  canAccessConversation,
  isBlockedBetweenUsers,
  checkRateLimit,
} from "@/lib/community/permissions";

const PAGE_SIZE = 40;

// ─── GET /api/community/direct/conversations/[id]/messages ────────────────────
export async function GET(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: convId } = await params;

  const conv = await canAccessConversation(convId, userId);
  if (!conv) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  if (conv.status !== "ACTIVE") return NextResponse.json({ error: "Conversation not active" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const before = searchParams.get("before");

  let query = supabaseAdmin
    .from("community_direct_messages")
    .select("id, sender_id, content, is_deleted, created_at")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (before) query = query.lt("created_at", before);

  const { data, error } = await query;
  if (error) {
    console.error("[DM_MESSAGES_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const messages = (data || []).reverse();

  // Enrich sender names
  const senderIds = [...new Set(messages.map((m) => m.sender_id))];
  let profiles = [];
  if (senderIds.length > 0) {
    const { data: pData } = await supabaseAdmin
      .from("user_profiles")
      .select("clerk_user_id, full_name")
      .in("clerk_user_id", senderIds);
    profiles = pData || [];
  }
  const profileMap = Object.fromEntries(profiles.map((p) => [p.clerk_user_id, p.full_name]));

  const enriched = messages.map((m) => ({
    ...m,
    content: m.is_deleted ? "[Message deleted]" : m.content,
    senderName: profileMap[m.sender_id] || "Unknown",
    isOwn: m.sender_id === userId,
  }));

  return NextResponse.json({ messages: enriched, hasMore: (data || []).length === PAGE_SIZE });
}

// ─── POST /api/community/direct/conversations/[id]/messages ───────────────────
export async function POST(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: convId } = await params;

  const conv = await canAccessConversation(convId, userId);
  if (!conv) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  if (conv.status !== "ACTIVE") return NextResponse.json({ error: "Conversation not active" }, { status: 403 });

  const otherId = conv.user_one_id === userId ? conv.user_two_id : conv.user_one_id;

  // Check block status
  const blocked = await isBlockedBetweenUsers(userId, otherId);
  if (blocked) return NextResponse.json({ error: "Cannot send message to this user" }, { status: 403 });

  // Rate limit
  const { allowed } = await checkRateLimit(userId, "message");
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const content = (body.content || "").trim();
  if (!content) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

  const { data: message, error } = await supabaseAdmin
    .from("community_direct_messages")
    .insert({ conversation_id: convId, sender_id: userId, content })
    .select("id, sender_id, content, is_deleted, created_at")
    .single();

  if (error) {
    console.error("[DM_MESSAGE_POST]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  // Update conversation updated_at for ordering
  await supabaseAdmin
    .from("community_direct_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", convId);

  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("full_name")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  return NextResponse.json(
    { message: { ...message, senderName: profile?.full_name || "Unknown", isOwn: true } },
    { status: 201 }
  );
}
