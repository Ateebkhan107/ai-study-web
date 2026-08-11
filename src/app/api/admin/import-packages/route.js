import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildPackageName,
  fetchAllRows,
  normalizeStatus,
  paperKeyFromExam,
  paperKeyFromQuestion,
  summarizePackage,
} from "@/lib/adminImportPackages";

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

export async function GET() {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: packages, error } = await supabaseAdmin
    .from("pyq_import_packages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const questions = await fetchAllRows(supabaseAdmin, "pyq_questions", QUESTION_SELECT);
    const packageQuestions = new Map();
    for (const question of questions) {
      if (!question.import_package_id) continue;
      if (!packageQuestions.has(question.import_package_id)) {
        packageQuestions.set(question.import_package_id, []);
      }
      packageQuestions.get(question.import_package_id).push(question);
    }

    const enriched = (packages || [])
      .map((pkg) => summarizePackage(pkg, packageQuestions.get(pkg.id) || []))
      .filter((pkg) => pkg.total_questions > 0);
    return NextResponse.json({ success: true, packages: enriched });
  } catch (summaryError) {
    console.error("[admin/import-packages] Summary failed:", summaryError);
    return NextResponse.json({ success: true, packages: packages || [] });
  }
}

export async function POST(request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (body.action !== "sync_existing_papers") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  try {
    const [exams, questions, existingPackages] = await Promise.all([
      fetchAllRows(
        supabaseAdmin,
        "pyq_exams",
        "id,exam,exam_type,year,attempt,shift,paper_code,exam_date,status,is_published,created_at",
        (query) => query.order("year", { ascending: false }),
      ),
      fetchAllRows(supabaseAdmin, "pyq_questions", QUESTION_SELECT),
      fetchAllRows(supabaseAdmin, "pyq_import_packages", "*"),
    ]);

    const examsById = new Map(exams.map((exam) => [exam.id, exam]));
    const packageByName = new Map(existingPackages.map((pkg) => [pkg.name, pkg]));
    const packageById = new Map(existingPackages.map((pkg) => [pkg.id, pkg]));
    const groups = new Map();

    for (const question of questions) {
      const exam = examsById.get(question.exam_id);
      const paper = exam || question;
      const key = exam ? paperKeyFromExam(exam) : paperKeyFromQuestion(question);
      if (!groups.has(key)) {
        groups.set(key, { paper, questions: [] });
      }
      groups.get(key).questions.push(question);
    }

    let createdPackages = 0;
    let questionsLinked = 0;
    const summaries = [];

    const sortedGroups = [...groups.values()].sort((a, b) => {
      const ay = Number(a.paper.year || 0);
      const by = Number(b.paper.year || 0);
      if (ay !== by) return by - ay;
      return String(a.paper.exam_date || a.paper.attempt || "").localeCompare(String(b.paper.exam_date || b.paper.attempt || ""));
    });

    for (const group of sortedGroups) {
      if (group.questions.length === 0) continue;

      const currentPackageId = group.questions.find((q) => q.import_package_id && packageById.has(q.import_package_id))?.import_package_id;
      let pkg = currentPackageId ? packageById.get(currentPackageId) : null;
      const packageName = buildPackageName(group.paper);

      if (!pkg) {
        pkg = packageByName.get(packageName);
      }

      if (!pkg) {
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from("pyq_import_packages")
          .insert({ name: packageName, status: normalizeStatus(group.paper.status) })
          .select("*")
          .single();
        if (insertError) throw insertError;
        pkg = inserted;
        packageByName.set(pkg.name, pkg);
        packageById.set(pkg.id, pkg);
        createdPackages += 1;
      }

      const idsToLink = group.questions
        .filter((q) => q.import_package_id !== pkg.id)
        .map((q) => q.id);

      for (let start = 0; start < idsToLink.length; start += 100) {
        const batch = idsToLink.slice(start, start + 100);
        const { error: linkError } = await supabaseAdmin
          .from("pyq_questions")
          .update({ import_package_id: pkg.id })
          .in("id", batch);
        if (linkError) throw linkError;
        questionsLinked += batch.length;
      }

      summaries.push(summarizePackage(pkg, group.questions.map((q) => ({ ...q, import_package_id: pkg.id })), group.paper));
    }

    return NextResponse.json({
      success: true,
      totalPapersFound: summaries.length,
      importPackagesCreated: createdPackages,
      questionsLinked,
      duplicateQuestionsCreated: 0,
      unlinkedQuestionsRemaining: 0,
      packages: summaries,
    });
  } catch (error) {
    console.error("[admin/import-packages] Sync failed:", error);
    return NextResponse.json({ error: error.message || "Sync failed" }, { status: 500 });
  }
}
