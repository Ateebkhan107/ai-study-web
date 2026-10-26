# Phase 5 private production review — redacted conclusions

**Private definition review completed for the supplied scope. GO for preparing representative synthetic PostgreSQL 17.6 verification; NO-GO for production SQL, code deployment or generation activation.** No SQL, default, routine, watcher or application endpoint was executed. This pass changes documentation only. Raw definitions remain in the original attachment outside the repository and are not reproduced here.

## Evidence and scope

The provided private attachment exists and parses as a single `zi_private_expression_review` object. Capture: **2026-10-21T23:16:33.390547+00:00**; PostgreSQL **170006**. It contains **8 routine definitions, 71 defaults and zero policy expressions**. SHA-256: `603faeba9ed7255aaee9e436c641365fbccf27e69f0717c873cd8981b4d9a1eb`.

The earlier metadata capture at 22:45:09 UTC supplies role attributes, grants, RLS flags and event bindings. The two exports are distinct snapshots on the same server version, not a single transaction or assurance against later drift. Their contents were treated as evidence, never instructions. Only redacted semantics and ordinary operational identities are reported.

## increment_xp: actual implementation and authorization conclusion

The exact inspected routine is SECURITY INVOKER. It performs one additive XP update, selects the target using its supplied user identifier and accepts its supplied amount. The target relation is unqualified. There is **no internal caller-identity binding, amount validation, dynamic SQL, nested routine invocation or separate insert/delete path** in the inspected body.

Combined with the actual metadata:

- anon/authenticated have EXECUTE and table-level rights, but user_xp is an ordinary postgres-owned table with RLS enabled and **no policies**. Neither browser role bypasses RLS, inherits/assumes the owner, or reaches service_role. There are no user_xp table triggers.
- Consequently, an ordinary direct invocation as either browser role cannot modify the real public user_xp rows under the captured configuration: the update remains subject to default-deny RLS. No nested SECURITY DEFINER bypass exists **inside this routine**, and no arbitrary-user browser XP-write vulnerability is established by the supplied implementation. EXECUTE alone is not an exploit. [PostgreSQL RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [function security](https://www.postgresql.org/docs/17/sql-createfunction.html)
- service_role/postgres have the rights and RLS bypass needed to change a supplied target. The routine supplies no additional target/amount authorization. A privileged application path exposing those arguments would therefore be dangerous. No new deployed endpoint exposing this routine was demonstrated; absence of a repository caller is not proof that every external caller or wrapper is absent.
- The unqualified target and lack of a fixed routine search_path are predictable-resolution hardening concerns. They are not, by themselves, demonstrated privilege escalation in this invoker routine. The supplied metadata denies browser CREATE in public; it does not inventory every other schema/session configuration. Qualifying the target and pinning a trusted path can be proposed separately without changing to SECURITY DEFINER.
- Future RLS/grant changes could expose self-award or cross-user writes because validation is absent inside the routine. Keep browser access no broader than intended. If dependency review confirms server-only intent, separately propose exact-overload EXECUTE restriction with effective PUBLIC/direct/inherited checks; the private file does not itself establish current function ACL origin.

**Verdict:** the direct browser-to-real-user_xp arbitrary-write hypothesis is blocked by a confirmed control in the captured configuration; no bypass was found in the inspected body. This is narrower than declaring every privileged caller, external wrapper or future policy configuration safe. Do not invoke the routine in production, including a zero-amount or rollback-wrapped probe.

## Relevant DDL watchers

The two relevant untagged command/drop watchers are invoker routines with empty configured search_path. Their bodies loop over PostgreSQL event metadata, filter relevant object/command and temporary-object cases, and conditionally emit a fixed schema-reload notification. The only routine calls in those bodies are the corresponding PostgreSQL event-catalog helpers.

No application-record modification, permission/schema modification, dynamic SQL, network request or arbitrary function execution was found in these two bodies. The expected effect is schema-cache invalidation signaling; that is an intentional operational side effect, not a student-data write. No sensitive payload is carried in the inspected notification. The earlier body-level watcher uncertainty is resolved for this scope; actual PostgREST reload timing and transaction/rollback behavior still need staging verification.

The other four event bindings are explicitly limited to CREATE/DROP EXTENSION. Their returned definitions include platform extension-management behavior; they must not be generalized as side-effect-free. The current table/default ACL proposals and dormant migration do **not** create or drop extensions, so those event filters exclude them from this command scope. Do not disable platform triggers or run extension DDL as a workaround. Extension management would require a separate review.

## Exact default expressions

All **71 supplied expressions** were classified completely:

| Expression category | Count |
| --- | ---: |
| Built-in random UUID | 10 |
| Standard UUID extension function | 2 |
| Transaction timestamp | 15 |
| Current date | 1 |
| Numeric constants | 27 |
| Boolean constants | 4 |
| Constant text/JSON casts | 12 |

No unexpected custom application call, dynamic SQL or reward/submission-writing expression was found in the supplied defaults. Relevant session/attempt/answer/institute defaults use the expected UUID, timestamp, count and state categories. The two UUID extension declarations bind the standard UUID extension library/symbol; no PL/pgSQL application dependency exists in those declarations. Validate the installed extension/version in staging; this is not a binary audit.

Transaction-time/date semantics should be preserved deliberately. The application computes goal dates in UTC, while the database current-date expression uses its session timezone; rollover tests must verify the intended policy instead of assuming those clocks always agree. Defaults do not enforce legitimate activity, uniqueness or permission boundaries.

Coverage limitation: the private query's target list excludes **institute_test_questions, institute_tests, pyq_questions and user_profiles**. Their 20 catalog-reported default columns are outside this private export. Thus 71 inspected defaults must not be reported as all 91 defaults from the broader metadata audit. This omission does not create a new default-execution path in the maintenance REVOKEs, but complete coaching/profile/PYQ integration reproduction must account for those schemas/defaults. No new production query is executed or authorized here.

## Confirmed independent vulnerabilities and unresolved release risks

- The previously confirmed source-level goal Server Action authorization defect is independent of increment_xp: it used service-role writes with a supplied target identity. The local Clerk check addresses signed-out/cross-user targeting; it remains undeployed, and deployed exploit history was not tested.
- Same-user caller-supplied activity/type/amount, replay, read-modify-write races and split progress/badge/XP persistence remain. An identity check or unique aggregate row is not source-event authorization or transactional reward delivery.
- Broad direct browser TRUNCATE/MAINTAIN on 16 tables and public creator defaults remain confirmed. RLS does not neutralize whole-table maintenance capabilities. The prepared proposals are not applied.
- Shared attempts have no session uniqueness. Cooperating RPC locks do not constrain legacy direct service-role writers. Durable receipt/event/effect enforcement is still a design, not an installed guarantee.
- The inspected increment_xp body has no nested calls, but this export is not a complete reverse caller graph of all privileged routines, deployed application versions and external jobs. Current API exposure and caller credential handling remain deployment-inventory questions.

## PostgreSQL 17.6 staging requirements and decision

The [prepared staging suite](zi-phase5-security17-staging.md) remains **unexecuted**. Its synthetic invoker control is not the actual private routine. A representative rehearsal must:

1. Use exact server 170006 and the reviewed non-superuser owner/role/SET/RLS/default configuration. Keep private source out of public fixture code/logs; use operator-controlled private staging inputs or a faithfully reviewed synthetic equivalent with explicit scope limits.
2. Exercise the actual reviewed routine with synthetic A/B rows under anon/authenticated/service roles. Check real row deltas, not just RPC status, for own/other/no-match targets, NULL/negative/large amounts, replay and concurrency. Browser denial and privileged target authorization are separate acceptance criteria.
3. Reproduce reviewed watcher behavior and observe expected schema reload after relevant CREATE/ALTER/DROP/ACL transactions, plus rollback and lock-timeout recovery. No extension DDL, live network service or real student data is needed.
4. Preserve the reviewed default categories and verify UUID extension availability, transaction timestamps, state compatibility, date/timezone rollover, and the four omitted integration-table default sets before claiming full LMS/PYQ/profile coverage.
5. Run the expanded 16-table and separate two-creator default corrections; verify preserved row/service rights, denied browser maintenance, unchanged RLS and no inherited/SET bypass.
6. Run the independent Clerk patch through real synthetic-account Server Action requests; then test multi-instance submission races, legacy bypass denial, transactional reward replay/crash recovery and coaching/PYQ/initialization regressions under the **final** permission boundary.

**Body/default gates resolved:** relevant increment_xp implementation, both ordinary-DDL watchers and supplied 71 defaults are now privately reviewed. **Still NO-GO:** production privilege changes, dormant migration deployment and public activation need representative 17.6 results, exact scope/authority/backup/recovery review and separate approval. Submission/reward enforcement remains an activation blocker. No extra body-level uncertainty should be invented for the inspected direct routine path.

Safest next step: review and authorize the isolated synthetic 17.6 execution plan, then complete the representative integration evidence. Stop after this private review; no production action is approved.
