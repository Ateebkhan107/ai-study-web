# Local goal hardening implementation and release gates

> Historical preparation/implementation record. The authorized exact-17.6 rehearsal has now run; see [final staging results](zi-phase5-pg176-staging-final-report.md) for actual results, corrected fixture issues and remaining NO-GO gates.

2026-10-22. No production connection, SQL execution, grant change, deployment or activation. User selected **review proposal only; do not install PostgreSQL**. Existing PostgreSQL 18.3 is untouched. Exact 17.6 runtime remains unavailable. Private production definitions remain outside Git and are not reproduced here.

## Local application changes

- `updateGoalProgress` retains Clerk authentication, identity failure handling and exact owner comparison. Historical type/amount arguments are ignored. It can only request delivery of already persisted events for the authenticated owner. The alternate utility export shares this boundary.
- Removed the test route's independent goal read/increment/award implementation. Goal delivery uses the same database RPC as the action and daily-goal read endpoint.
- Legacy `/api/update` now rejects all client counters with 409 after authentication. Previously it still minted same-user PYQ XP from fabricated counts. Repository search found no active calls to this endpoint; supported submissions use `/api/pyq-attempts` and `/api/test-session`. Older external clients need a compatibility check before release.
- Formula access records a book identity only after Clerk, entitlement and actual resource lookup. A source write failure never awards XP. Access remains usable on reward-recording failure; a subsequent successful access can retry. This cannot prove a person read/learned the book.
- `GOAL_REWARDS_TRANSACTIONAL` is new, server-only and defaults **off**. No environment file was edited. With it off, legacy goal claims no longer increment/reward; they return `pending_migration`. This deliberately pauses unsafe goal earning in this local candidate. Normal test/PYQ storage, base rewards and book access code remain, subject to the existing defects below. Do not deploy this as a transparent no-behavior-change patch.

## Executable synthetic SQL implementation — not deployed or executed

`db/proposals/20261022_goal_reward_staging.sql` refuses any database/operator/port/version other than the isolated synthetic 17.6 fixture. It is **not a production migration**. It creates private RLS-enabled event/credit/progress/receipt tables, explicitly revokes inherited default object grants from application roles on these new objects, and exposes only two service-role RPCs. It does not alter production privilege proposals or corrected Zi migrations.

| Defect | Implemented mechanism | Runtime status |
| --- | --- | --- |
| Fabricated progress | Client cannot transmit counts; DB triggers capture persisted source activity, not result-page/sessionStorage assertions | Application boundary PASS; DB SKIPPED |
| Replayed activity | Unique source identity; PYQ distinct question/book per UTC day; TEST lifetime session key; completion receipt per owner/goal/day | DB SKIPPED |
| Reward after failed persistence | Source capture in source transaction; delivery progress + receipt + additive XP + applied marker in one transaction | DB SKIPPED |
| Missing reward after interruption | Durable pending credits survive lost HTTP callbacks; next action/daily-goal read retries; rolled-back delivery leaves credits unapplied | DB SKIPPED |
| Duplicate concurrent rewards | Cross-instance transaction advisory lock, unique receipt and atomic additive XP write | DB SKIPPED |

PYQ capture requires an existing question and a nonempty persisted answer. This proves an accepted answer event, not correctness, learning or absence of guessing. Proposed reward unit changes from a client-claimed PYQ batch to a distinct question/day; this policy requires explicit acceptance. FORMULA means authorized book access once/book/day. TEST requires an owned session, complete distinct matching bank answer set and completed matching institute association where present. Answer/institute hooks serialize on the session row to avoid opposite commit order losing source capture. No AI-generated private-answer hook is enabled or supplied.

Goal eligibility (active type, track, target and XP) is snapshotted at capture. First credit freezes that day's target/reward. Delivery uses an explicit UTC date, respects both existing progress uniqueness constraints and does not overwrite a newer public day with a delayed older credit. Processing is bounded at 1,000 credits per call; returned pending count supports repeated draining. A scheduled, authenticated server drainer plus backlog/failure monitoring is still required for timely delivery without another user request. No scheduler or deployment was created.

## Remaining mandatory gates

1. Execute the exact 17.6 fixture and acceptance suite. Real SQL parser/planner, transaction semantics, locks, ACLs, owner execution, RLS and trigger behavior are **unverified**. No mock database is used as proof of those guarantees.
2. Validate full coaching flows, normal/atomic/legacy writer paths, intermediate failures, parallel institute/answer commits, cross-day source replay, goal policy changes, level thresholds, source deletion policy, bounded backlog draining and service-role misuse. Verify schema/index assumptions against the supplied catalog without copying private definitions. Test DDL watchers/schema reload against a representative Supabase staging environment separately.
3. Migrate **all** base-XP/badge/profile initializers that overwrite `user_xp.xp`: `utils/xp.js`, `utils/badgeEngine.js`, inline helpers in PYQ/test routes and profile/dashboard initialization. Existing read/modify/upsert writers can erase concurrent goal deltas; base activity and badge awards also lack complete durable receipt coverage. `increment_xp` is not used as a shortcut. Its privileged supplied-target/amount behavior remains trusted-caller risk; direct browser arbitrary-user modification remains unproven under observed default-deny RLS.
4. Replace the remaining legacy submission bypass with DB-enforced lifetime session uniqueness/registry and restricted writer privileges. The new TEST event index prevents goal replay for one session; it **does not** prevent duplicate `test_attempts` or fix base submission reward replay. Preserve historical rows; no duplicate cleanup is proposed here.
5. Approve cutover policy for already rewarded/completed legacy goals. New prototype receipts have no history. Installing them over existing rewards without reconciled seeds/cutoff can double-pay. Never reset student progress or backfill old events implicitly. A reviewed production migration, deterministic historical receipt/cutoff reconciliation and rollback design are outstanding.
6. Scope runtime role access: service credentials remain privileged/trusted and can directly change public rows; SQL constraints/receipts protect cooperating delivery, not unrestricted administrators/service writers. Restrict application writers through the durable contract before claiming that legacy/new writers cannot bypass guarantees. Do not weaken existing RLS.
7. Rehearse forward/retry/rollback and recovery. Rollback must disable new entry points/writers first, retain event/receipt evidence, keep balances, and avoid restoring insecure client counting. Never drop the ledger while writers/retries remain live. The synthetic SQL guard is intentionally not removable without separate review.

The 16-table TRUNCATE/MAINTAIN and creator-default proposals remain separate and unapplied. Their exact 17.6 tests remain mandatory. No conclusion in this document approves production migration or public Zi activation.

## Verification evidence this turn

- Server tests: **189 PASS, 0 FAIL**, one PostgreSQL suite **SKIPPED** (190 test entries including the skipped parent). Includes six Clerk/owner tests, seven delivery-boundary tests, legacy counter rejection and existing submission regression tests. These replace the earlier unsafe-behavior characterization assertions; the historical five failures remain documented in the earlier rehearsal report.
- UI tests: **11 PASS**, 0 FAIL, no skips; existing engine and Zi configuration surfaces with mocked dependencies.
- Targeted ESLint: PASS for changed server modules/routes/tests. No live Clerk/Supabase integration was exercised.
- Initial plain-Node route run failed because server-only imports require the suite's `--conditions=react-server` option. Corrected command passes; no application workaround was added.
- SQL acceptance fixture: PREPARED, **SKIPPED**. Tests cover no evidence/browser denial, source replay, source rollback, XP-write rollback with safe retry, lost callback/rolled-back worker, eight independent connections and service trust. Actual process kill/restart recovery and the broader regression matrix still require execution/extension in approved staging.
- Offline build: run in a fresh isolated source copy without .env, with synthetic keys and Node network calls denied. See the result note below; no production connections are permitted by this build harness. Build failures do not establish later render-stage success.

Reproduce network-free server verification with the bundled Node 24 and `--conditions=react-server --test` over the existing testGenerator suite plus generatedTests/routes/quota/bankSubmission/legacyRewards/submissionClient/goalAuthorization/goalRewardIntegrity/goalRewards17. SQL tests require separate explicit opt-in, fixed socket/database/user, a fresh disposable fixture and an absolute isolated 17.6 psql path; do not point them at an existing database.

## Decisions

| Stage | Decision |
| --- | --- |
| Local development and further review | GO |
| Download/install/start 17.6 | HOLD — user chose proposal review only |
| Independent Clerk/counter security patch | NO-GO for deployment pending build and compatibility review; can be split from Zi, with goal earning pause clearly accepted |
| Transactional goal rewards | NO-GO — SQL unexecuted, policy/cutover/all-XP-writer gates unresolved |
| Existing-table/default privilege corrections | NO-GO — exact 17.6 and app regression evidence pending; no production approval |
| Dormant Zi migration | NO-GO — existing migration safety gates remain |
| Zi AI generation/public activation | NO-GO |

Next safest step: review the runtime proposal and local diff, then approve only the isolated 17.6 rehearsal when ready. Production approval is neither requested nor implied.

Final build result: **FAIL** in `/private/tmp/prepzii-goal-offline-build-upmlp_4j/build.log` with network denial active. Reported Google Fonts fetch failures in global-error/layout/page (Space Grotesk, JetBrains Mono, Rajdhani, Fraunces). No fallback fonts or loader mocks were introduced. Font asset acquisition/visual parity plan: `docs/zi-phase5-offline-font-build-plan.md`. Server test log: `/private/tmp/prepzii-phase5-goal-hardening-tests.log`.
