-- Add 'attempt' column to support JEE sessions and attempts
ALTER TABLE pyq_exams ADD COLUMN IF NOT EXISTS attempt TEXT;

-- For backward compatibility, backfill 'attempt' from existing 'exam_date' where appropriate
UPDATE pyq_exams SET attempt = exam_date::TEXT WHERE attempt IS NULL AND exam_date IS NOT NULL AND exam_type != 'UG';
