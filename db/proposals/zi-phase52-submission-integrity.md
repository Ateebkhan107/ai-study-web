# Phase 5.2 submission integrity proposal — NOT APPROVED FOR APPLICATION

This is a design, not an executable migration. Do not create an index or mutate historical records from it. Full catalog evidence, staging verification, exact SQL review and separate application approval remain required.

## Preserve history while preventing new duplicates

A unique index on existing `test_attempts(session_id)` cannot currently succeed: 21 session groups contain 36 excess records. Do not silently pick the first row, delete duplicates, renumber sessions or backdate a partial-index cutoff.

Prefer a new private **submission registry** for normal tests. Its primary key is `session_id`; a unique `attempt_id` links the committed attempt. Explicit session/attempt foreign keys, authenticated owner validation, RLS/ACL restrictions and a trusted function owner must be designed against the verified schema. An attempt FK can be deferred if the registry claim is inserted before the attempt in the same transaction. This puts uniqueness on new registry rows without indexing or altering the duplicate historical set. The exact constraints/ordering require a separate migration review.

The authoritative server-scoring/commit transaction should:

1. Lock the owned base session. Check its question source, timing and allowed state.
2. Inspect all previous attempts for that session. Return one only if its owner, answer set and institute association are complete and unambiguous. Historical duplicates, partial records or owner mismatches require review; never insert another attempt or award another reward to resolve them automatically.
3. If no previous attempt exists, claim the unique registry session key, then persist attempt, answers, institute association, base-session completion and reward events in one transaction. A conflict must roll back and return/recheck the committed canonical receipt; do not schedule rewards from an HTTP retry.
4. Persist a unique reward event keyed by submission/source and reward type, even for zero-correct tests that still affect goals/streaks. A durable outbox consumer applies XP/counters/goal/badge effects transactionally and idempotently. Aggregate XP read/modify/write and `after()` callbacks alone cannot provide exactly-once accounting.

The registry works only when **every authorized writer is routed through that protocol**. Verify and restrict direct DML on attempts/answers/registry for browser and application roles, including inherited grants, and grant only the reviewed commit entry point. SECURITY DEFINER ownership must be unreachable by application roles. BYPASSRLS does not itself replace table privileges. Do not blindly revoke privileges on shared tables without auditing every application dependency.

Drain or update legacy service-role deployments, old client helpers, institute paths and background jobs before enforcing restricted DML. A rolling old writer that directly INSERTs must fail closed after cutover; it cannot be allowed to bypass the registry. Administrative owners remain trusted, and deliberate administrative writes require an explicit controlled procedure. An advisory lock or in-memory guard by itself does not constrain nonparticipating writers.

Normal atomic submission rollout should be independent of the generated engine. Local code provides the default-off server flag `ZI_BANK_ATOMIC_SUBMISSIONS_ENABLED`; it must not be enabled before its RPC migration is separately approved/applied. Generated submissions retain their own private session uniqueness, no shared attempts/rewards, and remain disabled.

## Historical reconciliation and optional archival

No cleanup is necessary to retain history while introducing a new registry, but ambiguous old sessions must remain blocked for submission until reviewed. If a future policy requires indexing the old attempts table, a separate archival/reconciliation project is necessary first:

- Take an authorized backup/snapshot of every candidate and all incoming FK, trigger, logical and JSON references. Record original IDs and checksums in a private immutable archive/audit mapping; initially copy, do not move or delete.
- Review each group with its student/session ownership, answers, provenance, request logs and institute associations. Similar scores/timing do not establish which row is canonical or whether any reward was paid. Preserve genuine retakes as distinct sessions only under an explicit reviewed product policy.
- Reconcile XP, streaks, badges and goals only from reliable reward provenance. The theoretical 375 additional correct-answer XP in the audit is not evidence of actual payment and must never be automatically subtracted.
- Obtain separate approval for any proposed pointer changes, archival/movement or deletion, including the exact affected rows and recovery plan. Unknown FKs/trigger side effects block cleanup. Keeping all rows indefinitely is an acceptable outcome.
- Only after verified zero conflicts, writer cutover and explicit approval may the existing commented `CREATE UNIQUE INDEX CONCURRENTLY` proposal be reconsidered. Run it outside a transaction, verify index validity/readiness and plan for failures. No such index is approved or applied here.

## Required verification before rollout

Use representative staging schema/policies and at least two independent application workers. Race fresh submissions, lost acknowledgements, malformed/NULL answers, failed answer writes, institute failures, expired sessions, duplicate historical rows and worker crashes. Exercise a legacy direct INSERT after DML restriction and verify denial. Replay outbox events and reward retries to prove one committed result and one application of each reward. Generated tests must remain source-separated and disabled during this normal-test rollout.

The current local worker guard is deliberately tested to permit overlap across separate guard instances. It reduces same-worker retries and safely recognizes complete saved results; it is not the proposed database guarantee. The existing proposed atomic RPC covers cooperating callers but does not yet implement this registry or durable reward outbox.
