// Deterministic fixtures ONLY. Never imported by application code or persisted to Supabase.
import { validateGenerationConfig, QUESTION_VALIDATION_VERSION } from "../../zi/testGenerator/questionSchema.server.js";
export const fixtureId = (n) => `23456789-1234-4234-8234-${String(n).padStart(12, "0")}`;
export const configuration = { generationConfig: { exam: "JEE Main", subject: "Physics", chapter: "Rotational Motion", difficulty: "Medium", questionCount: 5 }, sessionConfig: { mode: "timed", durationMinutes: 30 } };
const statements = [
  "A laboratory flywheel turns about a frictionless axle. What physical intervention can change its angular momentum about that axle?",
  "An isolated ice skater draws her extended arms towards her body while rotating. Which principle determines how her angular speed changes?",
  "Two particles are attached at different distances from a fixed rotation axis. Why does the more distant particle contribute more inertia for equal masses?",
  "A satellite releases a brake between counter-rotating internal rotors. Which total property stays constant when external torques vanish?",
  "A wheel rolls on a stationary rough floor without slipping. Why can static friction at contact transfer no instantaneous mechanical power?",
];
export function generationFixture() {
  const config = validateGenerationConfig(configuration.generationConfig);
  const questions = statements.map((statement, i) => {
    const id = fixtureId(i + 1);
    const audit = { id, verdict: "accept", independentlyCorrectOptions: [0], confidence: "high", issues: [], requiresCalculation: false, substantiveReasoningSteps: 2,
      answerCorrect: true, exactlyOneCorrect: true, explanationConsistent: true, noContradictions: true, quantitiesAndUnitsConsistent: true, sufficientInformation: true, examMatches: true, subjectMatches: true, topicMatches: true, difficultyMatches: true, reasoningAppropriate: true, originalityPass: true };
    return { id, exam: config.exam, subject: config.subject, chapter: config.chapter, topic: "Rotational dynamics", difficulty: "Medium", questionType: "MCQ", sourceType: "AI_GENERATED", statement,
      options: ["The applicable rotational conservation law", "A change in the temperature alone", "The arbitrary zero of angular position", "An unrelated change in the observer's clock"], correctAnswer: 0,
      explanation: ["Identify the physical system and the relevant rotational principle.", "Apply the stated constraints to distinguish the valid physical explanation."], concepts: ["Rotational dynamics"], formulas: [],
      validation: { status: "passed_implemented_checks", validationVersion: QUESTION_VALIDATION_VERSION, referencePYQIds: [fixtureId(100)], blindSolution: { id, correctOptions: [0], sufficientInformation: true, scientificallySound: true, uncertainties: [], requiresCalculation: false }, audit } };
  });
  return { status: "complete", validationVersion: QUESTION_VALIDATION_VERSION, acceptedCount: 5, requestedCount: 5, provenance: { referencePYQIds: [fixtureId(100)] }, questions };
}
