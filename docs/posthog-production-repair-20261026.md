# PostHog production analytics repair — 26 October 2026

Follow-up: the separate standard Web Analytics dashboard retained stale totals after this repair. Raw production events and a fresh private session were subsequently verified, and the standard totals corrected with PostHog's in-page refresh. See [the discrepancy investigation](posthog-web-analytics-discrepancy-20261026.md).

## Result

Production delivery is verified in PostHog project 586306, filtered to `https://www.prepzii.com`: one visitor and two pageviews, split between `/` and `/jee` (one each). These came from a real browser homepage load followed by a Next.js Link navigation. No synthetic capture API events were submitted.

## Root cause

Vercel's `prepzii` project had neither `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` nor `NEXT_PUBLIC_POSTHOG_HOST` in its project environment variables. Both existed locally. `instrumentation-client.js` deliberately skips `posthog.init` when either is missing and only warns in development, so production failed silently.

Before repair, the deployed browser emitted zero PostHog resource requests, and its JavaScript lacked the locally configured project token. Historical localhost traffic and installation health therefore did not establish that production was initialized. The dashboard domain selector contained both localhost and the production domain; its production filter was not the underlying delivery failure.

## Smallest fix applied

- Added the existing browser project token and `https://us.i.posthog.com` as encrypted Vercel **Production** variables. Values are omitted from this report. Preview and Development scopes were not changed.
- Rebuilt the existing production deployment using its exact commit `561f3a52ebe3f7e924b3d4abc975f8a3877f2838`, with `withLatestCommit: false`. No local working tree changes were deployed.
- New deployment: `dpl_4LuvniRrF6TJdQTNphtWHjjFo5Hp`, status **READY**, assigned to `www.prepzii.com`, `prepzii.com`, and `prepzii.vercel.app`.
- No application source, dependencies, Clerk configuration, consent settings, session replay settings, or domain authorization changes were required. Selected the production domain in the Live dashboard for verification.

A redeployment was necessary because Next.js embeds `NEXT_PUBLIC_*` values at build time. That redeployment is complete; no further redeployment is needed for this fix.

## Audit and validation

| Check | Evidence |
| --- | --- |
| Initialization | One application `posthog.init` call in root `instrumentation-client.js`. Installed Next.js resolves this root file as well as the optional `src` location. No relocation was required. |
| Initial and App Router pageviews | Existing `defaults: "2026-01-30"` selects SDK `capture_pageview: "history_change"`. No manual pageview capture exists. Live Analytics recorded exactly one pageview for `/` and one for `/jee`. Browser retained one document navigation entry during the Link transition. |
| Token and host | The US ingestion endpoint accepted the existing local project's configuration. After rebuild, exactly one initially loaded production JavaScript bundle contained the configured token. Events appeared in the intended PostHog project. |
| Network | Before: zero PostHog resource requests. After: configuration, SDK assets, `/e/`, and `/i/v0/e/` returned HTTP 200 in the production browser. |
| CSP | Production HTTP responses had no Content-Security-Policy header. No PostHog CSP or blocked-request errors were observed in the inspected browser. |
| Consent and blockers | No application consent gate or opt-in/opt-out calls were found in the analytics path. Successful browser delivery rules out a blocker for this tested browser. Other visitors' extensions and stored opt-outs were not changed or tested. |
| Domains | Vercel verifies both apex and www; apex redirects to www. PostHog already lists `https://www.prepzii.com`; production-filtered events arrived successfully. Localhost remains available for historical data. |
| Authentication and privacy | Existing Clerk identify/reset bridge unchanged. Signed-out production rendering and Clerk requests returned successfully. No full authenticated account workflow was exercised. Session recording remained disabled in fetched project configuration. |
| Checks | ESLint passed for `instrumentation-client.js` and `src/components/ui/web-awesome-provider.jsx`. Vercel's production build completed successfully. Production homepage returned HTTP 200. |

Live counters cover a rolling time window; online users can return to zero after the test browser becomes inactive. Missing historical production events cannot be recovered by enabling future capture.

Deployment: https://vercel.com/ateebs-projects-7c8a9451/prepzii/4LuvniRrF6TJdQTNphtWHjjFo5Hp

Live view: https://us.posthog.com/project/586306/web/live

References: https://posthog.com/docs/libraries/next-js and the installed Next.js instrumentation-client/environment-variable guides.
