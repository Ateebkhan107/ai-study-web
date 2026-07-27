import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/admin";

export async function GET(req) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Total Exams
    const { count: totalExams } = await supabaseAdmin
      .from('pyq_exams')
      .select('*', { count: 'exact', head: true });

    // Published Exams
    const { count: publishedExams } = await supabaseAdmin
      .from('pyq_exams')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    // Total Questions
    const { count: totalQuestions } = await supabaseAdmin
      .from('pyq_questions')
      .select('*', { count: 'exact', head: true });

    // Questions Missing Images
    const { count: missingImages } = await supabaseAdmin
      .from('pyq_questions')
      .select('*', { count: 'exact', head: true })
      .is('question_image', null)
      .is('option_a_image', null)
      .is('option_b_image', null)
      .is('option_c_image', null)
      .is('option_d_image', null)
      .is('explanation_image', null);

    // Students
    const { count: totalStudents } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      stats: {
        totalExams: totalExams || 0,
        publishedExams: publishedExams || 0,
        draftExams: (totalExams || 0) - (publishedExams || 0),
        totalQuestions: totalQuestions || 0,
        missingImages: missingImages || 0,
        totalStudents: totalStudents || 0,
      }
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
