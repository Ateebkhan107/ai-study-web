import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function GET(req) {

  const { searchParams } = new URL(req.url);

  const exam = searchParams.get("exam");
  const year = searchParams.get("year");

  let query = supabase
    .from("pyq_questions")
    .select("exam_type, year, attempt, shift");

  if (exam) {
    query = query.eq("exam", exam);
  }

  if (year) {
    query = query.eq("year", year);
  }

  const { data, error } = await query;

  if (error) {
    console.error("PYQ PAPERS QUERY ERROR:", error.message);

    return NextResponse.json(
      { error: "Failed loading papers" },
      { status: 500 }
    );
  }

  const papersMap = new Map();

  for (const row of data || []) {

    const key = `${row.year}__${row.exam_type}__${row.attempt}__${row.shift}`;

    if (!papersMap.has(key)) {
      papersMap.set(key, {
        year: row.year,
        exam_type: row.exam_type,
        attempt: row.attempt,
        shift: row.shift,
      });
    }

  }

  const papers = [...papersMap.values()].sort((a, b) => b.year - a.year);

  return NextResponse.json(papers);
}