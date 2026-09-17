import process from "node:process";
import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { mergeAndIngest } from "./prepare_jee_questions_ingestion.mjs";

process.loadEnvFile(".env.local");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function run() {
  console.log("Starting JEE question ingestion and chapter synchronization...");
  const { toUpsert, pyqUpdates } = await mergeAndIngest();

  console.log(`Total questions to upsert into 'questions' table: ${toUpsert.length}`);
  console.log(`Total pyq_questions rows to update with NCERT chapter: ${pyqUpdates.length}`);

  const CHUNK_SIZE = 100;

  // 1. Upsert to questions table
  console.log("Upserting into 'questions' table...");
  let insertedQuestions = 0;
  for (let i = 0; i < toUpsert.length; i += CHUNK_SIZE) {
    const chunk = toUpsert.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase
      .from("questions")
      .upsert(chunk, { onConflict: "id" });

    if (error) {
      console.error(`Error upserting chunk ${i}-${i + chunk.length}:`, error);
      throw error;
    }
    insertedQuestions += chunk.length;
    if ((i / CHUNK_SIZE) % 5 === 0 || i + chunk.length >= toUpsert.length) {
      console.log(`Upserted ${insertedQuestions} / ${toUpsert.length} questions into 'questions' table`);
    }
  }

  // 2. Update pyq_questions table
  console.log("Updating 'pyq_questions' table with NCERT chapters...");
  let updatedPyq = 0;
  for (let i = 0; i < pyqUpdates.length; i += CHUNK_SIZE) {
    const chunk = pyqUpdates.slice(i, i + CHUNK_SIZE);
    const promises = chunk.map(u =>
      supabase
        .from("pyq_questions")
        .update({ chapter: u.chapter, subject: u.subject })
        .eq("id", u.id)
    );
    const results = await Promise.all(promises);
    const failed = results.filter(r => r.error);
    if (failed.length > 0) {
      console.error("Some updates failed:", failed.map(f => f.error));
    }
    updatedPyq += chunk.length;
    if ((i / CHUNK_SIZE) % 5 === 0 || i + chunk.length >= pyqUpdates.length) {
      console.log(`Updated ${updatedPyq} / ${pyqUpdates.length} in 'pyq_questions' table`);
    }
  }

  console.log("ALL INGESTIONS AND UPDATES COMPLETED SUCCESSFULLY!");
}

run().catch(console.error);
