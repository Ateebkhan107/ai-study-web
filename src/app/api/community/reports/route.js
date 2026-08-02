import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { checkRateLimit } from "@/lib/community/permissions";

// ─── POST /api/community/reports ──────────────────────────────────────────────
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 10 reports per day
  const { allowed } = await checkRateLimit(userId, "report");
  if (!allowed) return NextResponse.json({ error: "Report limit reached for today" }, { status: 429 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { targetType, targetId, reason } = body;

  if (!["user", "message", "group"].includes(targetType))
    return NextResponse.json({ error: "targetType must be user, message, or group" }, { status: 400 });

  if (!targetId || typeof targetId !== "string")
    return NextResponse.json({ error: "targetId required" }, { status: 400 });

  const cleanReason = (reason || "").trim();
  if (!cleanReason || cleanReason.length > 500)
    return NextResponse.json({ error: "Reason required (max 500 characters)" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("community_reports")
    .insert({
      reporter_id: userId,
      target_type: targetType,
      target_id: targetId,
      reason: cleanReason,
      status: "open",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[REPORT_POST]", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }

  return NextResponse.json({ success: true, reportId: data.id }, { status: 201 });
}
