import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const exam = searchParams.get("exam");
  const year = searchParams.get("year");

  let query = supabaseAdmin
    .from("pyq_exams")
    .select("id, exam, exam_type, year, attempt, shift, paper_code, exam_date")
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
    .map((row) => {
      const examDate = row.exam_date ? new Date(`${row.exam_date}T00:00:00Z`) : null;
      const isJeeMain = row.exam === "JEE" && row.exam_type === "JEE Main";
      // JEE Main Session 1 can include 1 February papers. Keep the 2023 and
      // 2024 Session 1 papers in the January selector while retaining dates.
      const isSessionOneFeb = isJeeMain && [2023, 2024].includes(row.year) && examDate
        && examDate.getUTCMonth() === 1 && examDate.getUTCDate() === 1;
      const attemptLabel = isSessionOneFeb
        ? "January"
        : isJeeMain && examDate
          ? examDate.toLocaleString("en-US", { month: "long", timeZone: "UTC" })
          : row.attempt;
      const dateLabel = isJeeMain && examDate
        ? examDate.toLocaleString("en-US", { day: "numeric", month: "long", timeZone: "UTC" })
        : row.attempt;
      const shiftLabel = isJeeMain
        ? `${dateLabel} - ${row.shift}${row.shift === "Shift 1" ? " (9:00 AM - 12:00 PM)" : row.shift === "Shift 2" ? " (3:00 PM - 6:00 PM)" : ""}`
        : row.shift;

      return {
        id: row.id,
        year: row.year,
        exam_type: row.exam_type,
        attempt: row.attempt,
        attempt_label: attemptLabel,
        shift: row.shift,
        shift_label: shiftLabel,
        paper_code: row.paper_code,
        exam_date: row.exam_date,
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
      const attemptCompare = String(a.attempt_label || a.attempt || "").localeCompare(String(b.attempt_label || b.attempt || ""), undefined, { numeric: true });
      if (attemptCompare !== 0) return attemptCompare;
      const dateCompare = String(a.exam_date || "").localeCompare(String(b.exam_date || ""), undefined, { numeric: true });
      if (dateCompare !== 0) return dateCompare;
      return String(a.shift || "").localeCompare(String(b.shift || ""), undefined, { numeric: true });
    });

  return NextResponse.json(papers);
}
