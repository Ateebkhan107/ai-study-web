import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

process.loadEnvFile('.env.local');

const apply = process.argv.includes('--apply');
const root = process.cwd();
const sourceDir = path.join(root, 'scratch', 'jee2023', 'transcribed');
const diagramDir = path.join(root, 'scratch', 'jee2023', 'diagram_crops');
const reportPath = path.join(root, 'tmp', 'jee-main-2023-january-quality-repair-report.json');
const paperPattern = /^JEE-MAIN-23-(?:24|25|29|30|31)JAN-S[12]$|^JEE-MAIN-23-01FEB-S[12]$/;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const files = (await fs.readdir(sourceDir)).filter((file) => file.endsWith('.json'));
const sourceByPaper = new Map();

for (const file of files) {
  const questions = JSON.parse(await fs.readFile(path.join(sourceDir, file), 'utf8'));
  for (const question of questions) {
    if (!paperPattern.test(question.paper_code)) continue;
    const paper = sourceByPaper.get(question.paper_code) ?? [];
    paper.push(question);
    sourceByPaper.set(question.paper_code, paper);
  }
}

const report = {
  mode: apply ? 'apply' : 'dry-run',
  generated_at: new Date().toISOString(),
  scope: [...sourceByPaper.keys()].sort(),
  option_repairs: [],
  image_repairs: [],
  explanations_cleared: [],
  answer_keys_changed: [],
  errors: [],
};

for (const [paperCode, sourceQuestions] of [...sourceByPaper.entries()].sort()) {
  const { data: exam, error: examError } = await supabase
    .from('pyq_exams')
    .select('id')
    .eq('paper_code', paperCode)
    .single();

  if (examError) {
    report.errors.push({ paper_code: paperCode, error: examError.message });
    continue;
  }

  const { data: liveQuestions, error: questionsError } = await supabase
    .from('pyq_questions')
    .select('id, question_number, question_type, option_a, option_b, option_c, option_d, correct_option, question_image, explanation')
    .eq('exam_id', exam.id)
    .order('question_number');

  if (questionsError) {
    report.errors.push({ paper_code: paperCode, error: questionsError.message });
    continue;
  }

  const liveByNumber = new Map(liveQuestions.map((question) => [question.question_number, question]));

  for (const source of sourceQuestions) {
    const live = liveByNumber.get(source.question_number);
    if (!live) {
      report.errors.push({ paper_code: paperCode, question_number: source.question_number, error: 'Live question missing' });
      continue;
    }

    const update = {};
    const optionFields = ['option_a', 'option_b', 'option_c', 'option_d'];
    if (String(live.question_type).toUpperCase() === 'MCQ') {
      const repairedFields = [];
      for (const field of optionFields) {
        if (!String(live[field] ?? '').trim() && String(source[field] ?? '').trim()) {
          update[field] = source[field];
          repairedFields.push(field);
        }
      }
      if (repairedFields.length) {
        report.option_repairs.push({
          paper_code: paperCode,
          question_number: source.question_number,
          fields: repairedFields,
        });
      }
    }

    if (source.has_diagram && !String(live.question_image ?? '').trim()) {
      const number = String(source.question_number).padStart(2, '0');
      const preferredPath = path.join(diagramDir, paperCode, `q${number}.png`);
      let imagePath = preferredPath;
      try {
        await fs.access(imagePath);
      } catch {
        imagePath = source.image_path;
      }

      if (!imagePath) {
        report.errors.push({ paper_code: paperCode, question_number: source.question_number, error: 'No source image path' });
      } else {
        const objectPath = `jee-main-2023/${paperCode}/q${number}.png`;
        report.image_repairs.push({
          paper_code: paperCode,
          question_number: source.question_number,
          source_path: imagePath,
          object_path: objectPath,
        });

        if (apply) {
          const image = await fs.readFile(imagePath);
          const { error: uploadError } = await supabase.storage
            .from('pyq-images')
            .upload(objectPath, image, { contentType: 'image/png', upsert: true });
          if (uploadError) throw uploadError;
          update.question_image = supabase.storage.from('pyq-images').getPublicUrl(objectPath).data.publicUrl;
        }
      }
    }

    if (/^Source solution answer:/i.test(String(live.explanation ?? '').trim())) {
      update.explanation = null;
      report.explanations_cleared.push({ paper_code: paperCode, question_number: source.question_number });
    }

    if (apply && Object.keys(update).length) {
      const { error: updateError } = await supabase
        .from('pyq_questions')
        .update(update)
        .eq('id', live.id);
      if (updateError) throw updateError;
    }
  }
}

if (apply) {
  for (const paperCode of report.scope) {
    const { data: exam, error: examError } = await supabase
      .from('pyq_exams')
      .select('id')
      .eq('paper_code', paperCode)
      .single();
    if (examError) throw examError;

    const { data: after, error: afterError } = await supabase
      .from('pyq_questions')
      .select('question_number, correct_option')
      .eq('exam_id', exam.id);
    if (afterError) throw afterError;

    const sourceMap = new Map(sourceByPaper.get(paperCode).map((question) => [
      question.question_number,
      String(question.correct_option ?? question.official_answer ?? '').toLowerCase(),
    ]));

    for (const question of after) {
      const expected = sourceMap.get(question.question_number);
      const actual = String(question.correct_option ?? '').toLowerCase();
      if (expected !== actual) {
        report.answer_keys_changed.push({
          paper_code: paperCode,
          question_number: question.question_number,
          expected,
          actual,
        });
      }
    }
  }
}

await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
  mode: report.mode,
  papers: report.scope.length,
  option_repairs: report.option_repairs.length,
  image_repairs: report.image_repairs.length,
  explanations_cleared: report.explanations_cleared.length,
  answer_key_mismatches: report.answer_keys_changed.length,
  errors: report.errors.length,
  report: reportPath,
}, null, 2));

if (report.errors.length || report.answer_keys_changed.length) process.exitCode = 1;
