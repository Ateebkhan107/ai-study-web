# Zi PYQ pattern analysis — Phase 2 verification

Verified against the connected Supabase database and existing Zi Gemini provider
on 16 October 2026 (India time). Database operations were read-only. Question
generation, migrations, authentication, UI and test-engine changes are excluded.

## Live cases

| Request | Fetched rows (including overlap) | Unique candidates | Usable selected | Analyzed | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| JEE Main Physics, Rotational Motion | 120 | 120 | 16 | 16 | analyzed; cache hit confirmed |
| JEE Advanced Physics, Rotational Motion | 8 | 4 | 1 | 0 | insufficient_references; no AI call |
| NEET Biology, Human Physiology | 120 | 80 | 16 | 16 | analyzed; cache hit confirmed |
| Main Rotational Motion, nonexistent exact topic | 0 | 0 | 0 | 0 | insufficient_references; no AI call |

Advanced had only four matching published candidates in the strict joined query.
Three had image/layout dependencies. No Main questions were substituted to fill
the sample. The one surviving reference ID was
`80641370-7566-4a46-a419-e0cc5b75b1d5`; it was retrieved but **not analyzed**.

Main exclusions: 47 image/layout dependencies, three duplicate statements and two
invalid answer keys. NEET exclusions: 25 image/layout dependencies and one
incomplete content row. These describe the bounded candidate windows only.

Both successful live analyses used `gemini-flash-lite-latest`, an existing Zi
availability fallback. The configured primary model was not replaced. Gemini's
schema incompatibility was fixed by sending its structural schema subset while
retaining full server-side Zod validation. A temporary NEET 503 required a separate
bounded retry; failed requests did not produce successful or cached summaries.

## Actual output excerpts

These are selected fields from successful live outputs, not mock patterns.
Complete service results also contain formulas, question structures, reasoning,
distractors, combinations, difficulty observations, classifications, provenance,
all reference IDs, retrieval statistics and coverage limitations.

```json
{
  "status": "analyzed",
  "exam": "JEE Main",
  "subject": "Physics",
  "chapter": "System of Particles & Rotational Motion",
  "topic": null,
  "numberOfQuestionsAnalyzed": 16,
  "questionDistribution": {
    "nature": { "conceptual": 2, "numerical": 14 }
  },
  "difficultyCharacteristics": {
    "sourceLabelCounts": { "Medium": 16 }
  },
  "conceptDistributionExcerpt": [
    {
      "concept": "torque",
      "count": 3,
      "proportionOfSample": 0.1875,
      "referenceIds": [
        "2d4a5d70-48db-42aa-bb04-648ca1dd0b01",
        "1eef2a4b-5f37-4174-98d2-a9b85778b274",
        "6505c846-05d2-4948-bd5a-ecb289863025"
      ]
    }
  ]
}
```

NEET's returned summary describes factual anatomical/cellular knowledge,
physiological processes and clinical disorders, with single-correct MCQs,
statement evaluation and textual matching structures. All 16 were classified
conceptual; source labels were nine Easy and seven Medium.

```json
{
  "concept": "digestion",
  "count": 3,
  "proportionOfSample": 0.1875,
  "referenceIds": [
    "947353c4-e1f9-4350-96ce-b04dfd905513",
    "372b6032-02e9-4796-910a-8a0b0bfac1c4",
    "3b6caae1-c653-4d85-8fb2-5f69c4c3ac1d"
  ]
}
```

## Checks

- 29 unit tests passed: scope normalization, strict query construction, Main vs
  Advanced filtering, candidate bounds, literal topics, quality exclusions,
  insufficient data, citation integrity, output validation, duplicate handling,
  noncopying checks, provider cancellation, schema requests and bounded fallback.
- Targeted lint passed for all changed executable files.
- Production build passed using `next build --webpack` with network access for
  the existing Google Fonts. The sandboxed build could not fetch those fonts;
  the default Turbopack build stalled and was stopped.
- Source-wide lint found an existing `react-hooks/set-state-in-effect` error in
  `src/components/zi/ZiLauncher.jsx:63`, plus warnings. Full repository lint also
  includes existing vendored `venv` errors (45 errors, 50 warnings total).
- Existing uncommitted changes were preserved. A full working-tree whitespace
  check reports pre-existing trailing whitespace in `BattleRoomClient.jsx:467`.

## Known limits

Chapter mappings include combined syllabus chapters, so narrower semantic intent
can be affected by broad or inaccurate source labels. Images are excluded
conservatively. Candidate sampling is bounded, not exhaustive or unbiased.
Difficulty is source metadata; concepts/reasoning are AI-inferred. No independent
scientific verification or current-syllabus certification is claimed. Cache is
process-local, nonpersonal and opportunistic; it is not distributed rate limiting.

Phase 2 stops at this server-only service and verification tooling.
