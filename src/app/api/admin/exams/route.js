import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/admin";

export async function GET(req) {
  const admin = await isAdmin();
  
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const examFilter = searchParams.get("exam");
  const yearFilter = searchParams.get("year");

  let query = supabaseAdmin.from("pyq_exams").select("*, pyq_questions(count)").order("created_at", { ascending: false });

  if (examFilter) {
    query = query.ilike("exam", `%${examFilter}%`);
  }
  
  if (yearFilter) {
    query = query.eq("year", parseInt(yearFilter));
  }

  const { data, error } = await query;

if (error) {
//   console.log("========== SUPABASE ERROR ==========");
//   console.log(error);
//   console.log("===================================");

  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  );
}

  const formattedExams = data.map(exam => ({
    ...exam,
    status: exam.is_published ? 'PUBLISHED' : 'DRAFT',
    question_count: exam.pyq_questions && exam.pyq_questions[0] ? exam.pyq_questions[0].count : 0,
    pyq_questions: undefined // remove the nested array
  }));

  return NextResponse.json({ exams: formattedExams });
}

export async function POST(req) {
  const admin = await isAdmin();
  
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { exam, year, exam_type, exam_date, shift, paper_code, duration, total_marks, instructions, status } = body;

    if (!exam || !year || !exam_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("pyq_exams")
      .insert([{
        exam,
        year: Number(year),
        exam_type,
        exam_date: exam_date || null,
        attempt: body.attempt || null, // Support for JEE attempts
        shift: shift || null,
        paper_code: paper_code || null,
        duration_minutes: Number(duration) || 180,
        total_marks: Number(total_marks) || 300,
        instructions: instructions || null,
        status: status || 'DRAFT',
        is_published: status === 'PUBLISHED'
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating exam:", error);
      return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
    }

    return NextResponse.json({ success: true, exam: data });
  } catch (err) {
    console.error("Exam creation error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(req) {
  const admin = await isAdmin();
  
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Exam ID required" }, { status: 400 });
    }

    if (updates.duration !== undefined) {
      updates.duration_minutes = updates.duration;
      delete updates.duration;
    }
    
    if (updates.status) {
      updates.is_published = updates.status === 'PUBLISHED';
    }

    const { data, error } = await supabaseAdmin
      .from("pyq_exams")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating exam:", error);
      return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
    }

    return NextResponse.json({ success: true, exam: data });
  } catch (err) {
    console.error("Exam update error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req) {
  const admin = await isAdmin();
  
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Exam ID required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("pyq_exams")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting exam:", error);
      return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Exam deletion error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
