-- Battle Arena V2: Elo Ratings, Monthly Seasons, Leaderboards, Champions, and Live Feed

-- 1. Extend battle_stats with Elo rating, streaks, and tier stats
alter table public.battle_stats 
  add column if not exists arena_rating integer not null default 1000,
  add column if not exists peak_rating integer not null default 1000,
  add column if not exists win_streak integer not null default 0,
  add column if not exists best_streak integer not null default 0;

-- 2. Extend battle_players to store match-level rating delta
alter table public.battle_players
  add column if not exists rating_before integer,
  add column if not exists rating_after integer,
  add column if not exists rating_change integer default 0;

-- 3. Monthly Seasons Table
create table if not exists public.battle_seasons (
  id text primary key, -- e.g. '2026-09'
  name text not null, -- e.g. 'September 2026 Season'
  started_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  champion_user_id text references public.user_profiles(clerk_user_id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists battle_seasons_active_idx
  on public.battle_seasons(is_active, ends_at desc);

-- 4. Per-Season User Stats Table (Preserves historical stats across months)
create table if not exists public.battle_season_stats (
  id uuid primary key default gen_random_uuid(),
  season_id text not null references public.battle_seasons(id) on delete cascade,
  user_id text not null references public.user_profiles(clerk_user_id) on delete cascade,
  arena_rating integer not null default 1000,
  peak_rating integer not null default 1000,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  win_streak integer not null default 0,
  best_streak integer not null default 0,
  total_battles integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (season_id, user_id)
);

create index if not exists battle_season_stats_season_rating_idx
  on public.battle_season_stats(season_id, arena_rating desc, wins desc);

create index if not exists battle_season_stats_user_idx
  on public.battle_season_stats(user_id);

-- 5. Monthly Season Awards / Badges (Champions, Top 3, Top 10)
create table if not exists public.battle_season_awards (
  id uuid primary key default gen_random_uuid(),
  season_id text not null references public.battle_seasons(id) on delete cascade,
  user_id text not null references public.user_profiles(clerk_user_id) on delete cascade,
  rank integer not null check (rank >= 1),
  badge_name text not null, -- e.g. 'Sep ''26 Arena Champion'
  badge_key text not null,  -- e.g. 'arena_champ_2026_09'
  arena_rating integer not null,
  wins integer not null,
  celebration_seen boolean not null default false,
  awarded_at timestamptz not null default now(),
  unique (season_id, user_id)
);

create index if not exists battle_season_awards_user_idx
  on public.battle_season_awards(user_id, celebration_seen);

-- 6. Live Arena Events Feed
create table if not exists public.battle_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('match_finish', 'streak', 'tier_up', 'champion')),
  user_id text references public.user_profiles(clerk_user_id) on delete set null,
  opponent_id text references public.user_profiles(clerk_user_id) on delete set null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists battle_events_created_at_idx
  on public.battle_events(created_at desc);

-- 7. Row Level Security Policies
alter table public.battle_seasons enable row level security;
alter table public.battle_season_stats enable row level security;
alter table public.battle_season_awards enable row level security;
alter table public.battle_events enable row level security;

-- Public read for seasons
drop policy if exists "Battle seasons public read" on public.battle_seasons;
create policy "Battle seasons public read"
  on public.battle_seasons
  for select
  using (true);

-- Public read for seasonal stats/leaderboard
drop policy if exists "Battle season stats public read" on public.battle_season_stats;
create policy "Battle season stats public read"
  on public.battle_season_stats
  for select
  using (true);

-- Public read for awards, update celebration_seen by owner
drop policy if exists "Battle season awards public read" on public.battle_season_awards;
create policy "Battle season awards public read"
  on public.battle_season_awards
  for select
  using (true);

drop policy if exists "Battle season awards owner update" on public.battle_season_awards;
create policy "Battle season awards owner update"
  on public.battle_season_awards
  for update
  using (user_id = (auth.jwt() ->> 'sub'))
  with check (user_id = (auth.jwt() ->> 'sub'));

-- Public read for live arena feed
drop policy if exists "Battle events public read" on public.battle_events;
create policy "Battle events public read"
  on public.battle_events
  for select
  using (true);
