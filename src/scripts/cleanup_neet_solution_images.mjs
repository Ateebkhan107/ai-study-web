import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const APPLY = process.argv.includes("--apply");
const BUCKET = "pyq-images";
const IMAGE_FIELDS = [
  "question_image",
  "option_a_image",
  "option_b_image",
  "option_c_image",
  "option_d_image",
  "explanation_image",
];
const REPORT_PATH = "tmp/neet-solution-image-cleanup.json";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase credentials are required");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function canonicalUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return String(value).split("?")[0].split("#")[0];
  }
}

function storagePath(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const index = url.pathname.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

async function fetchAllQuestions() {
  const rows = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("pyq_questions")
      .select(`id,exam,exam_type,year,paper_code,question_number,${IMAGE_FIELDS.join(",")}`)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}

const rows = await fetchAllQuestions();
const neetRows = rows.filter((row) => String(row.exam).toUpperCase().startsWith("NEET"));
const targets = neetRows.filter((row) => row.explanation_image);
const targetIds = new Set(targets.map((row) => String(row.id)));
const targetUrls = new Set(targets.map((row) => canonicalUrl(row.explanation_image)));
const protectedUrls = new Set();

for (const row of rows) {
  for (const field of IMAGE_FIELDS) {
    const url = canonicalUrl(row[field]);
    if (!url || !targetUrls.has(url)) continue;
    const isTargetExplanation = field === "explanation_image" && targetIds.has(String(row.id));
    if (!isTargetExplanation) protectedUrls.add(url);
  }
}

const deletableUrls = [...targetUrls].filter((url) => !protectedUrls.has(url));
const deletablePaths = [...new Set(deletableUrls.map(storagePath).filter(Boolean))];
const externalUrls = deletableUrls.filter((url) => !storagePath(url));
const uploadedYears = [...new Set(neetRows.map((row) => Number(row.year)).filter(Number.isFinite))].sort();
const targetRowsByYear = Object.fromEntries(uploadedYears.map((year) => [
  year,
  targets.filter((row) => Number(row.year) === year).length,
]));

const report = {
  mode: APPLY ? "apply" : "dry-run",
  scope: { exam: "NEET", years: uploadedYears },
  scannedQuestions: rows.length,
  uploadedNeetQuestions: neetRows.length,
  targetRows: targets.length,
  targetRowsByYear,
  uniqueTargetUrls: targetUrls.size,
  protectedSharedUrls: protectedUrls.size,
  deletableStorageObjects: deletablePaths.length,
  externalOrUnrecognizedUrls: externalUrls.length,
  targetRecords: targets.map((row) => ({
    id: row.id,
    year: row.year,
    examType: row.exam_type,
    paperCode: row.paper_code,
    questionNumber: row.question_number,
    explanationImage: row.explanation_image,
  })),
  protectedSharedAssets: [...protectedUrls],
  deletablePaths,
  externalUrls,
};

if (APPLY && targets.length > 0) {
  const ids = [...targetIds];
  for (let index = 0; index < ids.length; index += 200) {
    const { error } = await supabase
      .from("pyq_questions")
      .update({ explanation_image: null })
      .in("id", ids.slice(index, index + 200));
    if (error) throw error;
  }

  for (let index = 0; index < deletablePaths.length; index += 100) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove(deletablePaths.slice(index, index + 100));
    if (error) throw error;
  }

  let remainingTargetReferences = 0;
  for (let index = 0; index < ids.length; index += 200) {
    const { data, error } = await supabase
      .from("pyq_questions")
      .select("id,explanation_image")
      .in("id", ids.slice(index, index + 200));
    if (error) throw error;
    remainingTargetReferences += data.filter((row) => row.explanation_image).length;
  }
  report.remainingTargetReferences = remainingTargetReferences;
  if (remainingTargetReferences !== 0) {
    throw new Error(`${remainingTargetReferences} NEET explanation-image references remain`);
  }
}

await fs.mkdir("tmp", { recursive: true });
await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  mode: report.mode,
  scannedQuestions: report.scannedQuestions,
  uploadedNeetQuestions: report.uploadedNeetQuestions,
  uploadedYears: report.scope.years,
  targetRows: report.targetRows,
  targetRowsByYear: report.targetRowsByYear,
  uniqueTargetUrls: report.uniqueTargetUrls,
  protectedSharedUrls: report.protectedSharedUrls,
  deletableStorageObjects: report.deletableStorageObjects,
  externalOrUnrecognizedUrls: report.externalOrUnrecognizedUrls,
  remainingTargetReferences: report.remainingTargetReferences,
  report: REPORT_PATH,
}, null, 2));
