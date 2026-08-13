import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getInstituteContext } from "@/lib/instituteAuth";
import { getChapterTargets } from "@/lib/questions";
import { TestCreateSchema } from "@/lib/validations";

function shuffle(rows) {
  return [...rows].sort(() => Math.random() - 0.5);
}

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const context = await getInstituteContext(slug, ["COACHING_ADMIN"]);
    if (context.error) return context.error;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = TestCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const {
      title,
      batch_id: batchId,
      exam,
      subject,
      chapters,
      duration_minutes: duration,
      question_count: questionCount,
      difficulty,
      mode,
    } = parsed.data;

    if (mode === "auto" && !chapters.length) {
      return NextResponse.json({ error: "Chapters are required for auto-generated tests" }, { status: 400 });
    }

    const { data: batch, error: batchError } = await supabaseAdmin
      .from("institute_batches")
      .select("id")
      .eq("id", batchId)
      .eq("institute_id", context.institute.id)
      .maybeSingle();

    if (batchError) throw batchError;
    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    if (mode === "auto") {
      let questionQuery = supabaseAdmin
        .from("questions")
        .select("id")
        .eq("is_active", true)
        .eq("status", "PUBLISHED")
        .in("chapter", getChapterTargets(chapters.join(",")));

      if (exam === "JEE") {
        questionQuery = questionQuery.in("exam", ["JEE", "JEE Main"]);
      } else {
        questionQuery = questionQuery.eq("exam", "NEET");
      }

      if (subject !== "All Subjects") {
        questionQuery = questionQuery.eq("subject", subject === "Maths" ? "Mathematics" : subject);
      }

      if (difficulty && difficulty.toLowerCase() !== "mixed") {
        questionQuery = questionQuery.eq("difficulty", difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase());
      }

      const { data: questionRows, error: questionsError } = await questionQuery.limit(500);
      if (questionsError) throw questionsError;

      const selectedQuestions = shuffle(questionRows || []).slice(0, questionCount);
      if (!selectedQuestions.length) {
        return NextResponse.json({ error: "No matching published questions found" }, { status: 400 });
      }

      const { data: test, error: testError } = await supabaseAdmin
        .from("institute_tests")
        .insert({
          institute_id: context.institute.id,
          title,
          exam,
          subject: subject === "Maths" ? "Mathematics" : subject,
          chapters,
          difficulty,
          duration_minutes: duration,
          total_questions: selectedQuestions.length,
          status: "PUBLISHED",
          created_by: context.actor.userId,
          published_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (testError) throw testError;

      const questionInsert = selectedQuestions.map((question, index) => ({
        institute_id: context.institute.id,
        institute_test_id: test.id,
        question_id: question.id,
        question_order: index + 1,
      }));

      const { error: testQuestionsError } = await supabaseAdmin
        .from("institute_test_questions")
        .insert(questionInsert);

      if (testQuestionsError) throw testQuestionsError;

      const { error: assignmentError } = await supabaseAdmin
        .from("institute_test_assignments")
        .insert({
          institute_id: context.institute.id,
          institute_test_id: test.id,
          batch_id: batchId,
        });

      if (assignmentError) throw assignmentError;

      return NextResponse.json({ test }, { status: 201 });
    } else {
      // mode === "custom"
      const { data: test, error: testError } = await supabaseAdmin
        .from("institute_tests")
        .insert({
          institute_id: context.institute.id,
          title,
          exam,
          subject: subject === "Maths" ? "Mathematics" : subject,
          chapters,
          difficulty,
          duration_minutes: duration,
          total_questions: 0,
          status: "DRAFT",
          created_by: context.actor.userId,
        })
        .select("*")
        .single();

      if (testError) throw testError;

      const { error: assignmentError } = await supabaseAdmin
        .from("institute_test_assignments")
        .insert({
          institute_id: context.institute.id,
          institute_test_id: test.id,
          batch_id: batchId,
        });

      if (assignmentError) throw assignmentError;

      return NextResponse.json({ test }, { status: 201 });
    }
  } catch (error) {
    console.error("[INSTITUTE_TEST_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to create institute test" }, { status: 500 });
  }
}
