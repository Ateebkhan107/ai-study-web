# Zi Phase 4: conversational test configuration

Scope: configure and confirm AI practice tests inside the existing floating Zi tutor and `/zi`. No questions are generated or saved. No new tables, test engine changes, scoring changes, authentication changes, analytics changes or official-PYQ modifications.

## Flow

1. The authenticated, validated and rate-limited existing `/api/zi/chat` route recognizes test-building requests before invoking Gemini or deducting trial prompts.
2. A deterministic parser extracts supported exam, subject, chapter/topic aliases, difficulty, question count, mode and timed duration. It supports follow-up changes and common number words. Existing official/PYQ question-bank requests retain their original action flow.
3. The existing server access context supplies the exam track and available subscription tracks. A generic JEE preference defaults to JEE Main; NEET defaults to NEET. An explicit permitted exam overrides the default. Advanced is rejected explicitly. Changing a subject clears an unrelated topic; supplying a previously missing subject preserves the topic already given.
4. Zi asks for the first missing setting and presents the shared configuration card through its existing `__ZI_VALIDATED_ACTION__` protocol. Collected settings are retained. Count is an integer from 5–30, timed duration an integer from 5–180 minutes. Practice mode removes duration.
5. Interactive edits call authenticated `/api/zi/test-builder`, which accepts only `update`, `confirm` and `reset`. Zod rejects extra fields and invalid values; server access checks apply to all updates.
6. The complete server summary must be reviewed before confirmation. A simultaneous edit-and-confirm request is refused. Any edits invalidate confirmation. Confirmation explicitly states that no test was generated or saved. There is no Start Test action for these drafts.

Configuration requests make **zero Gemini calls**, use no AI trial prompts, and remain rate limited. Exhausted trial users have a configuration entry button in the floating tutor; normal paid/free tutor access remains enforced server-side.

## Server ownership and privacy

Draft tokens contain authenticated AES-256-GCM encrypted state: owner, validated configuration, confirmation, revision and fixed one-hour expiry. HKDF separates the signing/encryption key domain. Prefer a dedicated server-only `ZI_TEST_BUILDER_SECRET`; otherwise the existing server-only `CLERK_SECRET_KEY` supplies the root key. No Clerk authentication behavior changes. All instances must use the same root secret. Secret rotation invalidates drafts.

The server authenticates every route, decrypts and verifies ownership/expiry, validates patches, and rechecks exam access. The public action contains configuration, missing fields, safe messages and an opaque token. It contains no owner identifier, answer key, model prompt, validation reasoning, service-role key or Gemini key. Responses are not cached.

Client drafts live only in memory, indexed by Clerk user ID. Both surfaces share this session store. Old cards become inactive after a newer configuration is received. Reloading the page loses the client draft. There are no database writes or migrations.

These are stateless drafts, not persisted test records. A student can replay an older **own** unexpired draft token. Revision is informational, not a distributed replay lock. Phase 5 must add durable idempotency/creation authorization before generation or saving can be enabled; confirmation alone must never authorize an unbounded generation job.

## Generation availability

- `ZI_AI_TEST_GENERATION_ENABLED` is a server-only future integration flag, default false. Even when true, Phase 4 remains fail-closed with `generationEnabled: false` and `verification_pending`.
- `ZI_AI_TEST_PROVIDER_STATUS=quota_blocked` supplies an explicit operator-maintained quota pause across instances. Without that setting, a locally observed unexpired structured-provider quota cooldown also reports `quota_blocked`. Reading this status makes no provider request.
- Otherwise, the UI honestly reports that generation is disabled pending live validation/security approval. It does not infer that an old daily quota error is still current or that a reset means the provider was verified successfully.
- No provider probe, fallback, quota bypass, generation endpoint, model switch or generation-service call was added.

`confirmedGenerationConfiguration` provides an internal future handoff containing `generationConfig` accepted by Phase 3 and separate `sessionConfig`. Chapter aliases preserve strict Phase 2 scope rules (including rotation/centre-of-mass exclusions); known chapter aliases are not incorrectly passed as exact topic filters. Unknown topics use exact topic scope. No current route invokes this handoff to generate questions.

## Files created

- `src/lib/zi/testGenerator/builder.server.js`: parser, strict patch schema, encrypted owner-bound draft state, access/confirmation/availability validation and future handoff.
- `src/app/api/zi/test-builder/route.js`: configuration-only authenticated endpoint.
- `src/components/zi/ZiTestBuilder.jsx`: shared compact responsive controls and safe summary.
- `src/components/zi/testBuilderSession.js`: user-scoped memory-only client token store and subscriptions.
- `src/lib/zi/testGenerator/builder.test.mjs`: deterministic configuration/security/availability tests.
- `src/lib/zi/testGenerator/builderRoute.test.mjs`: actual route handlers tested with mocked Clerk/access/provider/service boundaries.
- `src/components/zi/tests/testBuilder.test.mjs`: actual JSX rendered through both message components using Next's bundled Babel and React SSR; surrounding navigation/Clerk/rich-text presentation is mocked.
- `docs/zi-phase4-verification.md`: this report.

## Files modified

- `src/app/api/zi/chat/route.js`: intercept deterministic builder requests using the existing validated action marker; preserve ordinary tutor trial enforcement.
- `src/lib/zi/validation.js`: bounded optional draft token in chat requests.
- `src/lib/zi/prompt.js`: prohibit claims that an AI test was created; distinguish existing-bank actions.
- `src/lib/zi/provider.js`: read-only quota-status accessor; preserves preceding Phase 3.1 changes.
- `src/lib/zi/geminiRetry.server.js`: read-only cooldown accessor; retry policy unchanged.
- `src/components/zi/ZiLauncher.jsx`: pass/store draft tokens, preserve trial counts for configuration calls, surface server errors and configuration entry. Replace the existing synchronous usage-reset effect with guarded state adjustment so targeted lint passes.
- `src/components/zi/ZiPanel.jsx`: configuration entry when trial prompts are exhausted.
- `src/components/zi/ZiMessage.jsx`: floating tutor renders shared builder action.
- `src/components/zi/ZiWorkspace.jsx`: workspace renders shared builder action and passes/stores draft tokens; export its existing message component for rendering tests.

All unrelated pre-existing changes were retained, including battle and formula-card work and earlier generator/report files.

## Verification

Automated server suite: **124 passing** (77 existing tests plus 47 new builder/route tests). Shared UI/rendering suite: **7 passing**. Total: **131 passing**, no failures or skipped tests.

Coverage includes natural requests, missing settings, follow-up changes, exam defaults and override/access restrictions, Advanced rejection, invalid difficulty/counts/duration schemas, ownership/tamper/expiry, reviewed confirmation, safe configuration serialization, real route authentication and rate-limit handling, both Zi message paths, quota availability, future feature-flag restrictions, and Phase 3-compatible handoff scope. Existing scientific/originality/numeric/serialization tests continue to pass unchanged.

Commands (Node 24 runtime):

```sh
node --conditions=react-server --test src/lib/zi/testGenerator/*.test.mjs
node --test src/components/zi/tests/testBuilder.test.mjs
node node_modules/eslint/bin/eslint.js src/lib/zi/testGenerator/builder* src/components/zi/tests/testBuilder.test.mjs src/app/api/zi/test-builder/route.js src/app/api/zi/chat/route.js src/components/zi/ZiTestBuilder.jsx src/components/zi/testBuilderSession.js src/components/zi/ZiWorkspace.jsx src/components/zi/ZiMessage.jsx src/components/zi/ZiPanel.jsx src/components/zi/ZiLauncher.jsx src/lib/zi/validation.js src/lib/zi/prompt.js src/lib/zi/provider.js src/lib/zi/geminiRetry.server.js
node node_modules/next/dist/bin/next build --webpack
```

Targeted lint: passed. Production webpack build: passed, including the new configuration route and existing `/zi` page. Node's existing module-type warning remains because this repository does not declare ESM globally; no package-wide changes were made.

This is automated configuration verification, not a signed-in browser end-to-end run or live question-generation verification. No actual student database was changed and no live Gemini request was made. The prior Phase 3.1 daily-free-tier blocker has not been re-probed. AI question quality/release readiness remains unverified until controlled live validation is approved and passes.

## Remaining limitations and Phase 5 boundary

- The quota-independent parser covers bounded English request patterns and known chapter aliases, not unrestricted language understanding. Ambiguous/custom topics can require explicit subject selection or controls. Syllabus/reference availability is validated later by strict retrieval, not claimed during configuration.
- Weak-topic selection from saved performance is not connected; Zi asks students to choose a topic and explicitly declines to infer weaknesses.
- Drafts expire after an hour and do not survive browser reload. They do not persist tests, attempts or results.
- Runtime cooldown status is process-local; use the explicit operator status for a shared pause. Unknown provider status never enables generation.
- Generation, live validation, durable jobs/idempotency, secure test persistence, test-engine integration and results remain outside Phase 4. No Phase 5 work was started.
