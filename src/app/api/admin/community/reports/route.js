import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/admin";
import { AdminReportUpdateSchema } from "@/lib/validations";

// ─── GET /api/admin/community/reports ────────────────────────────────────────
export async function GET(request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "open";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 30;
  const offset = (page - 1) * limit;

  if (!["open", "dismissed", "actioned"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("community_reports")
    .select("id, reporter_id, target_type, target_id, reason, status, created_at, reviewed_by, reviewed_at")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: "Server error" }, { status: 500 });

  return NextResponse.json({ reports: data || [], page, limit });
}

// ─── PATCH /api/admin/community/reports ───────────────────────────────────────
export async function PATCH(request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AdminReportUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { reportId, action } = parsed.data;

  const { error } = await supabaseAdmin
    .from("community_reports")
    .update({
      status: action,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json({ success: true });
}
