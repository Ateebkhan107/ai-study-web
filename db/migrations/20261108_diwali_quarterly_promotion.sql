create table if not exists public.promotion_redemptions (
  id uuid primary key default gen_random_uuid(),
  promotion_code text not null,
  clerk_user_id text not null,
  exam_track text not null check (exam_track in ('JEE', 'NEET')),
  plan text not null,
  redeemed_at timestamptz not null default now(),
  expires_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  unique (promotion_code, clerk_user_id)
);

alter table public.promotion_redemptions enable row level security;
revoke all on public.promotion_redemptions from public, anon, authenticated;
grant select, insert on public.promotion_redemptions to service_role;

create index if not exists promotion_redemptions_user_idx
  on public.promotion_redemptions (clerk_user_id, redeemed_at desc);

create or replace function public.redeem_diwali_prepzii_2026(
  p_clerk_user_id text,
  p_exam_track text
)
returns table (expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_track text := upper(trim(p_exam_track));
  v_current_expiry timestamptz;
  v_new_expiry timestamptz;
begin
  if p_clerk_user_id is null or trim(p_clerk_user_id) = '' then
    raise exception using errcode = '22023', message = 'A user is required.';
  end if;

  if v_track not in ('JEE', 'NEET') then
    raise exception using errcode = '22023', message = 'Select JEE or NEET.';
  end if;

  if v_now > timestamptz '2026-11-15 23:59:59.999+05:30' then
    raise exception using errcode = '22023', message = 'This Diwali offer expired on 15 November 2026.';
  end if;

  if exists (
    select 1 from public.promotion_redemptions
    where promotion_code = 'DIWALIPREPZII'
      and clerk_user_id = p_clerk_user_id
  ) then
    raise exception using errcode = '23505', message = 'You have already claimed this Diwali offer.';
  end if;

  select s.expires_at
    into v_current_expiry
  from public.subscriptions s
  where s.clerk_user_id = p_clerk_user_id
    and s.exam_track = v_track
    and s.plan = 'quarterly'
  for update;

  v_new_expiry := greatest(v_now, coalesce(v_current_expiry, v_now)) + interval '3 months';

  insert into public.promotion_redemptions (
    promotion_code, clerk_user_id, exam_track, plan, redeemed_at, expires_at, metadata
  ) values (
    'DIWALIPREPZII', p_clerk_user_id, v_track, 'quarterly', v_now, v_new_expiry,
    jsonb_build_object('price', 0, 'currency', 'INR', 'source', 'diwali_2026')
  );

  insert into public.subscriptions (
    clerk_user_id, exam_track, plan, status,
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
    starts_at, expires_at, amount, currency, updated_at
  ) values (
    p_clerk_user_id, v_track, 'quarterly', 'active',
    'promo_DIWALIPREPZII', 'free_coupon', 'server_verified',
    v_now, v_new_expiry, 0, 'INR', v_now
  )
  on conflict (clerk_user_id, exam_track, plan) do update set
    status = 'active',
    expires_at = excluded.expires_at,
    updated_at = excluded.updated_at;

  return query select v_new_expiry;
end;
$$;

revoke all on function public.redeem_diwali_prepzii_2026(text, text) from public, anon, authenticated;
grant execute on function public.redeem_diwali_prepzii_2026(text, text) to service_role;
