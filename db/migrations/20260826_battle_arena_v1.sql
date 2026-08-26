-- Battle Arena V1
-- Stores server-created 1v1 battles, answer state, challenges, queue, and stats.

create table if not exists public.battle_queue (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.user_profiles(clerk_user_id) on delete cascade,
  exam text not null check (exam in ('JEE', 'NEET')),
  joined_at timestamptz not null default now()
);

create unique index if not exists battle_queue_user_id_unique
  on public.battle_queue(user_id);

create index if not exists battle_queue_exam_joined_at_idx
  on public.battle_queue(exam, joined_at);

create table if not exists public.battle_matches (
  id uuid primary key default gen_random_uuid(),
  exam text not null check (exam in ('JEE', 'NEET')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'FINISHED', 'CANCELLED')),
  question_ids text[] not null default '{}',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  winner_user_id text references public.user_profiles(clerk_user_id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists battle_matches_status_created_at_idx
  on public.battle_matches(status, created_at desc);

create table if not exists public.battle_players (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battle_matches(id) on delete cascade,
  user_id text not null references public.user_profiles(clerk_user_id) on delete cascade,
  score integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  skipped_count integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (battle_id, user_id)
);

create index if not exists battle_players_user_id_created_at_idx
  on public.battle_players(user_id, created_at desc);

create table if not exists public.battle_answers (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battle_matches(id) on delete cascade,
  user_id text not null references public.user_profiles(clerk_user_id) on delete cascade,
  question_id text not null,
  selected_answer jsonb,
  is_correct boolean,
  answered_at timestamptz not null default now(),
  unique (battle_id, user_id, question_id)
);

create index if not exists battle_answers_battle_user_idx
  on public.battle_answers(battle_id, user_id);

create table if not exists public.battle_challenges (
  id uuid primary key default gen_random_uuid(),
  challenger_id text not null references public.user_profiles(clerk_user_id) on delete cascade,
  challenged_id text not null references public.user_profiles(clerk_user_id) on delete cascade,
  status text not null default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')),
  battle_id uuid references public.battle_matches(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  created_at timestamptz not null default now(),
  check (challenger_id <> challenged_id)
);

create unique index if not exists battle_challenges_pending_unique
  on public.battle_challenges(challenger_id, challenged_id)
  where status = 'PENDING';

create index if not exists battle_challenges_participants_idx
  on public.battle_challenges(challenger_id, challenged_id, created_at desc);

create table if not exists public.battle_stats (
  user_id text primary key references public.user_profiles(clerk_user_id) on delete cascade,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  total_battles integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.battle_queue enable row level security;
alter table public.battle_matches enable row level security;
alter table public.battle_players enable row level security;
alter table public.battle_answers enable row level security;
alter table public.battle_challenges enable row level security;
alter table public.battle_stats enable row level security;

drop policy if exists "Battle queue own rows" on public.battle_queue;
create policy "Battle queue own rows"
  on public.battle_queue
  for all
  using (user_id = (auth.jwt() ->> 'sub'))
  with check (user_id = (auth.jwt() ->> 'sub'));

drop policy if exists "Battle matches visible to players" on public.battle_matches;
create policy "Battle matches visible to players"
  on public.battle_matches
  for select
  using (
    exists (
      select 1 from public.battle_players bp
      where bp.battle_id = battle_matches.id
        and bp.user_id = (auth.jwt() ->> 'sub')
    )
  );

drop policy if exists "Battle players visible to participants" on public.battle_players;
create policy "Battle players visible to participants"
  on public.battle_players
  for select
  using (
    exists (
      select 1 from public.battle_players own_bp
      where own_bp.battle_id = battle_players.battle_id
        and own_bp.user_id = (auth.jwt() ->> 'sub')
    )
  );

drop policy if exists "Battle answers own rows only" on public.battle_answers;
create policy "Battle answers own rows only"
  on public.battle_answers
  for select
  using (user_id = (auth.jwt() ->> 'sub'));

drop policy if exists "Battle challenges visible to participants" on public.battle_challenges;
create policy "Battle challenges visible to participants"
  on public.battle_challenges
  for select
  using (
    challenger_id = (auth.jwt() ->> 'sub')
    or challenged_id = (auth.jwt() ->> 'sub')
  );

drop policy if exists "Battle stats public read" on public.battle_stats;
create policy "Battle stats public read"
  on public.battle_stats
  for select
  using (true);
