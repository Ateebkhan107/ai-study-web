import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const SAVED_PYQ_SELECT_FIELDS = `
  id,
  exam,
  exam_type,
  year,
  attempt,
  shift,
  paper_code,
  subject,
  chapter,
  difficulty,
  question,
  question_image,
  option_a,
  option_b,
  option_c,
  option_d,
  option_a_image,
  option_b_image,
  option_c_image,
  option_d_image,
  correct_option,
  explanation,
  explanation_image,
  question_type,
  correct_options,
  numerical_answer,
  numerical_min,
  numerical_max,
  marks_positive,
  marks_negative,
  status
`;

function normalizeQuestionId(questionId) {
  if (questionId === null || questionId === undefined || questionId === "") {
    return null;
  }

  return String(questionId);
}

export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = normalizeQuestionId(searchParams.get("questionId"));
    const includeQuestions = searchParams.get("includeQuestions") === "true";
    const track = String(searchParams.get("track") || "").toLowerCase();

    if (questionId) {
      const { data, error } = await supabaseAdmin
        .from("pyq_bookmarks")
        .select("id")
        .eq("user_id", userId)
        .eq("question_id", questionId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return NextResponse.json({ bookmarked: Boolean(data) });
    }

    const { data: bookmarkRows, error } = await supabaseAdmin
      .from("pyq_bookmarks")
      .select("question_id")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    const questionIds = (bookmarkRows || []).map((bookmark) =>
      String(bookmark.question_id)
    );

    if (includeQuestions) {
      if (questionIds.length === 0) {
        return NextResponse.json({ questions: [] });
      }

      let query = supabaseAdmin
        .from("pyq_questions")
        .select(SAVED_PYQ_SELECT_FIELDS)
        .eq("status", "PUBLISHED")
        .in("id", questionIds);

      if (track === "jee") {
        query = query.neq("exam", "NEET");
      } else if (track === "neet") {
        query = query.eq("exam", "NEET");
      }

      const { data: questions, error: questionsError } = await query;

      if (questionsError) {
        throw questionsError;
      }

      return NextResponse.json({
        questions: questions || [],
      });
    }

    return NextResponse.json({
      questionIds,
    });
  } catch (error) {
    console.error("[PYQ_BOOKMARKS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const questionId = normalizeQuestionId(body?.questionId);

    if (!questionId) {
      return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("pyq_bookmarks")
      .insert([
        {
          user_id: userId,
          question_id: questionId,
        },
      ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PYQ_BOOKMARKS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const questionId = normalizeQuestionId(body?.questionId);

    if (!questionId) {
      return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("pyq_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", questionId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PYQ_BOOKMARKS_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
