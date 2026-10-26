# Phase 5 historical reward cutover policy

2026-10-22. Prepared for review; no production operation is authorized. Phase 5 feature development is frozen.

The cutover preserves every existing XP balance, profile counter, goal-progress row, badge marker and historical attempt. It does not recompute balances, remove duplicates, repair earlier losses or back-pay missing rewards. A private opening snapshot and source reservations record the boundary while writes are locked. Future balance changes must equal committed, unique receipts added to that opening balance.

Historical non-null test sessions are reserved for life. All duplicate rows remain; no canonical row is invented for a conflicting group. A complete, single historical result may be returned without payment. Ambiguous or incomplete histories return a safe conflict. Old null-session attempts remain unchanged; new supported submissions require an owned session. These rules apply to the compatibility RPC too; direct legacy inserts must be denied after cutover.

| Area | Release candidate behavior | Approval state |
| --- | --- | --- |
| Existing XP and earned rewards | Preserve exactly; no retroactive payments or deductions | Required by the release request |
| Badge accounting | Preserve original historical eligibility basis, including old duplicate/retake counts; count only verified distinct new activity | **Approved by the user on 2026-10-22** |
| Already earned badges | Keep marker and historical balance; never pay again | Required preservation/idempotency rule |
| Historically eligible but unclaimed badges | Record eligibility privately; do not create a public marker or automatically pay XP | Conservative no-retro default; **product decision pending** on whether to show a badge without XP or leave it held |
| Historical TEST/PYQ/badge sources | Reserve as consumed rather than infer whether a missing payment occurred | **Confirm policy**, especially old unanswered PYQ rows: these currently reserve the question too |
| New PYQ base reward | First answered question per user lifetime: 10 XP correct / 2 XP wrong; first answer determines entitlement; a new request key cannot repay it | **Product approval pending**; the badge decision does not approve this separate base-XP rule |
| Existing goal periods | Preserve progress/completion; freeze payment for each already recorded date/goal period; later periods use verified events | **Product approval pending**, including the cutover-day pause for incomplete goals |
| New PYQ goals | One answered distinct question per UTC day; request replay does not count | **Product approval pending** |
| Missing/incorrect historical rewards | Leave unchanged; reconcile only through a separately approved, auditable process | No reconciliation authorized |

The opening badge basis uses the original JEE default, threshold directions, timestamp rank ties, truthy field fallbacks and rounding. This deliberately preserves historical behavior; it does not introduce a NEET badge redesign or reinterpret “Mock Test Ace” as a count of mock tests. See [badge parity](zi-phase5-badge-parity.md).

Source, receipt, balance and progress changes commit together. A rollback leaves no reward or reservation; a committed request whose response is lost returns its saved result on retry. Initialization cannot reset a balance. Before migration commit, abort the whole migration on any precondition failure. After commit, rollback means pausing writes or returning to a vetted contract-compatible application; it never means restoring unsafe grants/upserts or deleting receipts/reservations.

The migration's policy token is an operator safeguard, not evidence of product approval. The rehearsal supplies it only for synthetic data. Production execution remains blocked until the pending decisions above and the release checklist are approved separately.
