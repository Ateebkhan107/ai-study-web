# Phase 5 final manual verification instructions

**Safety verdict: PASS for read-only database integrity, for the exact scripts below on the expected trusted PostgreSQL 17.6 server.** The private script additionally requires controlled handling of its sensitive output. This approval concerns manual verification only; production privilege corrections, migrations and activation remain unapproved. Neither script was executed during this review.

## Exact reviewed files

| Order | File | SHA-256 |
| --- | --- | --- |
| 1 | [Catalog metadata](../db/audits/20261022_zi_security_readiness_catalog.sql) | `fc3711f79457720fb754de1bcbc1021a7e8db3ea7fa800b241c52a0a8c842f1d` |
| 2 | [Private expressions](../db/audits/20261022_zi_security_private_expressions.sql) | `7e1f5ec743400ea8da091602a39e34ae42092a95aab6a8632bea4a2b236fadac` |

The SQL files are unchanged by this safety review. Any edit, AI rewrite or appended statement requires another review. Do not combine these files with the privilege proposal, forward migration or rollback.

## Strict integrity review

Both files have one `WITH … SELECT` statement and one terminating semicolon. All CTEs are SELECTs. Every FROM/JOIN source is a `pg_catalog` relation/function or a preceding catalog-derived CTE; neither scans application records. All explicit function calls are qualified `pg_catalog` metadata/privilege/deparse/JSON functions. SQL conditional/aggregate expressions and built-in casts add no application execution path.

- No INSERT, UPDATE, DELETE, MERGE, TRUNCATE, DDL, GRANT/REVOKE, CALL, DO, dynamic EXECUTE, COPY, explicit lock request, sequence advancement, application RPC or network/file-export function appears.
- No SET, RESET, set_config, ALTER SYSTEM, role switch or transaction control appears. **They change no database settings at all**, including session settings. They do not currently install transaction-local read-only/time-limit safeguards; classification rests on reviewing the exact SELECT and its functions, not a claim that the SQL Editor session is already READ ONLY.
- Privilege inquiries inspect authorization; `pg_has_role(...,'SET')` asks whether switching is allowed and does not switch roles. `current_setting` reads the version without changing it.
- The catalog script inspects `pg_proc.prosrc` only for a Boolean/name-based candidate match and never returns or invokes that source. `pg_roles` supplies role attributes, not stored password hashes. Definitions/default/policy expression text are withheld in this first script.
- The private script's `pg_get_expr` and `pg_get_functiondef` deparse catalog definitions. A returned string containing CREATE, UPDATE or a secret is **data in the result**, not an executed command. Do not paste a returned definition back into a query editor and run it. [PostgreSQL metadata functions](https://www.postgresql.org/docs/17/functions-info.html)
- Selecting these catalogs does not fire application table-write or DDL event triggers, nor evaluate the target column defaults or policy predicates. JSON construction serializes the selected metadata.
- Neither script includes RAISE/NOTIFY, application logging, public upload, Git commands or automatic export.

Accordingly, these exact scripts contain no path to modify production application records, grants, schema or database settings under normal PostgreSQL built-in behavior. This is a static source review, not an executed syntax/performance test or a guarantee about a compromised server or modified built-ins. Ordinary query activity can still consume resources, take read locks, and appear in provider query history/diagnostic statistics; read-only does not mean zero operational footprint. A timeout/error is not permission to change settings persistently, grant access or execute proposed fixes.

## Exact execution order in Supabase

1. Open the intended PrepZii production project and **SQL Editor** using your existing authorized account/role. Confirm the project/environment before running anything. Prepare an access-controlled, preferably encrypted local export folder **outside this repository, all other Git repositories, and shared/synced folders**. Do not place production results in `docs/`, `db/`, Downloads shared with others, or a public ticket.
2. Open a fresh query containing **only the complete catalog metadata file**. Run the whole statement once; do not select an internal CTE fragment. Do not accept AI-generated edits or run anything from a migrations/proposals tab.
3. Expect **one row**, column `zi_security_readiness`. Confirm `server_version_num` is `170006`, `captured_at` is current, and `executor` is the expected authorized role. A different server version requires compatibility review; do not alter the server to match. Confirm all four application roles and the six known shared tables appear. Generated tables are expected absent before migration; absence must not be interpreted as an installed/private-ACL pass. Any missing dependency table, permission error, timeout or incomplete payload remains unresolved evidence. Stop on errors and share only sanitized error text/SQLSTATE.
4. Export the first result using the instructions below. Inspect/redact a **copy** locally before sharing. Do not send a full operational role inventory without reviewing custom names for sensitive identifiers.
5. Only after you have a private output-handling arrangement, open a separate fresh query containing **only the complete private expressions file**. Run the whole statement once with the same authorized role/project. Expect **one row**, column `zi_private_expression_review`. No proposed correction or migration needs to run first.
6. Export the second result directly to the private local folder. Inspect it locally. Do not paste it into chat, Supabase AI, an online JSON formatter, a public issue, logs or a repository. Return only the summary described below.
7. Stop. Do not run the correction proposal, migration, rollback, cleanup or any function definition from the results. These two SELECTs provide separate snapshots; if schema/roles/defaults change between them, disclose that drift and obtain matching fresh evidence rather than treating them as one atomic snapshot.

If provider/browser retention is incompatible with your confidentiality requirements, **do not run the private expressions script in SQL Editor**. Use an already authorized private database client/export workflow after confirming its logging controls; that alternative must still execute only the reviewed SELECT. Neither the scripts nor this review can disable or guarantee Supabase, browser, clipboard or organizational retention. Supabase documents SQL Editor execution history. [Supabase SQL Editor](https://supabase.com/features/sql-editor)

## Exporting complete results

Supabase's current Studio tests show results-menu actions **Export → Copy as JSON** and **Export → Download CSV**. Labels can differ across versions. [Supabase Studio source](https://github.com/supabase/supabase/blob/master/e2e/studio/features/sql-editor.spec.ts)

- **Catalog:** Export → Copy as JSON, then paste into a trusted local text editor and save outside Git; alternatively use Download CSV. Do not copy the visually shortened preview cell. JSON export normally wraps the single row as `[{"zi_security_readiness": {...}}]`; some clients may encode the value as a JSON string instead. Preserve the full exported structure.
- **Private expressions:** prefer Export → Download CSV to avoid putting definitions on a synchronized clipboard. Save directly to the private folder. CSV contains a header and one quoted JSON field, with escaped quotes/newlines; keep the original CSV. Use a trusted local CSV/JSON reader for inspection, not manual unescaping or an online conversion service. If JSON copy is your only option, use it only with approved private clipboard handling and clear the copied sensitive value afterward according to your normal policy.
- Open the saved file locally and verify it parses completely, has one row/the expected result key, and includes the final `limitations` array without ellipses or truncation. A successful one-row query does not prove the cell was exported fully. Re-export if incomplete; do not increase permissions or modify the query to persist results in a database table.
- No production output was generated, logged, saved or committed by this agent. The committed/reviewable assets are query text and instructions only. Keep future raw outputs outside Git; do not attach them to a PR or include their contents in a commit message. Restrict local file access to the reviewer and retain/remove files under your normal confidential-data policy.

## What can be shared

“Safe to share” below means a reviewed minimum in this authorized conversation, **not public publication**. Custom object/role names can themselves reveal sensitive information. Redact or consistently pseudonymize them while preserving the direction of grants/membership; do not redact a dangerous grant into an apparent absence.

| Result | Shareable minimum after local review | Keep local |
| --- | --- | --- |
| Catalog identity | Capture time, version, expected executor identity or consistent alias | Project connection URLs, credentials, browser account details |
| Table/column ACLs | Six known table names, standard anon/authenticated/service_role/authenticator names, privileges, direct/PUBLIC/inherited/SET origin, relevant owner reachability | Unrelated/custom role and column names that identify people or private systems |
| Defaults/roles/events | Global versus public default scope, relevant grant flags, event-trigger count/event/tags/enabled state, routine owner/security/path safety conclusions | Full unrelated role inventory; any sensitive schema/path/name literals |
| Private defaults | “UUID default is the expected built-in”; timestamp/status/counter behavior reviewed; unexpected custom dependency yes/no | Raw expressions, literal defaults, personal values, secrets, connection strings |
| Private routines/policies | Relevant writes/callers, SECURITY DEFINER/INVOKER, trusted search_path, side effects, authorization/uniqueness findings, safe/unsafe/unresolved verdict | Full definitions, embedded tokens/URLs/personal literals, raw policy expressions |

A useful redacted private-review summary is:

```text
Snapshot time / server version / expected executor:
Column ACLs and inherited/SET paths: reviewed | unresolved; findings:
Default ACLs: creators/scopes and relevant TRUNCATE/MAINTAIN grants:
UUID/time/status/counter defaults: expected | unexpected | unresolved:
DDL event triggers: none | reviewed safe | unsafe | unresolved; reasons:
Custom table triggers / transitive dependencies: findings:
increment_xp + reward policies: auth/target binding and replay findings:
Sensitive literals encountered: yes/no (do not include the literals):
Missing permissions/output/dependencies or schema drift:
```

Privately trace custom functions called by defaults, event triggers and reward routines, including dynamic SQL. Source-name matching and `pg_depend` are incomplete discovery mechanisms; pinned built-ins may lack dependency entries. A returned empty list is not proof that every transitive path is harmless. Review reward-table policy identity binding and unique event/award keys without exposing body literals. Do not invoke any candidate routine to test its effects in production.

## Remaining approval conditions

**Privilege correction:** fresh complete ACL/column/membership/SET/owner evidence; no surviving browser maintenance/owner path; exact six-table TRUNCATE/MAINTAIN scope; confirmed operator authority; reviewed DDL event-trigger behavior for REVOKE; PostgreSQL 17.6 staging regressions for Clerk, Supabase/community, PYQ, test, institute and XP initialization; captured exact ACL recovery baseline; then separate approval of the exact SQL. Global and per-schema creator-default corrections require their own scope/authority review and approval; per-schema revocation cannot override global default grants.

**Dormant revision-4 migration:** fresh compatible schema/no unexpected object collisions; privately reviewed relevant default expressions and DDL event triggers/dependencies; trusted owner unreachable by application roles; effective private table/column/function isolation including MAINTAIN and inherited access; representative PostgreSQL 17.6 rehearsal; reviewed backup, bounded execution and rollback/retention plan; all feature flags off; approved disposition of existing broad grants; then explicit migration approval. The prior PostgreSQL 18/212-entry test result is historical evidence, not this required rehearsal.

**Activation remains separately NO-GO:** all submission writers coordinated, database-enforced durable commit/idempotency, durable reward accounting/crash recovery, generated-source/privacy/end-to-end checks and provider quality/quota/access gates. Catalog verification alone does not satisfy these or authorize duplicate deletion.

Stop after preparing these instructions. No production changes are authorized.
