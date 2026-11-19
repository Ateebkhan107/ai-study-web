# PrepZii payment, catalog, and staging readiness

**Release recommendation — NO-GO for production.** The code and database changes are ready for staging verification. The release still needs historical payment reconciliation, editorial approval of the Formula Cards catalog, and real-service acceptance. This work used synthetic payments, isolated databases, and read-only hosted catalog queries. Production records, migrations, and deployments were untouched.

## Razorpay lifecycle and fixes

1. **Order creation** — The signed-in user's exam track and current subscription determine eligibility. The server persists the plan, price, duration, user, track, and a UUID receipt before creating an order. The checkout response is returned only after the Razorpay order ID is bound to that intent. The new AI Mode charge is ₹1,999, matching the displayed price. Existing captured ₹2,000 orders belong in historical review.
2. **Verification** — The Checkout callback requires the registered Clerk owner and a valid HMAC using the stored order ID. The webhook authenticates the exact raw body with its own secret and handles `payment.captured`. Both fetch the authoritative order and payment and compare IDs, receipt, ownership notes, plan, track, amount, currency, paid status, capture status, and refund amount before invoking the same database function. An authenticated webhook can fulfill the original track if the student has since switched profiles. [Razorpay security checklist](https://security.razorpay.com/security/checklist/) · [Razorpay signature and capture verification](https://razorpay.com/docs/server-integration/python/test-app/)
3. **Redemption and renewal** — The ledger has a primary key on the provider order ID and a unique constraint on the provider payment ID. The function serializes decisions by student and track, locks existing subscription rows, and commits the receipt and entitlement together. A repeated valid callback returns success without changing expiry. A newer same-plan purchase extends any remaining active term, including an authorized purchase whose capture arrives during the preceding term. An older registered purchase arriving after a newer activation, a lower plan displaced by a higher active plan, or a capture predating a newer cancellation is recorded for review without changing entitlement. The previous checkout route's direct writes of paid references are blocked by a database trigger.
4. **Expiration and recovery** — These are fixed-duration passes. Access continues to use subscription status and expiry. A failed write rolls back the ledger receipt. Temporary verification errors receive a retryable webhook response. Superseded and conflicting payments receive a terminal review disposition and require operator follow-up. A checkout confirmation error directs the customer to check their subscription before paying again. Refund or dispute processing remains an operator workflow. This change checks for a refund before activation.

## Prepared migrations

| File | Purpose and dependency |
|---|---|
| [20261112 Formula Cards publication policy](../db/migrations/20261112_formula_cards_active_read.sql) | Existing prepared migration. Restricts browser-role reads to active cards. Check deployed policies and migration history before applying in staging. |
| [20261113 Razorpay redemption](../db/migrations/20261113_razorpay_payment_redemptions.sql) | Creates the checkout registry, unique redemption ledger, service-only function, and write guards in one transaction. Requires the current subscriptions schema and its user/track/plan unique key. If the Diwali coupon RPC is present, its wrapper shares the subscription lock. Run as a trusted schema owner. |
| [20261114 Formula Cards image storage](../db/migrations/20261114_formula_cards_diagram_image.sql) | Adds a nullable image-reference field. It neither adds card content nor changes publication flags. The app can serve the hosted schema without this optional column. |

The Razorpay cutover should pause checkout and drain in-flight legacy callbacks before the migration. Record a provider cutoff for reconciliation and confirm that the old route cannot write paid references afterward. Keep the replay guard in place during rollback and disable checkout if the new path must be taken out of service.

### Historical payment reconciliation

1. Run [historical-inventory.sql](../scripts/payments/historical-inventory.sql) in read-only mode with restricted output. Current subscription rows retain only the latest provider references and cannot establish whether older payments were used.
2. Match a provider export in the correct Razorpay merchant and mode against the application's historical receipts, entitlement changes, refunds, and customer records. Keep promotions, duplicates, conflicting owners, missing evidence, refunded payments, and captured orders with uncertain fulfillment in separate review queues. Do not classify a payment as unused solely because the current subscription row does not contain it.
3. For positively evidenced prior redemptions, use a private reviewed CSV with `provider_order_id`, `provider_payment_id`, and `evidence_reference`. In an operator-approved transaction, create a temporary table named `reviewed_razorpay_history` with these three text columns, load the reviewed rows, and invoke [record-reviewed-history.sql](../scripts/payments/record-reviewed-history.sql) with `ON_ERROR_STOP=1`. Review the result before committing. It reserves the identifiers as historically consumed and changes no subscription.
4. Keep unregistered legacy orders outside the live redemption path. Resolve evidenced paid-but-unfulfilled orders through a separately approved entitlement or refund procedure. Unknown and conflicting records remain quarantined. Repeat a reviewed import in staging to prove idempotency.

## Formula Cards editorial reconciliation

The [reconciliation manifest](prepzii-formula-catalog-reconciliation.json) lists exact missing IDs and divergent fields from the read-only comparison.

| Classification | Chapters | Cards |
|---|---:|---:|
| Bundled baseline | 181 | 1,990 |
| Hosted rows | 171 | 1,892 |
| Missing from hosted catalog | 10 | 98 |
| Hosted rows with field differences requiring review | 21 | 27 |
| Hosted-only rows | 0 | 0 |

The missing Physics topics are Heat & Thermodynamics, Electrostatics, Current Electricity, Capacitance, and Alternating Current for both JEE and NEET. Hosted service-role and anonymous reads returned zero inactive cards. An inactive row alone would not distinguish an unpublished draft from a withdrawal. Likewise, the absence of a row cannot distinguish an unseeded card from a deleted one, and divergent fields do not prove intentional editing. The manifest separates those unknowns from the confirmed missing rows and reserves separate editorial dispositions.

The hosted schema lacks `diagram_image`. The deck retries only that precise missing-column error, with the same active-card filter. The six bundled diagram references are listed for review. Existing content remains authoritative, and none of the missing content or diagram references was published automatically. Chapter links skip prefetch, the deck API uses `no-store`, and its progressive refresh drops withdrawn cards from the deck. The app and Zi use active database content without bundled publication fallback. A fresh request enforces the current publication state. Content already delivered to a browser remains outside server control.

If editors approve restoring specific missing material, prepare an insert-only subset of the historical Physics batch 4 seed and validate it in staging. Preserve all existing divergent fields and publication flags. Leave deleted or intentionally unpublished material absent or inactive according to the editorial decision.

## Staging acceptance checklist

| Area | Verify with isolated staging accounts and services |
|---|---|
| **Clerk and onboarding** | New signup, incomplete-profile denial, onboarding completion, repeat sign-in, expired and revoked sessions, second identity in the same browser, and direct API authorization. |
| **JEE and NEET controls** | Switch tracks, confirm scoped entitlements, test free/Pro/AI Mode and institute permissions, and verify ownership and cross-track denials. A captured purchase after a profile switch must fulfill the track on its stored intent. |
| **Razorpay Test Mode** | Use test API keys, auto-capture, a dedicated `RAZORPAY_WEBHOOK_SECRET`, and the exact staging `/api/webhooks/razorpay` URL for `payment.captured`. Exercise valid checkout, tampered and unsigned callbacks, wrong user, missing intent, status/amount/currency mismatches, and a purchase completed after closing the browser. |
| **Renewal, expiry, and recovery** | Test duplicate and simultaneous deliveries, payment-ID collisions, older orders after renewal, expiry and cancellation, retries after transient failures, and reviewed reconciliation. Verify one receipt and one corresponding entitlement change. Check that a legacy app instance cannot bypass the ledger. |
| **PYQ and mock tests** | Verify JEE and NEET paper composition, multiple-answer and numerical scoring, resume, timeout, reconnect, concurrent submit, review and reward delivery. |
| **Dashboard and leaderboard** | Compare real staging records for goals, streak, XP, rank ties and analytics totals. Exercise failures and retries using large synthetic histories stored in staging Supabase. |
| **Formula Cards** | Obtain editorial disposition for every missing item and divergent field. Test draft, publish, and withdraw on a disposable card through direct app URLs, the progressive API, browser-role Supabase reads, open-deck refresh, and Zi. Verify service-role editing and the optional image field. |
| **Zi AI** | Run with the real staging provider. Verify first open, follow-up context, persisted account memory, cancellation and account isolation. |
| **Supabase performance** | Use a staging PostgreSQL connection to capture query plans for realistic PYQ histories, random-paper candidates, and rank. Record latency with indexes and data distribution representative of the intended release. |
| **Mobile Core Web Vitals** | Use the hosted staging candidate with Clerk, PostHog, and Checkout enabled. Record LCP, CLS, INP and failures on representative mobile devices and networks. |

## Files changed

- Payment handlers and verification — `src/app/api/payment/create-order/route.js`, `src/app/api/payment/verify/route.js`, `src/app/api/webhooks/razorpay/route.js`, `src/lib/razorpayPayments.server.js`, `src/proxy.js`, and `src/app/payment/failed/page.jsx`.
- Payment schema, reconciliation and tests — `db/migrations/20261113_razorpay_payment_redemptions.sql`, `scripts/payments/historical-inventory.sql`, `scripts/payments/record-reviewed-history.sql`, `scripts/payments/redemption.test.mjs`, and `src/lib/tests/razorpayPayments.test.mjs`.
- Formula Cards — `src/lib/formulaCards.js`, `src/components/formula-cards/FormulaSubjectView.jsx`, `db/migrations/20261114_formula_cards_diagram_image.sql`, `src/lib/tests/performanceRoutes.test.mjs`, and the reconciliation manifest.

## Verification

- **Automated app checks** — 400 passed, 0 failed, and 8 database-gated tests skipped. The skipped tests require the previous PostgreSQL 17.6 lab.
- **Isolated PostgreSQL 18.3 payment suite** — 8 passed. It exercised eight concurrent deliveries of one order, a payment-ID collision across owners, renewal ordering, expiry, cancellation, direct legacy writes, immutable bindings, injected transaction failure, and reviewed historical receipts.
- **Local production-mode HTTP check** — A correctly signed non-actionable webhook returned HTTP 200 without a Clerk session. A changed raw body with the original signature returned HTTP 401. Neither request contacted the payment provider.
- **Local Formula Cards policy check** — Browser roles could see all 1,990 active fixture cards and zero inactive cards. The service role could see the two inactive fixture cards. The optional migration added a nullable field with the active count intact.
- **Build and lint** — The candidate built with Turbopack and webpack using dummy service credentials. Application and payment-script lint reported zero errors and 32 pre-existing warnings. Repository-wide lint reported 44 errors and 53 warnings, with all errors in the local Python virtual environment.
- **Staging dependencies** — Razorpay Test Mode delivery, hosted Clerk sessions, real staging Supabase data and plans, editorial sign-off, hosted Zi memory, and full mobile telemetry remain pending.
