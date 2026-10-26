# Zi local mock development with real Clerk

Update 2026-10-23: noun-first/Hinglish chat routing is fixed and the existing allowlisted real Clerk account completed generation, test submission and result/review verification. See [chat 503 fix and current evidence](zi-local-chat503-fix.md). The dated results below describe the initial setup run.

2026-10-22. **Separate isolated development command implemented. Authenticated browser acceptance is pending an allowlisted real Clerk test-account ID and sign-in.** The normal application's hosted Supabase credentials, authentication, flags and production behavior were not changed.

## Why normal localhost stays disabled

The normal `.env.local` targets hosted Supabase, not the synthetic PostgreSQL lab. Its generated-engine, private-pilot and provider-approval controls are unset. The builder deliberately keeps public generation disabled. Setting flags in that file would expose unverified hosted storage to writes; this implementation does not do that.

The fallback is a separate source workspace under `/private/tmp/prepzii-zi-local-*`, using the existing Zi workspace, conversational builder, job routes/orchestration, validators, private storage, test session, results and review components. The ordinary `npm run dev` remains unchanged. This separate app is scoped to Zi and generated tests; it is not a replica of every PrepZii route or hosted Supabase/PostgREST.

## Start with your existing account

Use Node 22.23.2 or the existing supported Node 22 runtime. Dependencies are already installed; no installation or environment-file edit is required.

From `/Users/ateebmazhar/Desktop/ai-study-web`:

```sh
ZI_LOCAL_CLERK_USERS='user_YOUR_EXISTING_TEST_ACCOUNT_ID' npm run dev:zi:mock
```

Replace the placeholder with the existing account's **Clerk user ID**, from the test instance associated with the current test keys. Do not supply a token, email, password or API key. Optionally allow exactly two existing accounts with comma-separated IDs for cross-user checks. The ID format alone does not authenticate a caller: real Clerk session verification still applies.

Open **http://localhost:3463/zi**, sign in normally with that existing test account, and use:

> Make a 10-question JEE Main Physics test on Rotational Motion.

Choose **Medium**, **10 questions**, **Timed Test**, **15 minutes**. Update the summary, confirm, then choose **Generate confirmed test**. Wait for job completion and use Start test. Answer questions, wait for the saved indicator, refresh to recover, submit and open results/review.

The deterministic fixture supports **JEE Main → Physics → Rotational Motion → Medium → 5 or 10 questions**, in timed or practice mode. Unsupported scopes/counts fail before reservation; it does not silently relabel questions as another topic. This includes the Laws of Motion/Easy configuration in the earlier screenshot: change it to the supported fixture settings. These are synthetic fixture questions and mocked validation outputs, not claims of live AI quality or official PYQ provenance.

The launcher prints a private workspace/database name. Keep the terminal running. Ctrl-C stops only that server; it does not stop PostgreSQL, delete databases or remove evidence. To resume saved local tests, supply the **same account allowlist** and the printed workspace:

```sh
ZI_LOCAL_CLERK_USERS='user_YOUR_EXISTING_TEST_ACCOUNT_ID' npm run dev:zi:mock -- --resume /private/tmp/prepzii-zi-local-ABC123
```

Use the actual printed path, whose prefix is `prepzii-zi-local-`. A fresh invocation without `--resume` creates a fresh synthetic database and preserves prior databases. Existing admission limits remain: two reservations/account/UTC day, one outstanding/account and two fleet-wide; held/uncertain work is not automatically refunded or replayed. Do not clear ledgers to bypass those controls. Use a fresh retained workspace when testing from a clean synthetic baseline.

## Isolation and authentication boundaries

- Before setup and every SQL batch: fixed Unix socket `/tmp/prepzii-phase5-pg17`, port `55436`, server `170006`, operator/database owner `zi_phase5_lab_admin`, exact data directory `/private/tmp/prepzii-pg176.ujiylN/data`, no database TCP listener, and private filesystem ownership/modes. A guard failure stops database access. PostgreSQL 18 is never selected.
- The launcher creates a fresh guarded fixture database and installs the already-tested Phase 5 corrections, dormant storage, combined integrity candidate and job migration there only. Existing lab databases/evidence are retained.
- Only the two existing **Clerk test keys** are extracted from `.env.local`; no application env file is sourced or copied. No real Supabase, Gemini, payment or analytics credential enters the child process. Supabase env values in the copy are invalid synthetic placeholders; SQL uses a narrow guarded local adapter.
- Real `ClerkProvider`, `clerkMiddleware`, `auth()` and the original access-control module remain. No auth aliases, synthetic login cookie, test-user switcher or fake session endpoint exists. The authenticated user must be in the explicit server allowlist. Local synthetic profile/subscription fixtures reference those real Clerk IDs; no Clerk account, metadata, real entitlement or payment is changed.
- The deterministic provider module replaces the live adapter **only in the temporary copy**. The execution-approval flag is injected only into that copy to reach the mock module; it never enables the original Gemini adapter. No Gemini key is provided, and a Node transport guard denies Gemini, hosted Supabase and all other external destinations except the reviewed Clerk API/frontend needed for real authentication. Arbitrary redirects are denied. Browser connection policy permits only self and those Clerk origins.
- `localhost` is verified to resolve exclusively to loopback before startup. Next dev binds `localhost:3463`; observed verification listener was **[::1]:3463**, not a public interface. Requests with other Host/forwarded Host or nonlocal/missing POST Origin are rejected before Clerk handling. Database calls independently recheck endpoint isolation.
- The copy's config accepts only the development-server phase, rejects production build/start and hosted/CI indicators, and requires an owned private temporary directory. The root Next config and application modules never select this mock mode. Public/preview/production generation stays disabled.
- No normal question-bank/coaching writer or direct XP update is added. The local adapter accepts only the reviewed generated-test RPCs and bounded read queries. Unknown operations fail closed. Existing server grading, timing, answer secrecy, durable job receipts, idempotency and generated-test XP exclusion remain in force.

## Actual verification

| Check | Result |
| --- | --- |
| Lab identity/version/operator/data directory/socket/ownership | PASS — exact 17.6; PostgreSQL 18 untouched |
| Fresh guarded fixture installation with final Phase 5 and jobs contracts | PASS |
| New launcher policy, credential-selection, network-denial, SQL-adapter and source-isolation tests | PASS — 6 tests |
| Synthetic core integration through this copy's actual orchestration/validators/local adapter/storage/session/results modules | PASS — 11 scenarios, 12 Node entries including parent |
| Duplicate confirmation/concurrent execution | PASS — one job, seven deterministic mock calls for the 10-question accepted set |
| Private answers, wrong-owner draft/job/session/result denial | PASS in synthetic core suite |
| Save failure/stale revision, saved-answer refresh/deadline recovery, transaction rollback | PASS in synthetic core suite |
| Submission commit with lost acknowledgement and concurrent retries | PASS — one immutable submitted result |
| Existing XP/receipts and service direct-XP prohibition | PASS — unchanged |
| HTTP Host/forwarded Host/Origin rejection, signed-out job rejection | PASS — five bounded HTTP checks |
| Real Clerk sign-in SSR and interactive email/Google controls | PASS — HTTP 200 and browser inspection; no login submitted |
| Mock production build rejection | PASS |
| Targeted ESLint | PASS |
| Full existing server suite, UI suite, fresh network-denied normal production build | PASS — 228 server, 14 UI; build uses synthetic configuration only |
| Full signed-in browser request → results with real Clerk; second real account | **SKIPPED/BLOCKED** — no account ID was supplied for the allowlist and no sign-in was completed; core tests are not an authenticated end-to-end PASS |
| Live Gemini, hosted Supabase/PostgREST/LMS, deployment/public activation | SKIPPED — prohibited |

Final executed test suites have zero FAIL. During development, a transport-denial regression test caught Node's normalized-array socket signature; the guard was fixed and rerun successfully. Initial Clerk rewrites failed when the dev hostname was `127.0.0.1` but requests used `localhost`; binding the reviewed localhost name fixed it. The subsequent bounded HTTP suite and real browser sign-in controls passed. Earlier logs were retained.

Prepared verification workspace: `/private/tmp/prepzii-zi-local-DpnhPd`; synthetic database `zi_phase61_jobs_1792692504990`. Its allowlist is intentionally empty, so no account can use generation there. It contains synthetic core-suite rows only. Use a **fresh invocation with your real account ID**, not this empty-allowlist workspace, for manual acceptance. The signed-out verification server is stopped after review to release port 3463.

Evidence: that workspace's private `evidence/` directory contains server logs, `core-*.json` results and `clerk-sign-in.png`. Normal-app regression/build evidence is `/private/tmp/prepzii-phase61-build-wapb2q/evidence/`. Manifests, raw logs and local account IDs are private; do not commit them or paste them publicly.

Remaining acceptance: sign in with the allowlisted existing Clerk test account; perform the above journey; refresh during generation/session; submit twice; use a second allowlisted account to verify the first account's job/test/session/result stay inaccessible. Do not claim that step complete from prior fake-auth Phase 6.2 evidence. Production and hosted integration remain NO-GO under the Phase 5/6.3 gates.
