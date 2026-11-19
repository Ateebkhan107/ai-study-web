begin;

alter table public.battle_queue
  add column if not exists last_seen_at timestamptz not null default now();

-- Queue, cancellation and challenge acceptance share the same match creation lock.
create or replace function public.battle_create_match(p_exam text, p_first text, p_second text, p_challenge_id uuid default null)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_match_id uuid;
  v_questions text[];
  v_challenge public.battle_challenges%rowtype;
begin
  perform pg_advisory_xact_lock(1973901, 1);

  if p_first = p_second or p_first is null or p_second is null then
    raise sqlstate 'PT400' using message = 'Battle requires two different players.';
  end if;

  if p_challenge_id is not null then
    select * into v_challenge from public.battle_challenges where id = p_challenge_id for update;
    if not found or v_challenge.challenger_id <> p_first or v_challenge.challenged_id <> p_second then
      raise sqlstate 'PT403' using message = 'You cannot accept this challenge.';
    end if;
    if v_challenge.status = 'ACCEPTED' and v_challenge.battle_id is not null then
      return v_challenge.battle_id;
    end if;
    if v_challenge.status <> 'PENDING' or v_challenge.expires_at <= clock_timestamp() then
      raise sqlstate 'PT409' using message = 'This challenge is no longer pending.';
    end if;
  end if;

  if (select count(*) from public.user_profiles
      where clerk_user_id in (p_first, p_second) and nullif(btrim(username), '') is not null
        and case when upper(exam) = 'NEET' then 'NEET' else 'JEE' end = p_exam) <> 2 then
    raise sqlstate 'PT409' using message = 'Both players need a username and the same exam track.';
  end if;

  if exists (
    select 1 from public.battle_players bp join public.battle_matches bm on bm.id = bp.battle_id
    where bp.user_id in (p_first, p_second) and bm.status = 'ACTIVE'
  ) then
    raise sqlstate 'PT409' using message = 'A player is already in an active battle.';
  end if;

  select array(
    select id::text from public.battle_questions
    where exam = p_exam and is_active
    order by random() limit 10
  ) into v_questions;

  if cardinality(v_questions) < 10 then
    raise sqlstate 'PT503' using message = 'Not enough active Battle Arena questions yet.';
  end if;

  insert into public.battle_matches (exam, question_ids)
  values (p_exam, v_questions) returning id into v_match_id;

  insert into public.battle_players (battle_id, user_id)
  values (v_match_id, p_first), (v_match_id, p_second);

  delete from public.battle_queue where user_id in (p_first, p_second);

  if p_challenge_id is not null then
    update public.battle_challenges set status = 'ACCEPTED', battle_id = v_match_id where id = p_challenge_id;
  end if;

  return v_match_id;
end;
$$;

create or replace function public.battle_manage_queue(p_user_id text, p_action text)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_match_id uuid;
  v_opponent text;
  v_exam text;
  v_queue public.battle_queue%rowtype;
begin
  if p_action not in ('join', 'poll', 'leave') then
    raise sqlstate 'PT400' using message = 'Invalid matchmaking action.';
  end if;

  perform pg_advisory_xact_lock(1973901, 1);

  select bm.id into v_match_id from public.battle_players bp
  join public.battle_matches bm on bm.id = bp.battle_id
  where bp.user_id = p_user_id and bm.status = 'ACTIVE'
  order by bm.created_at desc limit 1;

  if v_match_id is not null then
    select user_id into v_opponent from public.battle_players
    where battle_id = v_match_id and user_id <> p_user_id limit 1;
    return jsonb_build_object('status', 'matched', 'battleId', v_match_id, 'opponentId', v_opponent);
  end if;

  if p_action = 'leave' then
    delete from public.battle_queue where user_id = p_user_id;
    return jsonb_build_object('status', 'idle', 'ok', true);
  end if;

  select case when upper(exam) = 'NEET' then 'NEET' else 'JEE' end into v_exam
  from public.user_profiles where clerk_user_id = p_user_id and nullif(btrim(username), '') is not null;
  if not found then
    if p_action = 'join' then
      raise sqlstate 'PT428' using message = 'Choose a username before using Battle Arena.';
    end if;
    return jsonb_build_object('status', 'idle');
  end if;

  delete from public.battle_queue
  where user_id = p_user_id and (exam <> v_exam or last_seen_at < now() - interval '60 seconds');

  if p_action = 'join' then
    insert into public.battle_queue (user_id, exam) values (p_user_id, v_exam)
    on conflict (user_id) do update set last_seen_at = now()
    returning * into v_queue;
  else
    update public.battle_queue set last_seen_at = now() where user_id = p_user_id returning * into v_queue;
    if not found then
      return jsonb_build_object('status', 'idle');
    end if;
  end if;

  select q.user_id into v_opponent from public.battle_queue q
  join public.user_profiles p on p.clerk_user_id = q.user_id
  where q.exam = v_exam and q.user_id <> p_user_id and q.last_seen_at >= now() - interval '60 seconds'
    and nullif(btrim(p.username), '') is not null
    and case when upper(p.exam) = 'NEET' then 'NEET' else 'JEE' end = v_exam
    and not exists (
      select 1 from public.battle_players bp join public.battle_matches bm on bm.id = bp.battle_id
      where bp.user_id = q.user_id and bm.status = 'ACTIVE'
    )
  order by q.joined_at, q.id limit 1;

  if v_opponent is not null then
    v_match_id := public.battle_create_match(v_exam, v_opponent, p_user_id);
    return jsonb_build_object('status', 'matched', 'battleId', v_match_id, 'opponentId', v_opponent);
  end if;

  return jsonb_build_object('status', 'queued', 'queue',
    jsonb_build_object('id', v_queue.id, 'exam', v_queue.exam, 'joined_at', v_queue.joined_at));
end;
$$;

create or replace function public.battle_save_answer(p_battle_id uuid, p_user_id text, p_question_id text, p_answer text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_match public.battle_matches%rowtype;
  v_player public.battle_players%rowtype;
  v_correct text;
begin
  select * into v_match from public.battle_matches where id = p_battle_id for update;
  if not found then raise sqlstate 'PT404' using message = 'Battle not found.'; end if;

  select * into v_player from public.battle_players where battle_id = p_battle_id and user_id = p_user_id;
  if not found then raise sqlstate 'PT403' using message = 'You are not a player in this battle.'; end if;

  if v_match.status <> 'ACTIVE' or v_player.completed_at is not null then
    raise sqlstate 'PT409' using message = 'Your battle answers are already locked.';
  end if;
  if p_question_id is null or not (p_question_id = any(v_match.question_ids)) then
    raise sqlstate 'PT400' using message = 'Question is not part of this battle.';
  end if;
  if p_answer is not null and p_answer not in ('A', 'B', 'C', 'D') then
    raise sqlstate 'PT400' using message = 'Choose a valid answer.';
  end if;

  select upper(correct_answer) into v_correct from public.battle_questions where id = p_question_id::uuid;
  if not found then raise sqlstate 'PT404' using message = 'Question not found.'; end if;

  insert into public.battle_answers (battle_id, user_id, question_id, selected_answer, is_correct)
  values (p_battle_id, p_user_id, p_question_id, to_jsonb(p_answer), p_answer = v_correct)
  on conflict (battle_id, user_id, question_id) do update
  set selected_answer = excluded.selected_answer, is_correct = excluded.is_correct, answered_at = clock_timestamp();
end;
$$;

-- Answer writes and submission both lock the match. The second submission
-- publishes both scores and all Marks changes in the same transaction.
create or replace function public.battle_submit(p_battle_id uuid, p_user_id text)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_submitted_at timestamptz := date_trunc('milliseconds', clock_timestamp());
  v_match public.battle_matches%rowtype;
  v_player public.battle_players%rowtype;
  v_first public.battle_players%rowtype;
  v_second public.battle_players%rowtype;
  v_winner text;
  v_correct integer;
  v_wrong integer;
  v_before integer;
  v_opponent_marks integer;
  v_after integer;
  v_delta integer;
  v_won boolean;
  v_draw boolean;
  v_season_start timestamp := date_trunc('month', v_submitted_at at time zone 'UTC');
  v_season text := to_char(v_season_start, 'YYYY-MM');
begin
  select * into v_match from public.battle_matches where id = p_battle_id for update;
  if not found then raise sqlstate 'PT404' using message = 'Battle not found.'; end if;

  select * into v_player from public.battle_players where battle_id = p_battle_id and user_id = p_user_id;
  if not found then raise sqlstate 'PT403' using message = 'You are not a player in this battle.'; end if;
  if v_match.status <> 'ACTIVE' then return false; end if;

  if v_player.completed_at is null then
    select count(*) filter (where is_correct), count(*) filter (where not is_correct)
    into v_correct, v_wrong
    from public.battle_answers
    where battle_id = p_battle_id and user_id = p_user_id
      and question_id = any(v_match.question_ids) and selected_answer is not null and is_correct is not null;

    update public.battle_players set score = v_correct * 4 - v_wrong,
      correct_count = v_correct, wrong_count = v_wrong,
      skipped_count = cardinality(v_match.question_ids) - v_correct - v_wrong, completed_at = v_submitted_at
    where id = v_player.id;
  end if;

  select * into v_first from public.battle_players where battle_id = p_battle_id
    order by score desc, completed_at asc nulls last, user_id limit 1;
  select * into v_second from public.battle_players where battle_id = p_battle_id and id <> v_first.id limit 1;
  if v_first.completed_at is null or v_second.completed_at is null then return false; end if;

  v_draw := v_first.score = v_second.score and v_first.completed_at = v_second.completed_at;
  v_winner := case when v_draw then null else v_first.user_id end;

  insert into public.battle_seasons (id, name, started_at, ends_at)
  values (v_season, to_char(v_season_start, 'FMMonth YYYY') || ' Season',
    v_season_start at time zone 'UTC',
    (v_season_start + interval '1 month' - interval '1 millisecond') at time zone 'UTC')
  on conflict (id) do nothing;

  insert into public.battle_stats (user_id)
  select user_id from public.battle_players where battle_id = p_battle_id order by user_id
  on conflict (user_id) do nothing;

  perform 1 from public.battle_stats where user_id in (v_first.user_id, v_second.user_id)
  order by user_id for update;

  for v_player in select * from public.battle_players where battle_id = p_battle_id order by user_id loop
    select arena_rating into v_before from public.battle_stats where user_id = v_player.user_id;
    update public.battle_players set rating_before = v_before where id = v_player.id;
  end loop;

  for v_player in select * from public.battle_players where battle_id = p_battle_id order by user_id loop
    select rating_before into v_opponent_marks from public.battle_players where battle_id = p_battle_id and id <> v_player.id;
    v_before := v_player.rating_before;
    v_won := coalesce(v_player.user_id = v_winner, false);
    v_delta := case
      when v_draw then 0
      when v_won and v_opponent_marks >= v_before + 100 then 30
      when v_won and v_opponent_marks <= v_before - 100 then 20
      when v_won then 25
      when v_opponent_marks >= v_before + 100 then -20
      when v_opponent_marks <= v_before - 100 then -30
      else -25
    end;
    v_after := greatest(0, v_before + v_delta);

    update public.battle_players set rating_after = v_after, rating_change = v_after - v_before where id = v_player.id;

    update public.battle_stats set
      arena_rating = v_after, peak_rating = greatest(peak_rating, v_after),
      wins = wins + v_won::integer, losses = losses + (not v_won and not v_draw)::integer,
      draws = draws + v_draw::integer, total_battles = total_battles + 1,
      win_streak = case when v_won then win_streak + 1 when v_draw then win_streak else 0 end,
      best_streak = greatest(best_streak, win_streak + v_won::integer),
      updated_at = clock_timestamp()
    where user_id = v_player.user_id;

    insert into public.battle_season_stats (season_id, user_id)
    values (v_season, v_player.user_id) on conflict (season_id, user_id) do nothing;

    update public.battle_season_stats set
      arena_rating = greatest(0, arena_rating + v_delta),
      peak_rating = greatest(peak_rating, arena_rating + v_delta),
      wins = wins + v_won::integer, losses = losses + (not v_won and not v_draw)::integer,
      draws = draws + v_draw::integer, total_battles = total_battles + 1,
      win_streak = case when v_won then win_streak + 1 when v_draw then win_streak else 0 end,
      best_streak = greatest(best_streak, win_streak + v_won::integer),
      updated_at = clock_timestamp()
    where season_id = v_season and user_id = v_player.user_id;
  end loop;

  update public.battle_matches
  set status = 'FINISHED', finished_at = clock_timestamp(), winner_user_id = v_winner
  where id = p_battle_id;

  return true;
end;
$$;

revoke execute on function public.battle_create_match(text, text, text, uuid),
  public.battle_manage_queue(text, text), public.battle_save_answer(uuid, text, text, text),
  public.battle_submit(uuid, text) from public, anon, authenticated;
grant execute on function public.battle_create_match(text, text, text, uuid),
  public.battle_manage_queue(text, text), public.battle_save_answer(uuid, text, text, text),
  public.battle_submit(uuid, text) to service_role;

commit;
