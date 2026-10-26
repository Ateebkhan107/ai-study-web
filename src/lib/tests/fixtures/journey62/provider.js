// Synthetic provider substitute. Copied/aliased ONLY into the isolated fixture app.
import { GENERATE_QUESTIONS_PROMPT, BLIND_SOLVE_PROMPT } from "@/lib/zi/testGenerator/questionPrompts.server.js";
import { generationFixture } from "@/lib/tests/fixtures/generated.mjs";
const additional = [
  ["A rigid door is pushed near its hinge and then near its handle with the same perpendicular force. Why is the handle position more effective for opening it?", "The force has a larger perpendicular lever arm", "The door loses gravitational mass", "The hinge eliminates every contact force", "The applied force must be larger at the handle"],
  ["A uniform disc and a thin hoop have equal mass and radius. Material redistribution changes their rotational response. Which comparison follows about their central moments of inertia?", "The hoop has the larger moment of inertia", "Both moments must vanish", "The disc always has greater inertia than the hoop", "The comparison depends only on their temperatures"],
  ["A gymnast leaves a springboard with angular momentum and later tucks her legs during free flight. Neglect air resistance. Which distinction correctly describes internal and external effects?", "Internal reshaping changes inertia while total angular momentum stays fixed", "Tucking creates an external torque from nothing", "Angular momentum must become zero at the highest point", "Changing posture removes the force of gravity"],
  ["A horizontal beam balances about a support while several vertical forces act on it. What must be checked in addition to vanishing net force to establish static equilibrium?", "The net moment about the support must also vanish", "Every individual force must vanish separately", "The support must supply kinetic energy", "The beam must rotate with constant nonzero acceleration"],
  ["An engineer moves the reference axis parallel to a rigid body's central axis. What physical information explains the increase in the measured rotational inertia?", "The added contribution depends on total mass and squared axis separation", "Mass becomes negative under an axis shift", "The body must deform before its inertia can be compared", "The angular velocity alone determines the added inertia"],
];
const pool = [...generationFixture().questions.map(({ id, validation, ...q }) => q), ...additional.map(([statement, ...options]) => ({
  ...generationFixture().questions[0], statement, options, id: undefined, validation: undefined,
}))].map((q) => Object.fromEntries(Object.entries(q).filter(([k]) => !["id", "validation"].includes(k))));
export function getZiGenerationQuotaStatus() { return { blocked: false }; }
export function streamZiResponse() { throw Error("Synthetic journey permits builder requests only; no tutor/provider transport"); }
export async function completeZiQuestionTask(request) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  request.signal?.throwIfAborted();
  const p = JSON.parse(request.prompt);
  let data;
  if (p.references) {
    const ids = p.references.map((r) => r.id);
    const evidence = { description: "Synthetic sample compares rotational reasoning under stated physical constraints.", referenceIds: ids };
    data = { patternSummary: "Synthetic reference sample for exercising the complete local verification pipeline only.",
      classifications: ids.map((referenceId) => ({ referenceId, nature: "conceptual", concepts: ["Rotational dynamics"], estimatedReasoningSteps: 2 })),
      commonFormulas: [], questionStructures: [evidence], reasoningPatterns: [evidence], distractorPatterns: [], multiConceptCombinations: [],
      difficultyCharacteristics: { observations: [evidence], caveats: [] }, coverageLimitations: ["Synthetic fixture content is not a real official PYQ or a live quality evaluation."] };
  } else if (request.systemPrompt.startsWith(GENERATE_QUESTIONS_PROMPT)) {
    const offset = p.previouslyProposedScenarios.length;
    data = { questions: pool.slice(offset, offset + p.count) };
  } else if (request.systemPrompt === BLIND_SOLVE_PROMPT) {
    if (p.questions.some((q) => "correctAnswer" in q || "explanation" in q)) throw Error("Answer secrecy regression");
    data = { solutions: p.questions.map((q) => ({ id: q.id, correctOptions: [0], sufficientInformation: true, scientificallySound: true,
      requiresCalculation: false, solutionSteps: ["Synthetic blind reasoning evaluates the physical constraints."], uncertainties: [], calculation: null })) };
  } else {
    data = { audits: p.questions.map((q) => ({ ...generationFixture().questions[0].validation.audit, id: q.id,
      deterministicModelApplies: true, rationale: "Deterministic synthetic audit response for local integration testing." })) };
  }
  return { data, model: "synthetic-gemini-no-network", providerRequests: 1, usage: { inputTokens: 100, outputTokens: 100, totalTokens: 200 } };
}
export const completeZiPatternAnalysis = completeZiQuestionTask;
