import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ─── GET /api/community/direct/conversations ──────────────────────────────────
// List active DM conversations for the current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("community_direct_conversations")
    .select("id, user_one_id, user_two_id, requested_by, status, created_at, updated_at")
    .or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`)
    .eq("status", "ACTIVE")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[CONVERSATIONS_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // Enrich with the OTHER participant's profile
  const otherUserIds = (data || []).map((c) =>
    c.user_one_id === userId ? c.user_two_id : c.user_one_id
  );

  let profiles = [];
  if (otherUserIds.length > 0) {
    const uniqueIds = [...new Set(otherUserIds)];
    const { data: pData } = await supabaseAdmin
      .from("user_profiles")
      .select("clerk_user_id, full_name, exam, target_year")
      .in("clerk_user_id", uniqueIds);
    profiles = pData || [];
  }

  const profileMap = Object.fromEntries(profiles.map((p) => [p.clerk_user_id, p]));

  const conversations = (data || []).map((c) => {
    const otherId = c.user_one_id === userId ? c.user_two_id : c.user_one_id;
    return {
      ...c,
      otherUser: profileMap[otherId] || { full_name: "Unknown", clerk_user_id: otherId },
    };
  });

  return NextResponse.json({ conversations });
}
