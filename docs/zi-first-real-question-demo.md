# First real Gemini question demo — prepared, not executed

2026-10-25. **Ready for offline review and explicit execution approval, subject to development-key/account confirmation. Zero real provider requests.** Production Prepzii.com, hosted Supabase, PostgreSQL databases, public flags, credentials and deployments were not changed. The previous four-call Gemini 3.6 pilot remains blocked; its tests and gates are preserved.

## Smallest reliable path within $0.40

Use **one** generation request to the stable **`gemini-3.5-flash-lite`** model. Reuse the existing generation prompt/schema, question scope/rendering checks, numerical proof schema and fixed arithmetic verifier. The generated item must be exactly one Easy, single-correct JEE Main Physics Rotational Motion MCQ in the supported torque/angular-acceleration family. The model supplies the wording, values, options, answer, explanation and calculation proof; the live path does not substitute a fixture or fall back to mock data.

This is a **private first-question demo**, not a released generated test: there is no paid reference-analysis, blind-solve or AI audit call. Mathematical checks run locally; human explanation/originality/syllabus review is mandatory. No official PYQs are supplied or claimed. Originality is requested but not certified. No student session, submission or XP record is created.

Google's [model specification](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite) lists a **1,048,576-token input limit** and 65,536-token output limit, with structured outputs and thinking support. We budget the **entire documented input window**, including system instructions, context and schema, rather than claiming 16,000 bytes is 16,000 tokens. The wire request still has the existing restrictive 16,000-byte cap; it contains only text/schema and no tools, cache, files or media. Output is explicitly capped at **8,000 tokens**, including thinking under the reviewed [thinking/output-limit contract](https://ai.google.dev/gemini-api/docs/generate-content/thinking). LOW thinking, temperature 0.1 and one candidate are fixed.

The [Standard price table](https://ai.google.dev/gemini-api/docs/pricing) lists **$0.30/million input** and **$2.50/million output including thinking** for this model. At those rates:

`1,048,576 × $0.30 / 1,000,000 + 8,000 × $2.50 / 1,000,000 = $0.3345728`

That is the conservative maximum **token-cost estimate for this one request** under the documented model/rate contract, before tax. The ledger reserves **$0.39** before dispatch; the allowance stays exactly **$0.40**. Actual short-question usage is expected to be much smaller, but no optimistic token estimate is used for admission. No dollar amount here is a provider-enforced project-wide invoice cap: account tier/rates, taxes, unexpected provider behavior and other clients require separate account confirmation. The policy expires on **2026-10-26 at 23:59:59 UTC**; after that, documentation/pricing must be re-reviewed before a new plan/approval. No permission to change production billing or key restrictions is implied.

## Concrete prepared plan

- Root: `/private/tmp/prepzii-gemini-pilot-JpS3SB`
- Authorization ID: `first-real-demo`
- Manifest hash: `7c17b6f8deebd1869cba3c4aba57c798d9d41850c173a09f92482949daf28e04`
- Private files: `plan.json`, `request.json`, `display.html`.
- `display.html` currently states that approval is pending and no question exists. It does not show a mock as genuine AI output.
- **No `approval.json` exists and no live receipt has been created.**

The plan binds the exact root, model, single-request allowance, request hash, fixed policy and selected implementation hashes. Editing those sources or payload invalidates the plan. Regenerate/review a plan after any such change; do not weaken hash checks.

After successful approved execution, the local display will be:

`/private/tmp/prepzii-gemini-pilot-JpS3SB/first-real-demo/review.html`

Open that file directly in your browser; no server or hosted application is needed. It shows the generated statement, four options, answer and explanation, with human-review limitations. Provider text is escaped; CSP denies network/scripts. HTML/results remain private 0600 files inside 0700 directories, outside Git.

## Exact command — only after separate approval

The development key must already be supplied privately as `GEMINI_API_KEY` in this process's environment; never paste it into chat or command arguments. The runner does not load `.env.local`, import normal application credentials or modify environment files. A key is present in the local env file, but its project ownership/type/permissions have not been authenticated. Do not source the whole application env to obtain it.

After the user confirms the development project and reviewed account pricing and explicitly approves this exact single request, prepare the private approval file in this root. It must bind the manifest hash above, authorization ID, model, maximum requests 1, $0.40 allowance in nanodollars, a one-hour-or-shorter expiry, `developmentProjectConfirmed:true`, `standardPricingConfirmed:true`, and the private fingerprint of the exact development key. The fingerprint and key are not included in public reports. No approval file is generated automatically by `--prepare` or by dry runs.

Then the exact execution command is:

```sh
cd /Users/ateebmazhar/Desktop/ai-study-web
ZI_PILOT_EXECUTION_AUTHORIZATION=first-real-demo \
  /Users/ateebmazhar/.nvm/versions/node/v22.23.2/bin/node \
  --conditions=react-server scripts/zi-pilot/demo.mjs --execute \
  /private/tmp/prepzii-gemini-pilot-JpS3SB
```

**Do not run it before approval.** Without the private matching grant and key, it refuses. Production/preview/Next/application/DB environments are rejected. The raw Gemini transport opens only after authorization and durable reservation; no normal chat route or public flag can enable it. Only the pinned Gemini hostname, HTTPS 443 and exact selected-model generateContent path are used. General fetch/HTTP, hosted Supabase, Unix DB sockets and subprocesses remain denied. There is no SDK, retry, fallback, redirect following, token probe or concurrent request.

Every call spends the single-request identity. The existing ledger fsyncs the receipt before I/O, retains reservations for errors/timeout/crash/unknown metadata, and rejects any second dispatch. Approval is rechecked when the one-shot transport opens. A dry run uses a separate `offline-check` identity and cannot count as real generation. Real mode cannot invoke mock fallback. Missing or inconsistent usage, unexpected model identity, invalid schema or wrong arithmetic stops without releasing a review artifact; failed/uncertain work is never silently retried.

## Model/API permissions: verified versus unknown

Verified from official public documentation: model ID, input/output limits, structured output and LOW thinking support, published Standard token rates and server API-key authentication. [Google's API-key guidance](https://ai.google.dev/gemini-api/docs/api-key) distinguishes project-billed standard keys and service-account-bound authorization keys. It documents restrictions on unrestricted standard keys. Do not assume any key-shaped string has valid access.

Owner confirmation still required, privately and without changing production: dedicated development Google project/key; Generative Language API enabled; compatible API/key restrictions and (for authorization keys) service-account access; selected model access, quota and Standard/free-versus-paid account billing. Server IP restrictions must permit this Mac. Actual remote key validity, native TLS/DNS behavior, live JSON-schema acceptance, usage fields/model version and scientific quality remain **untested**. Do not grant broad IAM roles, loosen existing key restrictions, or run a probe automatically to resolve refusal. The one authorized call itself may fail closed; that does not authorize another attempt.

## Implementation and evidence

New files: `scripts/zi-pilot/demo-policy.mjs`, `demo-network.cjs`, `demo.mjs`, `demo.test.mjs`. Existing `accounting.mjs` now recognizes the explicit fixed one-call demo profile while keeping its default four-call policy; `gemini-once.mjs` can label the explicitly selected model correctly. Existing original pilot gates remain unchanged. The display and demo are CLI/files only; Clerk/RLS/XP protections and app/UI routes are untouched.

Offline checks:

- **PASS:** 56 previous pilot/boundary regressions after adding the profile.
- **PASS:** 8 demo tests, including full-input-window cost, unchanged allowance, dry/real distinction, payload drift, one-call ledger/replay, exact approval/key binding, network denial, mocked one-shot endpoint transport and numerical/display escaping checks.
- **PASS:** ESLint on all pilot scripts.
- **SKIPPED:** actual Gemini/account/quota/permission checks, real TLS/API schema behavior, real question quality, hosted/database integration and a new app build. No app/Next component was changed.

Private logs: `/private/tmp/prepzii-first-demo-checks-i0kw5tae/`. `pilot.log` records the prior regressions and first seven demo tests; `demo-authorization.log` records the final eight demo tests; `lint-authorization.log` records lint. `approved-scope-plan.log` records preparation only, **not authorization**. Older plans and lab/test evidence are retained.

**Decision:** the shortest technical demo path is prepared and offline-verified. Execution remains paused for confirmation of the development key/account and separate explicit approval of exactly one request at the stated pre-tax exposure. The four-call Phase 6.4 pipeline and public/production generation remain NO-GO. Do not interpret this report or a dry-run success as execution authorization.
