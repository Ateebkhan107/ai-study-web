-- Drop the unique constraint on (clerk_user_id, exam_track)
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
    having array_agg(key_info.column_name order by key_info.ordinal_position) = array['clerk_user_id', 'exam_track']
  loop
    execute format('alter table public.subscriptions drop constraint if exists %I', constraint_row.constraint_name);
  end loop;
end $$;

-- Also drop the index if it exists separately
drop index if exists public.subscriptions_user_exam_track_idx;

-- Create the new unique index including plan
create unique index if not exists subscriptions_user_track_plan_idx
  on public.subscriptions(clerk_user_id, exam_track, plan);

alter table public.subscriptions add constraint subscriptions_user_track_plan_key unique using index subscriptions_user_track_plan_idx;
