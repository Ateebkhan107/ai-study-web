# Shared institute identity security fix

## Root cause and security impact

The consumer app used its Supabase service-role client to resolve institute access after Clerk login. Three paths accepted a matching profile email as authorization. The institute list and access context could bind an unbound membership and set it active. The per-institute resolver could also accept an active membership that was already bound to a different Clerk user. The student-add route used a Clerk email lookup to activate students and could overwrite the existing membership's identity, role and status. These paths could skip the invitation recipient, expiration, revocation and replay checks. A separate owner shortcut granted institute access from `owner_user_id` even when the owner's explicit membership was suspended or otherwise inactive.

The affected service-role operations bypass RLS. Depending on the affected membership role, unauthorized access could include institute records or administrative actions. The findings establish exposure paths. They do not establish whether anyone used them.

## Authorization and onboarding behavior

| Path | Previous behavior | Updated behavior |
| --- | --- | --- |
| Institute listing, access context and slug-scoped APIs | Used email as a fallback or bound rows as a side effect of reading. | Uses the server-authenticated Clerk ID and checks the active institute and membership state. Authorization reads do not mutate membership. |
| Canonical owner | Owner ID alone overrode membership status. | Checks the explicit owner row. Supports an active legacy `COACHING_ADMIN` owner row and a canonical legacy owner with no bound row. A non-active owner row denies access. |
| Add student | Clerk email lookup could activate or overwrite a membership. | Stages an unbound `PENDING` student, preserves an existing active or pending student row, and rejects conflicting roles or states. Any requested batch is checked against the authorized institute before writes. |
| Activate student access | Consumer login or onboarding could activate a membership by email. | Admin sends an invitation through **Members & Invites** in Prepzii LMS. The recipient accepts there with a verified Clerk primary email. A subsequent consumer request recognizes the active membership bound to that Clerk ID. |

The owner check follows the LMS canonical owner and legacy compatibility rules. It preserves the consumer's existing `COACHING_ADMIN` role response for canonical owners. New consumer institute provisioning still records the signed-in creator as owner. Student staging retains the existing batch-member linkage by membership ID. The LMS acceptance route supplies the authenticated Clerk ID, verified primary email and token hash to the existing `lms_accept_invitation` RPC. The hardened RPC updates the pending row in place and checks ownership of the existing binding, terminal invitation states and replay.

No consumer schema change is required. No migration or hosted data change was performed. Keep an explicit owner membership row when suspending or removing an owner. Physical deletion while the same canonical owner ID remains would be indistinguishable from a legacy institute without an owner membership row.

## Files changed

| File | Change |
| --- | --- |
| `src/lib/instituteMembership.js` | Shared read-only institute membership resolver and listing. |
| `src/lib/instituteAuth.js` | Scoped service-role reads to the active institute and authenticated Clerk ID. |
| `src/lib/accessControl.js` | Reused the shared membership listing for consumer entitlement context. |
| `src/app/api/institutes/route.js` | Reused the read-only listing and kept the provisioning handler. |
| `src/app/api/institutes/[slug]/students/route.js` | Staged pending students without binding identities and preserved existing membership state. |
| `src/components/institute/InstituteWorkspace.jsx` | Added directions to the existing LMS invitation workflow. |
| `src/lib/tests/instituteIdentity.test.mjs` | Added regressions for identity, membership status, tenant boundaries and onboarding. |
| `docs/SHARED_INSTITUTE_AUTH_SECURITY_FIX.md` | Recorded verification and rollout conditions. |

## Verification

| Check | Result |
| --- | --- |
| Consumer identity regressions | **PASSED**. 14 cases with mocked Clerk and a mock Supabase client without RLS. They call the route handlers directly and exercise legitimate and legacy owners, explicit negative owner states, verified and unverified matching emails, recipient mismatch, a row bound to another account, signed-out requests, cross-tenant denial, repeated login and student onboarding, and owner provisioning. The expired and revoked consumer cases verify that reads cannot activate a pending row. |
| Consumer library tests | **PASSED**. `node --conditions=react-server --test src/lib/tests/*.test.mjs` yielded 100 passes, zero failures and eight skips. The React Server condition is required for the server-only module marker. |
| LMS PostgreSQL tests | **PASSED** on a disposable local database. `bash scripts/test-role-database.sh` rehearsed LMS migrations 0020 and 0021 and passed tenant isolation and membership tests, including pending student activation, expired and revoked invitations, replay rejection and suspended owner denial. |
| Changed-file lint and whitespace | **PASSED**. ESLint reported no diagnostics on the changed code and `git diff --check` passed. |
| Repository-wide lint | **FAILED** for the unfiltered command. All 44 errors came from generated Gradio assets under the local `venv/`. With `--ignore-pattern venv/**`, lint **PASSED** with zero errors and 32 warnings. |
| Web production build and TypeScript stage | **PASSED**. `npm run build` compiled, ran Next.js's configured TypeScript stage and generated all 123 static pages. The consumer web repo has no standalone TypeScript check configured for the changed JavaScript files. |
| Hosted Clerk and shared Supabase journey | **NOT TESTED**. The route tests use mocks and the database tests use synthetic records on a disposable database. |

## Rollout conditions

1. Confirm the target LMS has the hardened invitation RPC and execution grants covered by migrations 0020 and 0021. Rehearse any pending migration against an authorized, sanitized snapshot before separately approving deployment.
2. In shared staging, confirm both apps use the same Clerk identities and shared Supabase database. Sign in with authorized test accounts. Verify an active and legacy owner can enter the intended institute, a suspended owner is denied in both apps, and a student added in the consumer app stays pending until accepting the intended invitation in LMS. Verify the same membership and batch assignment appear after acceptance and the student cannot enter a second institute.
3. Review existing active memberships for incorrect bindings from earlier behavior using authorized evidence. The code preserves existing active memberships and cannot determine how historical rows were activated.
4. Smoke-test shared staging consumer sign-in, dashboard, PYQ, practice tests, Zi and subscription flows before a controlled rollout.

**Decision**. Ready for shared staging verification. Production readiness remains unverified pending the checks above.
