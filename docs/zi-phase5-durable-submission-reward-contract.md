# Database-enforced submission and reward contract — design only

**Not an implemented or approved production migration.** Revision 4 and the maintenance/default proposals do not deliver this contract. The current service_role can bypass the cooperating RPC with direct DML; preserving that capability and claiming non-bypassable submission uniqueness would be contradictory.

## Trust boundary and chosen enforcement model

Prefer restricted runtime mutation privileges plus narrowly granted owner-only SECURITY DEFINER entry points and database constraints. Legacy **and** new runtime credentials must lose direct mutation access to authoritative attempts/answers/receipt/event/effect/XP state before the guarantee is claimed. Keep necessary launch/read/authoring rights on unrelated operations through separate entry points/roles. Browser maintenance corrections preserve existing service access today; the later mutation cutover is a separate, explicitly approved compatibility change.

Retaining the old service key with unrestricted relevant DML means this gate fails, even if most code uses the new API. Inventory and update every reward writer, deployed revision, external job and callable privileged routine first. Stage denial using the **old service credentials as well as any new dedicated runtime role**. Database owner/superuser administrators remain a trusted maintenance boundary; no SQL design can prevent an authorized owner from dropping/disabling its own enforcement. Require a controlled, auditable administrative procedure.

A trigger/registry alternative would need to cover every INSERT/UPDATE/DELETE/FK cascade and prevent runtime trigger disabling, replication-role changes, TRUNCATE and writable privileged helper bypasses. It is not selected as a shortcut here: RLS alone does not constrain service_role, a cooperative advisory lock alone does not constrain direct writers, and a registry side table alone does not constrain legacy inserts. Do not solve compatibility by leaving a fallback open.

## Canonical submission transaction

1. API authenticates Clerk on every entry point; supplied owner/score/counters are untrusted input. The current service JWT is not a Clerk identity proof at the database boundary. Either use a verified Clerk-bound database identity through a reviewed gateway or explicitly trust only the server scoring/identity layer with a tightly scoped role. Never assert that an arbitrary `p_owner` argument authenticates the caller. Recompute score from immutable server/database-owned question keys and the answer snapshot; do not accept client score or XP.
2. Use a new private receipt/registry table with **PRIMARY KEY(session_id)** and UNIQUE(attempt_id), owner/source/version metadata and immutable payload digest. FK references the existing session and canonical attempt, with approved ordering/deferrability. Do not add a unique session index to the historically duplicated attempts table. Lock the owned session and validate timing, source, complete question membership and institute ownership.
3. If historical attempts exist, require exactly one complete, owner-matching result and consistent institute association, or return a conflict. Do not select/delete a canonical historical duplicate implicitly. Historical receipts/rewards require provenance review; never retroactively award on retry solely because a receipt/event is missing.
4. New commit claims the registry session key, creates attempt+complete answers, closes institute/session association and stores a stable receipt in **one transaction**. All required FKs/checks hold at commit. Unique registry claim is the concurrency arbiter. A retry with the same normalized payload/version receives the same receipt; incompatible reuse is rejected without changing committed answers or awarding again.
5. Attempts/answers/receipt and post-submit question/source bindings become immutable to runtime callers. Protect registry/attempt deletion through FK RESTRICT or the controlled retention protocol, including cascades from shared test/institute records. Legacy NULL-session insertion and identity/session reassignment must be denied after cutover. Existing history is retained without rewriting it.
6. In that same transaction insert uniquely keyed reward events/outbox items for the authorized effects, including a zero-correct submission that still affects goals/streaks. Receipt commit succeeds if and only if its durable event creation succeeds. HTTP retries do not schedule awards via an independent `after()` callback.

Concrete new schemas, constraint names, grants, FK ordering and API signatures must be implemented/reviewed separately against the full verified schema. This document is not executable DDL.

## Transactional reward effects

- Private event key includes immutable source instance/receipt ID, reward kind, policy/version and where appropriate goal-day/badge scope. A fresh client idempotency UUID alone is not a proof of fresh activity; a caller must not mint another key to replay the same source. PYQ intentional retakes require distinct authorized attempt instances rather than global deduplication on question ID.
- Worker claims durable events with bounded leases/locks and retries; application of each DB effect, its unique applied-event marker and processed state occurs **in one transaction**. No marker-before-effect or badge-insert-before-XP split. On crash the transaction rolls back or both effect and marker persist. Outbox delivery may be at least once; database effects must be idempotent.
- Lock/update XP additively, not read-modify-upsert outside a transaction. Serialize conflicting per-user goal/day transitions, create a unique goal-completion reward event, and atomically award badges with their XP effect. Record policy/date/timezone inputs immutably; day changes must not convert a retry into a new source event.
- Runtime app callers cannot directly INSERT arbitrary events, mutate processed markers, alter XP/progress/award rows or invoke old arbitrary-increment privileged functions. Review all indirect EXECUTE paths, defaults and triggers. Exact role/column grants and SET inheritance are part of enforcement.
- Side effects outside PostgreSQL need their own provider idempotency/reconciliation contract. Do not claim a DB transaction makes an external email/payment exactly once.

## All-writer cutover and recovery

1. Build revised commit and effect paths, audit private routines, and migrate normal test, PYQ, goals, badges, streak, initialization and job callers in representative staging. Preserve active coaching launch/authoring/read functionality through explicit permissions.
2. Rehearse old and new versions concurrently, initially demonstrating the known bypass. Then rehearse the final permission boundary and require old direct writes to fail closed. Capture the exact dependency/credential matrix and application/SQL checksums.
3. Plan a bounded submission/reward maintenance window or a genuinely backward-compatible gateway to the **same** enforced commit API. Drain old workers/jobs, pause mutations, apply separately approved enforcement/role changes, deploy validated callers, deny all bypass credentials, and verify the gates before reopening. Do not claim a rolling deployment alone drains old direct writers.
4. Resume durable workers; replay stored events under their immutable keys and compare receipt/effect counts and additive aggregates. No historical XP deduction or backfill without provenance and separate approval.
5. Roll back code only to a version compatible with the enforced protocol, or pause affected mutations. Keep receipts/events/constraints. Prefer roll-forward; no automatic GRANT ALL or re-enabling arbitrary legacy DML. Compensating accounting events require explicit reconciliation approval.

## Required acceptance gates

| Gate | Required result |
| --- | --- |
| New submission, 20 simultaneous requests on multiple workers | One complete attempt/answer set, one registry receipt and one logical reward event set |
| Lost response / same payload retry | Same canonical receipt, no new effect |
| Same key/session with changed payload/source/owner | Denied; no overwrite or new reward |
| Historical multiple/partial/cross-owner result | Conflict, zero historical mutation or automatic reward |
| Old service-key direct mutation, browser/column/inherited/SET bypass, arbitrary reward routine | Permission denied or enforced equivalent contract; never a silent success |
| Runtime TRUNCATE/DELETE/cascade or marker/event mutation | Denied unless through explicit reviewed retention/admin procedure |
| Crash at every write/effect boundary | No partial committed submission; exactly one eventual authorized DB effect |
| Concurrent distinct sources for same user | Additive XP preserved; no lost update, duplicate badge/goal reward or date-reset replay |
| Negative/huge/client-supplied XP/type/count, repeated authenticated goal call | Rejected or derived from a verified source under policy; authentication alone is insufficient |
| Coaching/PYQ/profile/analytics regression | Legitimate flows and ownership checks preserved; no permissive RLS workaround |

Until these gates pass with the final role configuration and all deployed/external writers, distributed submission and reward idempotency remain **NO-GO**. Neither a passing cooperating-RPC smoke test nor the present maintenance-grant proposal is acceptance of this contract.
