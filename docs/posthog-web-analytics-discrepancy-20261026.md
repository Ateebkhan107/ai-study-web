# PostHog Web Analytics discrepancy — 26 October 2026

## Finding

The production SDK was delivering real pageviews to the correct PostHog project. The standard Web Analytics dashboard was displaying a stale query result. This was reproduced and resolved using **PostHog's in-page refresh button immediately beside Last 7 days**, without changing its date range, domain, test-account filter, website source, or deployment.

This follow-up verifies stored events rather than relying on ingestion HTTP responses or the previous Live view screenshot.

## Stored event evidence

Read-only HogQL queries ran in the authenticated SQL editor at `https://us.posthog.com/project/586306/sql`, the same project as Web Analytics. Only `$pageview` rows were selected.

| Timestamp (UTC) | `$host` | `$current_url` | Session |
| --- | --- | --- | --- |
| 2026-10-26 03:39:22.028000 | www.prepzii.com | https://www.prepzii.com/ | Original verification session |
| 2026-10-26 03:40:41.701000 | www.prepzii.com | https://www.prepzii.com/jee | Same original session |
| 2026-10-26 03:51:05.008000 | www.prepzii.com | https://www.prepzii.com/?analytics_check=20261026-fresh | New private-browser session |

The original session ID was `01a1764a-9228-7264-9356-551c9cc3812c`; the fresh private session ID was `01a17655-4c8b-7746-aa2a-a633d889f41e`. These are test session identifiers, not credentials.

`properties.environment`, `properties.$environment`, and `properties.$is_internal_or_test_user` were absent/blank on the inspected production events. The integration does not explicitly register an environment property. Production provenance is established by the actual browser visit, canonical host and URL, and active Vercel Production deployment, not by inventing an environment label. No environment filter was selected in Web Analytics.

Representative exact query:

```sql
SELECT
    toString(timestamp) AS timestamp_utc,
    properties.$host AS host,
    properties.$current_url AS current_url,
    properties.$session_id AS session_id,
    properties.$is_internal_or_test_user AS internal_user,
    properties.$environment AS sdk_environment,
    properties.environment AS environment
FROM events
WHERE event = '$pageview'
  AND properties.$host = 'www.prepzii.com'
ORDER BY timestamp DESC
LIMIT 10
```

## Reproduction and resolution

1. Confirmed project **586306**, Last 7 days, test-account filtering off. Localhost showed the reported 1 visitor / 32 pageviews / 3 sessions.
2. Selected the existing `https://www.prepzii.com` domain. Standard Web Analytics showed **0 visitors / 0 pageviews / 0 sessions**, despite the two stored production pageviews above.
3. Clicked PostHog's **in-page refresh**. With identical filters, totals became **1 visitor / 2 pageviews / 1 session**. Paths `/` and `/jee` had one view each.
4. Opened a new Chrome Incognito window and visited `https://prepzii.com/?analytics_check=20261026-fresh`. The real SDK-generated pageview arrived with the www HTTPS URL and a new session ID. No manual capture call or synthetic event POST was used.
5. Returned to standard Web Analytics: it still displayed **1 / 2 / 1**. Clicked the same in-page refresh: totals became **2 visitors / 3 pageviews / 2 sessions**. Homepage path now had two views and `/jee` one.

The repeated before/after refresh behavior establishes a stale dashboard query result, not failed production ingestion. The precise PostHog cache expiry was not inspected; no TTL is claimed. Browser navigation alone did not force a fresh dashboard result during this investigation.

## Other explanations checked

- **Wrong project:** ruled out by querying stored events inside the same project 586306 used by Web Analytics.
- **www/non-www or protocol mismatch:** fresh apex HTTPS visit produced a canonical `https://www.prepzii.com/` event. Production domain filter matched and counted it after refresh.
- **Timestamp/timezone exclusion:** all production timestamps fall on 26 October within the selected Last 7 days range. SQL string timestamps are UTC; the UI also displays local times in some views.
- **Missing session properties:** both original events share a session ID; the fresh private visit has a different one. Standard dashboard counted two sessions after refresh.
- **Internal/test filter:** off, and inspected production internal-user properties are blank.
- **Ingestion delay:** the new event was already queryable while the standard dashboard showed old totals. Refresh corrected totals; a deployment change was unnecessary.
- **Deployment regression:** Vercel still reports `dpl_4LuvniRrF6TJdQTNphtWHjjFo5Hp` READY, Production, commit `561f3a52ebe3f7e924b3d4abc975f8a3877f2838`.

## Changes and limits

Refreshed the dashboard and left its production domain selected. No website code, Vercel variables, authentication, consent configuration, or dependencies changed during this follow-up. No additional redeployment is required. No automated source tests were needed because there was no source change.

The earlier repair fixed missing production environment variables. Its Live-view verification was real, but did not verify freshness of the separate standard Web Analytics dashboard. That distinction explains why the earlier result and the subsequently observed zero totals could coexist.

Use the refresh icon inside PostHog beside the date selector when checking newly generated traffic. The Live tab and the standard dashboard use different refresh behavior; neither should be treated as a substitute for inspecting stored events when diagnosing discrepancies.
