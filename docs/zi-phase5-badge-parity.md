# Badge eligibility parity at the Phase 5 boundary

2026-10-22. All nine supported rule types were compared with the original `badgeEngine.js` implementation and the current admin rule selector. No production badge definitions or student rows were fetched. The live badge catalogue, unsupported types, enabled flags, thresholds and reward amounts still require private representative staging validation.

The user approved preserving historical eligibility while counting only verified distinct activity after cutover. Accordingly, `badge_opening` snapshots the old aggregation once, and current stats add only receipted new TEST/PYQ sources. Claims and display now use that same database basis. Public earned markers and balances are unchanged during migration. A historical unclaimed entitlement is held from payment, as documented in the [cutover policy](zi-phase5-historical-reward-cutover-policy.md).

| Rule | Original eligibility | Release parity/correction |
| --- | --- | --- |
| `tests_completed` | JEE-filtered attempt count >= target, without status/dedup filtering | Opening count preserves all old rows; each verified new lifetime submission adds one |
| `pyq_completed` | JEE-filtered PYQ row count >= target | Opening count preserves old retakes; a new verified first-answer entitlement adds one, fresh-key replay adds none |
| `total_questions` | Attempted test questions + PYQ rows >= target | Opening totals carried forward; new test attempted count and distinct new PYQ entitlements only |
| `total_xp` | Current XP >= target | Current atomic balance; no synthetic recomputation or retroactive adjustment |
| `streak` | Current streak >= target | Same threshold; verified source transaction updates streak, unanswered PYQ does not |
| `accuracy` | Rounded correct/attempted percentage >= target | Preserve old numerator/denominator, then add verified new results; use `correct_answers || correct || 0` for old tests |
| `leaderboard_rank` | Rank <= target; higher XP wins, earlier `updated_at` breaks equal-XP ties | Fixed prototype's all-ties-ahead behavior; missing own timestamp uses strict XP comparison, missing row is unavailable |
| `mock_tests` | Best `accuracy || score || 0` >= target | Fixed prototype's zero-accuracy fallback; remains a best-score rule, not a test count |
| `speed_solver` | Rounded total test seconds / attempted questions <= target; zero/missing result is unavailable | Fixed unrounded prototype and missing-time handling; zero rounded speed cannot earn a badge |

The original display/evaluation defaults to JEE even for other profiles. That behavior is preserved and explicitly deferred for a separate product decision. Where an old attempt has no `tests.exam`, original code used the first answer's exam without ordering. The candidate refuses mixed JEE/non-JEE historical answer groups rather than silently choosing a new historical track. Historical aggregate ambiguity must be reviewed privately.

Synthetic verification covers all nine exact-threshold and opposite-boundary comparisons (18 claims), old duplicate attempts, repeated PYQ rows, old truthy fallbacks, speed rounding, rank ties, no-data speed/rank, held historical eligibility, and fresh-key replay. The service-only stats RPC equals the claim basis; browser execution is denied. Two application tests verify that badge display uses the verified count and fails closed if the stats contract is unavailable.

These are rule and synthetic-accounting parity results, not approval of the live badge catalogue. Retake/base-XP policies and unclaimed historical badges remain distinct product decisions. New badge types, thresholds, track changes and reward amounts are outside the Phase 5 freeze.
