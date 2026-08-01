import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("study_sessions")
      .select("*")
      .eq("clerk_user_id", userId)
      .order("started_at", {
        ascending: false,
      })
      .limit(5);

    if (error) {
      throw error;
    }

    return NextResponse.json({ sessions: data || [] });
  } catch (error) {
    console.error("[RECENT_STUDY_SESSIONS_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
