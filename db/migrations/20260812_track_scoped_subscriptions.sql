alter table public.subscriptions
  add column if not exists exam_track text;

update public.subscriptions subscription
set exam_track = case
  when upper(coalesce(profile.exam, 'JEE')) like 'NEET%' then 'NEET'
  else 'JEE'
end
from public.user_profiles profile
where subscription.clerk_user_id = profile.clerk_user_id
  and subscription.exam_track is null;

update public.subscriptions
set exam_track = 'JEE'
where exam_track is null;

alter table public.subscriptions
  alter column exam_track set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_exam_track_check'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions
      add constraint subscriptions_exam_track_check
      check (exam_track in ('JEE', 'NEET'));
  end if;
end $$;

do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select constraint_info.constraint_name
    from information_schema.table_constraints constraint_info
    join information_schema.key_column_usage key_info
      on key_info.constraint_schema = constraint_info.constraint_schema
      and key_info.constraint_name = constraint_info.constraint_name
      and key_info.table_name = constraint_info.table_name
    where constraint_info.table_schema = 'public'
      and constraint_info.table_name = 'subscriptions'
      and constraint_info.constraint_type = 'UNIQUE'
    group by constraint_name
    having array_agg(key_info.column_name order by key_info.ordinal_position) = array['clerk_user_id']
  loop
    execute format('alter table public.subscriptions drop constraint if exists %I', constraint_row.constraint_name);
  end loop;
end $$;

do $$
declare
  index_row record;
begin
  for index_row in
    select index_class.relname as index_name
    from pg_index index_info
    join pg_class index_class on index_class.oid = index_info.indexrelid
    join pg_class table_class on table_class.oid = index_info.indrelid
    join pg_namespace namespace_info on namespace_info.oid = table_class.relnamespace
    where namespace_info.nspname = 'public'
      and table_class.relname = 'subscriptions'
      and index_info.indisunique
      and not index_info.indisprimary
      and (
        select array_agg(attribute.attname order by key_order.ordinality)
        from unnest(index_info.indkey) with ordinality as key_order(attnum, ordinality)
        join pg_attribute attribute
          on attribute.attrelid = table_class.oid
          and attribute.attnum = key_order.attnum
      ) = array['clerk_user_id']
  loop
    execute format('drop index if exists public.%I', index_row.index_name);
  end loop;
end $$;

create unique index if not exists subscriptions_user_exam_track_idx
  on public.subscriptions(clerk_user_id, exam_track);

create index if not exists subscriptions_exam_track_status_idx
  on public.subscriptions(exam_track, status);
