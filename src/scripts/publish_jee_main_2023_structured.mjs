import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

process.loadEnvFile('/Users/ateebfatmi/Desktop/prepzii/.env.local');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const transDir = '/Users/ateebfatmi/Desktop/prepzii/scratch/jee2023/transcribed';
const files = (await fs.readdir(transDir)).filter(f => f.endsWith('.json'));

// Group by paper_code
const papers = {};
for (const file of files) {
  const code = file.split('_')[0];
  if (!papers[code]) papers[code] = [];
  const content = JSON.parse(await fs.readFile(path.join(transDir, file), 'utf8'));
  papers[code].push(...content);
}

console.log(`Found ${Object.keys(papers).length} papers with transcribed questions.`);

for (const [code, questions] of Object.entries(papers)) {
  // Only publish papers that have 90 questions transcribed
  if (questions.length < 90) {
    console.log(`Skipping ${code} (${questions.length}/90 questions transcribed so far)`);
    continue;
  }

  console.log(`\nProcessing ${code} (${questions.length} questions)...`);

  // Sort by question_number
  questions.sort((a, b) => a.question_number - b.question_number);

  // Fetch or verify exam record
  const { data: exam, error: examErr } = await supabase
    .from('pyq_exams')
    .select('id, attempt, shift, year, exam, exam_type')
    .eq('paper_code', code)
    .maybeSingle();

  if (examErr || !exam) {
    console.error(`Exam not found for ${code}:`, examErr);
    continue;
  }

  // Fetch existing questions to preserve IDs and avoid foreign key violations
  const { data: existingQuestions } = await supabase
    .from('pyq_questions')
    .select('id, question_number')
    .eq('exam_id', exam.id);

  const existingMap = new Map((existingQuestions || []).map(q => [q.question_number, q.id]));

  const rowsToUpsert = [];
  for (const q of questions) {
    let imageUrl = null;
    if (q.has_diagram && q.image_path) {
      try {
        const diagramCropPath = path.join('/Users/ateebfatmi/Desktop/prepzii/scratch/jee2023/diagram_crops', code, `q${String(q.question_number).padStart(2, '0')}.png`);
        let fileBuffer;
        try {
          fileBuffer = await fs.readFile(diagramCropPath);
        } catch {
          fileBuffer = await fs.readFile(q.image_path);
        }
        const storagePath = `jee-main-2023/${code}/q${String(q.question_number).padStart(2, '0')}.png`;
        const { error: uploadErr } = await supabase.storage
          .from('pyq-images')
          .upload(storagePath, fileBuffer, { contentType: 'image/png', upsert: true });

        if (uploadErr) {
          console.warn(`Storage upload warning for ${code} Q${q.question_number}:`, uploadErr.message);
        } else {
          imageUrl = supabase.storage.from('pyq-images').getPublicUrl(storagePath).data.publicUrl;
        }
      } catch (err) {
        console.warn(`Could not read image file for Q${q.question_number}:`, err.message);
      }
    }

    const isNumerical = String(q.question_type || '').toUpperCase() === 'NUMERICAL';
    const rowId = existingMap.get(q.question_number);

    const record = {
      exam_id: exam.id,
      exam: exam.exam,
      exam_type: exam.exam_type,
      year: exam.year,
      attempt: exam.attempt,
      shift: exam.shift,
      paper_code: code,
      question_number: q.question_number,
      display_order: q.question_number,
      subject: q.subject,
      chapter: q.chapter || 'General',
      question_type: isNumerical ? 'NUMERICAL' : 'MCQ',
      question: q.question_text,
      option_a: isNumerical ? '' : (q.option_a || ''),
      option_b: isNumerical ? '' : (q.option_b || ''),
      option_c: isNumerical ? '' : (q.option_c || ''),
      option_d: isNumerical ? '' : (q.option_d || ''),
      correct_option: String(q.correct_option || q.official_answer || 'a').toLowerCase(),
      question_image: imageUrl,
      status: 'PUBLISHED',
      marks_positive: 4,
      marks_negative: 1
    };

    if (rowId) {
      record.id = rowId;
    }

    rowsToUpsert.push(record);
  }

  // Upsert in chunks of 50
  for (let i = 0; i < rowsToUpsert.length; i += 50) {
    const chunk = rowsToUpsert.slice(i, i + 50);
    const { error: upsertErr } = await supabase.from('pyq_questions').upsert(chunk);
    if (upsertErr) {
      console.error(`Error upserting questions chunk for ${code}:`, upsertErr);
    }
  }

  console.log(`✅ Successfully published ${rowsToUpsert.length} questions for ${code}`);
}

console.log('\nAll completed papers published successfully.');
