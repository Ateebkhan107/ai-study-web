import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("exam")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const track = profile?.exam || "JEE";

    const { data: goalsData, error: goalsError } = await supabaseAdmin
      .from("daily_goals")
      .select("id, title, description, target_value, xp, target, created_at")
      .eq("is_active", true)
      .in("target", [track, "ALL"])
      .order("created_at", { ascending: false });

    if (goalsError) {
      throw goalsError;
    }

    const goalsList = goalsData || [];

    if (goalsList.length === 0) {
      return NextResponse.json({ goals: [] });
    }

    const goalIds = goalsList.map((goal) => goal.id);

    const { data: progressData, error: progressError } = await supabaseAdmin
      .from("user_daily_goals")
      .select("goal_id, progress, completed")
      .eq("user_id", userId)
      .eq("goal_date", today)
      .in("goal_id", goalIds);

    if (progressError) {
      throw progressError;
    }

    const goals = goalsList.map((goal) => {
      const progress = progressData?.find((item) => item.goal_id === goal.id);

      return {
        ...goal,
        progress: progress?.progress || 0,
        completed: progress?.completed || false,
      };
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("[DAILY_GOALS_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
