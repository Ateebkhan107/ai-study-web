# PrepZii performance implementation and verification

The baseline was commit `ebac04f`. Before and after production-mode builds used the same installed dependencies, Node 22.23.2, and Next.js 16.3.0 with webpack. Both builds completed. The default Turbopack build stalled in this workspace and was stopped. The application was not deployed. No database migrations, RLS policies, production records, or dependencies were changed.

## Dashboard and error recovery

- The shared layout previously fetched institute membership, Clerk account details, test quota, profile, subscriptions, and Zi usage before returning the shell. It then waited for an XP initialization RPC. The layout now waits for Clerk identity and onboarding, the active-track subscription used by navigation, and Zi usage. Full entitlement checks still run at protected feature entry points. Subscription work in the full access context starts as soon as its track is known.
- XP initialization runs after the response for Clerk-verified users when the existing integrity feature is enabled. The stats endpoint can initialize a missing row if a first-visit request arrives before that background operation. Both use the existing idempotent database initializer.
- Goals, stats, Quick Study, and leaderboard have independent loading and recovery paths. Goals read the profile while reconciling rewards and wait for reconciliation before reading progress. Rank failure leaves XP, accuracy, streak, and the top leaderboard available. The dashboard shares its exact-rank result with the leaderboard while keeping top-list ordering and the existing XP/timestamp tie-breaker. Per-user results are uncached across users.
- Navigation no longer forces full prefetches for every route on mount. Hover and keyboard-focus prefetch remain. The Zi launcher loads its panel on first open and retains it across subsequent opens and closes.

## Homepage

- Static sections now render as Server Components. Clerk-aware links are a small client component. The hero heading is visible in the initial HTML, and CSS handles the preview, progress, hover, and supported scroll effects with reduced-motion support. The animation timing changed while the page content, responsive structure, navigation, and branding were retained.
- The homepage no longer imports Framer Motion or starts background requests for Web Awesome components on mount. Design-system wrappers register their own Web Awesome components when used. Clerk and PostHog remain part of the shared client startup. Space Grotesk and Source Sans 3 are the two first-paint font preloads, with the existing font files, CSS descriptors, and fallback metrics retained.

## PYQ and analytics

- Selected full papers with an exact paper ID now request all selected subjects together. Random papers retain a fast path for the first candidate and check subsequent candidates in bounded metadata pages before fetching full questions for a qualifying paper. Shuffling uses Fisher–Yates.
- Random sessions use 75 questions for JEE and 180 for NEET. The JEE eligibility check now treats `Maths` and `Mathematics` as the same subject. It can draw a 75-question random session from a 90-question source with 20 MCQs and 5 numericals per subject. Exact selected papers retain their source questions. Chapter practice and mistakes sessions retain their full set and existing filters. Score calculation and attempt ownership were unchanged.
- Analytics filters the joined exam label in PostgreSQL and reads smaller, ordered pages for the Clerk user. The existing calculation rules remain in JavaScript, including AIPMT under NEET, accuracy rounding, chapter thresholds, and streaks. Paginating the query avoids silently dropping attempts beyond a single response page.
- Repository migrations were reviewed. Read-only `EXPLAIN` requests for rank, paper metadata, and analytics against the configured PostgREST endpoint returned HTTP 406 with `PGRST107`, so deployed index use and execution times could not be verified. No index or database aggregation change was made.

## Formula Cards

- Published chapter and card reads use a five-minute revalidation window and the existing formula-card cache tag. Only successful database reads enter the new cache. The current seed fallback remains available on failure. The initial payload includes two full cards and a compact ID/importance list. The rest of the deck loads after navigation intent, with retry for failed loads. Keyboard navigation, shuffle, reset, bookmark, importance filtering, progress, and Zi card context remain available.
- Local raster images in the generic card renderer now use responsive Next image optimization. SVGs and external images retain direct delivery. At 1080 px and quality 75, the local Next optimizer encoded the Math nature-of-roots flowchart at 21,271 bytes in AVIF and 29,278 bytes in WebP from its 384,749-byte source. The already optimized position-time graph encoded at 21,230 bytes in AVIF from a 3,603,910-byte source. These are encoder results, with deployed CDN size and legibility still to be verified on devices.

## Before and after measurements

Homepage results are medians from three cold Chrome runs against the exact local build HTML and assets. The browser used a 390 × 844 viewport, DPR 2, 4× CPU slowdown, 150 ms latency, and 1.6 Mbps download. Third-party requests were blocked equally in both runs, including Clerk and PostHog. JavaScript and font transfer figures use browser-reported first-party bytes, including requests after mount within the capture window. Script execution uses Chrome's `ScriptDuration`.

| Homepage metric | Before | After |
|---|---:|---:|
| First-party JavaScript transferred | 420,013 B | 280,893 B |
| Script execution time | 194 ms | 135 ms |
| LCP | 4.31 s | 1.54 s |
| CLS | 0 | 0.00045 |
| Font transfer | 156,893 B | 101,515 B |
| Encoded HTML | 16,332 B | 25,276 B |

The server-rendered homepage sends more HTML and React Server Component data. The first-party JavaScript savings were larger than that increase. The baseline issued a forced dashboard prefetch during the static harness run. The after build did not issue that request. Field INP and production Core Web Vitals were unavailable.

Dashboard tests used two local Next production-mode servers with matched synthetic Clerk and database adapters. Fixture delays were 70 ms for ordinary database calls, 125 ms for rank counts, 140 ms for the Clerk profile request, and 200 ms for the XP initializer. HTTP TTFB is the median of three requests per build. Widget rows report one mobile-width browser journey per build. Response completion measures when a widget's data reached the browser. All of these numbers are local fixture measurements.

| Dashboard metric | Before | After |
|---|---:|---:|
| Signed-in shell TTFB | 443 ms | 167 ms |
| Calls blocking the signed-in layout | 10 | 3 |
| Exact rank counts per dashboard load for a user outside the top ten | 2 | 1 |
| Goals request duration | 315 ms | 220 ms |
| Goals response complete after navigation | 896 ms | 499 ms |
| Stats request duration | 212 ms | 212 ms |
| Stats response complete after navigation | 793 ms | 492 ms |
| Leaderboard request duration | 300 ms | 82 ms |
| Leaderboard response complete after navigation | 881 ms | 362 ms |

Formula Cards figures are gzip sizes of the serialized props for the same repository seed decks. These isolate the card data from page markup, framework chunks, and images.

| Formula Cards initial data | Before | After |
|---|---:|---:|
| JEE Rectilinear Motion, 9 cards | 1,542 B | 676 B |
| NEET Biological Classification, 18 cards | 5,465 B | 992 B |

## Regression checks

| Check | Baseline | Final |
|---|---:|---:|
| Server and API tests | 365 passed, 8 skipped | 373 passed, 8 skipped |
| Component rendering tests | 15 passed | 15 passed |
| App source lint | 0 errors, 32 warnings | 0 errors, 32 warnings |
| Repository-wide `npm run lint` | 44 errors, 53 warnings | 44 errors, 53 warnings |
| Production webpack build | Passed | Passed |

The repository-wide lint errors came from the local `venv/` directory. The web app has no `tsconfig.json` or standalone type-check script. The eight database-gated tests remained skipped. The separate Zi integration database test requires a prepared database fixture and was not counted in the passing totals.

The new focused tests exercised track-scoped subscription selection, Clerk-derived request identity, rank tie-breaker parity, a single shared rank calculation, partial rank failure, goal error versus empty behavior, JEE and NEET paper composition, answer reveal isolation, and multi-page NEET analytics. The local browser fixture exercised independent widget loading, goals retry, partial rank retry, switching between synthetic JEE and NEET users, Formula Cards navigation beyond the first two cards, bookmarking, and opening the deferred Zi panel. The homepage had no horizontal overflow at 390 px and 1366 px. The dashboard fixture had no horizontal overflow at 390 px. Existing mock-test and active-session coverage ran in the automated suites.

## Production verification still needed

- Measure field LCP, INP, and CLS on production traffic, plus authenticated dashboard, PYQ, Formula Cards, and API latency with real Clerk and Supabase connections. The direct localhost Clerk flow did not yield usable measurements. The signed-in timing and browser checks used synthetic identities.
- Run hosted Clerk sign-in, sign-up, onboarding, and subscription transitions on a staging account, followed by JEE and NEET PYQ and mock-test journeys. The local checks did not exercise live Zi provider responses or production account transitions.
- Obtain PostgreSQL plans and execution timings for realistic histories and publication distributions. Analytics pages still aggregate in the application, and random-paper metadata can require several pages when many candidates are incomplete. Verify deployed indexes before pursuing a database change.
- Verify the public chapter cache's revalidation and invalidation behavior when editors withdraw cards. Check optimized diagram clarity and the first-load cost of Zi on representative phones.

## Files modified

- **Dashboard and access** — `src/app/(dashboard)/layout.js`, `src/app/(dashboard)/dashboard/page.js`, `src/lib/accessControl.js`, `src/components/Navbar.jsx`, `src/components/StatsCards.jsx`, `src/components/DailyGoals.jsx`, `src/components/DashboardSection.jsx`, `src/components/analytics/Leaderboard.jsx`, `src/components/dashboard/DashboardPerformanceProvider.jsx`, `src/components/dashboard/useDashboardWidget.js`, `src/components/dashboard/WidgetRetry.jsx`, `src/app/api/dashboard-stats/route.js`, `src/app/api/daily-goals/route.js`, `src/app/api/pyq/leaderboard/route.js`, `src/lib/formulaBooks.js`, and `src/components/zi/ZiLauncher.jsx`.
- **Homepage** — `src/app/HomePageClient.jsx` was replaced by `src/app/HomePage.jsx`. Also changed `src/app/page.js`, `src/app/layout.js`, `src/app/LandingAuthLinks.jsx`, `src/app/landing.module.css`, `src/app/fonts/preloads.json`, `src/components/ui/design-system.jsx`, and `src/components/ui/web-awesome-provider.jsx`.
- **PYQ** — `src/app/(dashboard)/pyq/session/page.js`, `src/app/api/pyq/route.js`, `src/app/api/pyq/analytics/route.js`, and `src/lib/analyticsHelpers.js`.
- **Formula Cards** — `src/app/formula-cards/layout.jsx`, `src/app/formula-cards/[subjectSlug]/[chapterSlug]/page.jsx`, `src/app/api/formula-cards/[subjectSlug]/[chapterSlug]/route.js`, `src/components/formula-cards/FormulaCardDeck.jsx`, `src/components/formula-cards/FormulaCardRenderer.jsx`, and `src/lib/formulaCards.js`.
- **Tests and report** — `src/lib/tests/performanceRoutes.test.mjs`, `src/lib/tests/offlineFonts.test.mjs`, `src/components/zi/tests/testBuilder.test.mjs`, and `docs/prepzii-performance-report.md`.
