# SEO Phase 1 production readiness — 26 October 2026

## Decision

**NO-GO for immediate production promotion or deployment of the current checkout.**
The isolated SEO-only candidate is ready for an approved staged deployment. Its local build, lint and anonymous checks pass. Authenticated production-environment smoke tests remain a release gate.

Nothing has been deployed, pushed, merged, reset or discarded during this preparation. No production database, schema or environment variable was changed. Existing workspace source files were preserved; this directory contains preparation artifacts only.

## Isolation and exact release

Current checkout HEAD: `6fbeb808a07e7d41bb360864c3d1b43ee9f3c870`.
Production source base: `561f3a52ebe3f7e924b3d4abc975f8a3877f2838`.
At inspection, the checkout had 140 pending status entries and HEAD differed from production in 123 committed files. Neither HEAD nor the working directory is a safe release source.

`production-only.patch` applies to the exact production base. It contains 32 files: 29 runtime source files, two verification files and one implementation document. `git apply --check` passed against production source. All 10,036 other production tracked files match the isolated candidate byte-for-byte. `manifest.json` lists the release allowlist.

The candidate preserves production fonts. It excludes the unfinished offline-font migration from the working copy, including its global-error changes and font assets. It also excludes Zi generation/runtime changes, test generation/session changes, database migrations, experiments, package/script changes and other unrelated commits or edits. The Zi, battle and community files listed below contain title/metadata adjustments only.

Runtime changes:

- Server-rendered homepage metadata with a client component retaining homepage interaction; qualified unsupported claims.
- Shared canonical origin `https://www.prepzii.com`; unique public titles and explicit public index directives. Root noindex protects application pages that do not opt in.
- Public landing-page resource links and mobile exam navigation; existing practice CTAs retained.
- Formula hub, subject and chapter metadata with distinct JEE/NEET canonicals; invalid/empty resources do not become indexable.
- Fourteen public sitemap URLs; protected/non-indexable application URLs omitted.
- Robots rules allow harmless application entry pages to expose noindex while blocking private descendants and APIs.
- Existing pricing/access rules, API handlers, authentication/authorization guards, analytics initialization, Supabase clients and payment logic remain the production versions.

Exact file allowlist:

- `src/app/(dashboard)/about/page.js`
- `src/app/(dashboard)/battle/[id]/page.js`
- `src/app/(dashboard)/battle/page.js`
- `src/app/(dashboard)/careers/page.js`
- `src/app/(dashboard)/community/groups/[id]/page.js`
- `src/app/(dashboard)/community/groups/new/page.js`
- `src/app/(dashboard)/community/messages/[id]/page.js`
- `src/app/(dashboard)/community/messages/page.js`
- `src/app/(dashboard)/community/page.js`
- `src/app/(dashboard)/contact/page.js`
- `src/app/(dashboard)/feedback/page.js`
- `src/app/(dashboard)/help/page.js`
- `src/app/(dashboard)/privacy/page.js`
- `src/app/(dashboard)/report-bug/page.js`
- `src/app/(dashboard)/terms/page.js`
- `src/app/(dashboard)/zi/page.jsx`
- `src/app/formula-cards/[subjectSlug]/[chapterSlug]/page.jsx`
- `src/app/formula-cards/[subjectSlug]/page.jsx`
- `src/app/formula-cards/page.jsx`
- `src/app/layout.js`
- `src/app/page.js`
- `src/app/pricing/layout.jsx`
- `src/app/robots.js`
- `src/app/sitemap.js`
- `src/components/seo/SeoLandingPage.jsx`
- `src/lib/seoLandingPages.js`
- `src/app/HomePageClient.jsx`
- `src/components/seo/PublicExamNavigation.jsx`
- `src/lib/seo.mjs`
- `src/lib/tests/seo.test.mjs`
- `scripts/seo/verify.mjs`
- `docs/seo-phase1-local-implementation-20261026.md`

## Verification on the isolated production-based candidate

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Node 24 production webpack build | PASS | `build.txt`; 121 static outputs. Production font implementation retained. |
| Scoped application/SEO lint | PASS | `lint.txt`; zero errors, 32 existing warnings. |
| SEO policy tests | PASS | `tests.txt`; 5/5. |
| HTTP checks against the production build | PASS | `http.txt`; 41/41. |
| Homepage and six exam landing pages indexable | PASS | `/`, `/jee`, `/neet`, `/jee/pyq`, `/neet/pyq`, `/jee/mock-tests`, `/neet/mock-tests`; anonymous rendered metadata, index directives and www canonicals checked. |
| Remaining seven sitemap pages | PASS | All 14 sitemap entries passed public metadata checks; private URLs absent. |
| App entry pages, private pages, formulas and redirects | PASS | 11 application entries expose noindex without inherited homepage canonical; 8 private-route protection checks; 5 formula variants; invalid chapter 404; CTA/slash redirects. |
| Additional anonymous API guards | PASS | 10/10 returned 401: payment create/verify, test-session, pyq-attempts, dashboard-stats, profile, analytics, access, admin/dashboard-stats and institutes. POST checks used empty bodies; no authenticated payment or database write was performed. |
| Auth/payment/Supabase/dashboard/analytics source isolation | PASS | Unchanged production files outside allowlist verified by content. |
| Database migration or schema changes required | PASS: none | No SQL, migration, data-write handler or dependency change in release. |
| Full Clerk login, student test journey, paid checkout | NOT VERIFIED | Anonymous guards do not establish authenticated end-to-end behavior. Require approved staging smoke tests. |
| PostHog actual event delivery from this candidate | NOT VERIFIED | Integration unchanged; staged/promotion smoke must verify received events in the intended project rather than HTTP status alone. |
| Default Turbopack production build | NOT QUALIFIED | Verified artifact uses webpack; explicitly use the verified build mode for the staged release. |

The earlier 32 regression tests applied to the mixed checkout. They must not be presented as 32 tests of this isolated release; its available new policy suite has five tests. The prior full-checkout lint included unrelated vendored Python-environment JavaScript errors. The scoped lint result above is the relevant release result.

## Production environment requirements

Vercel project `prepzii` uses Node 24.x and Next.js. Read-only environment inspection with decryption disabled confirmed Production-scoped Clerk keys/redirect settings, Supabase URL/anon/service-role settings, Razorpay server/public settings, PostHog token/host and application URL entries. No values are included here. Presence does not independently prove that every secret is valid.

SEO introduces no new environment variables, integrations or dependencies. The canonical origin is fixed in the SEO helper. Existing public environment values must be supplied at build time; do not upload the locally built `.next` artifact as the production release.

PostHog and Razorpay entries are Production-only in current configuration. An ordinary Preview deployment therefore cannot establish production parity. Do not copy live payment secrets to Preview just to run a smoke test. An approved production-target staged deployment can use Production configuration without assigning the public domains, subject to Vercel protection and Clerk hostname restrictions. Preserve those protections.

## Safest deployment method after approval

1. Create a clean release branch/worktree from the production SHA above. Do not deploy this dirty checkout, cherry-pick the unrelated HEAD commit, or use `git add .`.
2. Apply and review `production-only.patch`; verify the allowlist and patch checksum below. Recheck that production has not advanced; if it has, rebase the isolated change onto the new production baseline and repeat checks.
3. Build from the clean source using Node 24 and `next build --webpack`, with the intended Production environment. Use a deployment-specific build override or explicit reviewed build configuration; avoid silently changing project-wide settings. Rebuild from source rather than reusing a mixed checkout artifact.
4. Create an approved staged Production-target deployment with domain assignment skipped (Vercel `--prod --skip-domain`), retaining deployment protection. Verify the exact commit, build settings and environment scope in Vercel. Ensure the chosen host is compatible with Clerk before testing; do not weaken authentication/protection to bypass restrictions.
5. Repeat anonymous SEO/robots/sitemap/redirect checks on that staged deployment. With a designated test account, check Clerk login/logout, dashboard/profile reads, access entitlements, existing test-taking/navigation and Zi entry. Use an appropriately configured payment test environment for an actual checkout test; do not initiate live charges or mutate production student records as part of an unapproved smoke test. Check analytics receipt in the intended PostHog project and event domain properties without sharing identifiers or secrets.
6. Report results and obtain approval for production promotion. Only then assign public domains/promote the exact tested deployment. Smoke-test the www homepage and six landing pages, apex-to-www redirects, auth entry, public canonical/index signals and actual analytics receipt; monitor errors.

## Rollback

Current known-good READY deployment at inspection:

- ID: `dpl_4LuvniRrF6TJdQTNphtWHjjFo5Hp`
- URL: `https://prepzii-hqh92j247-ateebs-projects-7c8a9451.vercel.app`
- Source: `561f3a52ebe3f7e924b3d4abc975f8a3877f2838`

Record the then-current production deployment and aliases immediately before promotion, because production may change after this report. If SEO, auth, access, payments or application behavior regresses, restore the recorded deployment through Vercel instant rollback/promotion. Use the known-good deployment above only if it is still the correct pre-release target. This preserves its existing built PostHog configuration. No database rollback or schema reversal is required. Verify www/apex aliases, page access, index directives and analytics after rollback. No rollback action has been taken now.

## Remaining risks

- Authenticated and payment journeys need staging verification; source preservation plus anonymous checks reduces risk but is not a substitute for those journeys.
- Root noindex makes explicit public opt-in essential. All current 14 sitemap pages passed; future public routes need the same metadata policy.
- Formula URLs can depend on existing profile/track selection. Tested anonymous variants passed; authenticated track behavior should be included in smoke testing.
- Production font builds fetch Google Fonts and require network access, as before. The successful isolated build used the existing production approach.
- Search indexing and rankings cannot be proven by local checks. Inspect Search Console after release; sitemap changes do not guarantee immediate recrawling.
- Existing warning debt and unrelated unfinished work remain outside this release.

Patch SHA-256: `8aa2dd49ea64cd66b5422c4d00c9fc1c1498d7fdbeab9ae713b648dec2ba7ea0`.

Approval should cover staging this isolated candidate first; immediate public promotion remains NO-GO until staging gates pass.
