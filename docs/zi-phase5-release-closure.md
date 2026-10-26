# Phase 5 closure checklist — scope frozen

2026-10-22. **Local release preparation: GO. Production deployment, grant changes and Zi activation: NO-GO pending the gates below.** Feature development is frozen. Only release correctness, parity, reproducibility and verification work was performed. Existing checkout changes and the original lab/evidence remain intact.

## Locally completed

- [x] [Historical cutover policy](zi-phase5-historical-reward-cutover-policy.md): retain balances, progress, duplicates and earned rewards; no automatic historical payment or repair.
- [x] [All nine badge rules compared](zi-phase5-badge-parity.md). Corrected track scope, historical duplicate/retake accounting, old field fallbacks, rank ties, speed rounding and best-score interpretation. The approved historical-plus-verified policy is explicit; display and claims share the same service-only stats contract.
- [x] [Production-form migration candidate](../db/releases/phase5/README.md) prepared outside automatic migrations, with endpoint/operator/policy/authority preflight and one atomic cutover transaction. **Prepared/tested does not mean approved or executable under the demonstrated hosted operator.**
- [x] Exact PostgreSQL **17.6 / 170006** reverified at the fixed local socket, port, operator, ownership, filesystem modes and data directory before every database operation. PostgreSQL 18 was not used.
- [x] Fresh final one-shot install in `zi_phase5_release_20261022_r5`; **30 DB scenarios PASS** (33 Node entries including 3 parents), zero FAIL/SKIPPED in that final run.
- [x] Committed backup restored into separate `zi_phase5_restore_20261022_r5`; all **35 tables** match, as do checked owners, normalized ACLs, RLS flags, columns/default hashes, constraints and routine hashes. Restored protected writes are denied; restored submission replay changes no records/rewards.
- [x] **204 server tests and 11 UI rendering tests PASS**; targeted ESLint and whitespace checks PASS.
- [x] Fresh final network-denied production build **PASS**, using synthetic configuration and no copied environment files.
- [x] Font blocker resolved using **28 exact cached WOFF2 files** for the existing five families, all 45 face/fallback rules, original weights/ranges/coverage/metrics/variables, and the same Latin preload assets. Official OFL notices are pinned and included. No new font version, styling redesign or dependency installation.
- [x] Offline Chrome font specimens at **1200px and 390px** load all five families with equal geometry and **zero differing pixel channels** versus the cached baseline; zero external requests. This is font-specimen parity, not a full signed-in website screenshot suite.
- [x] [Representative Supabase/Clerk/coaching LMS integration plan](zi-phase5-integration-release-plan.md) prepared, with synthetic actors, distributed app workers, API/browser/DB evidence and explicit failure gates.

## Unresolved production release blockers

- [ ] Separately approve production actions and the pending product decisions below.
- [ ] Prove hosted operator/private-owner provisioning authority without elevating browser/service roles or weakening RLS. The tested local superuser does not establish Supabase `postgres` authority.
- [ ] Fresh private catalog/schema/default-expression/watcher/dependency review and closure of external/privileged writers. The real private routines and event watchers were not executed in this lab. Invoker `increment_xp` must be evaluated with actual staging permissions/dependencies, not EXECUTE alone.
- [ ] Run the realistic signed-in Supabase/Clerk/PostgREST/LMS integration suite using separate staging credentials and no real students. Validate onboarding triggers, browser reads/RLS/source permissions, retake/result DTOs, badge catalogue, PostgREST cache, client upgrade and old-worker drain. **SKIPPED locally**, not PASS.
- [ ] Resolve any actual fractional-score or ambiguous historical-track precondition. The candidate refuses them instead of changing old data or rounding scores silently. Privately review invalid/malformed historical aggregates and live badge definitions before migration approval.
- [ ] Approve a coordinated production backup/restore, maintenance lock/timeout, migration order, monitoring, write-pause/forward-repair and reconciliation/drainer plan. The synthetic committed restore closes the local restore gap; it is not a production restore rehearsal.
- [ ] Confirm representative landing/dashboard/formula/test/mobile views with the final staged build. Font bytes/specimens match, but live authenticated full-app visual and behavioral acceptance remains required.

These blockers are mandatory release gates and cannot be relabeled as Phase 6 follow-ups. The existing standalone Clerk/counter patch can be reviewed separately from Zi, but the frozen tree also contains fail-closed reward/client changes: it must not be deployed piecemeal without a coordinated compatibility plan.

## Product decisions requiring approval

**Approved:** preserve historical badge eligibility and count verified distinct new activity after cutover.

Still pending: once-per-question lifetime PYQ base XP (including first-answer amount and old unanswered-question reservations); distinct-question/day PYQ goals; freezing existing goal periods through their recorded dates; and treatment/display of historically eligible but unclaimed badges without retroactive XP. Historical duplicate/partial sessions are held rather than silently resolved. See the [policy decision table](zi-phase5-historical-reward-cutover-policy.md).

## Safe Phase 6 scope

- New AI generation/provider activation, new test modes, quotas and additional product functionality.
- New badge types/amounts, a redesigned NEET/track badge policy, and analytics/leaderboard presentation changes beyond approved Phase 5 parity.
- Historical compensation/correction tools, only after a separate policy and audit approval; Phase 5 does not repair balances.
- Optional performance work and broader host/network chaos testing after required release safety and representative recovery gates pass.

## Evidence and failure history

Final evidence: `/private/tmp/prepzii-pg176.ujiylN/evidence/release-prep-20261022/`. Run 5 retains the exact candidate hash, acceptance TAP, pre/post snapshots, custom backup, restored snapshot/catalog and replay verification. Root evidence contains final server/UI/lint/build logs, font manifests/licenses and desktop/mobile specimen comparisons. All disposable databases are retained; none was reset or deleted.

Earlier release attempts are also retained: run 1 exposed a cross-file global-count test race; run 2 rolled back an alias collision in a new preflight; run 3 restored data correctly but its raw ACL comparator rejected PostgreSQL's equivalent NULL/owner-default representation. The comparator now normalizes built-in ACL semantics, and database test files run serially while within-scenario concurrency remains exercised. Run 4 then passed cutover/restore; run 5 repeats the complete flow with the final badge-display RPC. No failed/unfinished run is counted as PASS.

**Next step:** review the remaining product decisions and approve a separate representative staging integration run. Production SQL, grants, deployment, student-record changes and Zi activation still require separate explicit approval. No production action was taken.
