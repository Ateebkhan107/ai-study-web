import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BATCH_FILES = [
  "07apr_physics.json",
  "07apr_chemistry.json",
  "07apr_mathematics.json",
  "09apr_physics.json",
  "09apr_chemistry.json",
  "09apr_mathematics.json",
  "22apr_physics.json",
  "22apr_chemistry.json",
  "22apr_mathematics.json",
  "23apr_physics.json",
  "23apr_chemistry.json",
  "23apr_mathematics.json",
  "25apr_physics.json",
  "25apr_chemistry.json",
  "25apr_mathematics.json",
];

async function run() {
  console.log("=== Merging and Syncing Perfect JEE Main 2013 Dataset ===");

  let allQuestions = [];

  for (const filename of BATCH_FILES) {
    const filePath = path.join(process.cwd(), "scratch/transcribed", filename);
    const content = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(content);
    console.log(`Loaded ${filename}: ${data.length} questions`);
    allQuestions.push(...data);
  }

  console.log(`Total questions loaded: ${allQuestions.length}`);
  if (allQuestions.length !== 450) {
    throw new Error(`Expected 450 questions, found ${allQuestions.length}`);
  }

  // Sort by paper_code and question_number
  allQuestions.sort((a, b) => {
    if (a.paper_code !== b.paper_code) {
      return a.paper_code.localeCompare(b.paper_code);
    }
    return a.question_number - b.question_number;
  });

  // Upload clean diagrams
  console.log("\n1. Uploading diagrams to Supabase Storage...");
  let diagramUploadCount = 0;

  for (const q of allQuestions) {
    if (q.has_diagram) {
      const candidates = [
        path.join(process.cwd(), `tmp/clean_diagrams/${q.paper_code}/q${q.question_number}_diagram.png`),
        path.join(process.cwd(), `tmp/clean_diagrams/${q.paper_code}/q${q.question_number}_diagram.jpeg`),
        path.join(process.cwd(), `tmp/clean_diagrams/${q.paper_code}/q${q.question_number}_diagram.jpg`),
        path.join(process.cwd(), `tmp/clean_diagrams/${q.paper_code}/q${q.question_number}.png`),
        path.join(process.cwd(), `tmp/clean_diagrams/${q.paper_code}/q${q.question_number}.jpeg`),
        path.join(process.cwd(), `tmp/jee-main-2013/${q.paper_code}/crops/q${q.question_number}.png`),
        q.image_path,
      ];

      let foundPath = null;
      for (const p of candidates) {
        if (!p) continue;
        try {
          await fs.access(p);
          foundPath = p;
          break;
        } catch {}
      }

      if (foundPath) {
        try {
          const fileBuf = await fs.readFile(foundPath);
          const ext = path.extname(foundPath);
          const storagePath = `jee-main-2013-clean-diagrams/${q.paper_code}/q${q.question_number}${ext}`;
          const { error } = await supabase.storage
            .from("pyq-images")
            .upload(storagePath, fileBuf, {
              contentType: ext === ".png" ? "image/png" : "image/jpeg",
              upsert: true,
            });

          if (!error) {
            const { data: pubData } = supabase.storage
              .from("pyq-images")
              .getPublicUrl(storagePath);
            q.question_image = pubData.publicUrl;
            diagramUploadCount++;
          } else {
            console.error(`Error uploading diagram for ${q.paper_code} Q${q.question_number}:`, error.message);
          }
        } catch (e) {
          console.error(`Failed reading diagram ${foundPath}:`, e.message);
        }
      } else {
        console.warn(`No diagram file found on disk for ${q.paper_code} Q${q.question_number}`);
        q.question_image = null;
      }
    } else {
      q.question_image = null;
    }
  }

  console.log(`Uploaded ${diagramUploadCount} clean diagrams.`);

  // Save merged clean dataset
  const datasetPath = path.join(process.cwd(), "scratch/complete_clean_jee_2013.json");
  await fs.writeFile(datasetPath, JSON.stringify(allQuestions, null, 2), "utf8");
  console.log(`Saved complete dataset to ${datasetPath}`);

  // 2. Update pyq_questions in Supabase
  console.log("\n2. Updating pyq_questions in Supabase...");
  let pyqUpdateCount = 0;
  for (const q of allQuestions) {
    const { error } = await supabase
      .from("pyq_questions")
      .update({
        question: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option.toLowerCase(),
        question_image: q.question_image || null,
        chapter: q.chapter,
        explanation: `Official answer: Option (${q.correct_option.toUpperCase()})`,
      })
      .eq("paper_code", q.paper_code)
      .eq("question_number", q.question_number);

    if (error) {
      console.error(`Error updating pyq_questions ${q.paper_code} Q${q.question_number}:`, error.message);
    } else {
      pyqUpdateCount++;
    }
  }
  console.log(`Updated ${pyqUpdateCount}/450 pyq_questions rows.`);

  // 3. Update practice questions table
  console.log("\n3. Updating questions table (Practice Test Bank)...");
  await supabase
    .from("questions")
    .delete()
    .eq("exam", "JEE Main")
    .eq("source_type", "PREPZII_PRACTICE")
    .like("explanation", "%Official answer%");

  const practiceRows = allQuestions.map((q) => ({
    exam: "JEE Main",
    subject: q.subject,
    chapter: q.chapter,
    topic: "General",
    difficulty: "MEDIUM",
    question_type: "MCQ",
    question_text: q.question_text,
    question_image: q.question_image || null,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_option: q.correct_option.toLowerCase(),
    explanation: `Official answer: Option (${q.correct_option.toUpperCase()})`,
    marks: 4,
    negative_marks: 1,
    source_type: "PREPZII_PRACTICE",
    status: "PUBLISHED",
    is_active: true,
  }));

  const CHUNK_SIZE = 50;
  for (let i = 0; i < practiceRows.length; i += CHUNK_SIZE) {
    const chunk = practiceRows.slice(i, i + CHUNK_SIZE);
    const { error: insErr } = await supabase.from("questions").insert(chunk);
    if (insErr) {
      console.error(`Error inserting practice chunk ${i}:`, insErr.message);
    }
  }
  console.log(`Inserted ${practiceRows.length} practice questions.`);

  console.log("\n=== ALL SYNC OPERATIONS COMPLETED! ===");
}

run().catch(console.error);
