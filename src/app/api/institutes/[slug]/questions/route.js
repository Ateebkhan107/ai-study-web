import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getInstituteContext } from "@/lib/instituteAuth";
import { getChapterTargets } from "@/lib/questions";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const context = await getInstituteContext(slug, ["COACHING_ADMIN"]);
    if (context.error) return context.error;

    const { searchParams } = new URL(request.url);
    const exam = searchParams.get("exam") || "JEE";
    const subject = searchParams.get("subject") || "";
    const chapter = searchParams.get("chapter") || "";
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

    let query = supabaseAdmin
      .from("questions")
      .select("id,exam,subject,chapter,topic,difficulty,question_text,status,is_active")
      .eq("is_active", true)
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (exam === "JEE") {
      query = query.in("exam", ["JEE", "JEE Main"]);
    } else if (exam === "NEET") {
      query = query.eq("exam", "NEET");
    }

    if (subject) {
      query = query.eq("subject", subject === "Maths" ? "Mathematics" : subject);
    }

    if (chapter) {
      query = query.in("chapter", getChapterTargets(chapter));
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ questions: data || [] });
  } catch (error) {
    console.error("[INSTITUTE_QUESTIONS_ERROR]", error);
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
  }
}
