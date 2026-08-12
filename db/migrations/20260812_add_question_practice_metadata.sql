alter table public.questions
  add column if not exists source_type text not null default 'LEGACY',
  add column if not exists status text not null default 'PUBLISHED';

create index if not exists questions_practice_lookup_idx
  on public.questions (exam, subject, chapter, source_type, status, is_active);

comment on column public.questions.source_type is
  'Question bank origin, for example PREPZII_PRACTICE or LEGACY.';

comment on column public.questions.status is
  'Publication state used by admin review and student-facing practice selection.';
