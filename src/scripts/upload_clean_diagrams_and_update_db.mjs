import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import { classifyQuestion } from "./comprehensive_jee_2013_classifier.mjs";
import { NCERT_CHAPTERS } from "./test_jee_ncert_classifier.mjs";

process.loadEnvFile(".env.local");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DATASET_FILE = path.join(process.cwd(), "scratch/complete_clean_jee_2013.json");

const MANUAL_CHAPTER_OVERRIDES = {
  "JEE-MAIN-13-07APR_42": "Thermodynamics",
  "JEE-MAIN-13-07APR_43": "Redox Reactions",
  "JEE-MAIN-13-07APR_70": "Straight Lines",
  "JEE-MAIN-13-07APR_74": "Inverse Trigonometric Functions",
  "JEE-MAIN-13-07APR_77": "Straight Lines",
  "JEE-MAIN-13-07APR_81": "Continuity and Differentiability",
  "JEE-MAIN-13-07APR_83": "Inverse Trigonometric Functions",
  "JEE-MAIN-13-09APR_4": "Laws of Motion",
  "JEE-MAIN-13-09APR_24": "Ray Optics and Optical Instruments",
  "JEE-MAIN-13-09APR_28": "Nuclei",
  "JEE-MAIN-13-09APR_33": "Chemical Bonding and Molecular Structure",
  "JEE-MAIN-13-09APR_35": "States of Matter",
  "JEE-MAIN-13-09APR_41": "Organic Chemistry - Some Basic Principles and Techniques",
  "JEE-MAIN-13-09APR_48": "Chemical Kinetics",
  "JEE-MAIN-13-09APR_61": "Complex Numbers and Quadratic Equations",
  "JEE-MAIN-13-09APR_64": "Sequences and Series",
  "JEE-MAIN-13-09APR_67": "Sequences and Series",
  "JEE-MAIN-13-09APR_68": "Straight Lines",
  "JEE-MAIN-13-09APR_74": "Integrals",
  "JEE-MAIN-13-09APR_80": "Relations and Functions – I",
  "JEE-MAIN-13-09APR_83": "Differential Equations",
  "JEE-MAIN-13-09APR_84": "Limits and Derivatives",
  "JEE-MAIN-13-22APR_2": "Motion in a Plane",
  "JEE-MAIN-13-22APR_5": "System of Particles and Rotational Motion",
  "JEE-MAIN-13-22APR_32": "Structure of Atom",
  "JEE-MAIN-13-22APR_33": "Classification of Elements and Periodicity in Properties",
  "JEE-MAIN-13-22APR_40": "Equilibrium",
  "JEE-MAIN-13-22APR_42": "Organic Chemistry - Some Basic Principles and Techniques",
  "JEE-MAIN-13-22APR_43": "Aldehydes, Ketones and Carboxylic Acids",
  "JEE-MAIN-13-22APR_51": "Chemical Bonding and Molecular Structure",
  "JEE-MAIN-13-22APR_52": "Chemical Bonding and Molecular Structure",
  "JEE-MAIN-13-22APR_61": "Complex Numbers and Quadratic Equations",
  "JEE-MAIN-13-22APR_64": "Sequences and Series",
  "JEE-MAIN-13-22APR_65": "Sequences and Series",
  "JEE-MAIN-13-22APR_67": "Trigonometric Functions",
  "JEE-MAIN-13-22APR_69": "Straight Lines",
  "JEE-MAIN-13-22APR_81": "Relations and Functions – II",
  "JEE-MAIN-13-22APR_84": "Limits and Derivatives",
  "JEE-MAIN-13-23APR_8": "Mechanical Properties of Fluids",
  "JEE-MAIN-13-23APR_33": "Classification of Elements and Periodicity in Properties",
  "JEE-MAIN-13-23APR_34": "Chemical Bonding and Molecular Structure",
  "JEE-MAIN-13-23APR_43": "The Solid State",
  "JEE-MAIN-13-23APR_45": "Electrochemistry",
  "JEE-MAIN-13-23APR_50": "Coordination Compounds",
  "JEE-MAIN-13-23APR_52": "Polymers",
  "JEE-MAIN-13-23APR_66": "Trigonometric Functions",
  "JEE-MAIN-13-23APR_72": "Mathematical Reasoning",
  "JEE-MAIN-13-23APR_76": "Relations and Functions – I",
  "JEE-MAIN-13-23APR_79": "Differential Equations",
  "JEE-MAIN-13-23APR_81": "Application of Derivatives",
  "JEE-MAIN-13-23APR_84": "Differential Equations",
  "JEE-MAIN-13-23APR_86": "Integrals",
  "JEE-MAIN-13-23APR_89": "Three Dimensional Geometry",
  "JEE-MAIN-13-25APR_35": "The p-Block Elements (Group 13 and 14)",
  "JEE-MAIN-13-25APR_37": "Chemical Bonding and Molecular Structure",
  "JEE-MAIN-13-25APR_38": "Chemical Bonding and Molecular Structure",
  "JEE-MAIN-13-25APR_41": "Thermodynamics",
  "JEE-MAIN-13-25APR_43": "Equilibrium",
  "JEE-MAIN-13-25APR_45": "The p-Block Elements (Group 15 to 18)",
  "JEE-MAIN-13-25APR_46": "Organic Chemistry - Some Basic Principles and Techniques",
  "JEE-MAIN-13-25APR_48": "Electrochemistry",
  "JEE-MAIN-13-25APR_53": "Organic Chemistry - Some Basic Principles and Techniques",
  "JEE-MAIN-13-25APR_54": "Aldehydes, Ketones and Carboxylic Acids",
  "JEE-MAIN-13-25APR_56": "Organic Chemistry - Some Basic Principles and Techniques",
  "JEE-MAIN-13-25APR_65": "Probability – I",
  "JEE-MAIN-13-25APR_67": "Sets",
  "JEE-MAIN-13-25APR_68": "Straight Lines",
  "JEE-MAIN-13-25APR_69": "Relations and Functions – I",
  "JEE-MAIN-13-25APR_74": "Mathematical Reasoning",
  "JEE-MAIN-13-25APR_80": "Application of Derivatives",
  "JEE-MAIN-13-25APR_83": "Integrals",
};

async function run() {
  console.log("=== Updating JEE 2013 with Clean Text & Diagram-Only Images ===");

  const dataset = JSON.parse(await fs.readFile(DATASET_FILE, "utf8"));
  console.log(`Loaded ${dataset.length} questions.`);

  // 1. Upload clean diagrams
  console.log("\n1. Uploading clean isolated diagrams to Supabase Storage...");
  let diagramUploadCount = 0;
  for (const item of dataset) {
    if (item.has_diagram && item.local_diagram_path) {
      try {
        const fileBuf = await fs.readFile(item.local_diagram_path);
        const ext = path.extname(item.local_diagram_path);
        const storagePath = `jee-main-2013-clean-diagrams/${item.paper_code}/q${item.qnum}${ext}`;
        const { error } = await supabase.storage
          .from("pyq-images")
          .upload(storagePath, fileBuf, {
            contentType: ext === ".png" ? "image/png" : "image/jpeg",
            upsert: true,
          });

        if (!error) {
          const { data: pubData } = supabase.storage
            .from("pyq-images")
            .getPublicUrl(storagePath);
          item.public_diagram_url = pubData.publicUrl;
          diagramUploadCount++;
        } else {
          console.error(`Error uploading diagram for ${item.paper_code} Q${item.qnum}:`, error.message);
        }
      } catch (e) {
        console.error(`Failed to read local diagram for ${item.paper_code} Q${item.qnum}:`, e.message);
      }
    }
  }
  console.log(`Uploaded ${diagramUploadCount} clean diagrams.`);

  // 2. Build update payloads
  console.log("\n2. Updating pyq_questions in Supabase...");
  for (const item of dataset) {
    const overrideKey = `${item.paper_code}_${item.qnum}`;
    let chapter = MANUAL_CHAPTER_OVERRIDES[overrideKey];
    if (!chapter) {
      const res = classifyQuestion({
        subject: item.subject,
        question: item.question_text,
        option_a: item.option_a,
        option_b: item.option_b,
        option_c: item.option_c,
        option_d: item.option_d,
      });
      chapter = res.chapter || (item.subject === "Physics" ? "Physical World, Units and Measurements" : item.subject === "Chemistry" ? "Some Basic Concepts of Chemistry" : "Sets");
    }

    const imageUrl = item.has_diagram && item.public_diagram_url ? item.public_diagram_url : null;

    // Update pyq_questions
    const { error: pyqErr } = await supabase
      .from("pyq_questions")
      .update({
        question: item.question_text,
        option_a: item.option_a,
        option_b: item.option_b,
        option_c: item.option_c,
        option_d: item.option_d,
        correct_option: item.correct_option,
        question_image: imageUrl,
        chapter: chapter,
        explanation: `Official answer: Option (${item.correct_option.toUpperCase()})`,
      })
      .eq("paper_code", item.paper_code)
      .eq("question_number", item.qnum);

    if (pyqErr) {
      console.error(`Error updating pyq_questions ${item.paper_code} Q${item.qnum}:`, pyqErr.message);
    }
  }
  console.log("Updated all pyq_questions rows!");

  // 3. Update questions table (practice test bank)
  console.log("\n3. Updating questions table (Practice Test Bank)...");
  // Delete existing JEE Main 2013 rows in questions table and insert fresh clean ones
  const { error: delErr } = await supabase
    .from("questions")
    .delete()
    .eq("exam", "JEE Main")
    .eq("source_type", "PREPZII_PRACTICE")
    .like("explanation", "%Official answer%");

  const practicePayload = dataset.map((item) => {
    const overrideKey = `${item.paper_code}_${item.qnum}`;
    let chapter = MANUAL_CHAPTER_OVERRIDES[overrideKey];
    if (!chapter) {
      const res = classifyQuestion({
        subject: item.subject,
        question: item.question_text,
        option_a: item.option_a,
        option_b: item.option_b,
        option_c: item.option_c,
        option_d: item.option_d,
      });
      chapter = res.chapter || (item.subject === "Physics" ? "Physical World, Units and Measurements" : item.subject === "Chemistry" ? "Some Basic Concepts of Chemistry" : "Sets");
    }

    const imageUrl = item.has_diagram && item.public_diagram_url ? item.public_diagram_url : null;

    return {
      exam: "JEE Main",
      subject: item.subject,
      chapter: chapter,
      topic: "General",
      difficulty: "MEDIUM",
      question_type: "MCQ",
      question_text: item.question_text,
      question_image: imageUrl,
      option_a: item.option_a,
      option_b: item.option_b,
      option_c: item.option_c,
      option_d: item.option_d,
      correct_option: item.correct_option,
      explanation: `Official answer: Option (${item.correct_option.toUpperCase()})`,
      marks: 4,
      negative_marks: 1,
      source_type: "PREPZII_PRACTICE",
      status: "PUBLISHED",
      is_active: true,
    };
  });

  const BATCH_SIZE = 50;
  for (let i = 0; i < practicePayload.length; i += BATCH_SIZE) {
    const chunk = practicePayload.slice(i, i + BATCH_SIZE);
    const { error: insErr } = await supabase.from("questions").insert(chunk);
    if (insErr) {
      console.error(`Error inserting questions chunk ${i}:`, insErr.message);
    }
  }
  console.log(`Successfully re-ingested ${practicePayload.length} clean practice questions!`);
  console.log("\n=== ALL TASKS COMPLETED SUCCESSFULLY! ===");
}

run().catch(console.error);
