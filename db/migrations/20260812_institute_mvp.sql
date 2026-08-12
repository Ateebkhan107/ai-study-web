create table if not exists public.institutes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  owner_user_id text not null,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now()
);

create table if not exists public.institute_members (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references public.institutes(id) on delete cascade,
  user_id text,
  email text not null,
  role text not null default 'STUDENT',
  status text not null default 'PENDING',
  created_at timestamptz not null default now(),
  unique (institute_id, email)
);

create table if not exists public.institute_batches (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references public.institutes(id) on delete cascade,
  name text not null,
  exam text not null,
  target_year integer,
  created_at timestamptz not null default now()
);

create table if not exists public.institute_batch_members (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references public.institutes(id) on delete cascade,
  batch_id uuid not null references public.institute_batches(id) on delete cascade,
  member_id uuid not null references public.institute_members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (batch_id, member_id)
);

create table if not exists public.institute_tests (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references public.institutes(id) on delete cascade,
  title text not null,
  exam text not null,
  subject text not null,
  chapters text[] not null default '{}',
  difficulty text not null default 'mixed',
  duration_minutes integer not null default 30,
  total_questions integer not null default 0,
  status text not null default 'DRAFT',
  created_by text not null,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.institute_test_questions (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references public.institutes(id) on delete cascade,
  institute_test_id uuid not null references public.institute_tests(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  question_order integer not null,
  created_at timestamptz not null default now(),
  unique (institute_test_id, question_id)
);

create table if not exists public.institute_test_assignments (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references public.institutes(id) on delete cascade,
  institute_test_id uuid not null references public.institute_tests(id) on delete cascade,
  batch_id uuid not null references public.institute_batches(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (institute_test_id, batch_id)
);

create table if not exists public.institute_test_attempts (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references public.institutes(id) on delete cascade,
  institute_test_id uuid not null references public.institute_tests(id) on delete cascade,
  user_id text not null,
  session_id uuid references public.test_sessions(id) on delete set null,
  attempt_id uuid references public.test_attempts(id) on delete set null,
  status text not null default 'IN_PROGRESS',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  unique (institute_test_id, session_id)
);

create index if not exists institutes_owner_idx on public.institutes(owner_user_id);
create index if not exists institute_members_user_idx on public.institute_members(user_id);
create index if not exists institute_members_email_idx on public.institute_members(lower(email));
create index if not exists institute_batches_institute_idx on public.institute_batches(institute_id);
create index if not exists institute_batch_members_member_idx on public.institute_batch_members(member_id);
create index if not exists institute_tests_institute_idx on public.institute_tests(institute_id);
create index if not exists institute_test_assignments_batch_idx on public.institute_test_assignments(batch_id);
create index if not exists institute_test_attempts_test_idx on public.institute_test_attempts(institute_test_id);
create index if not exists institute_test_attempts_user_idx on public.institute_test_attempts(user_id);

alter table public.institutes enable row level security;
alter table public.institute_members enable row level security;
alter table public.institute_batches enable row level security;
alter table public.institute_batch_members enable row level security;
alter table public.institute_tests enable row level security;
alter table public.institute_test_questions enable row level security;
alter table public.institute_test_assignments enable row level security;
alter table public.institute_test_attempts enable row level security;

comment on table public.institutes is 'PrepZii institute/coaching workspaces. Access is enforced in server routes using Clerk user IDs.';
comment on table public.institute_tests is 'Institute-authored tests that reference existing PrepZii questions through institute_test_questions.';
