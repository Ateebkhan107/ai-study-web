BEGIN;

DO $$
BEGIN
  IF current_user IN ('anon', 'authenticated', 'service_role', 'authenticator') THEN
    RAISE EXCEPTION 'Run the redemption migration as a trusted schema owner';
  END IF;
END;
$$;

-- An intent is written before any provider order is created. Historical orders
-- cannot enter the live redemption path simply by presenting valid signatures.
CREATE TABLE public.razorpay_checkout_orders (
  receipt uuid PRIMARY KEY,
  checkout_sequence bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  provider_order_id text UNIQUE CHECK (provider_order_id ~ '^order_[A-Za-z0-9]{1,64}$'),
  clerk_user_id text NOT NULL CHECK (btrim(clerk_user_id) <> ''),
  exam_track text NOT NULL CHECK (exam_track IN ('JEE', 'NEET')),
  plan text NOT NULL CHECK (plan IN ('monthly', 'quarterly', 'yearly', 'ai_mode')),
  amount_paise integer NOT NULL CHECK (amount_paise > 0 AND amount_paise % 100 = 0),
  currency text NOT NULL CHECK (currency = 'INR'),
  duration_days integer NOT NULL CHECK (duration_days BETWEEN 1 AND 366),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE public.razorpay_payment_redemptions (
  provider_order_id text PRIMARY KEY CHECK (provider_order_id ~ '^order_[A-Za-z0-9]{1,64}$'),
  provider_payment_id text NOT NULL UNIQUE CHECK (provider_payment_id ~ '^pay_[A-Za-z0-9]{1,64}$'),
  disposition text NOT NULL CHECK (disposition IN ('applied', 'superseded', 'historical_consumed')),
  redeemed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  evidence_reference text,
  CHECK ((disposition = 'historical_consumed' AND evidence_reference IS NOT NULL AND btrim(evidence_reference) <> '')
    OR (disposition <> 'historical_consumed' AND evidence_reference IS NULL))
);

CREATE INDEX razorpay_checkout_owner_track_sequence_idx
  ON public.razorpay_checkout_orders (clerk_user_id, exam_track, checkout_sequence DESC)
  WHERE provider_order_id IS NOT NULL;

ALTER TABLE public.razorpay_checkout_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.razorpay_payment_redemptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.razorpay_checkout_orders, public.razorpay_payment_redemptions
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.razorpay_checkout_orders TO service_role;
GRANT INSERT (receipt, clerk_user_id, exam_track, plan, amount_paise, currency, duration_days)
  ON public.razorpay_checkout_orders TO service_role;
GRANT UPDATE (provider_order_id) ON public.razorpay_checkout_orders TO service_role;

CREATE FUNCTION public.guard_razorpay_order_binding()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF OLD.provider_order_id IS NOT NULL AND NEW.provider_order_id IS DISTINCT FROM OLD.provider_order_id THEN
    RAISE EXCEPTION 'A bound checkout order cannot be rebound' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_razorpay_order_binding
  BEFORE UPDATE OF provider_order_id ON public.razorpay_checkout_orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_razorpay_order_binding();
REVOKE ALL ON FUNCTION public.guard_razorpay_order_binding() FROM PUBLIC, anon, authenticated, service_role;

-- Only trusted server code may call this function after verifying the provider.
CREATE FUNCTION public.redeem_verified_razorpay_payment(
  p_order_id text, p_payment_id text, p_user_id text, p_amount_paise integer, p_currency text
)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog
AS $$
DECLARE
  v_order public.razorpay_checkout_orders%ROWTYPE;
  v_existing public.razorpay_payment_redemptions%ROWTYPE;
  v_disposition text;
  v_now timestamptz;
  v_rank integer;
  v_duration interval;
BEGIN
  IF p_order_id IS NULL OR p_order_id !~ '^order_[A-Za-z0-9]{1,64}$'
    OR p_payment_id IS NULL OR p_payment_id !~ '^pay_[A-Za-z0-9]{1,64}$' THEN
    RETURN 'invalid';
  END IF;

  SELECT * INTO v_order FROM public.razorpay_checkout_orders
    WHERE provider_order_id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.clerk_user_id IS DISTINCT FROM p_user_id
    OR v_order.amount_paise IS DISTINCT FROM p_amount_paise
    OR v_order.currency IS DISTINCT FROM p_currency THEN
    RETURN 'invalid';
  END IF;

  -- Serialize decisions across plan tiers for this student's exam track.
  PERFORM pg_advisory_xact_lock(hashtextextended(
    jsonb_build_array('prepzii-razorpay', v_order.clerk_user_id, v_order.exam_track)::text, 0
  ));
  v_rank := array_position(ARRAY['monthly','quarterly','yearly','ai_mode'], v_order.plan);
  v_duration := make_interval(hours => v_order.duration_days * 24);

  SELECT * INTO v_existing FROM public.razorpay_payment_redemptions
    WHERE provider_order_id = p_order_id;
  IF FOUND THEN
    IF v_existing.provider_payment_id IS DISTINCT FROM p_payment_id THEN
      RETURN 'conflict';
    END IF;
    RETURN CASE WHEN v_existing.disposition = 'applied' THEN 'already_applied' ELSE v_existing.disposition END;
  END IF;

  -- Keep same-track entitlement writes ordered with administrative row updates.
  PERFORM 1 FROM public.subscriptions
    WHERE clerk_user_id = v_order.clerk_user_id AND exam_track = v_order.exam_track
    FOR UPDATE;
  v_now := clock_timestamp();
  IF EXISTS (
    SELECT 1 FROM public.razorpay_checkout_orders o
    JOIN public.razorpay_payment_redemptions r USING (provider_order_id)
    WHERE o.clerk_user_id = v_order.clerk_user_id AND o.exam_track = v_order.exam_track
      AND o.checkout_sequence > v_order.checkout_sequence AND r.disposition = 'applied'
  ) OR EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.clerk_user_id = v_order.clerk_user_id AND s.exam_track = v_order.exam_track
      AND s.status = 'active' AND s.expires_at > v_now
      AND array_position(ARRAY['monthly','quarterly','yearly','ai_mode'],
        CASE WHEN s.plan = 'quarterly_promo' THEN 'quarterly' ELSE s.plan::text END) > v_rank
  ) OR EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.clerk_user_id = v_order.clerk_user_id AND s.exam_track = v_order.exam_track
      AND s.plan = v_order.plan AND s.status <> 'active' AND s.updated_at >= v_order.created_at
  ) THEN
    v_disposition := 'superseded';
  ELSE
    v_disposition := 'applied';
  END IF;

  INSERT INTO public.razorpay_payment_redemptions (provider_order_id, provider_payment_id, disposition)
    VALUES (p_order_id, p_payment_id, v_disposition)
    ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN 'conflict'; END IF;
  IF v_disposition = 'superseded' THEN RETURN v_disposition; END IF;

  INSERT INTO public.subscriptions AS current_subscription (
    clerk_user_id, exam_track, plan, status,
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
    starts_at, expires_at, amount, currency, updated_at
  ) VALUES (
    v_order.clerk_user_id, v_order.exam_track, v_order.plan, 'active',
    p_order_id, p_payment_id, 'server_verified',
    v_now, v_now + v_duration, v_order.amount_paise / 100, v_order.currency, v_now
  )
  ON CONFLICT (clerk_user_id, exam_track, plan) DO UPDATE SET
    status = 'active',
    razorpay_order_id = EXCLUDED.razorpay_order_id,
    razorpay_payment_id = EXCLUDED.razorpay_payment_id,
    razorpay_signature = EXCLUDED.razorpay_signature,
    starts_at = EXCLUDED.starts_at,
    expires_at = CASE WHEN current_subscription.status = 'active'
      THEN greatest(v_now, current_subscription.expires_at) + v_duration
      ELSE EXCLUDED.expires_at END,
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    updated_at = EXCLUDED.updated_at;

  RETURN 'applied';
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_verified_razorpay_payment(text, text, text, integer, text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.redeem_verified_razorpay_payment(text, text, text, integer, text)
  TO service_role;

-- Old application revisions used direct upserts and could bypass the ledger.
-- The definer of the redemption RPC may set paid references. Existing paid
-- references may still be maintained without replacing their identifiers.
CREATE FUNCTION public.guard_subscription_razorpay_references()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF coalesce(NEW.razorpay_order_id, '') !~ '^order_'
    AND coalesce(NEW.razorpay_payment_id, '') !~ '^pay_' THEN RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.razorpay_order_id IS NOT DISTINCT FROM OLD.razorpay_order_id
      AND NEW.razorpay_payment_id IS NOT DISTINCT FROM OLD.razorpay_payment_id THEN RETURN NEW;
    END IF;
  END IF;
  IF current_user <> (
    SELECT pg_get_userbyid(proowner) FROM pg_proc
    WHERE oid = 'public.redeem_verified_razorpay_payment(text,text,text,integer,text)'::regprocedure
  ) THEN
    RAISE EXCEPTION 'Paid subscription references require the redemption RPC' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_subscription_razorpay_references
  BEFORE INSERT OR UPDATE OF razorpay_order_id, razorpay_payment_id ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.guard_subscription_razorpay_references();
REVOKE ALL ON FUNCTION public.guard_subscription_razorpay_references() FROM PUBLIC, anon, authenticated, service_role;

-- The existing coupon RPC reads expiry before upserting. Share the paid
-- redemption lock so a concurrent first purchase cannot lose an extension.
DO $migration$
BEGIN
  IF to_regprocedure('public.redeem_diwali_prepzii_2026(text,text)') IS NOT NULL THEN
    ALTER FUNCTION public.redeem_diwali_prepzii_2026(text, text)
      RENAME TO redeem_diwali_prepzii_2026_unlocked;
    REVOKE ALL ON FUNCTION public.redeem_diwali_prepzii_2026_unlocked(text, text)
      FROM PUBLIC, anon, authenticated, service_role;
    EXECUTE $wrapper$
      CREATE FUNCTION public.redeem_diwali_prepzii_2026(p_clerk_user_id text, p_exam_track text)
      RETURNS TABLE (expires_at timestamptz)
      LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $body$
      BEGIN
        PERFORM pg_advisory_xact_lock(hashtextextended(
          jsonb_build_array('prepzii-razorpay', p_clerk_user_id, upper(btrim(p_exam_track)))::text, 0
        ));
        RETURN QUERY SELECT * FROM public.redeem_diwali_prepzii_2026_unlocked(p_clerk_user_id, p_exam_track);
      END;
      $body$
    $wrapper$;
    REVOKE ALL ON FUNCTION public.redeem_diwali_prepzii_2026(text, text) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.redeem_diwali_prepzii_2026(text, text) TO service_role;
  END IF;
END;
$migration$;

COMMIT;
