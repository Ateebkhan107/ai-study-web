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

const OPTION_IMAGE_QUESTIONS = {
  "JEE-MAIN-13-07APR": [8, 23, 27, 30],
  "JEE-MAIN-13-09APR": [22, 41, 55],
  "JEE-MAIN-13-22APR": [11, 19, 42, 43, 55, 60],
  "JEE-MAIN-13-23APR": [28, 30, 55],
  "JEE-MAIN-13-25APR": [1, 29, 53],
};

const SINGLE_DIAGRAM_QUESTIONS = {
  "JEE-MAIN-13-07APR": [9, 13, 14, 19, 26, 45],
  "JEE-MAIN-13-09APR": [4, 5, 6, 9, 10, 21, 25, 26, 29],
  "JEE-MAIN-13-22APR": [3, 5, 12, 13, 17, 18, 21, 30],
  "JEE-MAIN-13-23APR": [9, 18, 21, 24],
  "JEE-MAIN-13-25APR": [8, 16, 46, 56],
};

async function run() {
  console.log("=== Uploading Individual Option Images & Main Question Diagrams ===");

  const datasetPath = path.join(process.cwd(), "scratch/complete_clean_jee_2013.json");
  const dataset = JSON.parse(await fs.readFile(datasetPath, "utf8"));

  let uploadedOptions = 0;
  let uploadedQuestions = 0;

  for (const q of dataset) {
    const isOptQuestion = (OPTION_IMAGE_QUESTIONS[q.paper_code] || []).includes(q.question_number);
    const isSingleDiag = (SINGLE_DIAGRAM_QUESTIONS[q.paper_code] || []).includes(q.question_number);

    // Initialize option images to null
    q.option_a_image = null;
    q.option_b_image = null;
    q.option_c_image = null;
    q.option_d_image = null;

    if (isOptQuestion) {
      // 1. Check if there is a main question image
      const mainPath = path.join(
        process.cwd(),
        `scratch/option_images/${q.paper_code}/q${q.question_number}_main.png`
      );
      try {
        await fs.access(mainPath);
        const fileBuf = await fs.readFile(mainPath);
        const storagePath = `jee-main-2013-v3/${q.paper_code}/q${q.question_number}_main.png`;
        await supabase.storage.from("pyq-images").upload(storagePath, fileBuf, {
          contentType: "image/png",
          upsert: true,
        });
        const { data: pubData } = supabase.storage.from("pyq-images").getPublicUrl(storagePath);
        q.question_image = `${pubData.publicUrl}?v=3`;
        q.has_diagram = true;
        uploadedQuestions++;
      } catch {
        q.question_image = null;
        q.has_diagram = false;
      }

      // 2. Upload the 4 option images
      for (const letter of ["a", "b", "c", "d"]) {
        const optPath = path.join(
          process.cwd(),
          `scratch/option_images/${q.paper_code}/q${q.question_number}_opt_${letter}.png`
        );
        try {
          const fileBuf = await fs.readFile(optPath);
          const storagePath = `jee-main-2013-options-v3/${q.paper_code}/q${q.question_number}_opt_${letter}.png`;
          await supabase.storage.from("pyq-images").upload(storagePath, fileBuf, {
            contentType: "image/png",
            upsert: true,
          });
          const { data: pubData } = supabase.storage.from("pyq-images").getPublicUrl(storagePath);
          q[`option_${letter}_image`] = `${pubData.publicUrl}?v=3`;
          // Clear dummy option text if it was "Option A/B/C/D"
          if (q[`option_${letter}`]?.toLowerCase().startsWith("option")) {
            q[`option_${letter}`] = "";
          }
          uploadedOptions++;
        } catch (e) {
          console.error(`Failed reading option ${letter} for ${q.paper_code} Q${q.question_number}:`, e.message);
        }
      }
    } else if (isSingleDiag) {
      const diagPath = path.join(
        process.cwd(),
        `scratch/perfect_diagrams/${q.paper_code}/q${q.question_number}.png`
      );
      try {
        const fileBuf = await fs.readFile(diagPath);
        const storagePath = `jee-main-2013-v3/${q.paper_code}/q${q.question_number}.png`;
        await supabase.storage.from("pyq-images").upload(storagePath, fileBuf, {
          contentType: "image/png",
          upsert: true,
        });
        const { data: pubData } = supabase.storage.from("pyq-images").getPublicUrl(storagePath);
        q.question_image = `${pubData.publicUrl}?v=3`;
        q.has_diagram = true;
        uploadedQuestions++;
      } catch (e) {
        console.error(`Failed reading single diagram for ${q.paper_code} Q${q.question_number}:`, e.message);
      }
    } else {
      q.question_image = null;
      q.has_diagram = false;
    }
  }

  console.log(`Uploaded ${uploadedOptions} individual option images and ${uploadedQuestions} question diagrams.`);

  // Save updated dataset
  await fs.writeFile(datasetPath, JSON.stringify(dataset, null, 2), "utf8");

  // 3. Update pyq_questions
  console.log("\nUpdating pyq_questions in Supabase...");
  let pyqUpdates = 0;
  for (const q of dataset) {
    const { error: pyqErr } = await supabase
      .from("pyq_questions")
      .update({
        question: q.question_text,
        option_a: q.option_a || "",
        option_b: q.option_b || "",
        option_c: q.option_c || "",
        option_d: q.option_d || "",
        option_a_image: q.option_a_image,
        option_b_image: q.option_b_image,
        option_c_image: q.option_c_image,
        option_d_image: q.option_d_image,
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

  // 4. Update questions practice table
  console.log("\nUpdating questions practice table...");
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
    option_a: q.option_a || "",
    option_b: q.option_b || "",
    option_c: q.option_c || "",
    option_d: q.option_d || "",
    option_a_image: q.option_a_image,
    option_b_image: q.option_b_image,
    option_c_image: q.option_c_image,
    option_d_image: q.option_d_image,
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

  console.log("\n=== ALL DONE! ===");
}

run().catch(console.error);
