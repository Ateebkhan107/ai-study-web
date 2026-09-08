import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const examId = "8bb045c8-6bf7-4c84-8791-75f397f36f60";
const paperCode = "JEE-MAIN-26-22JAN-S2";
const bucketName = "pyq-images";
const storageDir = "jee-main-2026-january-clean/jee-main-26-22jan-s2";
const version = "20260906_v1";

const baseUrl = `https://vyqcciooigmnfmzrwtpp.supabase.co/storage/v1/object/public/${bucketName}/${storageDir}/`;
const localCropsDir = path.resolve("tmp/22jan_s2_crops");

// 1. Files to upload
const filesToUpload = [
  "q26_opt_a.png", "q26_opt_b.png", "q26_opt_c.png", "q26_opt_d.png",
  "q27_diagram.png",
  "q31_diagram.png",
  "q41_diagram.png",
  "q45_diagram.png", "q45_opt_a.png", "q45_opt_b.png", "q45_opt_c.png", "q45_opt_d.png",
  "q52_diagram.png",
  "q57_diagram.png",
  "q61_diagram.png",
  "q64_diagram.png", "q64_opt_a.png", "q64_opt_b.png", "q64_opt_c.png", "q64_opt_d.png",
  "q66_opt_a.png", "q66_opt_b.png", "q66_opt_c.png", "q66_opt_d.png"
];

console.log("Uploading files to Supabase Storage...");
for (const file of filesToUpload) {
  const filePath = path.join(localCropsDir, file);
  const fileData = await fs.readFile(filePath);
  const storagePath = `${storageDir}/${file}`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, fileData, {
      upsert: true,
      contentType: "image/png",
      cacheControl: "300"
    });
    
  if (uploadError) {
    console.error(`Failed to upload ${file}:`, uploadError);
  } else {
    console.log(`Uploaded ${storagePath}`);
  }
}

// 2. Fetch existing questions
const { data: questions, error: qError } = await supabase
  .from("pyq_questions")
  .select("*")
  .eq("exam_id", examId)
  .order("question_number", { ascending: true });

if (qError) {
  console.error("Error fetching questions:", qError);
  process.exit(1);
}

// 3. Clear incorrect images on questions that do not have diagrams
const visualQuestionNumbers = new Set([26, 27, 31, 41, 45, 52, 57, 61, 64, 66]);

for (const q of questions) {
  const qNum = q.question_number;
  
  if (!visualQuestionNumbers.has(qNum)) {
    // Clear any image on non-visual questions
    if (q.question_image || q.option_a_image || q.option_b_image || q.option_c_image || q.option_d_image) {
      console.log(`Clearing rogue images from Q${qNum}`);
      await supabase
        .from("pyq_questions")
        .update({
          question_image: null,
          option_a_image: null,
          option_b_image: null,
          option_c_image: null,
          option_d_image: null
        })
        .eq("id", q.id);
    }
  }
}

// 4. Update the 10 visual questions
const updates = [
  // Q26: Pendulum plots in options A..D
  {
    num: 26,
    data: {
      question_image: null,
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_a_image: `${baseUrl}q26_opt_a.png?v=${version}`,
      option_b_image: `${baseUrl}q26_opt_b.png?v=${version}`,
      option_c_image: `${baseUrl}q26_opt_c.png?v=${version}`,
      option_d_image: `${baseUrl}q26_opt_d.png?v=${version}`
    }
  },
  // Q27: Circuit diagram
  {
    num: 27,
    data: {
      question_image: `${baseUrl}q27_diagram.png?v=${version}`,
      option_a: "3",
      option_b: "zero",
      option_c: "2",
      option_d: "1",
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null
    }
  },
  // Q31: Pentagon diagram
  {
    num: 31,
    data: {
      question_image: `${baseUrl}q31_diagram.png?v=${version}`,
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null
    }
  },
  // Q41: Bar collision diagram
  {
    num: 41,
    data: {
      question_image: `${baseUrl}q41_diagram.png?v=${version}`,
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null
    }
  },
  // Q45: Logic gate diagram + truth tables
  {
    num: 45,
    data: {
      question_image: `${baseUrl}q45_diagram.png?v=${version}`,
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_a_image: `${baseUrl}q45_opt_a.png?v=${version}`,
      option_b_image: `${baseUrl}q45_opt_b.png?v=${version}`,
      option_c_image: `${baseUrl}q45_opt_c.png?v=${version}`,
      option_d_image: `${baseUrl}q45_opt_d.png?v=${version}`
    }
  },
  // Q52: Reaction schemes
  {
    num: 52,
    data: {
      question_image: `${baseUrl}q52_diagram.png?v=${version}`,
      option_a: "B, C and E Only",
      option_b: "B and E Only",
      option_c: "B Only",
      option_d: "B and C Only",
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null
    }
  },
  // Q57: Reaction scheme
  {
    num: 57,
    data: {
      question_image: `${baseUrl}q57_diagram.png?v=${version}`,
      option_a: "2-methylhex-2-yne",
      option_b: "Isopropylbut-1-yne",
      option_c: "2-methylhex-3-yne",
      option_d: "5-methylhex-2-yne",
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null
    }
  },
  // Q61: IUPAC ester structure
  {
    num: 61,
    data: {
      question_image: `${baseUrl}q61_diagram.png?v=${version}`,
      option_a: "n-propyl-2-bromo-5-methylheptanoate",
      option_b: "2-bromo-5-methylhexylpropanoate",
      option_c: "n-propyl-1-bromo-4-methylhexanoate",
      option_d: "2-bromo-5-methylpropanoate",
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null
    }
  },
  // Q64: Reaction scheme + 4 options
  {
    num: 64,
    data: {
      question_image: `${baseUrl}q64_diagram.png?v=${version}`,
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_a_image: `${baseUrl}q64_opt_a.png?v=${version}`,
      option_b_image: `${baseUrl}q64_opt_b.png?v=${version}`,
      option_c_image: `${baseUrl}q64_opt_c.png?v=${version}`,
      option_d_image: `${baseUrl}q64_opt_d.png?v=${version}`
    }
  },
  // Q66: Dibromo 4 structure options
  {
    num: 66,
    data: {
      question_image: null,
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_a_image: `${baseUrl}q66_opt_a.png?v=${version}`,
      option_b_image: `${baseUrl}q66_opt_b.png?v=${version}`,
      option_c_image: `${baseUrl}q66_opt_c.png?v=${version}`,
      option_d_image: `${baseUrl}q66_opt_d.png?v=${version}`
    }
  }
];

for (const upd of updates) {
  const qObj = questions.find((q) => q.question_number === upd.num);
  if (!qObj) {
    console.error(`Question ${upd.num} not found!`);
    continue;
  }
  const { error: uErr } = await supabase
    .from("pyq_questions")
    .update(upd.data)
    .eq("id", qObj.id);

  if (uErr) {
    console.error(`Error updating Q${upd.num}:`, uErr);
  } else {
    console.log(`Successfully updated Q${upd.num}`);
  }
}

console.log("All updates complete!");
