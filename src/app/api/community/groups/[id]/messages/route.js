import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { canSendGroupMessage, isGroupMember, checkRateLimit } from "@/lib/community/permissions";

const PAGE_SIZE = 40;

// ─── GET /api/community/groups/[id]/messages ──────────────────────────────────
// Paginated group messages — oldest messages fetched via cursor
export async function GET(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;

  const membership = await isGroupMember(groupId, userId);
  if (!membership) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const before = searchParams.get("before"); // ISO timestamp cursor for pagination

  let query = supabaseAdmin
    .from("community_group_messages")
    .select("id, sender_id, content, is_deleted, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[MESSAGES_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const messages = (data || []).reverse(); // Return oldest→newest for display

  // Enrich with sender display names
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
    // Replace content for deleted messages — never expose deleted content
    content: m.is_deleted ? "[Message deleted]" : m.content,
    senderName: profileMap[m.sender_id] || "Unknown",
    isOwn: m.sender_id === userId,
  }));

  const hasMore = data && data.length === PAGE_SIZE;

  return NextResponse.json({ messages: enriched, hasMore });
}

// ─── POST /api/community/groups/[id]/messages ─────────────────────────────────
// Send a group message
export async function POST(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;

  const canSend = await canSendGroupMessage(groupId, userId);
  if (!canSend) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  // Rate limit
  const { allowed } = await checkRateLimit(userId, "message");
  if (!allowed)
    return NextResponse.json({ error: "Message rate limit exceeded. Wait a moment." }, { status: 429 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const content = (body.content || "").trim();
  if (!content) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  if (content.length > 2000)
    return NextResponse.json({ error: "Message too long (max 2000 characters)" }, { status: 400 });

  // sender_id is always derived from the Clerk session — never from body
  const { data: message, error } = await supabaseAdmin
    .from("community_group_messages")
    .insert({ group_id: groupId, sender_id: userId, content })
    .select("id, sender_id, content, is_deleted, created_at")
    .single();

  if (error) {
    console.error("[MESSAGE_POST]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  // Get sender name
  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("full_name")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  return NextResponse.json(
    {
      message: {
        ...message,
        senderName: profile?.full_name || "Unknown",
        isOwn: true,
      },
    },
    { status: 201 }
  );
}
