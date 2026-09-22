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

const ESSENTIAL_DIAGRAMS = {
  "JEE-MAIN-13-07APR": [8, 9, 13, 14, 19, 23, 26, 27, 30, 45],
  "JEE-MAIN-13-09APR": [4, 5, 6, 9, 10, 21, 22, 25, 26, 29, 41, 55],
  "JEE-MAIN-13-22APR": [3, 5, 11, 12, 13, 17, 18, 19, 21, 30, 42, 43, 55, 60],
  "JEE-MAIN-13-23APR": [9, 18, 21, 24, 28, 30, 55],
  "JEE-MAIN-13-25APR": [1, 8, 16, 29, 46, 53, 56],
};

async function run() {
  console.log("=== Uploading Watermark-Free Diagrams (v2 Cache Busted) and Syncing DB ===");

  const datasetPath = path.join(process.cwd(), "scratch/complete_clean_jee_2013.json");
  const dataset = JSON.parse(await fs.readFile(datasetPath, "utf8"));

  // 1. Upload diagrams to Supabase Storage
  console.log("\n1. Uploading clean diagrams to jee-main-2013-clean-v2/...");
  let uploaded = 0;

  for (const q of dataset) {
    const list = ESSENTIAL_DIAGRAMS[q.paper_code] || [];
    if (list.includes(q.question_number)) {
      const localImgPath = path.join(
        process.cwd(),
        `scratch/perfect_diagrams/${q.paper_code}/q${q.question_number}.png`
      );
      try {
        const fileBuf = await fs.readFile(localImgPath);
        const storagePath = `jee-main-2013-clean-v2/${q.paper_code}/q${q.question_number}.png`;
        const { error: upErr } = await supabase.storage
          .from("pyq-images")
          .upload(storagePath, fileBuf, {
            contentType: "image/png",
            upsert: true,
          });

        if (!upErr) {
          const { data: pubData } = supabase.storage
            .from("pyq-images")
            .getPublicUrl(storagePath);
          q.question_image = `${pubData.publicUrl}?v=2`;
          q.has_diagram = true;
          uploaded++;
        } else {
          console.error(`Failed uploading ${q.paper_code} Q${q.question_number}:`, upErr.message);
        }
      } catch (e) {
        console.error(`Failed reading local image for ${q.paper_code} Q${q.question_number}:`, e.message);
      }
    } else {
      q.question_image = null;
      q.has_diagram = false;
    }
  }

  console.log(`Successfully uploaded ${uploaded} clean diagrams.`);

  // Save updated dataset
  await fs.writeFile(datasetPath, JSON.stringify(dataset, null, 2), "utf8");

  // 2. Update pyq_questions
  console.log("\n2. Updating pyq_questions table...");
  let pyqUpdates = 0;
  for (const q of dataset) {
    const { error: pyqErr } = await supabase
      .from("pyq_questions")
      .update({
        question: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option.toLowerCase(),
        question_image: q.question_image,
        chapter: q.chapter,
        explanation: `Official answer: Option (${q.correct_option.toUpperCase()})`,
      })
      .eq("paper_code", q.paper_code)
      .eq("question_number", q.question_number);

    if (pyqErr) {
      console.error(`Error updating pyq_questions ${q.paper_code} Q${q.question_number}:`, pyqErr.message);
    } else {
      pyqUpdates++;
    }
  }
  console.log(`Updated ${pyqUpdates}/450 rows in pyq_questions.`);

  // 3. Update questions practice table
  console.log("\n3. Updating questions practice test bank...");
  await supabase
    .from("questions")
    .delete()
    .eq("exam", "JEE Main")
    .eq("source_type", "PREPZII_PRACTICE")
    .like("explanation", "%Official answer%");

  const practiceRows = dataset.map((q) => ({
    exam: "JEE Main",
    subject: q.subject,
    chapter: q.chapter,
    topic: "General",
    difficulty: "MEDIUM",
    question_type: "MCQ",
    question_text: q.question_text,
    question_image: q.question_image,
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
      console.error(`Error inserting questions chunk ${i}:`, insErr.message);
    }
  }
  console.log(`Inserted ${practiceRows.length} practice questions.`);

  console.log("\n=== SYNC COMPLETE! ===");
}

run().catch(console.error);
