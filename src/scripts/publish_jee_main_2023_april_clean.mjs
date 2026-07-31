import fs from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

process.loadEnvFile('.env.local');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const code = process.argv[2];
const match = code?.match(/^JEE-MAIN-23-(\d\d)APR-S([12])$/);
if (!match) throw new Error('Expected a JEE Main 2023 April paper code.');

const [, day, shift] = match;
const manifestPath = `tmp/jee-main-2023-april-clean/${code}/manifest.json`;
const questions = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
if (questions.length !== 90) throw new Error(`${code}: expected 90 questions, found ${questions.length}.`);

const exam = {
  exam: 'JEE',
  exam_type: 'JEE Main',
  year: 2023,
  attempt: `${Number(day)} Apr`,
  shift: `Shift ${shift}`,
  paper_code: code,
  exam_date: `2023-04-${day}`,
  duration_minutes: 180,
  total_marks: 300,
  status: 'PUBLISHED',
  is_published: true,
};

let { data: existingExam, error: examLookupError } = await supabase
  .from('pyq_exams')
  .select('id')
  .eq('paper_code', code)
  .maybeSingle();
if (examLookupError) throw examLookupError;

if (!existingExam) {
  const { data, error } = await supabase.from('pyq_exams').insert(exam).select('id').single();
  if (error) throw error;
  existingExam = data;
} else {
  const { error } = await supabase.from('pyq_exams').update(exam).eq('id', existingExam.id);
  if (error) throw error;
}

for (const item of questions) {
  const number = item.number;
  const numerical = number % 30 > 20 || number % 30 === 0;
  const storagePath = `jee-main-2023-april-clean/${code}/q${String(number).padStart(2, '0')}.png`;
  const { error: uploadError } = await supabase.storage
    .from('pyq-images')
    .upload(storagePath, await fs.readFile(item.image_path), { contentType: 'image/png', upsert: true });
  if (uploadError) throw uploadError;

  const answer = String(item.answer);
  const optionAnswer = ['1', '2', '3', '4'].includes(answer) ? answer : '1';
  const payload = {
    exam_id: existingExam.id,
    exam: exam.exam,
    exam_type: exam.exam_type,
    year: 2023,
    attempt: exam.attempt,
    shift: exam.shift,
    paper_code: code,
    question_number: number,
    display_order: number,
    subject: item.subject,
    chapter: 'Unmapped',
    question_type: numerical ? 'NUMERICAL' : 'MCQ',
    question: `Question ${number}: Refer to the source image.`,
    // The legacy PYQ schema requires non-null option fields for every question.
    // The UI ignores these for numerical questions and renders its numerical input.
    option_a: numerical ? 'Not applicable' : 'Option 1',
    option_b: numerical ? 'Not applicable' : 'Option 2',
    option_c: numerical ? 'Not applicable' : 'Option 3',
    option_d: numerical ? 'Not applicable' : 'Option 4',
    correct_option: numerical ? 'a' : 'abcd'[Number(optionAnswer) - 1],
    numerical_answer: numerical ? answer : null,
    explanation: numerical ? `Source solution answer: ${answer}.` : `Source solution answer: option ${answer}.`,
    question_image: supabase.storage.from('pyq-images').getPublicUrl(storagePath).data.publicUrl,
    status: 'PUBLISHED',
    marks_positive: 4,
    marks_negative: numerical ? 0 : 1,
  };
  const { data: existingQuestion, error: questionLookupError } = await supabase
    .from('pyq_questions')
    .select('id')
    .eq('exam_id', existingExam.id)
    .eq('question_number', number)
    .maybeSingle();
  if (questionLookupError) throw questionLookupError;
  const { error } = existingQuestion
    ? await supabase.from('pyq_questions').update(payload).eq('id', existingQuestion.id)
    : await supabase.from('pyq_questions').insert(payload);
  if (error) throw error;
}

console.log(`${code}: published 90 questions`);
