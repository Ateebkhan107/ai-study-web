import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/admin";
import { deriveImageMode } from "@/lib/adminImportPackages";

const UPDATABLE_FIELDS = new Set([
  "exam",
  "subject",
  "chapter",
  "question",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_option",
  "explanation",
  "year",
  "exam_type",
  "attempt",
  "shift",
  "question_type",
  "numerical_answer",
  "marks_positive",
  "marks_negative",
  "question_image",
  "correct_options",
  "numerical_min",
  "numerical_max",
  "paper_code",
  "explanation_image",
  "option_a_image",
  "option_b_image",
  "option_c_image",
  "option_d_image",
  "exam_id",
  "question_number",
  "display_order",
  "difficulty",
  "topic",
  "import_package_id",
  "status",
  "confidence_score",
]);


// ==========================
// GET QUESTIONS
// ==========================

export async function GET(req) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const exam_id = searchParams.get("exam_id");
    const exam = searchParams.get("exam");
    const subject = searchParams.get("subject");
    const year = searchParams.get("year");
    const search = searchParams.get("search");
    const exam_type = searchParams.get("exam_type");
    const attempt = searchParams.get("attempt");
    const shift = searchParams.get("shift");
    const paper_code = searchParams.get("paper_code");
    const import_package_id = searchParams.get("import_package_id");
    const chapter = searchParams.get("chapter");
    const question_type = searchParams.get("question_type");
    const image_status = searchParams.get("image_status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let query = supabase
      .from("pyq_questions")
      .select("*", { count: 'exact' });

    if (exam_id) query = query.eq("exam_id", exam_id);
    if (exam) query = query.eq("exam", exam);
    if (subject) query = query.eq("subject", subject);

    if (year) query = query.eq("year", year);
    if (exam_type) query = query.eq("exam_type", exam_type);
    if (attempt) query = query.eq("attempt", attempt);
    if (shift) query = query.eq("shift", shift);
    if (paper_code) query = query.eq("paper_code", paper_code);
    if (import_package_id) query = query.eq("import_package_id", import_package_id);
    if (chapter) query = query.eq("chapter", chapter);
    if (question_type) query = query.eq("question_type", question_type);

    if (search) {
      if (!isNaN(search) && search.trim() !== "") {
        // If it's a number, try searching by ID as well
        query = query.or(`question.ilike.%${search}%,id.eq.${search}`);
      } else {
        query = query.or(`question.ilike.%${search}%,chapter.ilike.%${search}%,subject.ilike.%${search}%`);
      }
    }

    if (image_status) {
      if (image_status === "missing_any") {
        query = query.or("question_image.is.null,option_a_image.is.null,option_b_image.is.null,option_c_image.is.null,option_d_image.is.null,explanation_image.is.null");
      } else if (image_status === "has_all") {
        query = query.not("question_image", "is", null)
                     .not("option_a_image", "is", null)
                     .not("option_b_image", "is", null)
                     .not("option_c_image", "is", null)
                     .not("option_d_image", "is", null)
                     .not("explanation_image", "is", null);
      } else if (image_status === "missing_question") {
        query = query.is("question_image", null);
      } else if (image_status === "missing_options") {
        query = query.or("option_a_image.is.null,option_b_image.is.null,option_c_image.is.null,option_d_image.is.null");
      } else if (image_status === "missing_explanation") {
        query = query.is("explanation_image", null);
      }
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    if (import_package_id) {
      query = query
        .order("question_number", { ascending: true, nullsFirst: false })
        .order("display_order", { ascending: true, nullsFirst: false })
        .range(from, to);
    } else {
      query = query.order("created_at", { ascending: false }).range(from, to);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("[API /admin/pyq] Database Query Error:", error);
      return NextResponse.json({ error: "Failed loading PYQs" }, { status: 500 });
    }

//     console.log(`[API /admin/pyq] Query successful. Returned ${data?.length} rows. Total count: ${count}`);

    return NextResponse.json({
      success: true,
      questions: (data || []).map((question) => ({
        ...question,
        image_mode: deriveImageMode(question),
      })),
      totalCount: count
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}









// ==========================
// UPDATE QUESTION
// ==========================


export async function PATCH(req){

const admin =
await isAdmin();


if(!admin){

return NextResponse.json(
{
error:"Unauthorized"
},
{
status:401
}
);

}

try{


const body =
await req.json();



const {id,...rawUpdates}=body;




if(!id){


return NextResponse.json(
{
error:"Missing id"
},
{
status:400
}
);


}

const updates = Object.fromEntries(
  Object.entries(rawUpdates).filter(([field]) => UPDATABLE_FIELDS.has(field))
);

  const { data: qData, error } = await supabase
    .from("pyq_questions")
    .update(updates)
    .eq("id", id)
    .select("exam_id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // Touch the exam's updated_at timestamp
  if (qData?.exam_id) {
    await supabase.from("pyq_exams").update({ updated_at: new Date().toISOString() }).eq("id", qData.exam_id);
  }

  return NextResponse.json({ success: true });
} catch(error){



return NextResponse.json(
{
error:"Server error"
},
{
status:500
}
);


}


}









// ==========================
// DELETE QUESTION
// ==========================


export async function DELETE(req){

const admin =
await isAdmin();


if(!admin){

return NextResponse.json(
{
error:"Unauthorized"
},
{
status:401
}
);

}

try{


const {id}=await req.json();




if(!id){


return NextResponse.json(
{
error:"Missing id"
},
{
status:400
}
);


}




  // Fetch exam_id first to touch it later
  const { data: qData } = await supabase.from("pyq_questions").select("exam_id").eq("id", id).single();

  const { error } = await supabase
    .from("pyq_questions")
    .delete()
    .eq("id", id);

  if (error) {


return NextResponse.json(
{
error:"Delete failed"
},
{
status:500
}
);


}




  if (qData?.exam_id) {
    await supabase.from("pyq_exams").update({ updated_at: new Date().toISOString() }).eq("id", qData.exam_id);
    
    // Also, we can update the question count here as the user requested in Step 2:
    // Update Question Count in pyq_exams
    await supabase.rpc('decrement_exam_question_count', { row_id: qData.exam_id, decrement_num: 1 })
      .then(async () => {
         const { count } = await supabase.from('pyq_questions').select('*', { count: 'exact', head: true }).eq('exam_id', qData.exam_id);
         if (count !== null) await supabase.from('pyq_exams').update({ question_count: count }).eq('id', qData.exam_id);
      });
  }

  return NextResponse.json({
    success: true
  });






}

catch(error){



return NextResponse.json(
{
error:"Server error"
},
{
status:500
}
);



}



}
