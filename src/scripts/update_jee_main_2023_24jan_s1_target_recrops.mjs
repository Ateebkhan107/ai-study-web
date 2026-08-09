import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

global.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const PAPER_CODE = "JEE-MAIN-23-24JAN-S1";
const RECROP_ROOT = path.join(process.cwd(), "tmp", "jee-main-2023-24jan-s1-target-recrops");
const manifest = JSON.parse(
  await fs.readFile(path.join(RECROP_ROOT, "recrop-manifest.json"), "utf8"),
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

for (const row of manifest) {
  const number = String(row.question_number).padStart(2, "0");
  const fileBuffer = await fs.readFile(row.local_image_path);
  const objectPath = `jee-main-2023-january-retouches/24jan-shift-1-targets/q${number}.png`;

  const { error: uploadError } = await supabase.storage
    .from("pyq-images")
    .upload(objectPath, fileBuffer, { contentType: "image/png", upsert: true });
  if (uploadError) throw uploadError;

  const publicUrl = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
  const { error: updateError } = await supabase
    .from("pyq_questions")
    .update({ question_image: publicUrl })
    .eq("id", row.id)
    .eq("paper_code", PAPER_CODE);
  if (updateError) throw updateError;
}

console.log(JSON.stringify({ paperCode: PAPER_CODE, updated: manifest.length }, null, 2));
