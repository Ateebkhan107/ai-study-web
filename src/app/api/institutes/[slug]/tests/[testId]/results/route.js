import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getInstituteContext, getProfileMap } from "@/lib/instituteAuth";

export async function GET(_request, { params }) {
  try {
    const { slug, testId } = await params;
    const context = await getInstituteContext(slug, ["COACHING_ADMIN"]);
    if (context.error) return context.error;

    const { data: test, error: testError } = await supabaseAdmin
      .from("institute_tests")
      .select("*")
      .eq("id", testId)
      .eq("institute_id", context.institute.id)
      .maybeSingle();

    if (testError) throw testError;
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from("institute_test_attempts")
      .select("*, test_attempts(*)")
      .eq("institute_id", context.institute.id)
      .eq("institute_test_id", testId)
      .eq("status", "SUBMITTED");

    if (attemptsError) throw attemptsError;

    const profiles = await getProfileMap((attempts || []).map((attempt) => attempt.user_id));
    const leaderboard = (attempts || [])
      .map((attempt) => {
        const result = attempt.test_attempts || {};
        return {
          ...attempt,
          student: profiles[attempt.user_id] || null,
          score: result.score || 0,
          total_marks: result.total_marks || test.total_questions * 4,
          correct: result.correct_answers || 0,
          incorrect: result.wrong_answers || 0,
          unattempted: Math.max((result.total_questions || test.total_questions) - (result.attempted || 0), 0),
          accuracy: result.attempted > 0 ? Math.round(((result.correct_answers || 0) / result.attempted) * 100) : 0,
          time_taken_seconds: result.time_taken_seconds || 0,
        };
      })
      .sort((a, b) => b.score - a.score || a.time_taken_seconds - b.time_taken_seconds)
      .map((attempt, index) => ({ ...attempt, rank: index + 1 }));

    return NextResponse.json({ test, leaderboard });
  } catch (error) {
    console.error("[INSTITUTE_TEST_RESULTS_ERROR]", error);
    return NextResponse.json({ error: "Failed to load institute test results" }, { status: 500 });
  }
}
