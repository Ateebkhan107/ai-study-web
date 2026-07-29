import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const exam = searchParams.get("exam");
  const year = searchParams.get("year");

  let query = supabase
    .from("pyq_exams")
    .select("exam_type, year, attempt, shift, paper_code")
    .eq("is_published", true);

  if (exam) {
    query = query.eq("exam", exam);
  }

  if (year) {
    query = query.eq("year", Number(year));
  }

  const { data, error } = await query;

  if (error) {
    console.error("PYQ PAPERS QUERY ERROR:", error.message);
    return NextResponse.json({ error: "Failed loading papers" }, { status: 500 });
  }

  const papers = (data || [])
    .map((row) => ({
      year: row.year,
      exam_type: row.exam_type,
      attempt: row.attempt,
      shift: row.shift,
      paper_code: row.paper_code,
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
      const attemptCompare = String(a.attempt || "").localeCompare(String(b.attempt || ""), undefined, { numeric: true });
      if (attemptCompare !== 0) return attemptCompare;
      return String(a.shift || "").localeCompare(String(b.shift || ""), undefined, { numeric: true });
    });

  return NextResponse.json(papers);
}
