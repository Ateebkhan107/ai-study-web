import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import {
  buildPackageName,
  fetchAllRows,
  normalizeStatus,
  paperKeyFromExam,
  paperKeyFromQuestion,
  summarizePackage,
} from "../lib/adminImportPackages.js";

global.WebSocket = WebSocket;
process.loadEnvFile(".env.local");

const REPORT_PATH = path.join(process.cwd(), "tmp", "existing-papers-import-package-sync-report.json");
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const [exams, questions, existingPackages] = await Promise.all([
  fetchAllRows(
    supabase,
    "pyq_exams",
    "id,exam,exam_type,year,attempt,shift,paper_code,exam_date,status,is_published,created_at",
    (query) => query.order("year", { ascending: false }),
  ),
  fetchAllRows(supabase, "pyq_questions", QUESTION_SELECT),
  fetchAllRows(supabase, "pyq_import_packages", "*"),
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

const report = {
  totalExamRows: exams.length,
  totalQuestionRows: questions.length,
  totalPapersFound: 0,
  importPackagesBefore: existingPackages.length,
  importPackagesCreated: 0,
  questionsLinked: 0,
  duplicateQuestionsCreated: 0,
  unlinkedQuestionsRemaining: 0,
  packages: [],
};

const sortedGroups = [...groups.values()].sort((a, b) => {
  const examTypeCompare = String(a.paper.exam_type || a.paper.exam || "").localeCompare(String(b.paper.exam_type || b.paper.exam || ""));
  if (examTypeCompare) return examTypeCompare;
  const ay = Number(a.paper.year || 0);
  const by = Number(b.paper.year || 0);
  if (ay !== by) return by - ay;
  const dateCompare = String(a.paper.exam_date || a.paper.attempt || "").localeCompare(String(b.paper.exam_date || b.paper.attempt || ""));
  if (dateCompare) return dateCompare;
  return String(a.paper.shift || "").localeCompare(String(b.paper.shift || ""));
});

for (const group of sortedGroups) {
  if (group.questions.length === 0) continue;
  report.totalPapersFound += 1;

  const currentPackageId = group.questions.find((q) => q.import_package_id && packageById.has(q.import_package_id))?.import_package_id;
  let pkg = currentPackageId ? packageById.get(currentPackageId) : null;
  const packageName = buildPackageName(group.paper);

  if (!pkg) {
    pkg = packageByName.get(packageName);
  }

  if (!pkg) {
    const { data: inserted, error: insertError } = await supabase
      .from("pyq_import_packages")
      .insert({ name: packageName, status: normalizeStatus(group.paper.status) })
      .select("*")
      .single();
    if (insertError) throw insertError;
    pkg = inserted;
    packageByName.set(pkg.name, pkg);
    packageById.set(pkg.id, pkg);
    report.importPackagesCreated += 1;
  }

  const idsToLink = group.questions
    .filter((question) => question.import_package_id !== pkg.id)
    .map((question) => question.id);

  for (let start = 0; start < idsToLink.length; start += 100) {
    const batch = idsToLink.slice(start, start + 100);
    const { error } = await supabase
      .from("pyq_questions")
      .update({ import_package_id: pkg.id })
      .in("id", batch);
    if (error) throw error;
    report.questionsLinked += batch.length;
  }

  report.packages.push(summarizePackage(pkg, group.questions.map((q) => ({ ...q, import_package_id: pkg.id })), group.paper));
  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
}

const linkedQuestions = await fetchAllRows(supabase, "pyq_questions", "id,import_package_id");
report.unlinkedQuestionsRemaining = linkedQuestions.filter((question) => !question.import_package_id).length;
await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(JSON.stringify({
  reportPath: REPORT_PATH,
  totalPapersFound: report.totalPapersFound,
  importPackagesCreated: report.importPackagesCreated,
  questionsLinked: report.questionsLinked,
  duplicateQuestionsCreated: report.duplicateQuestionsCreated,
  unlinkedQuestionsRemaining: report.unlinkedQuestionsRemaining,
}, null, 2));
