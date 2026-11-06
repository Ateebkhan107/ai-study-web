# Zi specialization Phase 1 — implementation and deployment review

2026-10-31. Implemented locally; **not deployed**. No hosted database, production data, configuration or live Gemini call was used. Existing unrelated checkout changes were preserved.

## Changes

- Chat actions now use `studentContext.profile.exam`. Regression cases cover NEET, JEE Main and JEE Advanced without silently converting Advanced to Main.
- Tutor current-PYQ lookup selects the same joined reference fields and invokes the same `normalizeReference` validator as the generator. It requires an eligible published parent paper, approved/published statuses, matching exam subtype and supported complete content/answer formats. Review-pending, unpublished, mismatched, malformed and image/layout-dependent references are withheld. This intentionally inherits the generator's conservative text-only coverage limits. No source records are changed.
- Stored keys are labeled as stored keys, not independently verified answers. Stored solutions have review status unavailable: the current schema contract supplies no independent review evidence, so no solution is upgraded to “reviewed.” The existing system prompt retains all teaching/language/actions/memory/hidden-answer capabilities and adds provenance instructions. Actual model responses receive a server-owned `Gemini-generated response` label; deterministic test-builder responses retain their existing format.
- The existing launcher does not present accounting outages or held reservations as an exhausted trial. Server-side admission still fails closed.
- Preference reset deletes only the five allowlisted learning preferences. Trial usage and other internal rows survive.
- Free trial usage is read and mutated through a service-only transactional RPC. Missing/unavailable/malformed accounting fails closed. Premium entitlement remains independent of free-trial accounting.
- The Gemini streaming adapter still uses the existing SDK, model selection and fallback behavior. A dispatch callback runs after local initialization and cancellation checks. The installed SDK's unused automatic-function-calling wrapper is disabled because it otherwise returns a lazy iterator before HTTP starts. Cancellation is passed in the SDK's documented config location. Real-SDK tests with intercepted HTTP prove the stream connection is established before trial consumption.

## Accounting state contract

1. `read`: report historical used count, pending slots and remaining allowance. No grant of a fresh trial on errors.
2. `reserve`: serialize all workers for the Clerk owner with a transaction advisory lock; admit only while used + pending < 3. Record a fresh UUID and a monotonic usage floor.
3. `dispatch`: durably mark the reservation dispatched immediately before provider invocation. Failure prevents provider invocation. A lost acknowledgement cannot release dispatched work.
4. `consume`: after provider stream startup succeeds, atomically increment the existing `zi_free_prompts_used` preference and mark the reservation consumed. Repeating consumption is idempotent.
5. `release`: only a still-reserved request can be released after configuration/initialization failure. Dispatched work is never automatically released.

Ambiguous provider outcomes, process death or failed usage acknowledgements retain a pending slot and require operator reconciliation. They do not increment the consumed counter automatically, expire into new allowance, or authorize replay. An established stream that later fails or is cancelled retains its consumed prompt. This is prompt admission/accounting, not a provider invoice guarantee or a distributed replacement for Zi's separate process-local rate limiter.

## Separate proposed database change — NOT APPLIED TO HOSTED DATABASES

Proposal: `db/proposals/20261031_zi_trial_prompt_accounting.sql` (deliberately outside automatic migrations).

Production impact if separately approved:

- Adds one reservation table, two owner indexes and one SECURITY DEFINER RPC to the existing PostgreSQL database. No new infrastructure/provider or extensions.
- Enables RLS with no browser policies, revokes table access from browser and service roles, grants RPC execution only to service_role, and refuses an unsafe privileged owner relationship. Clerk ownership must still be supplied only by authenticated trusted server code.
- Does not rewrite historical counters at installation. Runtime reads preserve existing nonnegative usage, including totals above three; malformed legacy counters fail closed for review. Reservation usage floors prevent recorded historical/consumed counts being reset through preference deletion.
- Successful consumption continues mirroring usage into the existing counter for compatibility. No profile, question, test, subscription, billing or reward records are migrated.
- Adds reserve/dispatch/consume RPC calls to a successful free tutor turn; deterministic configuration and premium tutoring do not reserve/debit trials.
- Without the RPC installed and exposed to the service client, free tutoring fails closed. Deploying app code alone would interrupt free tutoring.

Required rollout order: review/backup and test on representative hosted staging; verify actual database version, owner authority, ACL/default privilege behavior and PostgREST RPC visibility; quiesce free-tutor traffic and drain old workers; apply the separately approved proposal; deploy coordinated app code; verify synthetic users before resuming traffic. Existing activation gates for AI generation remain unchanged and must not be enabled by this rollout.

Do not roll back to the old non-atomic accounting while requests are running or held. Quiesce traffic and reconcile reservations first; retain the ledger and monotonic counters. No automatic downgrade or destructive rollback SQL is provided.

## Verification

- **219 server tests PASS**, zero failed/skipped: specialization, real SDK streaming boundary, provider initialization boundary, all existing generator tests, custom-test quotas, generated storage, test-session routes and submission clients/bank integrity.
- **11 Zi UI rendering tests PASS**, zero failed/skipped. UI tests run without the server-only React condition; combining them with server-only tests is an invalid runner configuration and initially failed before being rerun correctly.
- **7 real database scenarios PASS** against a newly initialized private socket-only PostgreSQL **18.3** cluster, stopped after testing. Covers 12/16-way concurrent admission, concurrent repeated consumption, preserved legacy usage/reset behavior, malformed counts, foreign reservations, held dispatch and browser/service direct-table denial. PostgreSQL 17.6 was not available locally; production-version compatibility is not established by this result.
- Focused ESLint and `git diff --check` PASS.
- Fresh Next.js **16.3.0 production webpack build PASS**, including 123 static pages. Built from an isolated source/public/config copy with synthetic environment and outbound fetch/HTTP/TLS/socket connections denied. No `.env` files or production credentials were copied. Final artifact/log: `/private/tmp/zi-phase1-build-1lxu58hm/build.log`.
- Server test log: `/private/tmp/zi-phase1-server-tests.log`; UI log: `/private/tmp/zi-phase1-ui-tests.log`.

Commands:

```sh
# Use Node 22+ (the workstation default Node 20 is not suitable).
node --conditions=react-server --test src/lib/zi/*.test.mjs src/lib/zi/testGenerator/*.test.mjs src/lib/tests/quota.test.mjs src/lib/tests/routes.test.mjs src/lib/tests/generatedTests.test.mjs src/lib/tests/submissionClient.test.mjs src/lib/tests/bankSubmission.test.mjs
node --test src/components/zi/tests/testBuilder.test.mjs
# Creates only a fresh synthetic socket-only cluster, applies the proposal there,
# runs acceptance tests, stops that cluster and retains its private directory:
python3 scripts/zi-phase1/accounting_db_test.py /absolute/path/to/postgres/bin
```

## Unverified / deployment decision

**Ready for review and representative staging; not approved as safe for direct production deployment.** The accounting migration dependency, actual hosted database version/privileges, coordinated old-worker drain, held-request reconciliation and signed-in Clerk/Supabase integration must be checked first. No live Gemini account/model/latency/billing or teacher-reviewed scientific quality was tested.

Hidden-answer tests establish server-side omission and ownership controls. They do not prove a language model will never derive a hidden answer from visible question text or resist every injection. Provenance rules do not scientifically validate stored keys, stored explanations or new model reasoning. Reviewed-solution metadata remains absent, so unknown review status is preserved explicitly. Current-syllabus grounding and broader personalization remain outside this phase.
