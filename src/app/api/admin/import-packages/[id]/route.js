import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { fetchAllRows, summarizePackage } from "@/lib/adminImportPackages";

const QUESTION_SELECT = [
  "id",
  "exam_id",
  "exam",
  "exam_type",
  "year",
  "attempt",
  "shift",
  "paper_code",
  "question_number",
  "import_package_id",
  "status",
  "question",
  "question_image",
  "option_a_image",
  "option_b_image",
  "option_c_image",
  "option_d_image",
  "explanation_image",
].join(",");

export async function GET(_request, { params }) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("pyq_import_packages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const questions = await fetchAllRows(
    supabaseAdmin,
    "pyq_questions",
    QUESTION_SELECT,
    (query) => query.eq("import_package_id", id),
  ).catch(() => []);

  return NextResponse.json({ success: true, package: summarizePackage(data, questions) });
}

export async function PATCH(request, { params }) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const status = body.status;

  if (!status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }

  const { error: packageError } = await supabaseAdmin
    .from("pyq_import_packages")
    .update({ status })
    .eq("id", id);

  if (packageError) {
    return NextResponse.json({ error: packageError.message }, { status: 500 });
  }

  const { error: questionsError } = await supabaseAdmin
    .from("pyq_questions")
    .update({ status })
    .eq("import_package_id", id);

  if (questionsError) {
    return NextResponse.json({ error: questionsError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_request, { params }) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { error: questionsError } = await supabaseAdmin
    .from("pyq_questions")
    .update({ import_package_id: null })
    .eq("import_package_id", id);

  if (questionsError) {
    return NextResponse.json({ error: questionsError.message }, { status: 500 });
  }

  const { error: packageError } = await supabaseAdmin
    .from("pyq_import_packages")
    .delete()
    .eq("id", id);

  if (packageError) {
    return NextResponse.json({ error: packageError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
