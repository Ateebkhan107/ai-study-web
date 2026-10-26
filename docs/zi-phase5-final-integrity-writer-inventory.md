# Writer inventory before final integrity changes

2026-10-22. Read-only source inventory completed before implementation. The existing lab endpoint guard passed (170006, zi_phase5_lab_admin, expected data directory/socket, TCP off). No production connection. Scope: literal table operations, helper call sites, dynamic import scripts, SQL routines and archived writers. Read-only consumers were inspected to distinguish them from writers.

| Writer / entry point | Existing behavior and authority | Required replacement |
| --- | --- | --- |
| api/test-session PUT normal and institute branches | Clerk-owned session; either zi_commit_bank_submission RPC or direct test_attempts/user_answers INSERT plus institute UPDATE; local process lock only | One guarded DB submission transaction, lifetime session registry; no legacy direct fallback after cutover |
| zi_commit_bank_submission SQL | Owner definer; serializes cooperating callers; trusted supplied scores; direct legacy inserts bypass it | Keep compatibility entry point, enforce uniqueness with table trigger/registry; route supported callers to authoritative scoring and transactional base reward |
| Generated test store/start/save/submit RPCs | Separate private generated tables and public session; no normal attempt/XP reward | Preserve isolation; reject using generated sessions as normal reward sources |
| api/test-session inline addXpWithAdmin/updateStreakWithAdmin + after callback | Service absolute XP/stats upsert and non-durable callback | Remove absolute writes; commit base reward/stats/streak with saved source and durable receipt |
| api/pyq-attempts POST | Clerk-bound owner; server scoring; pyq_attempts insert then absolute XP upsert in another transaction | Atomic request receipt + persisted attempts + derived XP; same request immutable; independent source entitlement prevents fresh-key farming |
| utils/xp.addXP | Service read/add/upsert; arbitrary amount; invoked by badgeEngine | Source-specific DB claim only, no generic arbitrary-delta public API |
| utils/badgeEngine awardEligibleBadges | Inserts unique user_badges first, then XP separately; eligibility computed in JS | DB-verifiable eligibility; badge row and receipt/balance in one transaction; seed historical badge entitlements without paying again |
| utils/leaderboard.initUserLeaderboard via dashboard layout | Browser client SELECT-then-INSERT zero balance | Server init RPC, INSERT ON CONFLICT DO NOTHING; never reset existing XP/streak/name |
| utils/streak server action | Browser table update; accepts supplied owner/date inferred at caller | Retain Clerk binding, derive from persisted activity; no client-set counter/date |
| prepzii_deliver_goal_rewards | Own goal receipt/atomic additive XP, but unrestricted writers can overwrite it | Use common protected balance/receipt kernel while preserving old receipts/progress |
| prepzii_record_formula_access | Server-entitlement-verified book access; durable source capture | Retain no-delta API; reward only via common delivery kernel |
| api/update POST | Already rejects unverified counters | Remain closed; no fallback |
| services/profile.service | Writes user_profiles only; no XP write | Keep profile flow; use idempotent zero-only initialization separately |
| services/profile.server, utils/profile, dashboard-stats, PYQ leaderboard, analytics readers | Read XP/attempts; no absolute balance write found | Preserve read access and response shape |
| scripts/replace_neet_2024.mjs | Administrative replacement deletes/reinserts pyq_attempts through a dynamic insertBatches helper | Not a live app writer; old service-key mutation must fail after cutover. Requires separate audited maintenance/import path; do not execute here |
| scripts/archive/test_upsert.js and archived goal/test scripts | Historical direct table mutations | Unsupported after cutover; database must deny them rather than trusting archive status |
| increment_xp / handle_new_user | Production routines reviewed privately in prior phase, not loaded in lab; increment_xp is invoker additive UPDATE without caller/amount validation | Direct XP mutation denied to application roles; protected balance trigger also rejects unreceipted changes through old owner routines. Revalidate private dependencies before production cutover |

No additional active normal-attempt or XP mutation sites were found in the searched app/service/util files. Dynamic .from(table) in adminImportPackages is read-only; the replacement script's dynamic writer is included above. Import/archive scripts were not run. Other unknown external jobs or SQL routines remain a production catalog/cutover inventory gate; this repository scan is not proof that no external writers exist.

Planned enforcement: lifetime registry seeded from historical session groups with all old groups reserved; preserve duplicate rows and balances exactly; no blind unique index or retroactive awards. Separate private ledger owner with no application SET/membership path; common receipt kernel, row-lock additive XP and unforgeable private transaction permits; revoke direct runtime mutations on protected tables/columns and verify effective/inherited rights. Existing admin/table owners remain trusted for DDL, not application credentials. Production policy/history reconciliation and compatibility approval remain separate.
