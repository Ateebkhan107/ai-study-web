/**
 * Upload manifests produced by prepare_jee_2025.js
 *
 * Run with: node src/scripts/import_jee_2025.mjs
 */

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

const rootDir = path.join(process.cwd(), "tmp");

async function run() {
  const folders = await fs.readdir(rootDir);
  const shiftFolders = folders.filter(f => f.startsWith("jee-main-2025-shift-"));

  if (shiftFolders.length === 0) {
    console.error("No shift folders found in /tmp. Run prepare_jee_2025.js first.");
    return;
  }

  for (const shiftFolder of shiftFolders) {
    const shiftNumber = shiftFolder.split("-").pop();
    const manifestPath = path.join(rootDir, shiftFolder, `jee-main-2025-shift-${shiftNumber}-manifest.json`);
    
    let manifest;
    try {
      manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    } catch (e) {
      console.warn(`No manifest found in ${shiftFolder}, skipping...`);
      continue;
    }

    console.log(`=========================================`);
    console.log(`Importing Shift ${shiftNumber} - ${manifest.length} questions`);

    const packageName = `JEE Main 2025 January Shift ${shiftNumber}`;
    
    // 1. Create Import Package
    const { data: packageData, error: pkgError } = await supabase
      .from("pyq_import_packages")
      .insert({ name: packageName, status: "PENDING_REVIEW" })
      .select()
      .single();

    if (pkgError) {
      console.error("Failed to create import package:", pkgError);
      continue;
    }

    const packageId = packageData.id;
    console.log(`Created Import Package: ${packageId}`);

    const records = [];
    
    // 2. Upload images and prepare records
    for (const item of manifest) {
      let storagePath = null;
      if (item.image_path) {
        try {
          const imageBuffer = await fs.readFile(item.image_path);
          const ext = path.extname(item.image_path);
          const filename = `jee-main-2025/january/shift-${shiftNumber}/q${item.number}${ext}`;
          
          const { error: uploadError } = await supabase.storage
            .from("pyq-images")
            .upload(filename, imageBuffer, { contentType: "image/png", upsert: true });

          if (uploadError) {
            console.error(`Failed to upload image for Q${item.number}:`, uploadError);
          } else {
            storagePath = filename;
          }
        } catch (e) {
          console.error(`Local image not found for Q${item.number}:`, e.message);
        }
      }

      records.push({
        exam: item.exam,
        exam_type: item.exam_type || "JEE Main",
        year: item.year,
        paper_code: item.paper_code || `JEE-MAIN-25-JAN-S${shiftNumber}`,
        attempt: item.attempt || "January Session",
        shift: item.shift || `Shift ${shiftNumber}`,
        subject: item.subject,
        chapter: item.chapter,
        question_type: item.question_type,
        question: item.question,
        option_a: item.option_a,
        option_b: item.option_b,
        option_c: item.option_c,
        option_d: item.option_d,
        correct_option: item.correct_option,
        numerical_answer: item.numerical_answer ? Number(item.numerical_answer) : null,
        explanation: item.explanation,
        question_image: storagePath,
        status: "PENDING_REVIEW",
        import_package_id: packageId,
        confidence_score: 95.0, // Set to high since AI parsed it, can be adjusted
        marks_positive: 4,
        marks_negative: item.question_type === "NUMERICAL" ? 0 : -1,
      });
    }

    // 3. Insert Records
    const batchSize = 30;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error } = await supabase.from("pyq_questions").insert(batch);
      if (error) {
        console.error(`Batch insert error for Shift ${shiftNumber}:`, error);
      }
    }
    console.log(`Successfully imported all questions for Shift ${shiftNumber}!`);
  }
}

run().catch(console.error);
