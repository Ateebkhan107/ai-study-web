// Deliberately invented test data. Never official PYQs or scientific certification.
export const config = Object.freeze({ exam: 'JEE Main', subject: 'Physics', chapter: 'Rotational Motion', topic: 'Rotational dynamics', difficulty: 'Easy', questionCount: 1 });
export const references = Array.from({ length: 5 }, (_, i) => ({
  id: `56789012-1234-4234-8234-${String(i + 1).padStart(12, '0')}`,
  type: 'single_correct', provenance: 'synthetic_offline_fixture',
  statement: `Invented mechanics reference ${i + 1}: discuss ${['angular momentum conservation in a spinning skater', 'rotational energy of a flywheel', 'moment of inertia about a shifted axis', 'rolling without slipping down a slope', 'angular displacement under braking'][i]}.`,
  options: ['Synthetic option A', 'Synthetic option B', 'Synthetic option C', 'Synthetic option D'],
}));
export function candidate() {
  return { ...config, questionCount: undefined,
    questionType: 'MCQ', sourceType: 'AI_GENERATED',
    statement: 'A laboratory rotor turns about a fixed frictionless axle. Its moment of inertia is 2 kgm^2. A constant net torque of 6 Nm acts about this axle. What is its angular acceleration?',
    options: ['3 rad/s^2', '12 rad/s^2', '2 rad/s^2', '6 rad/s^2'], correctAnswer: 0,
    explanation: ['Use the rotational equation relating net torque to moment of inertia and angular acceleration.', 'Divide 6 Nm by 2 kgm^2 to obtain an angular acceleration of 3 rad/s^2, corresponding to option A.'],
    concepts: ['Net torque', 'Angular acceleration'], formulas: ['$\\tau=I\\alpha$'],
  };
}
export function mockResponse(stage, request, scenario = 'success') {
  let data;
  const ids = references.map(r => r.id);
  if (stage === 'analysis') data = {
    patternSummary: 'Synthetic mechanics examples exercise local pipeline contracts only; no official examination patterns or current syllabus claims are established.',
    classifications: ids.map(referenceId => ({ referenceId, nature: 'numerical', concepts: ['Rotational dynamics'], estimatedReasoningSteps: 1 })),
    commonFormulas: [], questionStructures: [{ description: 'Identify relevant rotational quantities from explicit givens.', referenceIds: ids }],
    reasoningPatterns: [{ description: 'Apply an explicitly stated mechanics relation with consistent units.', referenceIds: ids }], distractorPatterns: [], multiConceptCombinations: [],
    difficultyCharacteristics: { observations: [{ description: 'Invented examples have no calibrated examination difficulty.', referenceIds: ids }], caveats: [] },
    coverageLimitations: ['Synthetic fixtures are not official PYQs and do not certify syllabus coverage.'],
  };
  if (stage === 'generation') {
    const q = candidate(); delete q.questionCount;
    if (scenario === 'invalid-answer') q.correctAnswer = 1;
    if (scenario === 'wrong-numerical') q.options[0] = '4 rad/s^2';
    if (scenario === 'copied-reference') q.statement = references[0].statement;
    data = { questions: scenario === 'two-questions' ? [q, structuredClone(q)] : [q] };
  }
  const q = request.questions?.[0];
  if (stage === 'blind') {
    if ('correctAnswer' in q || 'explanation' in q || 'formulas' in q) throw Error('BLIND_ANSWER_LEAK');
    data = { solutions: [{ id: q.id, correctOptions: [0], sufficientInformation: true, scientificallySound: true, requiresCalculation: true,
      solutionSteps: ['Divide the net applied torque by the specified rotational inertia.'], uncertainties: [],
      calculation: { family: 'torque_acceleration', geometry: null, geometryEvidence: '', inputs: [
        { name: 'torque', value: 6, unit: 'Nm', sourceText: '6 Nm' }, { name: 'inertia', value: 2, unit: 'kgm^2', sourceText: '2 kgm^2' },
      ] },
    }] };
  }
  if (stage === 'audit') data = { audits: [{ id: q.id, verdict: 'accept', independentlyCorrectOptions: [0],
    answerCorrect: true, exactlyOneCorrect: true, explanationConsistent: true, noContradictions: true,
    quantitiesAndUnitsConsistent: true, sufficientInformation: true, examMatches: true, subjectMatches: true,
    topicMatches: true, difficultyMatches: true, reasoningAppropriate: true, originalityPass: true,
    requiresCalculation: true, deterministicModelApplies: true, confidence: 'high', substantiveReasoningSteps: 1,
    issues: [], rationale: 'Deterministic fixture response only; human review is still required.',
  }] };
  if (scenario === 'incomplete-validation' && stage === 'audit') data = { audits: [] };
  return { data, providerRequests: scenario === 'uncertain-requests' ? 2 : 1,
    model: 'deterministic-offline-fixture', finishReason: scenario === 'incomplete-output' ? 'MAX_TOKENS' : 'STOP',
    usage: scenario === 'missing-usage' ? null : { inputTokens: 100, outputTokens: 50, thoughtTokens: 0, totalTokens: scenario === 'usage-overflow' ? 999999 : 150 } };
}
