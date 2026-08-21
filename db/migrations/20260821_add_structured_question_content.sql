alter table public.questions
  add column if not exists question_content jsonb,
  add column if not exists explanation_content jsonb;

alter table public.pyq_questions
  add column if not exists question_content jsonb,
  add column if not exists explanation_content jsonb;

comment on column public.questions.question_content is
  'Native structured question content blocks/options/media for PrepZii rendering. Legacy scalar fields remain fallback.';

comment on column public.questions.explanation_content is
  'Native structured explanation/solution content blocks for PrepZii rendering.';

comment on column public.pyq_questions.question_content is
  'Native structured PYQ content blocks/options/media for PrepZii rendering. Legacy scalar fields remain fallback.';

comment on column public.pyq_questions.explanation_content is
  'Native structured PYQ explanation/solution content blocks for PrepZii rendering.';
