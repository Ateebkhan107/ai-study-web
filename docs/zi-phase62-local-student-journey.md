# Phase 6.2 — complete local synthetic student journey

2026-10-22. **The browser journey was executed successfully**, rather than inferred from unit tests. Local synthetic verification: GO. Hosted integration, real provider use, deployment and public generation: NO-GO.

## What actually ran

The real Zi workspace, conversational builder, HTTP route handlers, guarded orchestration, PYQ retrieval/analysis validators, question-generation/validation pipeline, private storage DAL, test interface, result page and answer review ran in a separate loopback-only Next.js fixture. Storage, reservations, revision checks, grading and submissions used the existing isolated PostgreSQL **17.6 / 170006** lab.

The temporary app replaces Clerk with two signed synthetic sessions, Supabase transport with a guarded local SQL adapter, and Gemini transport with deterministic structured responses. It uses a minimal test shell instead of the hosted dashboard/onboarding shell. These substitutions exist only in `/private/tmp`; the application's Clerk configuration, proxy, authorization and database clients are unchanged. This is a complete **mocked local journey**, not a live Clerk/Supabase/PostgREST/Gemini acceptance pass.

No `.env` files or production credentials were loaded/copied. Provider credentials are absent, the fixture provider has no real Gemini transport, and external fetch/TLS requests are blocked in the fixture process. The server binds only `127.0.0.1:3462`. Pilot flags are injected into this mock process only; public generation remains disabled in the original application. Every SQL batch checks the exact socket, version, port, operator, database ownership, data directory, listener isolation and filesystem ownership/mode.

Fixture: `/private/tmp/prepzii-phase62-5HlcU7`.
Fresh synthetic database: `zi_phase61_jobs_1792682346978`.
Original lab: `/private/tmp/prepzii-pg176.ujiylN`, socket `/tmp/prepzii-phase5-pg17`, port `55436`.
All Phase 5/6.1 databases and evidence were retained; no database was reset/deleted. The fresh fixture installs the existing Phase 5 candidate and Phase 6.1 job migration in their tested order.

## Browser findings and fixes

1. **Local same-origin handoff rejection — fixed.** Next's Node adapter constructed `request.url` with `localhost`, while the browser sent Host/Origin for `127.0.0.1`. Comparing Origin only with `request.url` would reject legitimate generation POSTs. The check now uses the actual HTTP Host with the request protocol, rejects malformed/foreign origins and ignores arbitrary forwarded-host headers. A focused regression test covers this boundary.
2. **No clear autosave acknowledgement — fixed.** An immediate refresh can discard an answer still inside the existing 250 ms save debounce. The interface now shows “Saving answers… Wait for confirmation before refreshing” and “Answers saved. Safe to refresh.” This does not promise durability before acknowledgement or silently replay an uncertain save. Saved answers and review markers were observed after reload, and the timer did not restart.
3. **Repeated expiry submission after an error — fixed.** A failed generated submission previously reopened the expired timer's automatic retry path. A generated failure now stops the timer/retry latch, pauses saves, disables submission and offers “Reload saved session.” Reload reconciles the existing server session, including a submission that may already have committed. Normal-bank submission behavior is preserved.

The fixture itself initially used a leading-underscore route directory, which Next treats as private, and initially compared login against the adapter's internal hostname. Those test-shell issues were corrected before accepted runs. They were not counted as passing student steps. One API-check invocation also supplied a result UUID instead of a generated-test UUID and stopped before mutations; its evidence is retained and is not a PASS.

No reward policy, XP amount, migration, question format, session grading rule, production flag or existing student balance was changed. Added files are local test utilities/fixtures and this report; application changes are limited to the three journey fixes above.

## Actual PASS / FAIL / SKIPPED

| Verification | Result | Evidence/limit |
| --- | --- | --- |
| Conversational request → configuration → confirmation | PASS | Requested a 10-question JEE Main Physics test, then supplied Rotational Motion, Medium, timed, five minutes; confirmed the reviewed summary |
| Confirmation → job → validation → private storage | PASS | Two browser-created jobs reached `ready / complete / 10/10`; seven accounted mock structured calls/job (analysis plus two generation/blind/audit batches) |
| Mobile test-taking → normal submit → results/review | PASS | Student A: 3 correct, 1 wrong, 6 unanswered, **11/40**, 75% accuracy; all ten questions available in authorized answer review |
| Timer and refresh | PASS | Countdown decreased instead of resetting; saved choices and review markers returned after reload. Expiry branch used a synthetic shortened deadline, not a five-minute wall-clock endurance test |
| Save failure/recovery | PASS | Injected one synthetic pre-write save failure; submission paused, error visible; reload reconciled state and saving resumed |
| Expiry submit failure/recovery | PASS | Injected one pre-commit submit failure at expiry; one failed PUT without repeated timer alerts/PUTs; reload completed the stored answer, **4/40**, 1 correct/9 unanswered |
| Ownership and private answers | PASS | Wrong student gets 404 for start/save/submit/result/review; browser shows “Result not found.” Signed-out/forged synthetic sessions get 401. Before submit, question DTOs omit answer keys/explanations and result/review return 409 |
| Duplicate submission | PASS | Concurrent real local PUTs returned the same attempt/session ID and left committed answers/result/revision/submission timestamp unchanged |
| Phase 5 and XP | PASS | Generated sessions created no legacy attempt or XP receipt; all existing synthetic XP profiles equal the Phase 5 opening snapshot, and direct service-role XP UPDATE remains denied |
| Responsive layout | PASS | Test/palette and result on narrow mobile; session/review on 1280px desktop; 390px result viewport has 390px scroll width. Screenshots retained |
| Automated server regressions | PASS — **228** | Includes generation, authorization, route contracts, quota handling, private delivery, idempotency and the local-origin regression; no real provider calls |
| UI rendering regressions | PASS — **14** | Actual builder/session rendering tests; distinct from the browser walkthrough above |
| Offline build | PASS | Fresh source copy, synthetic configuration only, external network denied |
| Lint / whitespace | PASS | Zero lint errors; two existing `<img>` optimization warnings remain in the session page; Git whitespace check clean |
| Remaining local core-journey failures | **None in final runs** | Resolved initial failures described above; they are not relabeled as PASS |
| Real Clerk, hosted Supabase/PostgREST/LMS, full onboarding/navigation | SKIPPED | Test-shell authentication/transport do not prove hosted behavior |
| Live Gemini correctness/originality/quotas/billing | SKIPPED | No real calls; synthetic conceptual MCQs do not establish live educational quality or deterministic numerical coverage |
| Browser automatic fullscreen acceptance | SKIPPED | Embedded browser rejected automatic fullscreen; exam protection was not weakened. Core session/timer flow continued |

The API scripts exercise actual local HTTP routes and actual SQL, not canned HTTP responses. There are seven distinct API scenario groups across pre-/post-submission runs. Browser actions were performed through computer-use tooling; the standalone API/server/UI tests are separately reproducible.

Evidence: `/private/tmp/prepzii-phase62-5HlcU7/evidence/` contains `browser-walkthrough.json`, API result JSON, server logs, control records and screenshots. Regression/build logs: `/private/tmp/prepzii-phase61-build-VZYhqu/evidence/`. Database installation/Phase 5 routine-preservation evidence: `/private/tmp/prepzii-pg176.ujiylN/evidence/phase61/zi_phase61_jobs_1792682346978/`.

## Manual browser test — available now

1. Open **http://127.0.0.1:3462/zi**. Confirm the yellow **SYNTHETIC LOCAL TEST** banner. Click **Student A** or **Student B**. These are local fixture identities, not Clerk logins; no credentials are needed.
2. Send: **Create a JEE Main Physics test on Rotational Motion with 10 medium questions, timed test for 5 minutes**.
3. Check all summary fields. Click **Confirm configuration**, then **Generate confirmed test**. Expect preparing/reserved/running states, followed by **ready · complete · 10/10 verified** and **Start test**.
4. Open **Start test**, choose answers and move through questions. Wait for **Answers saved. Safe to refresh.** before reloading. Verify saved selections and the decreasing timer. On mobile use **Palette** to navigate questions.
5. Click **Submit** / **Submit Test**. Review the score and counts, then **Review Answers**. The fixture's correct option is A; choosing A for three questions and B for one, leaving six blank, yields **11/40**. Submitted test links return the committed result rather than creating another attempt.
6. For ownership isolation, copy a generated test/result URL, switch to the other student using the banner and open it. Expect access rejection / result not found. Switch back to the owner to view it.

The fixture deliberately supplies ten conceptual rotation MCQs. Use the exact scope above; it is not a general-purpose live AI generator. Current A and B each used one of their two daily reservations; each has one fresh reservation remaining. Duplicate use of an existing confirmed draft reuses its job. To repeat freely, start a **new synthetic fixture/database** rather than resetting budgets or deleting evidence.

### Start/restart from a terminal

The fixture server is currently retained running. Do not start the original credential-bearing dev environment for this exercise.

If this fixture server has stopped, resume its preserved database/copy:

```sh
cd /Users/ateebmazhar/Desktop/ai-study-web
/Users/ateebmazhar/.nvm/versions/node/v22.23.2/bin/node src/lib/tests/phase62LocalJourney.mjs --serve /private/tmp/prepzii-phase62-5HlcU7
```

For a fresh run, first stop only the fixture launcher you started (Ctrl+C), then run:

```sh
/Users/ateebmazhar/.nvm/versions/node/v22.23.2/bin/node src/lib/tests/phase62LocalJourney.mjs
```

It creates a new guarded synthetic database and temporary source copy, prints their paths, and binds port 3462. A port conflict must be resolved by stopping your own fixture; do not terminate unrelated servers. Keep the launcher running while testing. Ctrl+C stops the fixture server without deleting its database/evidence. The original PostgreSQL 18 installation is never used.

### Repeat API and automated checks

With the fixture running, use a **generated test UUID from the Start test URL**, not the result/session UUID:

```sh
/Users/ateebmazhar/.nvm/versions/node/v22.23.2/bin/node src/lib/tests/phase62ApiChecks.mjs /private/tmp/prepzii-phase62-5HlcU7 7e417202-d9e0-4173-832e-c8238b14fd6c
/Users/ateebmazhar/.nvm/versions/node/v22.23.2/bin/node src/lib/tests/phase61LocalChecks.mjs
```

The API checker verifies the fixture health/database marker before requests and checks database isolation before SQL. Optional fault controls are in `phase62FixtureControl.mjs`; they only target the two named synthetic actors and can shorten a synthetic active deadline or fail one synthetic save/submit. They are not application/production endpoints.

Hosted authentication, Supabase transport/RLS integration, real provider quality and all outstanding Phase 5 release gates still require separate approval and verification. No hosted or production action is authorized or performed by this local journey.
