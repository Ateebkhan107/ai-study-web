# PrepZii Phase 3 — local generation review

> Historical first-run examples, retained for human review. These passed the earlier validator in this session, not the final `zi-questions-v1.1` validator. The Physics example is a direct substitution that the strengthened medium-difficulty gate would now reject. The final live rerun was blocked by Gemini HTTP 429 before generation; see `zi-phase3-live-review-final.md`. Do not treat these examples as production-approved questions.

Run: 2026-10-15T18:53:14.971Z

AI-GENERATED PRACTICE QUESTIONS. This is a private local review artifact containing answer keys and solutions. No questions were published or written to student-facing database tables. Passing implemented checks is not a guarantee of correctness or originality. Subject/exam/difficulty checks include AI review; numerical recomputation covers a fixed catalog only.

## JEE Main — Rotational Motion

Requested: 5; accepted: 1; status: partial; code: AI_PROVIDER_FAILURE.

Only 1 of 5 questions passed the implemented checks. No unchecked questions were added.

### Request usage and rejections

```json
{
  "metrics": {
    "generationCalls": 4,
    "blindSolveCalls": 1,
    "auditCalls": 1,
    "providerRequests": 8,
    "totalTokens": 17407,
    "inputTokens": 10488,
    "outputTokens": 6919,
    "batches": 4,
    "maxBatches": 4,
    "maxTokens": 80000,
    "models": [
      "gemini-3.5-flash",
      "gemini-flash-lite-latest"
    ]
  },
  "rejectionCounts": {
    "ANSWER_DISAGREEMENT_OR_AMBIGUITY": 1,
    "UNBOUND_GEOMETRY": 1,
    "UNRENDERABLE_CONTENT": 6,
    "AI_PROVIDER_OR_BUDGET_FAILURE": 1
  },
  "referencePYQIds": [
    "1b975da4-5648-45f3-a660-2004a437b73d",
    "00e56f45-efcc-4cb1-8b06-5c6942f83c56",
    "0a7856da-0724-4f3e-a2ec-4a0146ff8d40",
    "8bcdd3f2-e646-46e5-b249-06a8dd7f14f5",
    "21b9daeb-f1f9-49da-aced-c525133ea801",
    "497c455f-ccc6-43c2-b1e2-547c63a8c86a",
    "4d12b7e2-8d34-4cdd-8472-73808e8209b7",
    "0efdf2d5-9022-46da-bee6-4235a8a6e71b",
    "1d9a3473-6b9f-401e-814c-01d8f5d77846",
    "2d4a5d70-48db-42aa-bb04-648ca1dd0b01",
    "ac567687-e634-479c-b153-665ebfcca4bd",
    "1eef2a4b-5f37-4174-98d2-a9b85778b274",
    "26ec31ba-4359-4700-bfb1-a845addc0bea",
    "6505c846-05d2-4948-bd5a-ecb289863025",
    "113c9a88-7ca3-49ae-8910-259f8cedb729",
    "269600d1-84ca-4d78-ab1d-e5f57fe5875e"
  ]
}
```

### Question 1 — Conservation of Angular Momentum

ID: 2d286f5f-f2b0-4fcf-8025-519da1fe20a6; Medium; source: AI_GENERATED

A system has an initial moment of inertia of $4\text{ kg m}^2$ and is rotating with an angular velocity of $6\text{ rad/s}$ about a fixed axis. Due to an internal change, its moment of inertia increases to $8\text{ kg m}^2$. Assuming no external torque acts on the system, find its final angular velocity.

A. $1.5\text{ rad/s}$
B. $3.0\text{ rad/s}$
C. $4.5\text{ rad/s}$
D. $12.0\text{ rad/s}$

**Correct answer: B**

1. Since no external torque acts on the system, angular momentum is conserved.
2. The principle of conservation of angular momentum states $L_i = L_f$, which gives $I_i \omega_i = I_f \omega_f$.
3. We are given $I_i = 4\text{ kg m}^2$, $\omega_i = 6\text{ rad/s}$, and $I_f = 8\text{ kg m}^2$.
4. Rearranging for $\omega_f$: $\omega_f = \frac{I_i \omega_i}{I_f}$.
5. Substituting the given values: $\omega_f = \frac{4\text{ kg m}^2 \times 6\text{ rad/s}}{8\text{ kg m}^2} = 3.0\text{ rad/s}$.

Concepts: Conservation of angular momentum, Rotational inertia

Formulas: $L = I \omega$; $I_i \omega_i = I_f \omega_f$

Deterministic check: fixed_formula_catalog (momentum_conservation).

### Limitations

- Passing the implemented checks is not proof of scientific correctness or guaranteed originality. Blind solve and audit use the same AI provider in separate calls.
- Deterministic numerical coverage is limited to the fixed rotational-physics catalog and supported numeric SI options. Other unresolved calculations are rejected.
- Originality comparison covers the retrieved sample and this generation run, not every published question. Historical PYQs do not certify current syllabus inclusion.
- This is a bounded, purposive sample of published official PYQs, not an exam-wide statistical distribution.
- Image/layout-dependent references are excluded. Difficulty labels are source metadata, not independently calibrated.
- Chapter aliases can map to combined syllabus chapters; coverage follows the mapped chapter labels. Source chapter/topic accuracy is not independently verified.
- Candidate retrieval reached a page limit; additional matching PYQs may exist. Newest and oldest windows were sampled.
- Some reference topic labels are missing or unmapped; concept classifications will be inferred from question text.
- Some references lack a usable worked solution; inferred solving methods cannot be verified against those solutions.
- Excluded candidate counts: {"image_or_layout_dependency":47,"duplicate":3,"invalid_answer":2}.
- Analysis is based on a bounded sample of official PYQs.
- Some references lack detailed solutions.
- AI-inferred patterns and source answer keys have not undergone independent scientific validation. This analysis does not establish the current official syllabus.

## NEET — Human Physiology

Requested: 5; accepted: 3; status: partial; code: VALIDATION_ATTEMPTS_EXHAUSTED.

Only 3 of 5 questions passed the implemented checks. No unchecked questions were added.

### Request usage and rejections

```json
{
  "metrics": {
    "generationCalls": 4,
    "blindSolveCalls": 1,
    "auditCalls": 1,
    "providerRequests": 11,
    "totalTokens": 15075,
    "inputTokens": 10310,
    "outputTokens": 4765,
    "batches": 4,
    "maxBatches": 4,
    "maxTokens": 80000,
    "models": [
      "gemini-flash-lite-latest",
      "gemini-3.5-flash"
    ]
  },
  "rejectionCounts": {
    "CONFIGURATION_MISMATCH": 8
  },
  "referencePYQIds": [
    "1edd2d6c-33cd-49b9-8092-e1cd3075de0a",
    "2f8a546c-0962-4b34-bcd7-db39e5d096c6",
    "3abf9cc6-47bc-47cb-9692-8ce9a9855cfa",
    "74cabccd-4cbb-494e-be5c-ce3148fb7b8f",
    "553586b3-48fa-4197-adf1-ed8643e03b1b",
    "7628bdb5-a774-4870-ae3b-cffd67813f9b",
    "947353c4-e1f9-4350-96ce-b04dfd905513",
    "372b6032-02e9-4796-910a-8a0b0bfac1c4",
    "359c1f4e-612b-4dcd-ae9c-f4770150b4ef",
    "41c8d6d5-cc87-4667-b67f-fc9951659854",
    "96d41240-fae2-4c69-8b40-5a540c7ccd00",
    "3b6caae1-c653-4d85-8fb2-5f69c4c3ac1d",
    "733df3f0-aa82-46b3-b6e4-3daee1cdee28",
    "9049235c-1be5-49e7-9030-2774f4116bf9",
    "9e086dad-950f-4055-bb34-6933989ee82b",
    "b5c54073-33fc-49d8-8f8d-6f72e1585dc5"
  ]
}
```

### Question 1 — Digestive System and Secretions

ID: caea4e44-f168-481d-8473-c7435aac4469; Medium; source: AI_GENERATED

Which of the following statements regarding gastric secretions and human digestion is correct?

A. Parietal cells secrete intrinsic factor, which is essential for the absorption of vitamin B12.
B. Peptic cells secrete HCl, which converts inactive pepsinogen into active pepsin.
C. Goblet cells present in the mucosal epithelium secrete pepsinogen.
D. Gastro-esophageal sphincter regulates the opening of the stomach into the duodenum.

**Correct answer: A**

1. Parietal cells (also known as oxyntic cells) are present in the gastric glands of the stomach mucosa.
2. These cells secrete hydrochloric acid (HCl) and Castle's intrinsic factor.
3. Intrinsic factor plays a crucial role in the absorption of vitamin B12 in the ileum.
4. Peptic (or chief) cells secrete pepsinogen, whereas HCl is secreted by parietal cells.
5. Goblet cells secrete mucus to protect the mucosal lining from excoriation by HCl.
6. The opening of the stomach into the duodenum is controlled by the pyloric sphincter, not the gastro-esophageal sphincter.
7. Thus, the correct statement is that parietal cells secrete intrinsic factor essential for vitamin B12 absorption.

Concepts: Gastric Glands, Digestive Enzymes and Secretions, Absorption of Nutrients

Formulas: Not applicable

Deterministic check: not_applicable.

### Question 2 — Breathing and Exchange of Gases

ID: 459edb1a-946a-4f63-9147-c4a7747f2d36; Medium; source: AI_GENERATED

During forceful expiration in humans, which set of muscles actively contracts to reduce the thoracic volume?

A. Internal intercostal muscles and abdominal muscles
B. External intercostal muscles and diaphragm
C. External intercostal muscles and abdominal muscles
D. Diaphragm and internal intercostal muscles

**Correct answer: A**

1. Normal quiet breathing involves active inspiration and passive expiration.
2. During forceful (expedited) expiration, additional active muscular exertion is required.
3. Contraction of internal intercostal muscles pulls the ribs downward and inward.
4. Contraction of abdominal muscles pushes the abdominal viscera upward against the relaxed diaphragm.
5. Together, these actions decrease the volume of the thoracic cavity, increasing intrapulmonary pressure above atmospheric pressure to force air out.
6. Therefore, internal intercostal muscles and abdominal muscles are actively involved during forceful expiration.

Concepts: Mechanism of Breathing, Forceful Expiration, Thoracic Volume Changes

Formulas: Not applicable

Deterministic check: not_applicable.

### Question 3 — Body Fluids and Circulation

ID: cacb6804-906b-4ad3-8dfe-1f9abc368767; Medium; source: AI_GENERATED

Which of the following correctly describes the events during the ventricular systole stage of a normal cardiac cycle?

A. AV valves close, creating the first heart sound (lub), and semilunar valves open.
B. AV valves open, creating the second heart sound (dub), and semilunar valves close.
C. AV valves close, creating the second heart sound (dub), and semilunar valves close.
D. AV valves open, creating the first heart sound (lub), and semilunar valves open.

**Correct answer: A**

1. Ventricular systole begins with ventricular contraction, raising intraventricular pressure.
2. This rise in pressure forces the Atrioventricular (AV) valves (tricuspid and bicuspid) to close immediately to prevent backflow of blood into the atria.
3. The closure of AV valves produces the first heart sound, known as 'lub'.
4. As ventricular pressure continues to rise above arterial pressure, the semilunar valves (pulmonary and aortic) are forced open, allowing ejection of blood into the main arteries.
5. Hence, during ventricular systole, AV valves close (producing 'lub') and semilunar valves open.

Concepts: Cardiac Cycle, Heart Sounds, Heart Valves

Formulas: Not applicable

Deterministic check: not_applicable.

### Limitations

- Passing the implemented checks is not proof of scientific correctness or guaranteed originality. Blind solve and audit use the same AI provider in separate calls.
- Deterministic numerical coverage is limited to the fixed rotational-physics catalog and supported numeric SI options. Other unresolved calculations are rejected.
- Originality comparison covers the retrieved sample and this generation run, not every published question. Historical PYQs do not certify current syllabus inclusion.
- This is a bounded, purposive sample of published official PYQs, not an exam-wide statistical distribution.
- Image/layout-dependent references are excluded. Difficulty labels are source metadata, not independently calibrated.
- Chapter aliases can map to combined syllabus chapters; coverage follows the mapped chapter labels. Source chapter/topic accuracy is not independently verified.
- Candidate retrieval reached a page limit; additional matching PYQs may exist. Newest and oldest windows were sampled.
- Some references lack a usable worked solution; inferred solving methods cannot be verified against those solutions.
- Excluded candidate counts: {"image_or_layout_dependency":25,"incomplete_content":1}.
- AI-inferred patterns and source answer keys have not undergone independent scientific validation. This analysis does not establish the current official syllabus.

## JEE Main — Rotational Motion — Phase3 nonexistent reference topic c12ad9

Requested: 5; accepted: 0; status: insufficient_references; code: INSUFFICIENT_PYQ_REFERENCES.

Suitable verified PYQ pattern analysis is unavailable. No questions were generated.

### Request usage and rejections

```json
{
  "metrics": {
    "generationCalls": 0,
    "blindSolveCalls": 0,
    "auditCalls": 0,
    "providerRequests": 0,
    "totalTokens": 0,
    "inputTokens": 0,
    "outputTokens": 0,
    "batches": 0,
    "maxBatches": 4,
    "maxTokens": 80000,
    "models": []
  },
  "rejectionCounts": {},
  "referencePYQIds": []
}
```

### Limitations

- This is a bounded, purposive sample of published official PYQs, not an exam-wide statistical distribution.
- Image/layout-dependent references are excluded. Difficulty labels are source metadata, not independently calibrated.
- Chapter aliases can map to combined syllabus chapters; coverage follows the mapped chapter labels. Source chapter/topic accuracy is not independently verified.
- Only 0 usable references were found within the bounded search; the target is 12–20.
- At least 5 usable references are required. Gemini was not called; no patterns were inferred.
