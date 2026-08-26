alter table public.user_profiles
  add column if not exists username text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_username_format_check'
      and conrelid = 'public.user_profiles'::regclass
  ) then
    alter table public.user_profiles
      add constraint user_profiles_username_format_check
      check (
        username is null
        or (
          username = lower(username)
          and username ~ '^[a-z0-9_]{3,20}$'
          and username not in ('admin', 'prepzii', 'support', 'root')
        )
      );
  end if;
end $$;

create unique index if not exists user_profiles_username_lower_unique
  on public.user_profiles (lower(username))
  where username is not null;
