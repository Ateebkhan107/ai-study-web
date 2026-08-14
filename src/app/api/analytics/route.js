import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { canUseFeature, FEATURES, getUserAccessContext } from "@/lib/accessControl";
import { aggregateAnalytics } from "@/lib/analyticsAggregate";
import { normalizeTrack } from "@/lib/analyticsHelpers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const track = normalizeTrack(searchParams.get("track") || "JEE");
    const access = await getUserAccessContext({ userId, examTrack: track });
    const permission = canUseFeature(access, FEATURES.ANALYTICS_ADVANCED);

    if (!permission.allowed) {
      return NextResponse.json(
        {
          error: "PRO_REQUIRED",
          message: "Advanced Analytics is available with PrepZii Pro.",
          upgradeUrl: permission.upgradeUrl || "/pro",
        },
        { status: 403 }
      );
    }

    const [{ data: testAttemptsRaw, error: testError }, { data: pyqAttemptsRaw, error: pyqError }] = await Promise.all([
      supabaseAdmin
        .from("test_attempts")
        .select(`
          id,
          created_at,
          score,
          total_marks,
          total_questions,
          correct_answers,
          attempted,
          time_taken_seconds,
          tests ( exam ),
          user_answers (
            selected_option,
            is_correct,
            created_at,
            questions (
              exam,
              subject,
              chapter
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("pyq_attempts")
        .select(`
          id,
          question_id,
          selected_option,
          is_correct,
          attempted_at,
          pyq_questions (
            exam,
            subject,
            chapter,
            marks_positive,
            marks_negative
          )
        `)
        .eq("user_id", userId)
        .order("attempted_at", { ascending: true }),
    ]);

    if (testError) throw testError;
    if (pyqError) throw pyqError;

    const analytics = aggregateAnalytics({
      track,
      testAttemptsRaw,
      pyqAttemptsRaw,
    });

    return NextResponse.json({
      ...analytics,
      generatedAt: new Date().toISOString(),
      sources: {
        questionsPracticed: ["user_answers.selected_option", "pyq_attempts.selected_option"],
        accuracy: ["user_answers.is_correct", "pyq_attempts.is_correct"],
        testsCompleted: ["test_attempts.id"],
        averageScore: ["test_attempts.score", "test_attempts.total_marks"],
        chapters: ["questions.chapter", "pyq_questions.chapter"],
        timing: ["test_attempts.time_taken_seconds", "test_attempts.attempted"],
      },
    });
  } catch (error) {
    console.error("[ANALYTICS_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
