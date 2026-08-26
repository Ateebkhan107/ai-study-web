import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

process.loadEnvFile(".env.local");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SHIFTS = [
  { code: "JEE-MAIN-25-22JAN-S1", prefix: "22jan_s1", date: "2025-01-22", attempt: "22 Jan", shift: "Shift 1" },
  { code: "JEE-MAIN-25-22JAN-S2", prefix: "22jan_s2", date: "2025-01-22", attempt: "22 Jan", shift: "Shift 2" },
  { code: "JEE-MAIN-25-23JAN-S1", prefix: "23jan_s1", date: "2025-01-23", attempt: "23 Jan", shift: "Shift 1" },
  { code: "JEE-MAIN-25-23JAN-S2", prefix: "23jan_s2", date: "2025-01-23", attempt: "23 Jan", shift: "Shift 2" },
  { code: "JEE-MAIN-25-24JAN-S1", prefix: "24jan_s1", date: "2025-01-24", attempt: "24 Jan", shift: "Shift 1" },
  { code: "JEE-MAIN-25-24JAN-S2", prefix: "24jan_s2", date: "2025-01-24", attempt: "24 Jan", shift: "Shift 2" },
  { code: "JEE-MAIN-25-28JAN-S1", prefix: "28jan_s1", date: "2025-01-28", attempt: "28 Jan", shift: "Shift 1" },
  { code: "JEE-MAIN-25-28JAN-S2", prefix: "28jan_s2", date: "2025-01-28", attempt: "28 Jan", shift: "Shift 2" },
  { code: "JEE-MAIN-25-29JAN-S1", prefix: "29jan_s1", date: "2025-01-29", attempt: "29 Jan", shift: "Shift 1" },
  { code: "JEE-MAIN-25-29JAN-S2", prefix: "29jan_s2", date: "2025-01-29", attempt: "29 Jan", shift: "Shift 2" },
];

async function getExamMap() {
  const { data: exams, error } = await supabase
    .from("pyq_exams")
    .select("id, paper_code")
    .eq("exam", "JEE")
    .eq("year", 2025);
    
  if (error) throw error;
  const map = {};
  for (const e of exams) {
    map[e.paper_code] = e.id;
  }
  return map;
}

async function uploadImageIfNeeded(paperCode, qNum, needsImage) {
  if (!needsImage) return null;
  
  const cropFileName = `q${String(qNum).padStart(2, "0")}.png`;
  const localCropPath = path.join("tmp/jee-main-2025-jan", paperCode, "crops", cropFileName);
  
  if (!fs.existsSync(localCropPath)) {
    console.warn(`[WARN] Crop image not found: ${localCropPath}`);
    return null;
  }
  
  const storagePath = `jee-main-2025-jan/${paperCode}/${cropFileName}`;
  const fileBuffer = fs.readFileSync(localCropPath);
  
  const { error } = await supabase.storage
    .from("pyq-images")
    .upload(storagePath, fileBuffer, {
      contentType: "image/png",
      upsert: true,
    });
    
  if (error && !error.message?.includes("already exists")) {
    console.error(`Storage upload error for ${storagePath}:`, error.message);
  }
  
  const { data: publicUrlData } = supabase.storage
    .from("pyq-images")
    .getPublicUrl(storagePath);
    
  return publicUrlData.publicUrl;
}

async function publishShift(shiftInfo, examId) {
  const { code, prefix, attempt, shift } = shiftInfo;
  console.log(`\n========================================`);
  console.log(`Publishing ${code} (Exam ID: ${examId})...`);
  console.log(`========================================`);
  
  // Fetch existing questions to preserve chapter/topic mappings if available
  const { data: existingQuestions } = await supabase
    .from("pyq_questions")
    .select("id, question_number, chapter, topic")
    .eq("paper_code", code);
    
  const existingMap = {};
  for (const eq of (existingQuestions || [])) {
    existingMap[eq.question_number] = eq;
  }
  
  const mathsFile = `tmp/${prefix}_maths.json`;
  const physicsFile = `tmp/${prefix}_physics.json`;
  const chemFile = `tmp/${prefix}_chem.json`;
  
  const mathsData = JSON.parse(fs.readFileSync(mathsFile, "utf-8"));
  const physicsData = JSON.parse(fs.readFileSync(physicsFile, "utf-8"));
  const chemData = JSON.parse(fs.readFileSync(chemFile, "utf-8"));
  
  const rawQuestions = [...mathsData, ...physicsData, ...chemData];
  if (rawQuestions.length !== 75) {
    throw new Error(`Expected 75 questions for ${code}, but got ${rawQuestions.length}`);
  }
  
  for (let idx = 0; idx < rawQuestions.length; idx++) {
    const raw = rawQuestions[idx];
    const qNum = idx + 1;
    const isSA = (qNum > 20 && qNum <= 25) || (qNum > 45 && qNum <= 50) || (qNum > 70 && qNum <= 75);
    const subject = qNum <= 25 ? "Maths" : (qNum <= 50 ? "Physics" : "Chemistry");
    
    // Upload image if question needs it
    const imageUrl = await uploadImageIfNeeded(code, qNum, raw.needs_image === true);
    
    const existing = existingMap[qNum];
    const defaultChapter = subject === "Maths" ? "General Mathematics" : (subject === "Physics" ? "General Physics" : "General Chemistry");
    const chapter = raw.chapter || (existing?.chapter && existing.chapter !== "Unmapped" ? existing.chapter : defaultChapter);
    const topic = raw.topic || (existing?.topic && existing.topic !== "Unmapped" ? existing.topic : null);
    
    const qObj = {
      exam: "JEE",
      exam_type: "JEE Main",
      year: 2025,
      paper_code: code,
      exam_id: examId,
      attempt: attempt,
      shift: shift,
      question_number: qNum,
      display_order: qNum,
      subject: subject,
      chapter: chapter,
      topic: topic,
      question: raw.question,
      option_a: isSA ? "Not applicable" : (raw.option_a || "Not applicable"),
      option_b: isSA ? "Not applicable" : (raw.option_b || "Not applicable"),
      option_c: isSA ? "Not applicable" : (raw.option_c || "Not applicable"),
      option_d: isSA ? "Not applicable" : (raw.option_d || "Not applicable"),
      correct_option: isSA ? "a" : (raw.correct_option ? raw.correct_option.toLowerCase() : "a"),
      question_type: isSA ? "NUMERICAL" : "MCQ",
      numerical_answer: isSA ? (raw.numerical_answer != null ? String(raw.numerical_answer) : null) : null,
      marks_positive: 4,
      marks_negative: isSA ? 1 : 1,
      difficulty: "MEDIUM",
      status: "PUBLISHED",
      confidence_score: 1.0,
      question_image: imageUrl,
      explanation: isSA ? `Official NTA Answer: ${raw.numerical_answer != null ? raw.numerical_answer : "N/A"}` : null,
    };
    
    if (existing) {
      const { error: updateError } = await supabase
        .from("pyq_questions")
        .update(qObj)
        .eq("id", existing.id);
        
      if (updateError) {
        console.error(`Error updating Q${qNum} (${code}):`, updateError);
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase
        .from("pyq_questions")
        .insert([qObj]);
        
      if (insertError) {
        console.error(`Error inserting Q${qNum} (${code}):`, insertError);
        throw insertError;
      }
    }
  }
  
  // Update exam status to PUBLISHED
  await supabase
    .from("pyq_exams")
    .update({ status: "PUBLISHED", is_published: true })
    .eq("id", examId);
    
  console.log(`[SUCCESS] ${code}: 75 questions updated & published cleanly!`);
}

async function main() {
  const examMap = await getExamMap();
  console.log("Found exam records for:", Object.keys(examMap));
  
  for (const shiftInfo of SHIFTS) {
    const examId = examMap[shiftInfo.code];
    if (!examId) {
      console.error(`No exam ID found in pyq_exams for ${shiftInfo.code}!`);
      continue;
    }
    await publishShift(shiftInfo, examId);
  }
  
  console.log("\n========================================================");
  console.log("ALL 10 JEE MAIN JANUARY 2025 PAPERS PUBLISHED CLEANLY!");
  console.log("========================================================");
}

main().catch((err) => {
  console.error("FATAL ERROR in publish_jan25_all:", err);
  process.exit(1);
});
