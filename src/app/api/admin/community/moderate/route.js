import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/admin";
import { ModerationActionSchema } from "@/lib/validations";

const ALLOWED_ACTIONS = [
  "dismiss_report",
  "hide_message",
  "suspend_user",
  "unsuspend_user",
  "remove_from_group",
  "freeze_group",
  "unfreeze_group",
  "delete_group",
];

// ─── POST /api/admin/community/moderate ───────────────────────────────────────
export async function POST(request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId: adminId } = await auth();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ModerationActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { action, targetType, targetId, reason, extra } = parsed.data;

  let result;

  switch (action) {
    case "hide_message": {
      // Works for both group and DM messages
      const [gmResult, dmResult] = await Promise.allSettled([
        supabaseAdmin
          .from("community_group_messages")
          .update({ is_deleted: true, content: "[Removed by moderator]", updated_at: new Date().toISOString() })
          .eq("id", targetId),
        supabaseAdmin
          .from("community_direct_messages")
          .update({ is_deleted: true, content: "[Removed by moderator]", updated_at: new Date().toISOString() })
          .eq("id", targetId),
      ]);
      result = { gmResult, dmResult };
      break;
    }

    case "suspend_user": {
      const { error } = await supabaseAdmin.from("community_user_status").upsert(
        {
          user_id: targetId,
          is_suspended: true,
          suspended_at: new Date().toISOString(),
          suspended_by: adminId,
          reason: (reason || "").trim() || "Moderation action",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
      break;
    }

    case "unsuspend_user": {
      const { error } = await supabaseAdmin.from("community_user_status").upsert(
        {
          user_id: targetId,
          is_suspended: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
      break;
    }

    case "remove_from_group": {
      const { groupId } = extra || {};
      if (!groupId) return NextResponse.json({ error: "extra.groupId required for remove_from_group" }, { status: 400 });
      const { error } = await supabaseAdmin
        .from("community_group_members")
        .update({ status: "REMOVED" })
        .eq("user_id", targetId)
        .eq("group_id", groupId);
      if (error) throw error;
      break;
    }

    case "freeze_group": {
      const { error } = await supabaseAdmin
        .from("community_groups")
        .update({ is_frozen: true, updated_at: new Date().toISOString() })
        .eq("id", targetId);
      if (error) throw error;
      break;
    }

    case "unfreeze_group": {
      const { error } = await supabaseAdmin
        .from("community_groups")
        .update({ is_frozen: false, updated_at: new Date().toISOString() })
        .eq("id", targetId);
      if (error) throw error;
      break;
    }

    case "delete_group": {
      const { error } = await supabaseAdmin.from("community_groups").delete().eq("id", targetId);
      if (error) throw error;
      break;
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  // Log the moderation action
  await supabaseAdmin.from("community_moderation_logs").insert({
    admin_id: adminId,
    action,
    target_type: targetType || "unknown",
    target_id: targetId,
    reason: (reason || "").trim() || null,
  });

  return NextResponse.json({ success: true, action });
}
