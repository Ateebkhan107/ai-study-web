const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  });
}

// Polyfill WebSocket for Supabase on Node 20
const WebSocket = require('ws');
global.WebSocket = WebSocket;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  const baseDir = path.join(__dirname, "tmp/jee-main-cropped");
  if (!fs.existsSync(baseDir)) {
    console.error("No cropped images found.");
    return;
  }

  const shifts = fs.readdirSync(baseDir).filter(f => f.startsWith("jee_main_"));

  for (const shiftDir of shifts) {
//     console.log(`\n=============================================`);
//     console.log(`Processing shift directory: ${shiftDir}`);
    
    // Parse Attempt and Shift
    // Example: jee_main_22_jan_shift_1
    const match = shiftDir.match(/jee_main_(\d+)_jan_shift_(\d+)/i);
    if (!match) continue;

    const attemptStr = `${match[1]} Jan`;
    const shiftStr = `Shift ${match[2]}`;
    const paperCode = `JEE-MAIN-25-${match[1]}JAN-S${match[2]}`;

    // 1. Ensure Exam exists
    const { data: exams, error: examsError } = await supabase
      .from("pyq_exams")
      .select("id")
      .eq("exam", "JEE Main")
      .eq("year", 2025)
      .eq("shift", shiftStr)
      .eq("attempt", attemptStr);

    let examId = null;
    if (examsError) {
      console.error("Exam select error:", examsError);
      continue;
    }

    if (exams && exams.length > 0) {
      examId = exams[0].id;
    } else {
//       console.log(`Creating Exam: ${attemptStr} ${shiftStr}...`);
      const examDate = `2025-01-${match[1]}`;
      const { data: newExam, error: insertError } = await supabase.from("pyq_exams").insert({
        exam: "JEE Main",
        exam_type: "JEE Main",
        year: 2025,
        paper_code: paperCode,
        attempt: attemptStr,
        shift: shiftStr,
        exam_date: examDate
      }).select().single();
      
      if (newExam) examId = newExam.id;
      else {
        console.error("Exam insert error:", insertError);
        continue;
      }
    }

    // 2. Read images and find questions
    const dirPath = path.join(baseDir, shiftDir);
    const files = fs.readdirSync(dirPath);
    
    // Group files by question number (e.g. Q1_question.png, Q1_solution.png)
    const questions = {};
    for (const file of files) {
      const qMatch = file.match(/^Q(\d+)_(question|solution)\.png$/);
      if (qMatch) {
        const qNum = parseInt(qMatch[1]);
        const type = qMatch[2];
        if (!questions[qNum]) questions[qNum] = {};
        questions[qNum][type] = path.join(dirPath, file);
      }
    }

    const qNums = Object.keys(questions).map(Number).sort((a,b) => a - b);
//     console.log(`Found ${qNums.length} extracted questions.`);

    for (const qNum of qNums) {
      const qData = questions[qNum];
      if (!qData.question) continue; // Skip if no question image
      
//       console.log(`Uploading Q${qNum}...`);
      
      // Upload Question Image
      let qImagePath = `jee-main-2025/january/${match[1]}-jan-shift-${match[2]}/q${qNum}.png`;
      const qImageBuffer = fs.readFileSync(qData.question);
      await supabase.storage.from("pyq-images").upload(qImagePath, qImageBuffer, { contentType: "image/png", upsert: true });

      // Upload Solution Image (if exists)
      let solImagePath = null;
      if (qData.solution) {
        solImagePath = `jee-main-2025/january/${match[1]}-jan-shift-${match[2]}/q${qNum}_sol.png`;
        const solImageBuffer = fs.readFileSync(qData.solution);
        await supabase.storage.from("pyq-images").upload(solImagePath, solImageBuffer, { contentType: "image/png", upsert: true });
      }

      // 3. Insert into Database
      const record = {
        exam: "JEE Main",
        exam_type: "JEE Main",
        year: 2025,
        paper_code: paperCode,
        attempt: attemptStr,
        shift: shiftStr,
        exam_id: examId,
        subject: "Unmapped",  // To be edited in Admin CMS
        chapter: "Unmapped",
        question_type: "MCQ",
        question: "Refer to the question image below.",
        option_a: "A", // Placeholder as requested
        option_b: "B",
        option_c: "C",
        option_d: "D",
        correct_option: "a", // To be set in Admin CMS
        numerical_answer: null,
        explanation: solImagePath ? "Refer to the solution image below." : "",
        question_image: qImagePath,
        status: "PENDING_REVIEW", 
        marks_positive: 4,
        marks_negative: -1,
      };

      // Since we don't have a solution_image column in pyq_questions (it only has explanation string and question_image),
      // we can embed the solution image in the explanation field using markdown!
      if (solImagePath) {
        // Construct the public URL for the image to show in markdown
        const { data: publicUrlData } = supabase.storage.from("pyq-images").getPublicUrl(solImagePath);
        const solUrl = publicUrlData.publicUrl;
        record.explanation = `![Solution](${solUrl})`;
      }

      const { error } = await supabase.from("pyq_questions").insert(record);
      if (error) console.error(`Error inserting Q${qNum}:`, error);
    }
    
//     console.log(`Finished shift: ${shiftDir}`);
  }
}

run();
