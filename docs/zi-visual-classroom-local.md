# Zi Visual Classroom local preview

This preview uses application-authored lesson fixtures. All teaching copy and diagrams require subject and language review before student release.

## Open the preview

Use Node 22 and the repository's installed dependencies.

```sh
node scripts/zi-classroom/local.mjs
```

Open [the local dashboard](http://127.0.0.1:3471/dashboard), launch Zi, and select **Visual Classroom**. The harness uses a synthetic student and a mocked chat stream in a temporary Next.js app. It listens on loopback, omits the application's environment files, and blocks external requests. Stop the server with Ctrl+C.

The regular dashboard opts in through the server-only `ZI_CLASSROOM_FIXTURES=1` setting in a local development environment. It requires a signed-in student whose identity matches the server-rendered capability and the existing panel must be available to them. Use the isolated preview for fixture development where the regular app points to hosted services.

## Checks

```sh
node --conditions=react-server --test src/lib/zi/classroom/classroom.test.mjs
node --test src/components/zi/tests/testBuilder.test.mjs
```

For browser checks, use a locally installed Playwright and Chromium. `ZI_BROWSER_PLAYWRIGHT` can point to the local Playwright package and `ZI_BROWSER_CHROMIUM` can point to a Chromium executable.

```sh
node scripts/zi-classroom/local.mjs --test
node scripts/zi-classroom/local.mjs --test --disabled
node scripts/zi-classroom/local.mjs --test --production
```

The production check leaves the fixture setting opted in while exercising a production build of the isolated harness. The expected result is ordinary Zi without a Classroom entry.

## Scope

The three fixtures cover projectile motion under the level-ground, constant-gravity, no-drag model, Lewis-style ionic and covalent bonding, and selected parts of a schematic animal cell. Explanations are available in English and Hinglish. Lesson position lives in the mounted Zi panel session.

Gemini-backed lesson selection remains gated on accounting rollout approval, a trusted active-test reveal decision, and an action transport that prevents provider prose from impersonating a validated action.

## Phase 2A selection

In the isolated preview, send `/classroom projectile motion` or `/classroom chemical bonding` from Zi chat and choose **Open whiteboard**. Add ` Hinglish` for Hinglish explanations. `/classroom cell structure` requires a NEET profile. The browser harness uses a synthetic JEE Main AI Mode profile. The original fixture picker remains available for local review of all three templates.

Selection requires both local settings, `ZI_CLASSROOM_FIXTURES=1` and `ZI_CLASSROOM_SELECTION=1`, plus an authenticated AI Mode account and server-verified reveal eligibility. The command resolves a fixed template from the application-authored fixture registry awaiting subject sign-off. It does not dispatch to the provider or create a trial reservation. The harness exercises the real chat route with substituted authentication, storage, and provider modules in a temporary copy.

Zi chat now sends NDJSON records for prose, authorized actions, and completion. A client renders an action only after a complete framed response. Plain-text responses remain readable as prose. Roll out the clients and route together before enabling production use of this protocol.

The reveal policy is conservative. An active, missing, inconsistent, or unverified assessment restricts the response to general study guidance. Historical bank sessions that still say `in_progress` require complete, owner-bound submission evidence. A bounded scan, unavailable storage, or stale schema cache can withhold visuals and model dispatch. Generated review checks its ownership, completion, and question membership without projecting generated answer content into the Zi prompt. It has no new review UI entry point in this phase. PYQ reveal is verified for a requested item. Browser-only PYQ navigation and pasted questions have no durable global session record.

Before Phase 2B, validate the policy against the target database grants and historical session state, assess the cost of owner-scoped lookups, and review concurrent test start and submission behavior. Separate REST reads are not a transactional snapshot. Trial-accounting rollout and live-provider approval remain separate release requirements.
