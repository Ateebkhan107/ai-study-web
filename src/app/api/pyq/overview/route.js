import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/pyq/overview?track=jee|neet
// Returns real question-bank stats for the given track (used by the
// Question Vault / Index Matrix cards on the PYQ page header):
//   - totalQuestions: count of pyq_questions matching the track's exam(s)
//   - minYear / maxYear: real year range present in pyq_questions for that track
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const track = (searchParams.get("track") || "jee").toLowerCase();

    // JEE covers both "JEE Main" and "JEE Advanced" exam values; NEET is a
    // single exact value. Adjust here if your exam column uses different strings.
    const isNeet = track === "neet";

    const countQuery = supabase
      .from("pyq_questions")
      .select("id", { count: "exact", head: true })
      .eq("status", "PUBLISHED");

    if (isNeet) {
      countQuery.eq("exam", "NEET");
    } else {
      countQuery.ilike("exam", "%JEE%");
    }

    const { count: totalQuestions, error: countError } = await countQuery;

    if (countError) throw countError;

    const minYearQuery = supabase
      .from("pyq_questions")
      .select("year")
      .eq("status", "PUBLISHED")
      .order("year", { ascending: true })
      .limit(1);

    const maxYearQuery = supabase
      .from("pyq_questions")
      .select("year")
      .eq("status", "PUBLISHED")
      .order("year", { ascending: false })
      .limit(1);

    if (isNeet) {
      minYearQuery.eq("exam", "NEET");
      maxYearQuery.eq("exam", "NEET");
    } else {
      minYearQuery.ilike("exam", "%JEE%");
      maxYearQuery.ilike("exam", "%JEE%");
    }

    const [{ data: minRows, error: minError }, { data: maxRows, error: maxError }] =
      await Promise.all([minYearQuery, maxYearQuery]);

    if (minError) throw minError;
    if (maxError) throw maxError;

    const minYear = minRows?.[0]?.year ?? null;
    const maxYear = maxRows?.[0]?.year ?? null;

    return NextResponse.json({
      totalQuestions: totalQuestions ?? 0,
      minYear,
      maxYear,
    });
  } catch (error) {
    console.error("[PYQ_OVERVIEW_FETCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}