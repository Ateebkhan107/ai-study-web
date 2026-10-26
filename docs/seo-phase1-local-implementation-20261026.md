# SEO Phase 1 — local implementation and verification

Date: 26 October 2026. **Local only; not deployed.** No database writes, migrations, pricing changes, access-rule changes, or new SEO landing-page expansion were performed.

## Changes

- Added `src/lib/seo.mjs` as the canonical origin and metadata policy: search URLs always use `https://www.prepzii.com`, independently of local/preview app and Clerk redirect settings.
- Removed the root homepage canonical inherited by unrelated routes. Root metadata now defaults to noindex/follow; the homepage, six exam landing pages, pricing, six informational pages and eligible formula resources explicitly opt into indexing.
- Moved the existing interactive homepage to `src/app/HomePageClient.jsx`, retaining its existing fonts, hooks, animations and CTA behavior. `page.js` is a small server wrapper with homepage-specific metadata.
- Updated public page titles/descriptions and social metadata. Existing branded app/utility titles use absolute titles to avoid the root template appending the brand again.
- Formula subject/chapter metadata now describes the actual resource and uses a self-canonical. The JEE default consolidates to the clean path, while NEET retains `?exam=NEET`. Tracking parameters do not enter the canonical. Invalid/empty resources are not opted into indexing.
- Retained the existing profile-first subject selection and subject fallback behavior. Request-scoped React caching shares the metadata/page reads; no data-access permissions changed.
- Replaced the sitemap with an explicit 14-URL public allowlist. Removed protected `/subscriptions`. No deck enumeration or invented modification timestamps were added.
- Public app entry points and auth forms are crawlable so bots can read noindex. Protected descendants, APIs, account views, admin, institute, payments and formula books remain excluded from crawling. robots.txt is not used as an authorization mechanism.
- Exam resource cards and hub secondary discovery links now point to the public PYQ/mock-test landing pages. Primary practice CTAs still use the original `/go/{track}/{destination}` flow.
- Added a native details/summary mobile menu linking JEE, NEET, both PYQ pages, both mock pages and pricing; no menu-specific client state or new dependency is needed.
- Removed unsupported homepage catalog/year totals, mock counts and authenticity guarantees. Labelled sample question/analytics values as illustrative examples, qualified subject/chapter availability, and stated Pro access for mock tests. Existing free/Pro behavior is untouched.

## Results

| Check | Result | Details |
| --- | --- | --- |
| Application source lint | PASS | `npm run lint -- src scripts/seo next.config.mjs`: 0 errors, 32 existing warnings |
| Unrestricted repository lint | FAIL | `npm run lint` includes third-party JavaScript in `venv/`; 44 errors and 53 warnings overall. No vendor files or unrelated lint policy were changed. |
| Production build | PASS | `npm run build -- --webpack`, Next.js 16.3.0, Node 24.10.0; compiled and generated 123 static outputs |
| Default Turbopack attempt | INCOMPLETE | Stalled in compilation and was interrupted. Verification used the completed webpack build; default bundler configuration was not changed. |
| Unit/regression tests | PASS | 32 passed, 0 failed: SEO, offline font integrity and existing test-session/API route regression suite |
| Local production HTTP suite | PASS | 41 checks passed, 0 failed against the final build |
| Mobile browser | PASS | 390px viewport: menu opens, all seven links are accessible, navigation from JEE PYQs to NEET PYQs succeeds, menu resets closed on navigation; homepage header and qualified copy also inspected |
| Auth/access/analytics preservation | PASS | SHA-256 comparison with the pre-task working copy confirms 9 guarded files unchanged: proxy, auth, access matrix, admin layout, dashboard layout, formula-book layout, track redirect handler, PostHog initialization and Clerk identity bridge |
| Patch whitespace | PASS | `git diff --check` |

The HTTP suite checks all 14 public sitemap pages for anonymous HTTP 200, one brand occurrence in the title, descriptions, self-canonicals, H1 presence and consistent index directives. It checks 11 app/auth/utility pages for noindex and no inherited homepage canonical; five formula routes/variants; the robots/sitemap policy; eight anonymous protected-route responses; invalid chapter 404; and existing practice/slash redirects.

The homepage's origin-only canonical is normalized by Next.js to omit the trailing slash. The HTTP suite compares normalized URLs rather than treating equivalent root URL spellings as a failure.

The local server initially failed while bound to `127.0.0.1`, because Next.js's internal loopback proxy targeted `localhost`. Binding the verification server to `localhost:3472` resolved it without changing application or auth code. Sandbox restrictions also required permission to bind/read the local port.

## Reproduce

Use a supported Node runtime (verification used `/opt/homebrew/opt/node@24/bin` on this machine):

```sh
npm run lint -- src scripts/seo next.config.mjs
npm run build -- --webpack
node --conditions=react-server --test src/lib/tests/seo.test.mjs src/lib/tests/offlineFonts.test.mjs src/lib/tests/routes.test.mjs
npm run start -- --hostname localhost --port 3472
# In another terminal:
node scripts/seo/verify.mjs http://localhost:3472
```

## Remaining issues / limits

- No deployment was attempted. Production verification and Google recrawling remain pending an approved deployment.
- The default Turbopack stall and the broad lint command's inclusion of `venv/` remain unresolved tooling issues. The final webpack build and source lint passed.
- The runtime logged the existing formula-card database fallback for a missing `diagram_image` column. No schema change was made; a tested deck used the existing fallback. Data completeness and solution quality still need editorial review.
- Formula decks have not been mass-added to the sitemap. Thin content, complete server-rendered deck references, paper/chapter landing pages and predictor methodology remain later-phase work.
- Search Console indexing/field Core Web Vitals and actual ranking effects were not verified. No ranking or traffic outcome is claimed.
- The separate Vercel alias hostname redirect remains a hosting follow-up; canonical metadata now consistently selects www.
- Full authenticated student, administrator and institute journeys were not exercised with real accounts. Preservation evidence consists of unchanged guards/access logic, existing route regression tests and anonymous protected-route checks.
- The repository already contained extensive unrelated changes. They were retained; this task did not commit, revert or deploy them.

Temporary local evidence: `/tmp/prepzii-seo-http.txt`, `/tmp/prepzii-seo-tests.txt`, `/tmp/prepzii-seo-project-lint.txt`, `/tmp/prepzii-seo-lint.txt`, `/tmp/prepzii-seo-build-webpack.txt`, `/tmp/prepzii-seo-phase1-mobile.png`.
