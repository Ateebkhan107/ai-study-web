import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const RAW_URL = "https://vkrqzeezphqsbagfnzcn.supabase.co/storage/v1/object/public/question-figures/2021/February/dcbbf719-aa2d-4a4b-8420-5cd8a26f3f7a_fig.png";
const OUT_DIR = path.resolve("scratch/jee2021/images/JEE-MAIN-21-25FEB-S1");

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  console.log("Fetching original figure from:", RAW_URL);
  const res = await fetch(RAW_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const rawBuffer = Buffer.from(await res.arrayBuffer());
  const rawPath = path.join(OUT_DIR, "q48_raw.png");
  await fs.writeFile(rawPath, rawBuffer);
  console.log("Saved raw figure to:", rawPath, rawBuffer.byteLength, "bytes");

  // Run python script for high-precision crop and clean contrast
  execSync("python3 src/scripts/process_q48.py", { stdio: "inherit" });

  // Upload to Supabase Storage bucket 'pyq-images'
  const filesToUpload = [
    { name: "q48.png", remote: "jee-main-2021/JEE-MAIN-21-25FEB-S1/q48.png" },
    { name: "q48_opt_a.png", remote: "jee-main-2021/JEE-MAIN-21-25FEB-S1/q48_opt_a.png" },
    { name: "q48_opt_b.png", remote: "jee-main-2021/JEE-MAIN-21-25FEB-S1/q48_opt_b.png" },
    { name: "q48_opt_c.png", remote: "jee-main-2021/JEE-MAIN-21-25FEB-S1/q48_opt_c.png" },
    { name: "q48_opt_d.png", remote: "jee-main-2021/JEE-MAIN-21-25FEB-S1/q48_opt_d.png" },
  ];

  for (const file of filesToUpload) {
    const localBytes = await fs.readFile(path.join(OUT_DIR, file.name));
    const { data, error } = await sb.storage.from("pyq-images").upload(file.remote, localBytes, {
      contentType: "image/png",
      upsert: true,
    });
    if (error) {
      console.error(`Error uploading ${file.remote}:`, error);
    } else {
      console.log(`Uploaded ${file.remote}:`, data);
    }
  }

  // Update pyq_questions in database with versioned URLs for instant cache update
  const timestamp = Date.now();
  const baseUrl = `${SUPABASE_URL}/storage/v1/object/public/pyq-images/jee-main-2021/JEE-MAIN-21-25FEB-S1`;
  const updatePayload = {
    question_image: `${baseUrl}/q48.png?v=${timestamp}`,
    option_a_image: `${baseUrl}/q48_opt_a.png?v=${timestamp}`,
    option_b_image: `${baseUrl}/q48_opt_b.png?v=${timestamp}`,
    option_c_image: `${baseUrl}/q48_opt_c.png?v=${timestamp}`,
    option_d_image: `${baseUrl}/q48_opt_d.png?v=${timestamp}`,
  };

  const { data: updated, error: updateError } = await sb
    .from("pyq_questions")
    .update(updatePayload)
    .eq("paper_code", "JEE-MAIN-21-25FEB-S1")
    .eq("question_number", 48)
    .select("id, question_number, question_image, option_a_image");

  if (updateError) {
    console.error("Database update error:", updateError);
  } else {
    console.log("Database updated successfully:", updated);
  }
}

main().catch(console.error);
