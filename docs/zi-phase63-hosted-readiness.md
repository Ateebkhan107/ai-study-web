# Phase 6.3 — hosted integration readiness

2026-10-22. **Assessment complete; hosted integration, migrations, deployment and public generation: NO-GO.** No remote connection, SQL execution, provider request, account creation, flag change or deployment was performed. Only this report was added. Existing changes and synthetic lab evidence were preserved.

## Confirmed environment evidence

Local inspection classified values in memory; credentials, tenant hostnames, tokens and connection strings are deliberately omitted. Key prefixes and unsigned JWT claims are classification evidence, not authentication or proof of project isolation.

| Component | Confirmed locally | Unresolved |
| --- | --- | --- |
| Clerk | Publishable and secret keys have test-key prefixes | Same-instance pairing, dedicated synthetic tenant, issuer/audience, JWT template or third-party integration, allowed origins and remote configuration are not verified. A test instance is not proof of a dedicated staging environment. |
| Supabase | HTTPS hosted endpoint; anon JWT declares anon role and its project reference matches the URL; server credential has the secret-key prefix | Secret key validity, project association and effective service permissions are unverified. No independently identified staging project or production-project comparison establishes isolation. |
| Gemini | A key is configured; local model override is `gemini-3.5-flash` | Dedicated project, key restrictions, supported model, API enablement, quota and billing are unknown. Configuration inspection cannot prove API availability. No provider endpoint was contacted. |
| Environment separation | One root `.env.local`; `.env.example` exists; no local Vercel project link, Supabase link/config or `.clerk` directory found at the inspected standard paths | This does not prove that separate hosted environments do not exist. Remote environments and branch scopes were not inspected. |
| Safety controls | Pilot flag, allowlist, generated-engine flag, provider approval and integrity-contract flag are absent from `.env.local`; no Clerk/Supabase/Gemini/Zi shell overrides found | Hosted flags are unknown. Local absence must not be represented as proof about a deployed application. |

The local environment mixes Clerk test credentials with an unverified hosted Supabase target. Do not start the repository app with this environment for staging verification. The existing Phase 6.2 isolated fixture remains the accepted local mock experience; its injected flags and synthetic authentication do not establish hosted readiness.

`.env.example` documents Gemini/model and analytics variables but not the complete Clerk/Supabase/integrity/job configuration. Before a hosted rehearsal, prepare a separate secret store and clean build workspace with no inherited `.env.local`. Bind public build-time Supabase/Clerk configuration and server secrets to the same reviewed staging targets; do not reuse a build compiled for another environment. Do not alter the current environment file or copy production secrets.

## Authentication and permissions

There are two browser client paths. `src/lib/supabase.js` and `supabaseClient.js` create anon-key clients without a Clerk token callback. `useClerkSupabase.js` supplies a Clerk `supabase` template token with fallback to the ordinary session token. Community realtime also has token wiring. These are different authentication paths: neither the fallback token nor the named template is proven accepted by the actual Supabase project. Confirm which mechanism staging supports; do not assume both work.

Some existing policies use text JWT `sub`; older institute custom-question policies use `auth.uid()`. Check installed policy versions and Clerk subject compatibility rather than assuming a UUID identity. Server generation handlers use Clerk-derived identity, entitlement checks and explicit owner arguments through a server Supabase credential. That credential is privileged; successful service RPC access does not establish browser RLS or cross-user authorization.

Required staging actors are signed-out, synthetic A/B students, an unenrolled student, and two separate institutes with teacher/admin/student roles. Acceptance must cover valid, expired, wrong-issuer and forged tokens; substituted user/job/session/test/institute IDs; read/write/result isolation; enrollment revocation; and anonymous clients versus actual Clerk-authenticated clients. Do not weaken RLS or grant browser access to private answers, jobs, receipts or reward tables to resolve a failing test.

## Migration and authority readiness

Local source hashes were checked against retained release documentation; Phase 5 and Phase 6.1 hashes match. **Target schema comparison is BLOCKED**, not passed. No approved target, current target catalog, migration history, operator authority or staging backup was available.

Reviewed order, subject to an exact target-specific plan:

1. Approve remaining historical reward policy choices and inventory/drain all privileged and legacy writers. Verify a restorable synthetic staging backup and a separate empty restore target.
2. Review fresh target catalog and private dependency evidence. The existing 16-table maintenance correction and two-creator default correction are separate approval units; preserve required row permissions and service access.
3. Install dormant `db/migrations/20261016_zi_generated_tests.sql` **before** the integrity candidate, flags off. Never reinstall it after cutover because it replaces a compatibility routine.
4. Independently approve/prove private-owner provisioning and operator authority. `prepzii_integrity_owner` requires the reviewed NOLOGIN/BYPASSRLS isolation with no application or old-postgres membership/SET path. Do not elevate a refused operator or expose the owner to service/browser roles.
5. Execute only the combined `db/releases/phase5/20261022_phase5_integrity.sql`, not the prototype/components. Exact endpoint/operator/database/data-directory/port/policy guards and server `170006` must match actual server values, not assumptions about a pooler. Existing private schemas require an upgrade plan, not rerunning bootstrap. Fractional active penalties and ambiguous historical tracks are fail-closed gates.
6. Install `db/migrations/20261022_zi_generation_jobs.sql` afterward. Its own version guard checks major 17; the release approval gate must still require **exact 17.6**. Verify actual schema/table/routine owners and effective PUBLIC/direct/inherited/SET permissions, pinned search paths, RLS and service-only RPC exposure. Check installed job policy values and PostgREST function/schema-cache behavior.

The maintenance proposal covers test_sessions, test_attempts, test_questions, user_answers, institute_test_attempts, questions, badges, daily_goals, institute_test_questions, institute_tests, pyq_attempts, pyq_questions, user_badges, user_daily_goals, user_profiles and user_xp. It removes only TRUNCATE/MAINTAIN from PUBLIC/anon/authenticated and aborts if inherited/SET/ownership paths remain. The companion corrects future public-table defaults for postgres and supabase_admin; global-default drift or missing creator authority aborts. Neither proposal substitutes for the integrity candidate's protected write restrictions.

Previously reviewed private production evidence found browser `increment_xp` updates blocked by default-deny user_xp RLS, despite EXECUTE; privileged callers can supply arbitrary targets/amounts. This is not proof of browser exploitation or of a safe privileged call graph. Recheck representative staging permissions, dependencies and external writers. Ordinary DDL watcher bodies and 71 defaults were privately reviewed; four integration tables' 20 defaults were outside that export. Verify those missing defaults and target drift privately. Never publish raw definitions or invoke a production routine as a probe.

Source SHA-256:

| Artifact | SHA-256 |
| --- | --- |
| Dormant storage | `6f05ae3e8090cff0afba3699ddf4075b123ab8a918b3114b6926b93d11ce45c8` |
| Combined integrity candidate | `25fc783e9287126fc81349bdccba0565ff53325921e10a312f45ca1f3ade803e` |
| Generation jobs | `4e6a6510ccfdf7c46d44a9e067334c6f1b35f148aa13b294ef4a8ba497463edb` |
| 16-table correction | `383d0829a063f549ad1c9bc1a814066e143036ccc8b79d4ca0fba0c41aa6822c` |
| Creator defaults correction | `78069c67cdd4f4f72b05d19021f7472d47a4bcc1a92315554ea0b3690f0ae770` |

## Generation and recovery gates

Source inspection confirms encrypted confirmed drafts bind Clerk owner/config/expiry; server reservations derive immutable draft/config keys. Durable jobs serialize admission and physical dispatch, reserve budgets and retain held capacity; unknown usage/outcomes never authorize automatic regeneration. Polling returns safe job DTOs. Private storage uses a stable job creation key; generated submissions remain excluded from ordinary XP rewards.

Important: **GET job status is not a read-only database operation.** Its RPC can reconcile committed storage or mark expired work held. Login/onboarding, builder requests, ordinary app pages and chat can also have writes or provider side effects. None may be used as a catalog-only connectivity probe. Keep provider approval false/unset and do not exercise execute/chat or reserve jobs during this assessment.

The worker declares Node/300 seconds, with a 240-second execution bound and 270-second database deadline. Actual hosted runtime support, termination behavior, independent-worker concurrency, held-job operations, policy sign-off and monitoring are unverified. Existing local budget units are not a guaranteed currency ceiling. Mocked generation may be used in a separately isolated staging build only after synthetic writes are approved and outbound provider calls are denied; no public mock/auth bypass should be introduced.

## Execution evidence and next approval steps

| Check | This assessment |
| --- | --- |
| Secret-redacted local configuration classification, token bridge/flags/source review | PASS |
| Candidate identity/hash and documented migration order review | PASS locally; target application not verified |
| Hosted environment isolation | BLOCKED — no independently verified, approved target |
| Hosted SQL/catalog, actual schema/ACL/RLS/owner comparison | SKIPPED — no connection made |
| Real Clerk login/token mapping and coaching integration | SKIPPED — requires dedicated accounts, verified targets and explicit synthetic-write approval |
| Hosted migration, backup/restore, submissions/rewards/jobs | SKIPPED — requires approved plan and synthetic writes |
| Live Gemini availability/quality/quota/billing | SKIPPED — configuration only; execution prohibited |
| New automated/browser/database suite | SKIPPED — no application changes; prior local PASS evidence retained, not rerun |

Safest next action is to supply/review **non-secret staging identifiers**, with owner confirmation that Supabase project/database is different from production, contains synthetic data only, and is not linked to production webhooks, auth, storage or external writers. Identify the dedicated Clerk test instance, its audience/issuer integration and staging app origin; independently pair its server/public keys and Supabase credentials privately. Gemini ownership/restrictions can be inspected in its console without API execution. Do not paste keys or connection strings into approval messages.

Then approve **only read-only catalog/configuration access to those exact named targets**. Use a direct catalog SELECT inside `BEGIN READ ONLY`, transaction-local timeouts and `ROLLBACK`; stop on endpoint/version/operator mismatch or permission error. Reuse `db/audits/20261022_zi_security_readiness_catalog.sql` for its existing scope, but supplement it with approved catalog-only checks for Phase 5 private schemas/routines/triggers and Phase 6 jobs: the existing audit does not fully inventory those new objects. Store exports privately. Private-expression outputs stay outside Git/reports; publish only redacted conclusions. No application RPC, defaults evaluation, account creation, GET reconciliation or role switching is authorized by this catalog-only approval.

After reviewing that evidence, request a **separate** approval for exact migrations/owner provisioning/grant corrections, synthetic account/fixture writes, isolated application integration and backup/restore. Use the Phase 5 integration plan and Phase 6.2 journey as acceptance baselines: A/B isolation, normal/generated/coaching submissions, duplicate/concurrent retries and lost acknowledgements, conserved opening XP, durable receipts/no replay, private answers, refresh/timer recovery and mobile/error states. Provider execution stays blocked throughout.

Precommit migration failure rolls back the transaction. After committed cutover, pause writes and preserve ledgers/receipts; use a contract-compatible application or reviewed forward repair. Never restore old direct XP writes, clear uncertain jobs, delete duplicates or overwrite newer writes with an unreconciled backup. The local restore rehearsal is evidence of the candidate, not proof of hosted backup recoverability.

Remaining Phase 5 policy choices and all mandatory production gates in `zi-phase5-release-closure.md` remain open. Phase 6.2 manual acceptance closes the mock local journey, not real Clerk/Supabase/LMS or hosted recovery gates. **GO for preparation and a target-specific approval review; NO-GO for hosted integration execution, migrations, production release and live/public AI.**
