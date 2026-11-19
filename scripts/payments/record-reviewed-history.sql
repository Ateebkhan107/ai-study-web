-- Operator-only. In the same explicit transaction, load reviewed data into
-- pg_temp.reviewed_razorpay_history before invoking this script.
-- This records consumption evidence only. It never activates an entitlement.
LOCK TABLE public.razorpay_payment_redemptions IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_temp.reviewed_razorpay_history) THEN
    RAISE EXCEPTION 'No reviewed historical receipts supplied';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_temp.reviewed_razorpay_history
    WHERE provider_order_id IS NULL OR provider_order_id !~ '^order_[A-Za-z0-9]{1,64}$'
       OR provider_payment_id IS NULL OR provider_payment_id !~ '^pay_[A-Za-z0-9]{1,64}$'
       OR evidence_reference IS NULL OR btrim(evidence_reference) = ''
  ) OR EXISTS (
    SELECT 1 FROM pg_temp.reviewed_razorpay_history GROUP BY provider_order_id HAVING count(*) > 1
  ) OR EXISTS (
    SELECT 1 FROM pg_temp.reviewed_razorpay_history GROUP BY provider_payment_id HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Malformed, conflicting, or unevidenced historical receipts';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_temp.reviewed_razorpay_history h
    JOIN public.razorpay_checkout_orders o USING (provider_order_id)
  ) OR EXISTS (
    SELECT 1 FROM pg_temp.reviewed_razorpay_history h
    JOIN public.razorpay_payment_redemptions r
      ON h.provider_order_id = r.provider_order_id OR h.provider_payment_id = r.provider_payment_id
    WHERE r.provider_order_id <> h.provider_order_id OR r.provider_payment_id <> h.provider_payment_id
       OR r.disposition <> 'historical_consumed' OR r.evidence_reference <> h.evidence_reference
  ) THEN
    RAISE EXCEPTION 'Historical import overlaps a live intent or an incompatible receipt';
  END IF;
END;
$$;

INSERT INTO public.razorpay_payment_redemptions (provider_order_id, provider_payment_id, disposition, evidence_reference)
SELECT provider_order_id, provider_payment_id, 'historical_consumed', evidence_reference
FROM pg_temp.reviewed_razorpay_history
ON CONFLICT (provider_order_id) DO NOTHING;
