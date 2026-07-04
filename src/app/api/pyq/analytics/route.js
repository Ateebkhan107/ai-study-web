import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/pyq/analytics
// Returns real, computed PYQ practice stats for the signed-in Clerk user:
//   - attempted:   total attempts logged
//   - accuracy:    % correct across all attempts
//   - streak:      consecutive days (ending today or yesterday) with >=1 attempt
//   - subjects:    per-subject { subject, solved, accuracy }
//
// Data source: pyq_attempts (user_id, question_id, is_correct, attempted_at)
//              joined to pyq_questions (subject) via the question_id FK.
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: attempts, error } = await supabase
      .from("pyq_attempts")
      .select("is_correct, attempted_at, pyq_questions(subject)")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    const rows = attempts || [];

    const attempted = rows.length;

    const correctCount = rows.filter((r) => r.is_correct).length;
    const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

    const activeDays = new Set(
      rows
        .filter((r) => r.attempted_at)
        .map((r) => new Date(r.attempted_at).toISOString().slice(0, 10))
    );

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    if (!activeDays.has(cursor.toISOString().slice(0, 10))) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (activeDays.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const bySubject = {};

    for (const row of rows) {
      const subject = row.pyq_questions?.subject || "Unknown";

      if (!bySubject[subject]) {
        bySubject[subject] = { subject, solved: 0, correct: 0 };
      }

      bySubject[subject].solved += 1;
      if (row.is_correct) bySubject[subject].correct += 1;
    }

    const subjects = Object.values(bySubject).map((s) => ({
      subject: s.subject,
      solved: s.solved,
      accuracy: s.solved > 0 ? Math.round((s.correct / s.solved) * 100) : 0,
    }));

    return NextResponse.json({
      attempted,
      accuracy,
      streak,
      subjects,
    });
  } catch (error) {
    console.error("[PYQ_ANALYTICS_FETCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}