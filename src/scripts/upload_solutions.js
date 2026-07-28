import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import process from "node:process";
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in .env.local");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadSolutions(year, manifestPath, bucketPathPrefix) {
  let manifest;
  try {
    const raw = await fs.readFile(manifestPath, "utf-8");
    manifest = JSON.parse(raw);
  } catch (err) {
    console.error(`Skipping ${year}: Manifest not found or invalid (${manifestPath})`);
    return;
  }

  // manifest is a dict: { "1": "path/to/img", "2": ... }
  const numbers = Object.keys(manifest).map(Number).sort((a,b)=>a-b);
  
  for (let i = 0; i < numbers.length; i += 10) {
    const group = numbers.slice(i, i + 10);
    await Promise.all(group.map(async (num) => {
      const imgPath = manifest[String(num)];
      const objectPath = `${bucketPathPrefix}/solution-${String(num).padStart(3, "0")}.png`;
      const image = await fs.readFile(imgPath);
      
      const { error: uploadError } = await supabase.storage
        .from("pyq-images")
        .upload(objectPath, image, {
          upsert: true,
          contentType: "image/png",
        });
      
      if (uploadError) {
        console.error(`Error uploading ${objectPath}:`, uploadError.message);
        return;
      }
      
      const publicUrl = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
      
      // Now update the DB!
      // We must match year and paper_code and question_number OR we can fetch by exam and year and sort by id and assign?
      // Wait, in my import scripts, I didn't set `question_number`! I just inserted them in order from 1 to 200!
      // So to map them back, I must fetch them ordered by ID!
    }));
    console.log(`Uploaded solutions for ${year} up to question ${group[group.length - 1]}`);
  }
}

async function linkSolutions(year, manifestPath, bucketPathPrefix) {
  let manifest;
  try {
    const raw = await fs.readFile(manifestPath, "utf-8");
    manifest = JSON.parse(raw);
  } catch (err) {
    return;
  }

  const { data: questions, error } = await supabase
    .from("pyq_questions")
    .select("id")
    .eq("exam", "NEET")
    .eq("year", year)
    .eq("paper_code", `NEET ${year}`)
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  // questions are in order 1..200
  if (questions.length === 0) {
    console.log(`No questions found in DB for ${year}`);
    return;
  }

  for (let i = 0; i < questions.length; i++) {
    const qNum = i + 1; // 1-based index
    if (manifest[String(qNum)]) {
      const objectPath = `${bucketPathPrefix}/solution-${String(qNum).padStart(3, "0")}.png`;
      const publicUrl = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
      
      const { error: updateError } = await supabase
        .from("pyq_questions")
        .update({ explanation_image: publicUrl })
        .eq("id", questions[i].id);
        
      if (updateError) {
         console.error("Update error for Q", qNum, updateError);
      }
    }
  }
  console.log(`Linked solutions for ${year}!`);
}

async function main() {
  await uploadSolutions(2023, "tmp/neet-ug-2023-solutions.json", "neet-ug-2023");
  await uploadSolutions(2024, "tmp/neet-ug-2024-solutions.json", "neet-ug-2024");
  
  await linkSolutions(2023, "tmp/neet-ug-2023-solutions.json", "neet-ug-2023");
  await linkSolutions(2024, "tmp/neet-ug-2024-solutions.json", "neet-ug-2024");
}

main();
