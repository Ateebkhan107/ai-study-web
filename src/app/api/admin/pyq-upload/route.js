import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/admin";

import Papa from "papaparse";

// =============================
// UPLOAD PYQ CSV
// =============================

export async function POST(req) {
  const admin = await isAdmin();
  
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const rawExamId = formData.get("exam_id");
    const examId = rawExamId ? rawExamId.trim() : null;

    if (!file) {
      console.error("Upload Error: CSV file missing");
      return NextResponse.json({ success: false, error: "CSV file missing" }, { status: 400 });
    }
    
    const fileName = file.name || "Unknown File";

    if (!examId) {
      console.error(`Upload Error: Missing Exam ID. File: ${fileName}`);
      return NextResponse.json({ success: false, error: "Missing Exam ID" }, { status: 400 });
    }

//     console.log("=== CSV IMPORT DEBUG ===");
//     console.log("Received exam_id:", examId);
//     console.log("CSV filename:", fileName);

    // 1. Fetch Exam Metadata without .single() to debug the exact response
    const { data, error: examError } = await supabaseAdmin
      .from("pyq_exams")
      .select("*")
      .eq("id", examId);

//     console.log("Exam lookup:", data);
//     console.log("Supabase error:", examError);

    if (examError || !data || data.length !== 1) {
      const errorMsg = examError?.message || (data ? `Returned ${data.length} rows instead of 1` : "Data is null");
      console.error("Exam validation failed. Exact reason:", errorMsg, "Data:", data);
      return NextResponse.json({ success: false, error: `Invalid Exam ID: ${errorMsg}` }, { status: 400 });
    }
    
    const examData = data[0];

    const csvText = await file.text();
    
    const { data: parsedRows, errors } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    if (errors.length > 0) {
      console.error(errors);
    }

//     console.log("Headers:", Object.keys(parsedRows[0] || {}));
//     console.log("Parsed rows:", parsedRows.length);
//     console.log("First row:", parsedRows[0]);

    if (parsedRows.length === 0) {
      console.error("Upload Error: CSV empty or unreadable");
      return NextResponse.json({ success: false, error: "CSV empty or unreadable" }, { status: 400 });
    }

    const questions = [];

    // Format and Validate
    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      
      // Normalize correct_option
      let rawCorrectOption = row.correct_option || "";
      let normalizedCorrectOption = null;
      
      if (row.question_type === "MCQ" || !row.question_type) {
        normalizedCorrectOption = String(rawCorrectOption)
          .toUpperCase()
          .replace(/OPTIONS?/g, "")
          .replace(/ANSWERS?/g, "")
          .replace(/ANS/g, "")
          .replace(/[:()]/g, "")
          .trim();
      } else {
        normalizedCorrectOption = row.correct_option || null;
      }

      const q = {
        // Map new architecture relation
        exam_id: examId,
        
        // Preserve legacy metadata for backward compatibility (safe migration)
        exam: examData.exam,
        year: examData.year,
        exam_type: examData.exam_type,
        attempt: examData.attempt || (examData.exam_date ? examData.exam_date.toString() : null), // fallback to attempt or exam_date
        shift: examData.shift || null,
        paper_code: examData.paper_code || null,
        
        // Extract from simplified CSV row
        subject: row.subject,
        chapter: row.chapter,
        question_type: row.question_type || "MCQ",
        question: row.question,
        question_image: row.question_image || null, // although Images are now uploaded via Image Manager, we allow it if present
        option_a: row.option_a,
        option_b: row.option_b,
        option_c: row.option_c,
        option_d: row.option_d,
        correct_option: normalizedCorrectOption,
        correct_options: row.correct_options ? row.correct_options.split(",").map(x => x.trim()) : null,
        numerical_answer: row.numerical_answer ? Number(row.numerical_answer) : null,
        numerical_min: row.numerical_min ? Number(row.numerical_min) : null,
        numerical_max: row.numerical_max ? Number(row.numerical_max) : null,
        explanation: row.explanation,
        marks_positive: row.marks_positive ? Number(row.marks_positive) : 4,
        marks_negative: row.marks_negative !== null && row.marks_negative !== undefined ? Number(row.marks_negative) : 0
      };

      // Validation
      if (!q.subject || !q.question || !q.question_type) {
        const validationError = `Validation failed on row ${i + 2}: Missing Subject, Question, or Question Type.`;
        console.error("Validation Error:", validationError, "Row data:", row);
        return NextResponse.json({ success: false, error: validationError }, { status: 400 });
      }
      
      if (q.question_type === "MCQ") {
        if (!["A", "B", "C", "D"].includes(q.correct_option)) {
          const validationError = `Validation failed on row ${i + 2}: Invalid correct_option. Original: "${rawCorrectOption}", Normalized: "${q.correct_option}". Expected A, B, C, or D.`;
          console.error("Validation Error:", validationError, "Row data:", row);
          return NextResponse.json({ success: false, error: validationError }, { status: 400 });
        }
      }

      questions.push(q);
    }

    // =============================
    // DUPLICATE DETECTION
    // =============================
    
    // Fetch existing questions for this exam to build a Set of existing question texts
    const { data: existingData, error: fetchError } = await supabaseAdmin
      .from("pyq_questions")
      .select("question")
      .eq("exam_id", examId);
      
    if (fetchError) {
      console.error("Supabase Error (Fetch Duplicates):", fetchError.message);
      return NextResponse.json({ success: false, error: `Failed to verify duplicates: ${fetchError.message}` }, { status: 400 });
    }

    const existingQuestionTexts = new Set();
    if (existingData) {
      for (const r of existingData) {
        if (r.question) existingQuestionTexts.add(r.question.trim());
      }
    }

    // Filter out questions that already exist
    const newQuestions = [];
    let duplicateCount = 0;

    for (const q of questions) {
      const qText = q.question ? q.question.trim() : "";
      
      if (existingQuestionTexts.has(qText)) {
        duplicateCount++;
      } else {
        newQuestions.push(q);
        existingQuestionTexts.add(qText); // prevent duplicates within the CSV itself
      }
    }

    if (newQuestions.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        skipped: duplicateCount,
        message: `Skipped ${duplicateCount} duplicate questions. No new questions added.`
      });
    }

    // 4. Insert the new questions
    const { error } = await supabaseAdmin
      .from("pyq_questions")
      .insert(newQuestions);

    if (error) {
      console.error("Supabase Error (Insert Questions):", error.message);
      return NextResponse.json({ success: false, error: `Failed inserting questions: ${error.message}` }, { status: 400 });
    }
    
    // 5. Update Question Count in pyq_exams
    await supabaseAdmin.rpc('increment_exam_question_count', { row_id: examId, increment_num: newQuestions.length })
      // Fallback if RPC doesn't exist, though typically you'd just do an update or recalculate
      // For safety, we can just do a simple count query update.
      .then(async () => {
         const { count, error: countError } = await supabaseAdmin.from('pyq_questions').select('*', { count: 'exact', head: true }).eq('exam_id', examId);
         if (countError) console.error("Supabase Error (Count):", countError.message);
         if (count !== null) await supabaseAdmin.from('pyq_exams').update({ question_count: count }).eq('id', examId);
      });

    // 6. Calculate missing images for summary
    let missingImagesCount = 0;
    for (const q of newQuestions) {
      if (!q.question_image && !q.option_a_image && !q.option_b_image && !q.option_c_image && !q.option_d_image && !q.explanation_image) {
        missingImagesCount++;
      }
    }

    return NextResponse.json({
      success: true,
      count: newQuestions.length,
      skipped: duplicateCount,
      missingImages: missingImagesCount
    });

  } catch(error) {
    console.error("Upload crashed. Catch block error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || String(error)
      },
      { status: 400 }
    );
  }
}