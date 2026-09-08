import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserAccessContext } from "@/lib/accessControl";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_KEYS = [
  "preferred_language",
  "response_length",
  "explanation_style",
  "learning_style",
  "study_preference",
];

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getUserAccessContext({ userId });
    if (access.plan === "FREE") {
      return NextResponse.json({ error: "ZI_PRO_REQUIRED" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key !== "preferred_language") {
      return NextResponse.json({ error: "Invalid preference key" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("zi_preferences")
      .select("preference_value")
      .eq("clerk_user_id", userId)
      .eq("preference_key", key)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ key, value: data?.preference_value || null });
  } catch (error) {
    console.error("[ZI_PREFERENCES_READ_ERROR]", error);
    return NextResponse.json({ error: "Failed to read preference" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getUserAccessContext({ userId });
    if (access.plan === "FREE") {
      return NextResponse.json({ error: "ZI_PRO_REQUIRED" }, { status: 403 });
    }

    const body = await request.json();
    const { action, key, value } = body;

    if (!action || !["save", "delete", "reset"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "reset") {
      const { error } = await supabaseAdmin
        .from("zi_preferences")
        .delete()
        .eq("clerk_user_id", userId);
        
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (!ALLOWED_KEYS.includes(key)) {
      return NextResponse.json({ error: "Invalid preference key" }, { status: 400 });
    }

    if (action === "delete") {
      const { error } = await supabaseAdmin
        .from("zi_preferences")
        .delete()
        .eq("clerk_user_id", userId)
        .eq("preference_key", key);
        
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "save") {
      if (typeof value !== "string" || !value.trim()) {
        return NextResponse.json({ error: "Invalid preference value" }, { status: 400 });
      }

      const val = value.trim().substring(0, 150);
      const { error } = await supabaseAdmin
        .from("zi_preferences")
        .upsert({
          clerk_user_id: userId,
          preference_key: key,
          preference_value: val,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'clerk_user_id,preference_key'
        });

      if (error) throw error;
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("[ZI_PREFERENCES_ERROR]", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
