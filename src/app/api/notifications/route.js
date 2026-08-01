import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("exam")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const track = profile?.exam || "JEE";

    const { data: notifications, error: notificationsError } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${userId},user_id.eq.all`)
      .in("stream", [track, "ALL"])
      .order("created_at", { ascending: false });

    if (notificationsError) {
      throw notificationsError;
    }

    const notificationIds = (notifications || []).map((item) => item.id);

    let notificationReads = [];

    if (notificationIds.length > 0) {
      const { data: reads, error: readsError } = await supabaseAdmin
        .from("notification_reads")
        .select("notification_id, is_cleared, is_read")
        .eq("user_id", userId)
        .in("notification_id", notificationIds);

      if (readsError) {
        throw readsError;
      }

      notificationReads = reads || [];
    }

    const readsByNotificationId = new Map(
      notificationReads.map((read) => [read.notification_id, read])
    );

    const visibleNotifications = (notifications || [])
      .filter((item) => !readsByNotificationId.get(item.id)?.is_cleared)
      .map((item) => ({
        ...item,
        is_read: Boolean(readsByNotificationId.get(item.id)?.is_read),
      }));

    return NextResponse.json({
      track,
      notifications: visibleNotifications,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, clearAll } = await request.json();

    if (clearAll) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .select("exam")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      const track = profile?.exam || "JEE";

      const { data: notifications, error: notificationsError } = await supabaseAdmin
        .from("notifications")
        .select("id")
        .or(`user_id.eq.${userId},user_id.eq.all`)
        .in("stream", [track, "ALL"]);

      if (notificationsError) {
        throw notificationsError;
      }

      const rows = (notifications || []).map((notification) => ({
        user_id: userId,
        notification_id: notification.id,
        is_cleared: true,
        is_read: true,
      }));

      if (rows.length > 0) {
        const { error: clearError } = await supabaseAdmin
          .from("notification_reads")
          .upsert(rows, {
            onConflict: "user_id,notification_id",
          });

        if (clearError) {
          throw clearError;
        }
      }

      return NextResponse.json({ success: true });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId is required" },
        { status: 400 }
      );
    }

    const { data: notification, error: notificationError } = await supabaseAdmin
      .from("notifications")
      .select("id, user_id, stream")
      .eq("id", notificationId)
      .maybeSingle();

    if (notificationError) {
      throw notificationError;
    }

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("exam")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const track = profile?.exam || "JEE";
    const isAllowedUser =
      notification.user_id === userId || notification.user_id === "all";
    const isAllowedStream =
      notification.stream === track || notification.stream === "ALL";

    if (!isAllowedUser || !isAllowedStream) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: upsertError } = await supabaseAdmin
      .from("notification_reads")
      .upsert(
        {
          user_id: userId,
          notification_id: notificationId,
          is_read: true,
        },
        {
          onConflict: "user_id,notification_id",
        }
      );

    if (upsertError) {
      throw upsertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATIONS_MARK_READ_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
