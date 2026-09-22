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

const PYQ_FILE = path.join(process.cwd(), "scratch/jee_2013_pyq_final.json");
const QUESTIONS_FILE = path.join(process.cwd(), "scratch/jee_2013_questions_final.json");

async function run() {
  console.log("=== Starting JEE Main 2013 Ingestion ===");

  const pyqData = JSON.parse(await fs.readFile(PYQ_FILE, "utf8"));
  const questionsData = JSON.parse(await fs.readFile(QUESTIONS_FILE, "utf8"));

  console.log(`Loaded ${pyqData.length} PYQ records and ${questionsData.length} Practice questions records.`);

  // 1. Ingest into pyq_questions
  console.log("\n1. Ingesting into pyq_questions...");
  const BATCH_SIZE = 50;
  let pyqInserted = 0;
  for (let i = 0; i < pyqData.length; i += BATCH_SIZE) {
    const chunk = pyqData.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from("pyq_questions").insert(chunk).select("id");
    if (error) {
      console.error(`Error inserting PYQ chunk ${i} - ${i + BATCH_SIZE}:`, error);
      throw error;
    }
    pyqInserted += data.length;
    console.log(`  Inserted pyq_questions ${pyqInserted}/${pyqData.length}`);
  }

  // 2. Ingest into questions table (practice bank)
  console.log("\n2. Ingesting into questions table (Practice Test Bank)...");
  let questionsInserted = 0;
  for (let i = 0; i < questionsData.length; i += BATCH_SIZE) {
    const chunk = questionsData.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from("questions").insert(chunk).select("id");
    if (error) {
      console.error(`Error inserting questions chunk ${i} - ${i + BATCH_SIZE}:`, error);
      throw error;
    }
    questionsInserted += data.length;
    console.log(`  Inserted questions ${questionsInserted}/${questionsData.length}`);
  }

  console.log("\n=== Ingestion Complete! ===");
  console.log(`Successfully ingested ${pyqInserted} rows to pyq_questions and ${questionsInserted} rows to questions!`);
}

run().catch(console.error);
