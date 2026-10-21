# PrepZii Phase 5.2 — production compatibility and duplicate submission investigation

> Historical Phase 5.2 record. The subsequent user-supplied catalog evidence, revision 4 corrections and current deployment gates are recorded in [the production catalog review](zi-phase5-production-catalog-review.md). Earlier missing-catalog and CHECK-compatibility uncertainties below are superseded where that review explicitly resolves them.

**NO-GO for shared migration application or generated-test activation.** This pass performs approved read-only production investigation and local corrections only. No shared migration, destructive SQL, historical data modification, rollback, index creation or public generation occurred.

## Actual duplicate-attempt findings

The latest bounded Supabase GET-only snapshot at **2026-10-15T20:44:09.756Z** inspected **207 non-null-session attempts**, matching the API's exact visible count. **57 rows** belong to **21 duplicate session groups**, comprising **36 excess attempts**. Two investigation runs made seven GETs each; no application reward endpoints, RPCs or SQL execution endpoints were called. Raw student/session/attempt IDs, scores and answer keys were not persisted or printed. Evidence: `docs/zi-phase52-duplicate-evidence.json`.

- Every duplicate group has exactly one student, and every row matches the base session owner. No orphan base sessions or cross-student groups were observed.
- Every group has identical scores and scoring counts across its rows; scores are non-null. Each attempt has a distinct stored `started_at`, consistent with the attempt-row default timestamp rather than proof of separate intentional attempts.
- Twenty groups have at least one adjacent creation gap within five seconds; the remaining pair is **6.034 seconds** apart. No group has an adjacent gap over five minutes. The fingerprints/table below show each group without exposing its UUID or student identity.
- All 57 rows have `status='in_progress'` and NULL `submitted_at`. **Zero** linked `user_answers`, `test_questions.test_attempt_id` or `institute_test_attempts.attempt_id` rows were returned for these IDs, with complete bounded reference responses. This does not prove that undisclosed catalog FKs, triggers or logical/JSON references are absent.
- All 57 also have NULL `test_id`. Under current `analyticsAggregate`, profile and badge exam-resolution code, missing test associations and missing answer exams exclude these rows from exam-filtered test metrics. The raw history API still returns them; any raw row-count consumer sees 36 excess records. `getDashboardData` counts raw attempts but has no current caller in `src/`. Zi's five-row recent-attempt filter checks activity counts/score rather than submitted status, so partial/duplicate rows can consume its context window and contribute score-trend entries; with no linked answers they contribute no actual topic-answer evidence. Exact historical UI/context exposure was not reconstructed. No dashboard/analytics data was changed.

### Which sessions (privacy-safe correlation)

Fingerprints are the first 12 characters of MD5(UUID text). They are pseudonymous operational correlation labels, not anonymization guarantees. Keep this report private. The manual SQL script includes a commented authorized lookup for locating one fingerprint privately without publishing its raw UUID.

| Session fingerprint | Attempts | Gap range (seconds) | Score/counts | Saved answer rows |
| --- | ---: | --- | --- | ---: |
| `18b79e201d4b` | 3 | 1.145–2.115 | Identical | 0 |
| `2549eacb81ed` | 2 | 1.485–1.485 | Identical | 0 |
| `345ab0fa6097` | 2 | 1.288–1.288 | Identical | 0 |
| `42323089ffa1` | 2 | 2.194–2.194 | Identical | 0 |
| `4eaeed5beb0a` | 3 | 0.898–3.517 | Identical | 0 |
| `615746afc92e` | 2 | 1.446–1.446 | Identical | 0 |
| `99913642ec47` | 2 | 1.226–1.226 | Identical | 0 |
| `9c3eca0aa0c6` | 2 | 3.521–3.521 | Identical | 0 |
| `9c6ab13da725` | 2 | 1.866–1.866 | Identical | 0 |
| `9d7101056100` | 2 | 6.034–6.034 | Identical | 0 |
| `a950ff39cb58` | 6 | 0.067–0.302 | Identical | 0 |
| `b887dd0425b0` | 2 | 2.300–2.300 | Identical | 0 |
| `ba305e3b9a7c` | 3 | 0.829–1.649 | Identical | 0 |
| `bdc833c9a0f5` | 2 | 0.700–0.700 | Identical | 0 |
| `c4e5e4037b18` | 2 | 1.445–1.445 | Identical | 0 |
| `c7bbbfb6b3fe` | 2 | 2.735–2.735 | Identical | 0 |
| `c9787a562797` | 5 | 0.121–4.006 | Identical | 0 |
| `cbb833654e29` | 7 | 0.134–0.688 | Identical | 0 |
| `ce04f3074a34` | 2 | 0.952–0.952 | Identical | 0 |
| `cf3d7bf3a38c` | 2 | 2.750–2.750 | Identical | 0 |
| `eec32bd21265` | 2 | 1.931–1.931 | Identical | 0 |

### XP, streaks, goals and rewards

**Actual historical reward effects are unverified.** The advertised schema has aggregate `user_xp`, badges and daily-goal state, but no advertised attempt/session-linked reward ledger. Current balances cannot attribute a particular callback, lost update, reward retry or historical code path. We did not call `/api/profile/badges` (its GET can award badges), `/api/update`, or any reward RPC during the audit.

The correct-answer formula applied to excess rows gives **375 theoretical additional XP** if each duplicate had independently received `correct_answers * 15`. This is a hypothetical exposure estimate, **not observed paid XP**, and is neither a reconciliation total nor permission to subtract anything. Goal XP and badges are not included in that formula.

The current legacy submission handler schedules rewards only after answer/institute writes succeed; its partial-write failure returns before scheduling. Thus the missing answer rows are consistent with retries after persistence errors, but neither prove a failure nor rule out rewards from older code, triggers or other endpoints. Same-day streak updates normally return early after the first update; aggregate state and the lack of a durable event log prevent historical verification of streak/goal/badge effects.

## Confirmed causes versus hypotheses

**Confirmed from code and data:**

- The former flag-off normal handler inserted on every request, without previous-attempt lookup or a shared transaction. Attempts were inserted before separate answer/institute operations. A failed operation could leave an attempt behind, and retry could insert another. Even two successful retries could schedule two reward callbacks.
- The prior atomic RPC returned the earliest saved attempt without checking for historical duplicates or incomplete answers. The local revision-3 correction now fails closed instead.
- Normal RPC activation was coupled to the generated-engine flag; an independent default-off server flag now permits a later approved normal-only rollout.
- All historical groups have same-owner, identical-score, closely spaced rows with no advertised dependent answers or institute links. This is actual observed evidence.

**Suspected, not proven:** repeated manual retries, retry after an answer/institute error, multiple tabs, expired-timer retries, old deployed handlers or races across workers. No historical request IDs, deployment version, SQL errors or reward ledger were available to identify which mechanism produced each group. Different attempt-row timestamps are not evidence of intentional retakes.

## Submission and reward writer inventory

This inventory covers all attempt insertion sites and reward writers found in current repository source and proposed SQL. Production stored-function/trigger writers, old deployed clients and external jobs cannot be exhaustively verified without catalog/deployment evidence.

| Path | Safety status / actual behavior |
| --- | --- |
| `PUT /api/test-session`, legacy normal branch | Previously unconditional multi-step insertion. Locally corrected with owned complete-attempt reuse, bounded same-worker serialization, and conflict/partial detection. Separate workers can still race; persistence and rewards are not one transaction. |
| Same endpoint, normal atomic branch | Calls `zi_commit_bank_submission` only when an approved server flag is enabled. Proposed revision-3 RPC locks owned sessions, rejects historical ambiguity/incompleteness/owner mismatches, and commits new attempt/answers/institute/session atomically. Safe among cooperating RPC writers, not against legacy bypass writers; still not a durable reward ledger. |
| `src/lib/testAttempts.js:createTestAttempt` | Direct client INSERT, omitting session_id; no caller found in current `src/`. No reward call. Does not participate in atomic commit; old clients/external consumers remain a rollout concern. No speculative table ACL changes were made. |
| Institute/LMS test launch | Creates base session/questions plus an IN_PROGRESS institute association through existing POST `/api/test-session`; submission uses the same PUT normal paths. No second institute scoring writer found. LMS result APIs read SUBMITTED associations. Retry reuse now requires a completed association to the same attempt. |
| Generated `zi_submit_generated_test` / DAL / PUT | Disabled. Existing private-session row lock, ownership, revisions and atomic private result; no shared attempt, normal XP or goal writes. Resume returns the same private session/result. |
| Legacy `POST /api/update` | No current caller found. Locally rejects `source='test'` before database/reward work, preventing an explicit second test award through this endpoint. Non-test behavior was preserved and remains client-counter-based and non-idempotent; it is not a secure historical test-reward ledger and needs a separate broader reward hardening review. |
| `runPostSubmitProgressUpdates` in normal API | Schedules correct*15 XP, solved/correct counters, same-day streak update and TEST goal progress. Now scheduled only for newly written results in the same worker/RPC path. `after()` is not a durable transactional outbox. Cross-session XP updates use read/modify/write and may race. |
| `src/utils/xp.js:addXP` | Shared aggregate XP read/modify/upsert helper, also evaluates badges unless skipped. Used by legacy update, goals and badge reward writers. No attempt idempotency key; not modified beyond blocking the explicit test caller path above. |
| `src/utils/badgeEngine.js` and GET `/api/profile/badges` | Inserts user_badges then grants badge XP on successful insert. Database uniqueness is necessary to make simultaneous awards safe, and catalog constraints remain unverified. Reads alone at the app GET can have award side effects; audit used direct REST metadata/SELECTs instead. |
| `src/utils/goals.js` and `src/utils/updateGoalProgress.js` | Read/modify/write goal progress and award XP at completion. The latter is called by PYQ results and formula-book activity; the former has no current caller. No submission/attempt key or transactional award receipt. Existing functionality retained. |
| `src/utils/streak.js` and `src/utils/leaderboard.js:initUserLeaderboard` | Existing server streak action and client XP-profile initialization; no test-attempt INSERT. No current caller found for these exported helpers. Not attempt-level reward protection. |
| `/api/pyq-attempts` | Separate official PYQ attempt/reward path; uses server-side answer evaluation but inserts/rewards again for repeated requests. Does not create shared test_attempts. Outside this test-only correction; unchanged. |
| `increment_xp` advertised RPC | Present in REST metadata, no current repository caller found. Body/owner/grants/trigger callers inaccessible; manual catalog script surfaces it and other DB-side writers. Never invoked. |
| Battle finish/season-award paths | Separate battle ratings/statistics/season awards; no shared test_attempts or user_xp writes found in `src/lib/battle.js`. Unrelated existing battle changes retained. |
| Development/archive scripts | `src/scripts/archive/test_upsert.js` and similar old scripts can write aggregate XP. Not production submission handlers; none were executed. The new audit script only GETs bounded relevant records. |

The existing test client already has a synchronous in-flight ref guarding click/timer overlap. The local correction preserves it, validates acknowledgements and latches terminal normal conflicts so an expired timer cannot keep resubmitting an incomplete historical record. Network/429 failures make one transport request; explicit retry checks saved state on the server. Cross-tab/worker safety still requires database enforcement.

Normal page refresh retains the existing POST-new-session behavior and does not persist normal selections; this pass does not introduce normal answer autosave or redesign starts. Generated refresh/resume remains the existing private-session path and is verified locally while disabled publicly.

## Local corrections (not deployed)

1. Added server-only `bankSubmission.server.js`: look up at most two owned prior attempts; reuse only one complete distinct question-answer set and valid institute association. Ambiguous or partial submissions return 409 without repairing/deleting history or paying rewards. Read failures fail closed. A queue is bounded at 1000 active session keys and 16 pending operations per key, releases on failure, and serializes only within one worker.
2. Wrapped the normal route in that guard before scoring/persistence; preserved marking, NULL-answer rules, original legacy write operations and generated source separation. No RLS/authentication changes.
3. Added default-off `ZI_BANK_ATOMIC_SUBMISSIONS_ENABLED`. It selects the normal atomic RPC independently; it does not enable generated starts, Zi generation or provider calls. The existing engine-enabled atomic behavior remains backward compatible. All three flags are false in the inspected local environment.
4. Updated **unapplied migration revision 3**, keeping the original filename: normal RPC validates its answer snapshot and refuses multiple, incomplete, mismatched-owner or incomplete-institute historical records. `PZ409` maps to a safe terminal 409 without exposing SQL details. Prior CHECK/ACL/search-path/timeout hardening is preserved. No new table or index was added in this pass.
5. Blocked explicit test rewards in the legacy `/api/update` endpoint. Existing non-test behavior remains unchanged; no current in-repo caller of the generic endpoint was found.
6. Extracted the existing PUT transport into `submissionClient.js`: one request, preserved error status, validated saved attempt UUID. Normal 409 uses the existing error presentation and stops automatic retries. No test interface redesign or Zi UI edit.
7. Expanded the local fixture with the actual metadata-advertised `test_questions.test_attempt_id` FK, so catalog/reference queries can be validated faithfully. All test databases are fresh local fixtures; no old fixture reset or rollback execution occurred.

Migration revision-3 SHA-256:

```text
1f9f315285bce56e23c046d67046636a63e20047e84467aa7a4083dc02733417  db/migrations/20261016_zi_generated_tests.sql
```

The rollback was unchanged this pass and retains all shared base sessions. Its SHA-256 remains `fd00dca4fc4a4a7077159ca0413ffab9bf7453520aa171610034bc8a7a26e8e5`. Dropping its private tables permanently destroys generated questions, evidence, saved answers and results. It was not executed.

## Manual production catalog verification

**Execute manually only through the Supabase SQL Editor or an authorized PostgreSQL connection:** `db/audits/20261016_zi_phase52_read_only.sql`.

It uses a repeatable-read, read-only transaction with bounded timeouts and reads CHECKs, incoming/outgoing FKs/delete actions, triggers/bodies, indexes/uniques, table/schema/default ACLs, RLS policies, direct/transitive role membership, effective inherited privileges, public CREATE grants, function owners/search paths/SECURITY DEFINER configuration, DB-side attempt/reward writers, session status/duration classes and privacy-safe duplicate/reference counts. It includes no DML, DDL, cleanup, migration invocation or application RPC call. Keep its operational function-definition output private. An authorized PostgreSQL client can capture all result sets; in the SQL Editor inspect the individual SELECT results as needed.

Actual catalog access still returns **HTTP 406 / PGRST106 (pg_catalog not exposed)**. No direct PostgreSQL URL or management token is configured. Catalog information was not inferred from absent REST metadata or obtained through a permissions bypass. The manual script ran successfully on the isolated local fixture, including its duplicate records, **not on production**.

Still unverified: full target CHECK/index/trigger definitions, incoming references outside advertised metadata, all real table/schema/default ACLs, effective role inheritance/public CREATE/function owners, exact practice-duration/completed-status compatibility, old deployed writers and historical reward provenance.

## Database prevention and archival proposal

See `db/proposals/zi-phase52-submission-integrity.md` and the still-commented optional index proposal. The recommended design uses a private unique-per-session submission registry and one transactional normal commit path, with direct DML restricted after every old writer is audited/drained. This can retain every existing historical row. Historical ambiguity stays blocked until reviewed. A unique reward-event ledger/outbox is needed for reliable reward retries/crash recovery; process locks and `after()` alone do not provide it.

No uniqueness index is added while existing duplicates remain. Optional cleanup/archival requires a separate approved backup, reference inventory, per-group canonical/retake policy, preserved IDs/checksums/audit mapping, reward provenance review and exact row-level plan. No automated historical deletion, pointer rewriting or XP subtraction is proposed for execution.

## Verification

- **176** passing server/service/API tests, including new repeated/lost-response retries, eight concurrent legacy submissions in one worker, partial writes, historical duplicates, owner checks, independent normal flag, private SQL conflict serialization, complete/incomplete institute associations, NULL/unanswered/numerical/multiple-correct marking, guard exhaustion/release and a deliberate cross-worker overlap test documenting the limitation.
- **11** passing Zi/engine rendering and actual KaTeX tests; generated configuration/session DTOs and normal rendering remain compatible.
- **22** passing local PostgreSQL entries (21 scenarios plus parent): revision-3 migration, CHECK NULL regression, ACL/inherited privileges/owners/search paths, eight concurrent starts/submissions, six atomic normal commits, timing expiry/practice, resume and private source separation, plus duplicate/partial/foreign-owner historical RPC rejection. Rollback review is static only.
- **209 total passing test entries**, zero failed or skipped in the final suites.
- Targeted lint: zero errors, one existing `@next/next/no-img-element` warning at the reused test renderer (now line 229). Existing Node ESM package-type warnings remain. Repository `git diff --check` still reports pre-existing trailing whitespace in unrelated `src/components/battle/BattleRoomClient.jsx:467`; it was left untouched.
- Production build: **passed** with `next build --webpack`, compiling successfully and generating all 122 static pages.
- Manual read-only catalog SQL: successful local execution on `zi_phase5_remediation_fixture_53`; no production execution. Prior fixtures retained. The local server was stopped after verification; all fixture databases were retained.

Commands (bundled Node 24 runtime as `node`; database tests require a fresh guarded local fixture):

```sh
node --conditions=react-server --test src/lib/zi/testGenerator/*.test.mjs src/lib/tests/generatedTests.test.mjs src/lib/tests/routes.test.mjs src/lib/tests/quota.test.mjs src/lib/tests/bankSubmission.test.mjs src/lib/tests/legacyRewards.test.mjs src/lib/tests/submissionClient.test.mjs
node --test src/components/zi/tests/testBuilder.test.mjs src/components/test/tests/engine.test.mjs
ZI_PHASE5_LOCAL_DB=1 ZI_PHASE5_FIXTURE_DB=zi_phase5_remediation_fixture_53 node --conditions=react-server --test src/lib/tests/database.test.mjs
node node_modules/eslint/bin/eslint.js src/lib/tests/ src/scripts/investigate_zi_phase52_duplicates.mjs src/app/api/test-session/route.js src/app/api/update/route.js 'src/app/(dashboard)/test/session/page.js' src/components/test/tests/engine.test.mjs
node node_modules/next/dist/bin/next build --webpack
```

## Files changed in Phase 5.2

Modified:

- `db/migrations/20261016_zi_generated_tests.sql`
- `db/proposals/20261016_test_attempts_session_uniqueness.sql`
- `src/app/api/test-session/route.js`
- `src/app/api/update/route.js`
- `src/app/(dashboard)/test/session/page.js`
- `src/lib/tests/routes.test.mjs`
- `src/lib/tests/database.test.mjs`
- `src/lib/tests/fixtures/baseline.sql`
- `docs/zi-phase5-verification.md` (follow-up link)
- `docs/zi-phase5-safety-remediation.md` (historical-revision notice)

Added:

- `db/audits/20261016_zi_phase52_read_only.sql`
- `db/proposals/zi-phase52-submission-integrity.md`
- `src/lib/tests/bankSubmission.server.js`
- `src/lib/tests/bankSubmission.test.mjs`
- `src/lib/tests/submissionClient.js`
- `src/lib/tests/submissionClient.test.mjs`
- `src/lib/tests/legacyRewards.test.mjs`
- `src/scripts/investigate_zi_phase52_duplicates.mjs`
- `docs/zi-phase52-duplicate-evidence.json`
- `docs/zi-phase52-verification.md`

All unrelated pre-existing uncommitted battle, formula-card, Zi/provider, test/result/review and other work was retained. No dependencies or secrets were added.

## Final recommendation and approval boundary

**NO-GO** remains appropriate: obtain/review real catalog evidence, settle historical partial/duplicate handling, coordinate every writer and design database enforcement/durable rewards before claiming production compatibility or distributed idempotency. Local fixes reduce retries but are not deployed and do not close the cross-worker database gap.

No shared SQL/migration/rollback or data modifications occurred. No index was created, no old attempt or reward was corrected, and no Gemini call ran. Engine, normal atomic-rollout and public AI-generation flags remain off. No Phase 6 work or generated-test activation occurred. Separate explicit approval is required for any later migration or deployment action.
