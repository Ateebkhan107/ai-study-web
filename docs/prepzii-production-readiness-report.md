# PrepZii production-readiness audit

**Decision — NO-GO for production.** The candidate builds and passes the local app checks. Release still requires Formula Cards catalog reconciliation and database policy verification, a durable fix for payment replay, and a staging run with real service integrations.

The audit used the current local candidate, an isolated PostgreSQL 18.3 instance, production-mode local Next.js builds, synthetic student sessions, and read-only hosted Formula Cards catalog checks. Production data, payment records, and deployments were untouched. The proposed RLS migration ran only in the isolated database.

## Release blockers

| Blocker | Verified evidence | Exact next action |
|---|---|---|
| **Formula Cards catalog gap and database publication policy** | The hosted database contains 171 of 181 migrated chapters and 1,892 of 1,990 migrated cards. The previous app fallback supplied the missing material. The checked-in permissive RLS policy exposed an inactive fixture card to an anonymous client. The hosted database currently reports zero inactive rows, so hosted counts could neither reproduce nor rule out the policy leak. | Review the five missing Physics topics per track with the content owner. If the 98 cards should remain visible, prepare and stage an insert-only reconciliation from the Physics batch 4 migration. Preserve existing rows and publication decisions. Stage the restrictive RLS migration and check anonymous, authenticated, and service-role access. Verify the same withdrawal through the page, deck API, and Zi. Reconcile and approve both changes before a production rollout. |
| **Captured Razorpay order replay** | The real verification handler with mocked Razorpay and Supabase returned 200 on a previously redeemed captured order after a newer same-plan order had replaced it and expired. The upsert wrote a third activation for two captured orders. An immediate duplicate produced no write, and a wrong-track callback returned 400. | Create a durable redemption receipt keyed by provider order and payment IDs. Redeem and update the subscription atomically, including parallel callbacks and delayed retries. Reconcile historical receipts against captured provider records before enabling the new path. Verify with Razorpay Test Mode. |
| **Real integration sign-off** | The configured local Clerk publishable key belongs to a development instance. The browser fixture used synthetic Clerk identities and simulated Supabase responses. Hosted PostgREST returned 406 `PGRST107` for a read-only plan request. A direct PostgreSQL connection and staging test accounts were unavailable. | Use staging Clerk, Supabase, Razorpay Test Mode, Zi provider, and a separate analytics destination. Run the acceptance sequence below before authorizing a release. |

The ten missing chapter IDs are the JEE and NEET Physics versions of Heat & Thermodynamics, Electrostatics, Current Electricity, Capacitance, and Alternating Current. The historical batch 4 migration contains 49 JEE cards and their NEET copies. Its original upsert updates existing content and publication flags, so the reconciliation should use reviewed insert-only statements. [Historical batch 4](../db/migrations/20260829_formula_cards_physics_batch4.sql)

## Code fixes verified locally

- **Clerk and PYQ authorization** — A failed fallback profile lookup can no longer mark a student as onboarded. Analytics checks the verified profile track. Signed-in PYQ lookups default to that track when the query omits the exam, including exact-paper requests. Regression tests cover all three cases. [Auth](../src/lib/auth.js) · [PYQ API](../src/app/api/pyq/route.js) · [Analytics API](../src/app/api/pyq/analytics/route.js)
- **Formula Cards publication** — App reads now use live publication state without the shared deck cache or bundled fallback. The progressive endpoint returns `Cache-Control: no-store` and responds with a retryable 503 during a database failure. After a successful deck refresh, the browser drops withdrawn cards from its navigation list. Zi resolves card content from active database rows. The new restrictive SQL policy intersects existing browser SELECT policies with `is_active IS TRUE`. The local database returned one inactive row before the policy and zero after withdrawal; service-role access remained available. All 181 bundled chapter IDs and 1,990 card IDs matched a clean local run of the checked-in migrations. [Formula service](../src/lib/formulaCards.js) · [Deck component](../src/components/formula-cards/FormulaCardDeck.jsx) · [RLS migration](../db/migrations/20261112_formula_cards_active_read.sql)
- **Zi session isolation** — Closing and reopening the lazy panel preserves the conversation for the same signed-in student. An identity change clears the local transcript and cancels the prior stream and queued prompt. A stale stream cannot reset the controls for its successor, and a lazy-panel error stays within the panel. The browser fixture exercised follow-up history and Formula Card context, then switched identity without reloading and confirmed the next request carried no prior conversation. Hosted account memory and provider responses still need staging checks. [Launcher](../src/components/zi/ZiLauncher.jsx) · [Workspace](../src/components/zi/ZiWorkspace.jsx)

## Verification evidence

| Area | Verified locally or read-only | Remaining |
|---|---|---|
| Builds | The sandboxed Turbopack run stalled during compilation. A clean isolated build outside the sandbox with dummy credentials completed, with an 8.1 s compile. Both Turbopack and webpack built the final candidate. | Run the default build on the intended release runner. Turbopack is not a confirmed candidate blocker. |
| Dashboard and progress | Browser fixture checked JEE/NEET account switching, private stats, exact rank, independent widget loading, goals retry, and partial rank failure while XP and the leaderboard remain visible. | Check real hosted Supabase timings, real subscription transitions, and restored student state for authorized staging identities with large histories. |
| PYQ and mock tests | Tests checked 75-question JEE and 180-question NEET composition, AIPMT analytics, cross-track rejection, scoped answer reveal, scoring and active-session contracts, and XP/rank/progress behavior. | Stage full sessions, resume, timeout, duplicate submit, reconnect and result/review on representative imported papers. The eight guarded database suites require the unavailable PostgreSQL 17.6 fixture. |
| Formula Cards | Tested fresh reads on withdrawal and failure, RLS with actual local PostgreSQL roles, progressive navigation and bookmarks in Chrome, and local catalog parity. Hosted counts and IDs were read-only. | Reconcile the hosted catalog and stage withdrawal after loading a deck. A fresh request can enforce current publication state; content already delivered to a client remains outside server control. |
| Mobile third parties | Three throttled 390 × 844 Chrome runs against the local optimized homepage artifact downloaded real Clerk and PostHog script assets with HTTP 200. Median LCP was 1.93 s, CLS 0.00045, and external script transfer about 174 KiB. Session, payment, and telemetry endpoints were blocked during this asset test. | Measure the final hosted candidate on mobile with real auth and analytics enabled in staging. Collect LCP, CLS, INP, and failures. |

App tests finished with **392 passed, 0 failed, and 8 skipped**. App source lint reported **0 errors and 32 existing warnings**. The repository-wide lint failures in the local Python virtual environment were reported in the previous performance audit.

### PostgreSQL query plans

The PostgreSQL 18.3 fixture held 250,000 attempts, 36,000 questions and 100,000 XP rows. The heavy synthetic user had 8,000 attempts, 6,000 of which matched NEET/AIPMT. The rows below compare a representative local query with and without additional fixture-only indexes. They are single execution samples and include no PostgREST or network overhead. [PostgreSQL EXPLAIN reference](https://www.postgresql.org/docs/current/using-explain.html)

| Query | Base fixture | Fixture indexes |
|---|---:|---:|
| Analytics with a 5,000-row offset | 11.84 ms | 6.16 ms |
| Four-paper question metadata | 0.17 ms | 0.17 ms |
| Exact rank count | 2.65 ms | 0.31 ms |

The analytics plan used a bitmap index scan on the synthetic user history after adding the fixture index. Rank used two bitmap index scans combined with a bitmap OR. The paper metadata query showed no meaningful difference on this data. Production index definitions, execution plans, latency, and selectivity remain unverified. These experimental indexes were confined to the fixture.

## Nonblocking findings

- The homepage still carries a material third-party JavaScript cost. The staging mobile run should quantify interaction latency and authentication-dependent layout behavior.
- Formula Cards now trades cross-request caching for publication correctness. Measure the live database read path after reconciling catalog coverage.
- The existing exact-rank and offset-based analytics queries may have higher cost at realistic hosted scale. The fixture plans identify the queries to inspect first.

## Staging acceptance sequence

1. Sign up with fresh JEE and NEET test accounts. Complete onboarding, reload and sign in again, then exercise sign-out, expired sessions, an incomplete profile and a second identity in the same browser. Confirm unauthorized direct API requests fail.
2. Exercise free access, a paid plan, AI Mode, expiry and the applicable institute roles. Verify Razorpay callback ownership, wrong-track denial, same-order retry, concurrent retry and replay after renewal.
3. Seed realistic large histories in staging. Compare goals, XP, rank tie-breaks, streak, analytics totals and authorization against database results. Capture read-only PostgreSQL plans for the analytics page, paper selection, and rank query.
4. Complete representative JEE and NEET PYQ and mock tests on desktop and mobile. Cover retry, timeout, resume, numerical and multiple-answer scoring, results, review and reward delivery.
5. Publish and withdraw a disposable Formula Card while a deck is open. Check fresh app and browser-role reads, progressive navigation, and Zi card context. Verify account-scoped learning memory on a second login with the real staging provider.
6. Run the production build on the intended release runner and repeat the mobile checks with full staging integrations. Sign off only after the catalog, payment replay and hosted acceptance gates pass.
