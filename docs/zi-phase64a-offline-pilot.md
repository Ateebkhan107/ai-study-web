# Phase 6.4A — offline one-question pilot preparation

2026-10-24. **GO for offline evaluation; NO-GO for live Gemini execution.** This change adds a standalone CLI and deterministic fixtures/tests under `scripts/zi-pilot/`. No application, route, feature flag, environment file, production 5–30 question constraint, Clerk behavior, migration, database or XP policy was changed. No Gemini request or hosted database connection was made. Existing PostgreSQL 17.6 lab and Phase 5/6 evidence were preserved.

## Run locally

Use Node 22 or newer, as required by this repository. This command constructs a clean environment without provider/database credentials and does not load `.env.local`:

```sh
cd /Users/ateebmazhar/Desktop/ai-study-web
env -i PATH=/usr/bin:/bin /Users/ateebmazhar/.nvm/versions/node/v22.23.2/bin/node --conditions=react-server scripts/zi-pilot/run.mjs
```

It creates a fresh private `/private/tmp/prepzii-one-question-<random>` directory, prints that directory, run ID, status and mock dispatch count, and retains evidence. It does not start a server. The intended result is `offline_checks_passed_human_review_required`, four mock requests and zero live requests. Review `first-question/review.json` privately; it includes the synthetic answer and explanation. Files are mode 0600; directories are 0700 and must belong to the current OS user. Do not commit these artifacts or share answers unnecessarily.

To verify replay refusal, use the **same printed directory** and default run ID:

```sh
env -i PATH=/usr/bin:/bin /Users/ateebmazhar/.nvm/versions/node/v22.23.2/bin/node --conditions=react-server scripts/zi-pilot/run.mjs --root /private/tmp/prepzii-one-question-REPLACE_WITH_PRINTED_SUFFIX
```

The second execution must exit unsuccessfully without changing the journal or dispatching another request. The example placeholder is not a real path. Never remove the run directory to make an uncertain execution retry. Different roots/run IDs are separate **offline** experiments; they must not be treated as permission to repeat a future paid pilot.

Run focused tests:

```sh
env -i PATH=/usr/bin:/bin /Users/ateebmazhar/.nvm/versions/node/v22.23.2/bin/node --test scripts/zi-pilot/run.test.mjs
```

## Scope and reuse

Exactly one Easy, single-correct JEE Main Physics Rotational Motion question is evaluated. Scope is fixed internally; CLI options cannot alter count, subject, difficulty, endpoint, credentials or provider. Production `validateGenerationConfig` is explicitly checked to continue rejecting one question. The pilot uses the existing candidate/batch schemas directly rather than inventing a five-question application job.

Reused modules: generation JSON schemas/prompts, pattern-analysis schema and reference-citation validation, question structure/rendering validation, student-safe serializer for blind solving, normalized originality comparison, blind/audit schemas, answer agreement and deterministic numerical validation. The proposed calculation is `torque_acceleration`. The result is a private quality artifact, not a stored student test/session and not a reward event.

The five reference fixtures and the question are invented, deterministic test data. Analysis instructions, payload provenance, journal and result label them `synthetic_offline_fixture`. They are **not official PYQs**, evidence of current syllabus coverage, or proof of originality. The analysis prompt deliberately differs from the application's official-PYQ prompt to avoid misrepresenting provenance. No real reference pack was imported from production or retrieved online. Separate blind/audit fixture outputs test the contract; they do not constitute independent scientific review.

## Hard offline controls

- The CLI imports a deterministic mock directly. No Google SDK, live provider module, Supabase adapter, PostgreSQL client, application environment loader or child process is used by the runner. The reused import graph contains no database/provider transport.
- Its network guard denies fetch, HTTP(S), HTTP/2, sockets including Unix database sockets, TLS, tested DNS paths, subprocess creation and workers. This blocks both hosted databases and the retained local database. This is a trusted local test process with transport denial, not a general sandbox for arbitrary malicious JavaScript/native addons.
- Production/known hosted launch environments are refused. Ambient provider/database configuration and NODE_OPTIONS are rejected. No listener, browser route, Clerk sign-in substitution or public endpoint is added.
- `--live` and even `ZI_PILOT_LIVE_APPROVED=true` are refused. **No switch can currently enable real execution.** Future live support needs separately reviewed implementation and explicit approval; merely adding a key or changing a flag is insufficient. Normal mock application's Gemini/hosted-network denial remains unchanged.
- Each run acquires an exclusive persistent directory before creating a journal. That directory is the cross-process lock and is never automatically removed. Existing identities are refused regardless of success, failure, shutdown or crash. Symlink roots, unsafe owners/modes, traversal IDs and unknown arguments are rejected.
- Append-only journal writes are fsynced. Each dispatch is durably recorded before mock execution, with configuration/reference/body hashes, full serialized request size and reservation. A maximum of four dispatches is enforced before each call. There is no retry, fallback, continuation or replenishment loop, and no SDK exists to retry underneath it.
- Missing, inconsistent, excessive or multi-request usage makes the run held. Provider error, timeout or interrupted pending work also holds it. Known invalid/incomplete output or quality failure ends the run without a review artifact. Neither path retries or refunds reservations. A hard crash leaves the final dispatch unacknowledged; classify it as uncertain/held for review, never safe to resume.
- SIGINT/SIGTERM abort pending work, persist the uncertainty state and leave the lock intact. SIGKILL/power loss may prevent a final status append, but the durable dispatch and persistent directory still refuse replay. Corrupted/truncated journals are not repaired or replayed automatically. Same-filesystem durability assumptions are local to this Mac; this is not a production distributed job ledger.
- A private result is written only after all checks pass. An interrupted final artifact write cannot authorize another run. Inspect the final journal and artifact hash together; a partial artifact or missing completion is not a successful run.

## Request and token configuration

| Property | Offline implementation / intended later configuration |
| --- | --- |
| Actual provider | `deterministic-offline-fixture`; zero network requests |
| Intended Gemini model | Explicit `gemini-3.6-flash`, not the deprecated 3.5 alias; no live model chosen or invoked by this script |
| Expected successful sequence | Analysis → one candidate → blind solve → audit: exactly four mock dispatches |
| Hard request maximum | Four per persistent run identity, including analysis and validation; stop early on failure |
| Automatic attempts | One per stage; no SDK, retries, model fallback, tools, cache or search |
| Planned generation settings | JSON schema output, temperature 0.1, LOW thinking, `includeThoughts:false`, 8,000 maximum output tokens per request |
| Serialized input boundary | At most 16,000 UTF-8 bytes/request, including system text, escaped payload, schema and request framing; the budgeted JSON envelope mirrors the existing REST adapter and is never transmitted |
| Reservation ceiling | At most 96,000 local units/run: four times (16,000 bytes + 8,000 output units); every admission checks the remaining budget before dispatch; no refund |
| Configured output caps | Four × 8,000 = 32,000; all synthetic usage components are checked, including thought tokens |
| Deadlines | 45 seconds per request; 240 seconds overall; timeout scenarios use an accelerated 20 ms test clock |

Input bytes are not an exact model tokenizer or certified billed-input count. The runner checks positive integer usage and reconciles input + candidate output + thoughts against total, reservations and the configured output bound. Current mock usage is invented (150 units per successful stage, 600 total), not an actual token measurement. Hiding thought text does not disable thinking charges. Live billable usage, model-specific cap behavior, schema acceptance, key validity, quota and pricing tier remain unverified. No claim of a guaranteed dollar cap is made. The conditional $0.168 planning estimate in the Phase 6.4 report remains conditional, not implemented billing protection. A future live adapter's exact serialized payload and provider usage semantics must be re-reviewed.

## Human review before any candidate release

Record reviewer, date and artifact hash; the result remains pending until these checks are signed off:

1. **Mathematics:** solve independently without the generated key; check net torque, axis, inertia, signs, explicit units, assumptions, rounding and exactly one numeric match. Recompute `alpha = torque / inertia` by hand.
2. **Answer agreement:** compare independent solution, stated key, deterministic calculation, blind response and audit. Any ambiguity, contradiction or missing step rejects the item.
3. **Originality:** compare wording, physical setup, solution structure and distractors against a reviewed reference pack. Reject copies, paraphrases and number-only substitutions. The tiny synthetic sample is not comprehensive evidence.
4. **Syllabus:** verify current official JEE Main Physics syllabus and Rotational Motion relevance using separately reviewed authorized material; invented references and historic labels do not certify this. Judge Easy difficulty against actual exam expectations.
5. **Explanation:** confirm clear logical steps, valid formula application, substitution, units and final answer; no unsupported claims or misleading distractors. Check rendering and readability.
6. **Provenance/safety:** preserve synthetic labels, exclude secrets/personal data, verify all four stages and acknowledgements, absence of held dispatches, and artifact hash. Passing mocked validation is not acceptance of live AI quality.

## Executed checks and remaining gates

| Check | Actual outcome |
| --- | --- |
| New offline runner suite | PASS — 26 tests: successful numerical path, fifth-request refusal, budget/prompt refusal, uncertain usage, errors/timeouts, invalid answers/numerics, missing audit, multiple questions, copying, duplicate/concurrent runs, crash/restart, shutdown, configuration and transport denial |
| Existing generation/jobs/provider suites | PASS — 59 tests; provider fetches mocked |
| Existing local chat/isolation suites | PASS — 12 tests on Node 22.23.2 |
| ESLint on four new script files | PASS |
| Initial additional chat invocation | FAILED on shell Node 20 (`registerHooks` unavailable); corrected to required Node 22 and all 12 passed; no source workaround |
| New browser journey, UI/build, database suites | SKIPPED — standalone script only; existing app/UI/lab unchanged |
| Actual Gemini, token-count/model-list, quota/billing probes | SKIPPED — prohibited, no live adapter |
| Hosted Supabase, migrations, deployment, public activation | SKIPPED — prohibited |

Private logs: `/private/tmp/prepzii-phase64a-checks-1d7m748z/`; final runner results are `offline-pilot-envelope.log`, lint is `lint-envelope.log`, and the local mock regression log is `local-mock-regression.log`. Successful artifact paths are recorded in the test log. Earlier run artifacts and logs are retained, not overwritten or deleted.

**Remaining live blockers:** real authorized reference pack and syllabus review; exact development Gemini project/key restrictions/model access/quota/billing confirmation; separately reviewed minimal live transport with retries demonstrably disabled, exact four-call accounting including unknown outcomes, token/currency admission proof and durable approval identity; explicit user authorization of the exact run, spending boundary and local evidence target. A live transport must not reuse root hosted credentials or relax the existing mock network guard. No authentication/ownership claim is established by this operator-only quality CLI. Any later authenticated student/session integration must preserve the previously accepted Clerk/ownership contracts.

This step is complete for offline preparation only. The next action is review of these artifacts and decisions; real Gemini execution remains NO-GO and requires separate explicit approval.
