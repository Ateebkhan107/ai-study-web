import fs from "node:fs/promises";
import path from "node:path";
import katex from "katex";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const TRANSCRIBED = path.join(ROOT, "scratch", "jee2022", "transcribed");

const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];
const PAPERS = [
  // Session 1: June 2022 (13 shifts)
  "JEE-MAIN-22-24JUN-S1", "JEE-MAIN-22-24JUN-S2",
  "JEE-MAIN-22-25JUN-S1", "JEE-MAIN-22-25JUN-S2",
  "JEE-MAIN-22-26JUN-S1", "JEE-MAIN-22-26JUN-S2",
  "JEE-MAIN-22-27JUN-S1", "JEE-MAIN-22-27JUN-S2",
  "JEE-MAIN-22-28JUN-S1", "JEE-MAIN-22-28JUN-S2",
  "JEE-MAIN-22-29JUN-S1", "JEE-MAIN-22-29JUN-S2",
  "JEE-MAIN-22-30JUN-S1",
  // Session 2: July 2022 (11 shifts)
  "JEE-MAIN-22-25JUL-S1", "JEE-MAIN-22-25JUL-S2",
  "JEE-MAIN-22-26JUL-S1", "JEE-MAIN-22-26JUL-S2",
  "JEE-MAIN-22-27JUL-S1", "JEE-MAIN-22-27JUL-S2",
  "JEE-MAIN-22-28JUL-S1", "JEE-MAIN-22-28JUL-S2",
  "JEE-MAIN-22-29JUL-S1", "JEE-MAIN-22-29JUL-S2",
  "JEE-MAIN-22-30JUL-S2"
];

function extractMathBlocks(text) {
  if (!text) return [];
  const blocks = [];
  // Match $$...$$
  let remaining = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    blocks.push({ math, display: true });
    return "";
  });
  // Match $...$
  remaining.replace(/\$([^$]+?)\$/g, (_, math) => {
    blocks.push({ math, display: false });
    return "";
  });
  return blocks;
}

function auditMath(text, location) {
  const issues = [];
  if (!text || typeof text !== "string") return issues;

  // 1. Dollar count check (unbalanced $)
  const dollarCount = (text.match(/(?<!\\)\$/g) || []).length;
  if (dollarCount % 2 !== 0) {
    issues.push({
      type: "UNBALANCED_DOLLARS",
      location,
      error: `Odd number of dollar signs (${dollarCount})`,
      snippet: text.slice(0, 100)
    });
  }

  // 2. KaTeX rendering check on all math blocks
  const mathBlocks = extractMathBlocks(text);
  for (const block of mathBlocks) {
    try {
      katex.renderToString(block.math, {
        throwOnError: true,
        displayMode: block.display
      });
    } catch (e) {
      issues.push({
        type: "KATEX_PARSE_ERROR",
        location,
        error: e.message,
        snippet: block.math.slice(0, 100)
      });
    }
  }

  // 3. Bare LaTeX commands outside $...$
  const outsideDollars = text.replace(/\$\$[\s\S]*?\$\$/g, " ").replace(/\$[^\$]*?\$/g, " ");
  
  // Common LaTeX commands that should never appear outside math
  const bareCommands = outsideDollars.match(/\\(frac|sqrt|vec|hat|alpha|beta|gamma|delta|Delta|epsilon|theta|Theta|lambda|Lambda|mu|pi|Pi|sigma|Sigma|omega|Omega|phi|Phi|times|pm|mp|int|sum|prod|infty|approx|le|ge|leq|geq|neq|cdot|circ|degree|rightarrow|leftarrow|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|mathrm|mathbf|mathit|text|begin|end|binom|partial|nabla)\b/);
  if (bareCommands) {
    issues.push({
      type: "BARE_LATEX_OUTSIDE_MATH",
      location,
      error: `Bare LaTeX command '\\${bareCommands[1]}' outside math delimiters`,
      snippet: outsideDollars.slice(Math.max(0, bareCommands.index - 20), bareCommands.index + 50)
    });
  }

  // 4. Bare script outside $...$
  const bareScript = outsideDollars.match(/(?:\b[a-zA-Z0-9]\^\{?[0-9a-zA-Z\+\-]+\}?|\b[a-zA-Z0-9]_\{?[0-9a-zA-Z\+\-]+\}?)/);
  if (bareScript) {
    // Exclude markdown like a_b or ordinary snake_case
    if (bareScript[0].includes("^") || /_[0-9]/.test(bareScript[0])) {
      issues.push({
        type: "BARE_SCRIPT_OUTSIDE_MATH",
        location,
        error: `Bare script '${bareScript[0]}' outside math delimiters`,
        snippet: outsideDollars.slice(Math.max(0, bareScript.index - 20), bareScript.index + 50)
      });
    }
  }

  // 5. Raw HTML tags
  const rawHtml = text.match(/<\/?(?:span|div|p|br|table|tr|td|th|b|i|strong|em)[^>]*>/i);
  if (rawHtml) {
    issues.push({
      type: "RAW_HTML_TAG",
      location,
      error: `Raw HTML tag '${rawHtml[0]}'`,
      snippet: text.slice(Math.max(0, rawHtml.index - 20), rawHtml.index + 50)
    });
  }

  // 6. Raw HTML entities
  const rawEntity = text.match(/&(?:nbsp|lt|gt|amp|quot|apos|deg);/i);
  if (rawEntity) {
    issues.push({
      type: "RAW_HTML_ENTITY",
      location,
      error: `Raw HTML entity '${rawEntity[0]}'`,
      snippet: text.slice(Math.max(0, rawEntity.index - 20), rawEntity.index + 50)
    });
  }

  return issues;
}

async function verifyImageFile(imagePath, location) {
  if (!imagePath) return null;
  try {
    const stat = await fs.stat(imagePath);
    if (stat.size === 0) {
      return { type: "EMPTY_IMAGE", location, path: imagePath, error: "Image file is 0 bytes" };
    }
    return null;
  } catch (err) {
    return { type: "MISSING_IMAGE_FILE", location, path: imagePath, error: err.message };
  }
}

function checkDiagramCue(q, qid) {
  // Check if text says "shown in figure" etc. but no question image exists
  const text = q.question || "";
  const hasImage = Boolean(q.question_image || q.option_a_image || q.option_b_image || q.option_c_image || q.option_d_image);
  
  if (hasImage) return null;

  // Patterns indicating a figure must accompany the question
  const diagramPatterns = [
    /\b(?:as )?shown in (?:the )?(?:figure|fig\.|diagram|circuit|graph|chart|plot)\b/i,
    /\bgiven in (?:the )?(?:figure|fig\.|diagram|circuit|graph|chart|plot)\b/i,
    /\bfrom the (?:given )?(?:figure|fig\.|diagram|circuit|graph|chart|plot)\b/i,
    /\bin the circuit shown\b/i,
    /\bin the circuit given\b/i,
    /\bbelow is the (?:circuit|diagram|graph|plot)\b/i,
    /\bshown in diagram\b/i,
    /\bfollowing circuit diagram\b/i,
    /\bconsider the given circuit\b/i,
    /\bthe network shown in\b/i,
    /\bthe arrangement shown in\b/i,
    /\bthe setup shown in\b/i
  ];

  for (const pattern of diagramPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        type: "POTENTIAL_MISSING_DIAGRAM",
        location: qid,
        cue: match[0],
        snippet: text.slice(Math.max(0, match.index - 30), match.index + 80)
      };
    }
  }

  return null;
}

async function inspectPaper(paperCode) {
  const paperIssues = [];
  const questions = [];
  let imageCount = 0;

  for (const subject of SUBJECTS) {
    const filename = path.join(TRANSCRIBED, `${paperCode}_${subject.toLowerCase()}.json`);
    try {
      const rows = JSON.parse(await fs.readFile(filename, "utf8"));
      if (rows.length !== 30) {
        paperIssues.push({
          type: "SUBJECT_COUNT_MISMATCH",
          location: `${paperCode} ${subject}`,
          error: `Expected 30 questions, found ${rows.length}`
        });
      }
      questions.push(...rows);
    } catch (e) {
      paperIssues.push({
        type: "FILE_READ_ERROR",
        location: `${paperCode} ${subject}`,
        error: e.message
      });
    }
  }

  questions.sort((a, b) => a.question_number - b.question_number);

  if (questions.length !== 90) {
    paperIssues.push({
      type: "TOTAL_COUNT_MISMATCH",
      location: paperCode,
      error: `Expected 90 questions, found ${questions.length}`
    });
  }

  for (const q of questions) {
    const qid = `${paperCode} Q${q.question_number} [${q.subject}]`;

    // 1. Check math in question text
    paperIssues.push(...auditMath(q.question, `${qid} -> question`));

    // 2. Check options math
    if (q.option_a) paperIssues.push(...auditMath(q.option_a, `${qid} -> option_a`));
    if (q.option_b) paperIssues.push(...auditMath(q.option_b, `${qid} -> option_b`));
    if (q.option_c) paperIssues.push(...auditMath(q.option_c, `${qid} -> option_c`));
    if (q.option_d) paperIssues.push(...auditMath(q.option_d, `${qid} -> option_d`));

    // 3. Option completeness for MCQ
    const isNumerical = q.question_number % 30 > 20 || q.question_number % 30 === 0;

    if (!isNumerical) {
      if (q.question_type !== "MCQ") {
        paperIssues.push({ type: "TYPE_MISMATCH", location: qid, error: `Expected MCQ, got ${q.question_type}` });
      }

      // Check for leftover prefixes in options: (1), (A), (a), Option A
      for (const optKey of ["option_a", "option_b", "option_c", "option_d"]) {
        const val = q[optKey];
        const img = q[`${optKey}_image`];
        if (!val && !img) {
          paperIssues.push({ type: "EMPTY_OPTION", location: qid, error: `Missing ${optKey} (no text and no image)` });
        }
        if (typeof val === "string" && /^\s*(?:\([1-4A-Da-d]\)|[1-4A-Da-d]\.|\bOption\s*[A-Da-d]\b)\s+/i.test(val)) {
          paperIssues.push({
            type: "LEFTOVER_OPTION_PREFIX",
            location: `${qid} -> ${optKey}`,
            error: `Leftover option index prefix in: "${val.slice(0, 30)}"`
          });
        }
      }

      // Check correct option
      const corr = String(q.correct_option || "").toLowerCase().trim();
      if (!["a", "b", "c", "d", "none"].includes(corr)) {
        paperIssues.push({
          type: "INVALID_MCQ_ANSWER",
          location: qid,
          error: `Invalid MCQ correct_option: "${q.correct_option}"`
        });
      }
    } else {
      if (q.question_type !== "NUMERICAL") {
        paperIssues.push({ type: "TYPE_MISMATCH", location: qid, error: `Expected NUMERICAL, got ${q.question_type}` });
      }
      // Numerical options should be empty
      for (const optKey of ["option_a", "option_b", "option_c", "option_d"]) {
        if (q[optKey]) {
          paperIssues.push({
            type: "NUMERICAL_WITH_OPTIONS",
            location: `${qid} -> ${optKey}`,
            error: `Numerical question has option text: "${String(q[optKey]).slice(0, 30)}"`
          });
        }
      }
      // Check numerical answer
      const corr = String(q.correct_option || "").trim();
      if (!corr) {
        paperIssues.push({ type: "EMPTY_ANSWER", location: qid, error: "Empty numerical correct_option" });
      } else if (corr.toLowerCase() !== "none" && !Number.isFinite(Number(corr))) {
        paperIssues.push({
          type: "INVALID_NUMERICAL_ANSWER",
          location: qid,
          error: `Non-finite numerical answer: "${corr}"`
        });
      }
    }

    // 4. Verify images
    for (const imgField of ["question_image", "option_a_image", "option_b_image", "option_c_image", "option_d_image"]) {
      if (q[imgField]) {
        imageCount++;
        const imgErr = await verifyImageFile(q[imgField], `${qid} -> ${imgField}`);
        if (imgErr) paperIssues.push(imgErr);
      }
    }

    // 5. Diagram cue check
    const diagramCue = checkDiagramCue(q, qid);
    if (diagramCue) {
      paperIssues.push(diagramCue);
    }

    // 6. Chapter check
    if (!q.chapter || /^(general|unmapped)$/i.test(q.chapter.trim())) {
      paperIssues.push({
        type: "UNMAPPED_CHAPTER",
        location: qid,
        error: `Unmapped or generic chapter: "${q.chapter}"`
      });
    }
  }

  return {
    paperCode,
    questionsCount: questions.length,
    imageCount,
    issues: paperIssues
  };
}

async function main() {
  console.log("==========================================================================");
  console.log("   DEEP INSPECTION OF ALL JEE MAIN 2022 PYQS (ALL SESSIONS & BOTH SHIFTS)  ");
  console.log("==========================================================================\n");

  const results = [];
  let totalQuestions = 0;
  let totalImages = 0;
  let allIssues = [];

  for (const paperCode of PAPERS) {
    const res = await inspectPaper(paperCode);
    results.push(res);
    totalQuestions += res.questionsCount;
    totalImages += res.imageCount;
    allIssues.push(...res.issues);
  }

  console.log(`Inspected Papers: ${PAPERS.length}`);
  console.log(`Total Questions: ${totalQuestions} / 2160`);
  console.log(`Total Images:    ${totalImages}`);
  console.log(`Total Issues:    ${allIssues.length}\n`);

  // Group issues by type
  const grouped = {};
  for (const iss of allIssues) {
    grouped[iss.type] = (grouped[iss.type] || []);
    grouped[iss.type].push(iss);
  }

  console.log("Issue Summary by Type:");
  for (const [type, list] of Object.entries(grouped)) {
    console.log(`  - ${type}: ${list.length}`);
  }
  console.log("");

  // Print details for each issue type
  for (const [type, list] of Object.entries(grouped)) {
    console.log(`--------------------------------------------------------------------------`);
    console.log(`Details for: ${type} (${list.length} occurrences)`);
    console.log(`--------------------------------------------------------------------------`);
    list.slice(0, 20).forEach((item, i) => {
      console.log(`[${i+1}] ${item.location}`);
      if (item.error) console.log(`    Error:   ${item.error}`);
      if (item.cue) console.log(`    Cue:     "${item.cue}"`);
      if (item.snippet) console.log(`    Snippet: "${item.snippet}"`);
    });
    if (list.length > 20) {
      console.log(`    ... and ${list.length - 20} more`);
    }
    console.log("");
  }

  // Save full report to file
  const reportPath = path.join(ROOT, "scratch", "jee2022", "reports", "deep-inspection-report.json");
  await fs.writeFile(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalPapers: PAPERS.length,
    totalQuestions,
    totalImages,
    totalIssues: allIssues.length,
    summaryByType: Object.fromEntries(Object.entries(grouped).map(([k, v]) => [k, v.length])),
    issues: allIssues,
    paperSummaries: results.map(r => ({
      paper: r.paperCode,
      questions: r.questionsCount,
      images: r.imageCount,
      issuesCount: r.issues.length
    }))
  }, null, 2));

  console.log(`Full report saved to: ${reportPath}`);
}

main().catch(err => {
  console.error("Inspection error:", err);
  process.exit(1);
});
