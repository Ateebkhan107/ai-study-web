import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_REVIEW_QUESTIONS = 200;

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    const questionIds = [...new Set(Array.isArray(body.question_ids) ? body.question_ids.filter(Boolean) : [])]
      .slice(0, MAX_REVIEW_QUESTIONS);
    if (questionIds.length === 0) {
      return NextResponse.json({ error: "No question IDs provided" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("pyq_questions")
      .select(`
        id,
        question,
        question_image,
        subject,
        chapter,
        difficulty,
        year,
        question_type,
        option_a,
        option_b,
        option_c,
        option_d,
        option_a_image,
        option_b_image,
        option_c_image,
        option_d_image,
        correct_option,
        correct_options,
        numerical_answer,
        numerical_min,
        numerical_max,
        explanation,
        explanation_image
      `)
      .in("id", questionIds);
    if (error) throw error;

    return NextResponse.json({ answers: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
