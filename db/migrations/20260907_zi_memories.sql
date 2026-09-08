CREATE TABLE IF NOT EXISTS zi_memories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id text NOT NULL,
  memory_type text NOT NULL CHECK (
    memory_type IN (
      'concept_confusion',
      'study_priority',
      'temporary_goal',
      'exam_deadline',
      'subject_preference',
      'learning_note'
    )
  ),
  memory_key text NOT NULL,
  memory_text text NOT NULL CHECK (char_length(memory_text) BETWEEN 1 AND 300),
  subject text,
  chapter text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(clerk_user_id, memory_key)
);

CREATE INDEX IF NOT EXISTS zi_memories_user_active_idx
  ON zi_memories (clerk_user_id, expires_at);

ALTER TABLE zi_memories ENABLE ROW LEVEL SECURITY;

-- Zi memories are accessed only through trusted Next.js API routes using
-- Clerk auth and supabaseAdmin. With RLS enabled and no browser policies,
-- normal client-side Supabase access cannot read or write this table.
