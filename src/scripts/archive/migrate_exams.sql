-- 1. Create the `pyq_exams` table
CREATE TABLE IF NOT EXISTS pyq_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam TEXT NOT NULL,
    year INTEGER NOT NULL,
    exam_type TEXT NOT NULL,
    exam_date DATE,
    shift TEXT,
    paper_code TEXT,
    duration INTEGER DEFAULT 180,
    total_marks INTEGER DEFAULT 300,
    instructions TEXT,
    status TEXT DEFAULT 'PUBLISHED',
    question_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add `exam_id` to `pyq_questions`
ALTER TABLE pyq_questions
ADD COLUMN IF NOT EXISTS exam_id UUID REFERENCES pyq_exams(id) ON DELETE CASCADE;

-- 3. Data Migration: Create exams from existing unique metadata in pyq_questions
INSERT INTO pyq_exams (exam, year, exam_type, shift, paper_code, question_count)
SELECT 
    exam, 
    year, 
    exam_type, 
    shift, 
    paper_code,
    COUNT(*) as question_count
FROM pyq_questions
GROUP BY exam, year, exam_type, shift, paper_code;

-- 4. Update existing pyq_questions to link to the newly created pyq_exams
UPDATE pyq_questions q
SET exam_id = e.id
FROM pyq_exams e
WHERE q.exam = e.exam 
  AND q.year = e.year 
  AND q.exam_type = e.exam_type 
  AND (q.shift = e.shift OR (q.shift IS NULL AND e.shift IS NULL))
  AND (q.paper_code = e.paper_code OR (q.paper_code IS NULL AND e.paper_code IS NULL))
  AND q.exam_id IS NULL;

-- 5. Add an index to improve lookup performance by exam_id
CREATE INDEX IF NOT EXISTS idx_pyq_questions_exam_id ON pyq_questions(exam_id);
