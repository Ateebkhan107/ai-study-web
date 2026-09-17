import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getChapterTargets } from "@/lib/questions";
import { TEST_PAGE_CHAPTERS } from "@/lib/pyqChapterMapping";

export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exam = searchParams.get("exam") || "NEET";
    const rawSubject = searchParams.get("subject") || "Biology";
    const subject = rawSubject === "Maths" ? "Mathematics" : rawSubject;
    const lookupKey = rawSubject === "Mathematics" ? "Maths" : rawSubject;

    const chaptersList = TEST_PAGE_CHAPTERS[lookupKey] || TEST_PAGE_CHAPTERS[rawSubject] || [];

    if (!chaptersList.length) {
      return NextResponse.json({ chapters: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("questions")
      .select("id,chapter,difficulty")
      .eq("exam", exam)
      .eq("subject", subject)
      .eq("source_type", "PREPZII_PRACTICE")
      .eq("status", "PUBLISHED")
      .eq("is_active", true);

    if (error?.code === "42703") {
      return NextResponse.json({
        chapters: chaptersList.map((chapter) => ({
          chapter,
          count: 0,
          difficultyCounts: { easy: 0, medium: 0, hard: 0 },
        })),
        migrationRequired: true,
        message: "Practice question metadata columns are not installed yet.",
      });
    }

    if (error) {
      throw error;
    }

    const rows = data || [];
    const chapters = chaptersList.map((chapter) => {
      const targets = new Set(getChapterTargets(chapter));
      const matches = rows.filter((row) => targets.has(row.chapter));
      return {
        chapter,
        count: matches.length,
        difficultyCounts: {
          easy: matches.filter((row) => row.difficulty === "Easy").length,
          medium: matches.filter((row) => row.difficulty === "Medium").length,
          hard: matches.filter((row) => row.difficulty === "Hard").length,
        },
      };
    });

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error("[PRACTICE_AVAILABILITY_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load practice question availability" },
      { status: 500 }
    );
  }
}
