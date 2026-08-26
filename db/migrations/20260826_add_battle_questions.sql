-- Dedicated short-form question bank for real-time Battle Arena matches.
-- This table is intentionally separate from normal Test/PYQ question pools.

create table if not exists public.battle_questions (
  id uuid primary key default gen_random_uuid(),
  exam text not null check (exam in ('JEE', 'NEET')),
  subject text not null,
  chapter text,
  question_text text not null,
  options jsonb not null,
  correct_answer text not null,
  difficulty text not null default 'Easy' check (difficulty in ('Easy', 'Medium')),
  expected_time_seconds integer not null default 30 check (expected_time_seconds between 10 and 90),
  explanation text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint battle_questions_options_array_check check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  constraint battle_questions_correct_answer_check check (upper(correct_answer) in ('A', 'B', 'C', 'D'))
);

create index if not exists battle_questions_exam_active_idx
  on public.battle_questions(exam, is_active, created_at desc);

create index if not exists battle_questions_subject_chapter_idx
  on public.battle_questions(subject, chapter);

alter table public.battle_questions enable row level security;

drop policy if exists "Battle questions are not client readable" on public.battle_questions;
create policy "Battle questions are not client readable"
  on public.battle_questions
  for select
  using (false);
