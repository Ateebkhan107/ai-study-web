# Isolated Clerk mock chat 503 — fixed

2026-10-23 (Asia/Kolkata). The current app at **http://localhost:3463/zi** was updated locally, without restarting its authenticated server, replacing identities, changing its allowlist or resetting its database.

## Root cause

The exact request `10 Rotational Motion questions ka test generate kro` failed deterministic intent recognition. The parser recognized a generation verb before a test/question noun, but not this noun-first Hinglish order. Its question-count pattern also did not recognize a number separated from “questions” by the chapter name.

The ordinary chat route already invokes the builder **before** its provider branch. Gemini was not a prerequisite to building a draft. The unrecognized request fell through to general tutoring instead: unsupported local context reads were caught, and the local provider stub intentionally threw. The route returned “Zi provider unavailable” with HTTP 503. The active private server log confirms that chain. Clerk telemetry CSP warnings are independent and were not resolved by broadening network access.

## Changes

- Shared parser: recognizes bounded noun-first requests and common Hinglish generation wording, retains a leading question count, and keeps 5–30 limits, explicit confirmation, official-PYQ routing, ownership and expiry validation. A request only opens a draft; it cannot trigger generation by itself.
- Separate local chat route template: authenticates with real Clerk, independently enforces existing pilot membership, validates requests, and reuses the existing access context, rate limiter and deterministic builder. Unrelated tutoring is rejected explicitly with HTTP 503 and a readable local-only explanation. It imports no tutor stream, learning-memory or student-context pipeline, and never charges a tutor prompt.
- The local launcher installs this template only in its private temporary copy. Ordinary hosted chat behavior, production configuration and all generation/storage/session/reward contracts remain unchanged.
- The active workspace's chat route and parser were updated after endpoint/version verification; originals and hashes were retained privately. No authentication, allowlist, database adapter, network guard or feature flag was changed.

The normal development app still targets hosted Supabase and remains generation-disabled. Do not set its flags. The existing mock launcher/startup and resume instructions remain in `zi-local-clerk-mock.md`. Fresh mock workspaces inherit this fix. The currently running workspace already contains it; refresh or send a new supported request. Historical copied workspaces are not silently rewritten on resume.

## Executed checks

| Check | Result |
| --- | --- |
| Active local database endpoint/operator/ownership/data-directory/socket recheck | PASS — exact `170006`, fixed port 55436, Unix socket only |
| Full existing server regressions | PASS — 230 tests, including two added parser regression cases |
| Existing UI rendering suite | PASS — 14 tests |
| Local chat handler and safety-policy/network tests | PASS — 12 tests; identity/allowlist denial, expiry, foreign-owner draft, malformed input, isolation failure, rate limits, unrelated-chat rejection and blocked external transports |
| Fresh synthetic PostgreSQL generation/session suite | PASS — 11 scenarios, 12 Node entries including parent; exact reported request, concurrent reservations/execution, private storage/answers, wrong-owner denial, save failures, stale revisions, refresh/deadline recovery, rollback, lost submission acknowledgement, duplicate retries and unchanged XP |
| Bounded localhost HTTP checks | PASS — six checks for Host/forwarded Host/Origin rejection, signed-out denial and real Clerk sign-in rendering |
| Targeted ESLint and normal-app offline production build | PASS; build used a separate source copy, synthetic configuration and denied network |
| Real Clerk browser: exact request → configuration → confirmation → mock generation | PASS in the existing allowlisted Chrome session; 393px iPhone 16 emulation used for request/configuration/loading states |
| Real Clerk browser: owned generated test → saved answers → submission → results → answer review | PASS; result **3/40**, one correct, one wrong, eight unanswered; answers and explanations appear in submitted review |
| General tutoring error UI | PASS — readable “General AI chat is unavailable in local mock mode…” instead of provider fallback; mobile error inspected at 393×852 |
| Ready-job recovery after refresh/error and reopening Start test | PASS — a new builder card finds the existing ready job; Start test returns the same submitted attempt and 3/40 result, without another generation reservation |
| Actual second Clerk account; live Gemini, hosted Supabase/LMS, deployment/public activation | SKIPPED — no second real account was available; external generation/storage/deployment remained prohibited |

The browser generated one ready job, accepted all ten questions and recorded seven deterministic mock dispatches. After a browser presentation/accessibility interruption, the existing committed test's owned session URL was opened to continue test-taking; no replacement job was generated. The ready-job Start link was subsequently verified through the UI: after refresh, a new builder card recovered the same job, and clicking Start returned its already-submitted result. The fresh database suite separately verifies durable job/session recovery, concurrency and replay. This is not a claim of a second-account hosted test or a packet capture of unrelated system traffic.

Read-only before/after evidence confirms **one job, one submitted generated session and ten private questions**, unchanged XP fingerprints and reward receipt counts, and denied service direct XP UPDATE. No budget was refunded, no held job was reset, and no history was removed. The mock provider supplies deterministic responses only; its validation responses are fixtures, not a live-quality certification.

Clerk's existing development authentication and strict account allowlist remain. The fixed guarded SQL adapter targets the isolated synthetic lab only. No Gemini key or hosted database credential is supplied to the mock runtime; its provider is substituted locally, outbound Node transport denies Gemini/Supabase and other unapproved destinations, and browser CSP remains restricted. No provider or hosted Supabase call was made as a probe.

## Retained evidence and limits

- Active workspace: `/private/tmp/prepzii-zi-local-rAn09g`; database `zi_phase61_jobs_1792694722761`.
- Private browser/DB evidence: that workspace's `evidence/chat503-before.json`, `chat503-after.json`, `chat503-results-desktop.png`, `chat503-error-mobile.png`, original-source backup directory and existing server log.
- Separate fresh synthetic acceptance workspace: `/private/tmp/prepzii-zi-local-UC3Djy`, database `zi_phase61_jobs_1792695450128`; private `evidence/core-*.json`.
- Regression/build logs: `/private/tmp/prepzii-phase61-build-A2n68i/evidence/`.

All final executed suites pass. One initial new assertion expected the short chapter label instead of the existing canonical chapter label; it was corrected without changing chapter policy. Browser extension-injected `bis_skin_checked` attributes produce hydration warnings in this Chrome profile, and telemetry is blocked by the intended CSP. Neither blocked the successful submission/review, and extensions/CSP were not weakened. Drafts remain memory-only across page reload; committed jobs can be resumed from the existing generation controls after opening a new builder card.

Local mock testing: **GO**. Production, hosted migrations, paid provider usage and public generation: **NO-GO**, unchanged from Phase 5/6.3. No deployment or production credential/grant/data changes occurred.
