alter table public.user_profiles
  add column if not exists account_type text not null default 'STUDENT';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_account_type_check'
      and conrelid = 'public.user_profiles'::regclass
  ) then
    alter table public.user_profiles
      add constraint user_profiles_account_type_check
      check (account_type in ('STUDENT', 'INSTITUTE_ADMIN'));
  end if;
end $$;

update public.user_profiles profile
set account_type = 'INSTITUTE_ADMIN'
where exists (
  select 1
  from public.institute_members member
  where member.user_id = profile.clerk_user_id
    and member.role = 'COACHING_ADMIN'
    and member.status = 'ACTIVE'
);

