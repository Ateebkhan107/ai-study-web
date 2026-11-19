-- Read-only. Run as a reviewed operator and keep output in an access-controlled location.
BEGIN READ ONLY;

-- A subscription row retains only its latest reference. This is a lead for
-- reconciliation against provider exports, never a list of unredeemed payments.
SELECT clerk_user_id, exam_track, plan, status, starts_at, expires_at, amount, currency,
       razorpay_order_id, razorpay_payment_id,
       CASE
         WHEN coalesce(razorpay_order_id, '') LIKE 'promo_%' OR razorpay_payment_id = 'free_coupon'
           THEN 'promotion'
         WHEN razorpay_order_id ~ '^order_[A-Za-z0-9]{1,64}$'
           AND razorpay_payment_id ~ '^pay_[A-Za-z0-9]{1,64}$'
           THEN 'provider_pair_requires_evidence'
         ELSE 'missing_or_nonstandard_reference'
       END AS review_category
FROM public.subscriptions
ORDER BY clerk_user_id, exam_track, plan;

SELECT 'order' AS identifier_type, razorpay_order_id AS identifier, count(*) AS occurrences
FROM public.subscriptions WHERE razorpay_order_id ~ '^order_' GROUP BY razorpay_order_id HAVING count(*) > 1
UNION ALL
SELECT 'payment', razorpay_payment_id, count(*)
FROM public.subscriptions WHERE razorpay_payment_id ~ '^pay_' GROUP BY razorpay_payment_id HAVING count(*) > 1;

ROLLBACK;
