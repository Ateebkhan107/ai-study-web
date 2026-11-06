# Zi Phase 1: single-project integration decision

2026-11-01. **GO for preparation; NO-GO for hosted migration or application deployment today.** No hosted connection, SQL execution (including local SQL), backup export, deployment, push, environment change or student-data change was performed in this review. Application code and the original tested accounting proposal are unchanged. This plan uses the existing hosted project and private local rehearsal/backup storage; it does not require another Supabase project or paid branch.

## What is compatible, and what is not established

The original proposal needs only the existing `public.zi_preferences` table: text `clerk_user_id`, `preference_key`, `preference_value`; writable timestamptz `updated_at`; an immediate, valid, nonpartial unique index on `(clerk_user_id,preference_key)`; and usable defaults for other required columns (`id`, `created_at` in the repository schema). A SECURITY DEFINER owner must both have SELECT/INSERT/UPDATE permission and be able to bypass default-deny RLS on that table through ownership or already-authorized privileges. Do not elevate a refused operator.

Repository definitions meet this contract. The stored production snapshots do not establish the current preferences contract, live usage contents, role reachability or DDL hooks. The previous seven database scenarios ran on PostgreSQL 18.3, not the historically observed hosted 17.6. Fresh project identity/version and schema evidence are required; the release candidate's PostgreSQL 17+ syntax floor is not a certification for every version.

Historical values: absent counter means zero; accepted 1–9 digit nonnegative values are preserved; values >=3 remain exhausted. Signs, whitespace, decimals, trailing text, >9 digits, NULL values, invalid owner lengths and duplicate keys require review, not normalization/reset. Past erased/undercounted history cannot be reconstructed from the current counter. The ledger records a usage floor starting with each reservation, not retroactively for every account.

The original named-role REVOKEs alone do not prove effective privilege safety under custom/inherited defaults. The new release candidate aborts before commit on unexpected new-object grants, reachable browser execution, unsafe historical-counter maintenance, unreviewed preferences policies/triggers/rules, or incompatible data. It makes **no automatic corrections to shared permissions or historical records**. Relevant enabled DDL hooks and default expression bodies must still be privately reviewed before approving any CREATE operation.

## Prepared artifacts — none executed

- Read-only catalog + aggregate preflight: `db/audits/20261101_zi_trial_accounting_preflight.sql`.
- Original tested core, unchanged: `db/proposals/20261031_zi_trial_prompt_accounting.sql`.
- Precommit guard source: `db/proposals/20261101_zi_trial_accounting_precommit_checks.sql`.
- Single-transaction candidate to review/rehearse, **not yet approved**: `db/proposals/20261101_zi_trial_accounting_release.sql`. It embeds the unchanged original core between bounded preconditions and the precommit guard. Lock timeout 2s, per-statement timeout 15s, idle transaction timeout 60s. A brief lock covers only preferences/counter writes. No global defaults, existing grants, subscriptions or generation schemas are changed.

Original core SHA-256: `4f1b97c536cc4d7209a9face58657a5eedf4f2cc0213f09907f56c9d26daed2e`.
Preflight SHA-256: `e5ae9d452d6cb1c2a87e520e29d72e74467e540f009df1896b502721bfe76420`.
Release candidate SHA-256: `9dab3160ce236647d28e72a1888cc76d62efadb7284a918d72d543f3a2990656`.

The new SQL has static review only. Existing 219 server/11 UI/7 database/build results remain evidence for the implemented app and original core; they do not certify the new guard transaction or current hosted conditions. No application rebuild is needed merely for this preparation-only change.

## Student impact

| Population | Impact after a successful coordinated release |
|---|---|
| Free and ordinary Pro (without AI Mode) | Existing three-prompt balance preserved; concurrent requests share that balance. Accounting failure blocks inference; reserved/dispatched uncertainty holds capacity without automatic replay or expiry. Preference reset cannot erase usage. |
| Active AI Mode | Same existing subscription-derived entitlement; no trial reservation/debit. Shared access-context lookup still performs a usage read, so verify outage/latency handling rather than assuming zero operational impact. |
| All Zi users | Brief chat/preference-write pause for cutover. Stricter PYQ eligibility may withhold diagram/incomplete/review-pending context; stored keys/solutions remain accurately labeled. Other learning/test/payment flows stay outside the maintenance scope. |

Installation creates new objects and has no statement resetting counters or writing subscriptions. Runtime consumption only increments the existing usage key and its ledger, and release only frees never-dispatched reservations. There is no subscription routine/reference in this migration. Browser safety depends on verified effective privileges/RLS and trusted Clerk-derived ownership: service_role remains privileged and accepts an explicit owner parameter. No unconditional live-data guarantee is possible until those checks pass.

## Exact approval sequence

**1. Approve read-only preflight, not migration.** Record the single project reference, verified TLS endpoint, database, operator, observed server version and reviewer privately. Approve only the pinned preflight above, executed by the authorized operator in its READ ONLY transaction, with aggregate-only history output. No role switching, application RPCs or student-row exports. Privately verify relevant hook/default bodies against reviewed hashes. Compare current schema, uniqueness, defaults, owner authority, RLS, browser/SET-role access and global/public creator defaults. New-object collisions, insufficient visibility, invalid counters, unsafe grants or unexpected hooks are STOP conditions. Do not rerun/drop existing accounting objects or bundle older Phase 5/generator migrations.

**2. Approve backup and offline rehearsal separately.** Use a protected libpq service/connection profile, not credentials in shell history. Confirm the existing project's backup/restore options; do not assume PITR is enabled or buy another project. Minimum targeted backup: a consistent schema+data custom-format dump of `public.zi_preferences`, plus the reviewed ACL/default/role/hook metadata and exact source/artifact hashes. If an existing full-project backup is available, record its restore point as additional protection. Store private exports outside Git/log artifacts, encrypted with restricted access and an approved retention owner. No RLS-filtered/partial dump may be accepted silently.

Example *future operator action*, not executed here (service label/path must first be confirmed):

```sh
pg_dump --dbname='service=prepzii-approved-readonly' --format=custom --table=public.zi_preferences --file='/approved/private/path/zi-preferences-before.dump'
pg_restore --list '/approved/private/path/zi-preferences-before.dump'
```

Archive listing is not a restore rehearsal. Restore only into a fresh, private, disconnected local target with matching dependencies using `pg_restore --single-transaction --exit-on-error`, never `--clean` against the hosted database. Verify restored row counts and private counter-by-counter equality. Rehearse the **exact release hash** against the observed hosted version/schema/defaults/roles with synthetic histories. Include ordinary/custom inherited grants, owner rejection, malformed counters, timeout rollback, concurrency, idempotent consume and held outcomes. The new guard deliberately rejects custom inherited grants rather than editing them. A mismatch requires a newly reviewed candidate/hash; it is not permission to fix production automatically.

**3. Approve a Zi-only maintenance window and freeze the release.** Name the approved application commit/artifact, target deployment/project, maintenance mechanism and rollback-compatible artifact. Exclude unrelated dirty-checkout changes unless separately approved. Freeze auto-deploy/promotion and any automatic migration push; identify every old production, preview, branch and direct-deployment URL plus any privileged background caller that can write the usage key/preferences. Block Zi chat and preference mutations for real traffic on **all** such versions, not just the production alias. If no secure per-entitlement switch exists, pause both routes for all Zi users briefly. Drain active invocations and confirm no legacy writers; elapsed time or zero DB connections alone is not proof. Keep this block through database installation and operator verification.

**4. Approve the exact migration once, after gates 1–3 pass.** Reconfirm endpoint/operator and hashes, take/verify the final quiesced preferences backup, and approve `20261101_zi_trial_accounting_release.sql` as one transaction. Use a noninteractive stop-on-error SQL client, never apply all repository migrations or run the old core followed by the guard after commit. The guard must execute BEFORE COMMIT. On timeout, mismatch, unexpected permissions or uncertain COMMIT acknowledgement: stop; retain maintenance; inspect catalogs privately rather than rerun. Do not change existing grants/roles/triggers/counters to force a pass. Verify committed object definitions/owners/RLS/ACLs and exact RPC signature; confirm PostgREST has reloaded the routine and an authorized service `read` call works. No provider call is required.

**5. Approve application deployment and bounded operator verification.** Only after the installed RPC is verified, deploy the reviewed new artifact with public Zi traffic still blocked. Restrict this deployment to named operators and existing operator-owned Clerk accounts. This is a protected smoke test against the real project, not a staging project. Separately approve any synthetic-account reservations/counter rows that the smoke test will write; never use real student accounts or alter real subscriptions. Check authentication, JEE/NEET routing, hidden/cross-student denial, effective browser RPC/table denial, existing AI Mode entitlement, existing free balances and preference reset. Exercise the DB state machine on named synthetic IDs only, without pretending it establishes a real provider outcome. Use prior intercepted-provider tests for startup failures unless a separate bounded live Gemini call is explicitly approved. No Gemini spend is authorized by this runbook.

**6. Approve reopening Zi traffic.** Require passing operator results, unchanged historical counter snapshots through the DDL step, verified subscription entitlement reads, no unexpected writes/grants, and zero old writer access. Switch fully to the new artifact; do not percentage-roll old/new writers together. Keep old URLs protected/disabled and external callers drained. Cached old clients must reach only the new backend; test stale clients/direct URLs and require refresh if necessary. Skew protection/alias switching alone is not a database-writer fence. Observe RPC failures, lock waits, unexpected exhaustion, pending slots and provider dispatch errors; do not log questions, answers, IDs or preference content into shared diagnostics. Stop Zi again on any violation.

## AI test generation remains disabled

No flags were changed. At release, independently verify these are false/unset in every reachable deployment: `ZI_AI_TEST_GENERATION_ENABLED`, `ZI_GENERATION_PILOT_ENABLED`, `ZI_GENERATION_PROVIDER_APPROVED`, `ZI_GENERATED_TEST_ENGINE_ENABLED`; keep `ZI_GENERATION_PILOT_USERS` empty. Do not install generator/job/integrity migrations as part of trial accounting or enable pilot/execute endpoints. The deterministic builder may continue showing configuration only.

## Recovery — preserve data rather than rewind the project

- **Before COMMIT:** a failed transaction rolls back. Retain maintenance and verify new objects are absent and counters unchanged. Resolve the cause locally; require new approval before another attempt.
- **Unknown COMMIT:** do not rerun CREATE statements. Verify installed objects, definitions, ACLs and counters first.
- **Committed DB, app not switched:** leave the additive objects installed. If no new accounting calls happened, reopen the unchanged old app only after an explicit recovery decision confirming no pending/consumed new work. A later cutover must pause/drain it again.
- **Any new reservations/consumption:** pause Zi; preserve ledger, usage floors, counter snapshots and acknowledgements. Prefer a reviewed contract-compatible app or forward repair. Do not reopen the original non-atomic writer, delete the ledger, lower counters, automatically expire held slots or refund/replay uncertain dispatched work. Release only a provably never-dispatched reservation under separately approved reconciliation; ambiguous work stays held.
- **Targeted data repair if necessary:** compare private backup to current counter/ledger floors and review an explicit per-owner delta; never overwrite newer usage/preferences from a stale dump. Do not restore the entire hosted database for this additive rollout: it could rewind unrelated tests, payments and student activity. Any actual restore needs a separate incident/approval plan.

Sources checked for planning: [Supabase backups](https://supabase.com/docs/guides/platform/backups), [Vercel generated deployment URLs](https://vercel.com/docs/deployments/generated-urls), [Vercel Skew Protection](https://vercel.com/docs/skew-protection), [PostgreSQL rollback](https://www.postgresql.org/docs/17/sql-rollback.html). Project-specific plan features, traffic controls and current settings remain unverified.
