import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Polyfill WebSocket for Supabase on Node 20
import WebSocket from 'ws';
global.WebSocket = WebSocket;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Please add GEMINI_API_KEY to your .env.local file");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const rootDir = __dirname;
const files = fs.readdirSync(rootDir).filter(f => f.startsWith("selfstudys") && f.endsWith(".pdf"));

const stats = {
  totalFound: 0,
  imported: 0,
  failed: 0,
  missingImages: 0,
  missingChapters: 0,
  missingAnswers: 0,
  duplicates: 0,
  uploadedImages: 0,
};

async function extractPageData(imagePath) {
  const imagePart = {
    inlineData: {
      data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
      mimeType: "image/png"
    },
  };

  const prompt = [
    "You are an expert at extracting JEE Main exam questions from images.",
    "This page contains multiple questions. Extract all of them.",
    "",
    "For each question, return a JSON object exactly matching this schema:",
    "{",
    '  "number": <integer, the question number>,',
    '  "question": "<string, the question text. If heavily image-based, write \'Refer to the source visual.\'>",',
    '  "question_type": "<string, either \'MCQ\' or \'NUMERICAL\'>",',
    '  "option_a": "<string, option A text, or null if NUMERICAL>",',
    '  "option_b": "<string, option B text, or null if NUMERICAL>",',
    '  "option_c": "<string, option C text, or null if NUMERICAL>",',
    '  "option_d": "<string, option D text, or null if NUMERICAL>",',
    '  "correct_option": "<string, \'a\', \'b\', \'c\', or \'d\', or null if NUMERICAL>",',
    '  "numerical_answer": "<number, the numeric answer if NUMERICAL, or null if MCQ>",',
    '  "explanation": "<string, detailed solution text>",',
    '  "subject": "<string, \'Physics\', \'Chemistry\', or \'Maths\'>",',
    '  "chapter": "<string, guess the JEE chapter name>"',
    "}",
    "",
    "Return a JSON array containing all questions found on this page. Do not include markdown formatting or backticks. Just the raw JSON array."
  ].join("\n");

  const result = await model.generateContent([prompt, imagePart]);
  let text = result.response.text().trim();
  if (text.startsWith("```json")) text = text.replace(/^```json/, "").replace(/```$/, "");
  if (text.startsWith("```")) text = text.replace(/^```/, "").replace(/```$/, "");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON for page:", text);
    return [];
  }
}

async function processPDF(pdfFile, shiftNumber) {
//   console.log("\n=============================================");
//   console.log("Processing " + pdfFile + " (Shift " + shiftNumber + ")");
  const pdfPath = path.join(rootDir, pdfFile);
  const outputDir = path.join(rootDir, "tmp", "jee-main-2025-shift-" + shiftNumber);
  const imagesDir = path.join(outputDir, "question-images");
  fs.mkdirSync(imagesDir, { recursive: true });

  let allQuestions = [];
  
//   console.log("   Extracting all pages to images using pdftoppm...");
  try {
    const pagePrefix = path.join(imagesDir, 'page');
    execSync('pdftoppm -png -r 150 "' + pdfPath + '" "' + pagePrefix + '"');
  } catch (err) {
    console.error("pdftoppm failed:", err.message);
    return;
  }

  const pageImages = fs.readdirSync(imagesDir).filter(f => f.endsWith(".png")).sort();

  for (let i = 0; i < pageImages.length; i++) {
    const pageNum = i + 1;
    const imgPath = path.join(imagesDir, pageImages[i]);
    try {
//       console.log("   Extracting questions via Gemini from page " + pageNum + " (" + pageImages[i] + ")...");
      const questionsOnPage = await extractPageData(imgPath);
      
      for (const q of questionsOnPage) {
        q.exam = "JEE Main";
        q.year = 2025;
        
        // Parse attempt and shift from filename: jee_main_22_jan_shift_1.pdf
        const match = pdfFile.match(/jee_main_(\d+)_jan_shift_(\d+)\.pdf/i);
        if (match) {
          q.attempt = match[1] + " Jan";
          q.shift = "Shift " + match[2];
          q.paper_code = "JEE-MAIN-25-" + match[1] + "JAN-S" + match[2];
        } else {
          q.attempt = "January Session";
          q.shift = "Shift " + shiftNumber;
          q.paper_code = "JEE-MAIN-25-JAN-S" + shiftNumber;
        }
        
        q.image_path = imgPath;
        allQuestions.push(q);
      }
      
//       console.log("   Found " + questionsOnPage.length + " questions on page " + pageNum + ".");
      await new Promise(r => setTimeout(r, 4500));
    } catch (err) {
      console.error("Error on page " + pageNum + ":", err.message);
    }
  }

  allQuestions = allQuestions.filter((v,i,a)=>a.findIndex(v2=>(v2.number===v.number))===i);
  allQuestions.sort((a, b) => a.number - b.number);

//   console.log("Total unique questions found in PDF: " + allQuestions.length);

  const match = pdfFile.match(/jee_main_(\d+)_jan_shift_(\d+)\.pdf/i);
  let attemptStr = "January Session";
  let shiftStr = "Shift " + shiftNumber;
  let paperCode = "JEE-MAIN-25-JAN-S" + shiftNumber;
  if (match) {
    attemptStr = match[1] + " Jan";
    shiftStr = "Shift " + match[2];
    paperCode = "JEE-MAIN-25-" + match[1] + "JAN-S" + match[2];
  }

  const { data: exams, error: examsError } = await supabase.from("pyq_exams").select("id").eq("exam", "JEE Main").eq("year", 2025).eq("shift", shiftStr).eq("attempt", attemptStr);
  let examId = null;
  if (examsError) {
//     console.log("No pyq_exams table found or error:", examsError.message);
  } else if (exams && exams.length === 0) {
//     console.log("Creating JEE Main 2025 " + attemptStr + " " + shiftStr + " in pyq_exams...");
    const { data: newExam, error: insertError } = await supabase.from("pyq_exams").insert({
      exam: "JEE Main",
      exam_type: "JEE Main",
      year: 2025,
      paper_code: paperCode,
      attempt: attemptStr,
      shift: shiftStr
    }).select().single();
    if (newExam) examId = newExam.id;
  } else if (exams && exams.length > 0) {
    examId = exams[0].id;
  }

  for (const item of allQuestions) {
    stats.totalFound++;
    let storagePath = null;
    
    if (item.image_path) {
      try {
        const imageBuffer = fs.readFileSync(item.image_path);
        const match = pdfFile.match(/jee_main_(\d+)_jan_shift_(\d+)\.pdf/i);
        let filename = "";
        if (match) {
          filename = "jee-main-2025/january/" + match[1] + "-jan-shift-" + match[2] + "/q" + item.number + ext;
        } else {
          filename = "jee-main-2025/january/shift-" + shiftNumber + "/q" + item.number + ext;
        }
        
        const { error: uploadError } = await supabase.storage
          .from("pyq-images")
          .upload(filename, imageBuffer, { contentType: "image/png", upsert: true });

        if (uploadError) {
          console.error("Failed to upload image for Q" + item.number + ":", uploadError);
        } else {
          storagePath = filename;
          stats.uploadedImages++;
        }
      } catch (e) {
        console.error("Local image not found for Q" + item.number + ":", e.message);
        stats.missingImages++;
      }
    } else {
      stats.missingImages++;
    }

    if (!item.chapter) stats.missingChapters++;
    if (!item.correct_option && item.question_type !== 'NUMERICAL') stats.missingAnswers++;
    if (item.question_type === 'NUMERICAL' && item.numerical_answer === null) stats.missingAnswers++;

    const record = {
      exam: item.exam,
      exam_type: "JEE Main",
      year: item.year,
      paper_code: item.paper_code,
      attempt: item.attempt,
      shift: item.shift,
      exam_id: examId,
      subject: item.subject || 'Unknown',
      chapter: item.chapter || 'Unmapped',
      question_type: item.question_type,
      question: item.question,
      option_a: item.option_a,
      option_b: item.option_b,
      option_c: item.option_c,
      option_d: item.option_d,
      correct_option: item.correct_option,
      numerical_answer: item.numerical_answer ? Number(item.numerical_answer) : null,
      explanation: item.explanation || '',
      question_image: storagePath,
      status: "PENDING_REVIEW", 
      marks_positive: 4,
      marks_negative: item.question_type === "NUMERICAL" ? 0 : -1,
    };

    const { error } = await supabase.from("pyq_questions").insert(record);
    if (error) {
      console.error("Error inserting Q" + item.number + " Shift " + shiftNumber + ":", error.message);
      stats.failed++;
    } else {
      stats.imported++;
    }
  }
}

async function run() {
//   console.log("Starting JEE Main 2025 Direct Importer...");

  for (let i = 0; i < files.length; i++) {
    let shiftNumber = i + 1;
    await processPDF(files[i], shiftNumber);
  }

//   console.log("\n=============================================");
//   console.log("IMPORT COMPLETE REPORT");
//   console.log("=============================================");
//   console.log("- Total Questions Found: " + stats.totalFound);
//   console.log("- Successfully Imported: " + stats.imported);
//   console.log("- Failed: " + stats.failed);
//   console.log("- Missing Images: " + stats.missingImages);
//   console.log("- Missing Chapters: " + stats.missingChapters);
//   console.log("- Missing Answers: " + stats.missingAnswers);
//   console.log("- Duplicate Questions: " + stats.duplicates);
//   console.log("- Uploaded Images: " + stats.uploadedImages);
}

run();
