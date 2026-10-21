import "server-only";

// Explicit allowlist. Never spread model objects or internal validation records
// into a student payload. Concepts/formulas can reveal hints, so omit those too.
export function serializeStudentQuestion(question) {
  return {
    id: question.id, exam: question.exam, subject: question.subject, chapter: question.chapter,
    topic: question.topic, difficulty: question.difficulty, questionType: "MCQ", sourceType: "AI_GENERATED",
    statement: question.statement, options: [...question.options],
  };
}

export function serializeStudentGeneration(result) {
  return {
    status: result.status, requestedCount: result.requestedCount, acceptedCount: result.acceptedCount,
    message: result.message, questions: result.questions.map(serializeStudentQuestion),
  };
}

// Only for trusted local review / future authorized post-submission solutions.
export function serializeInternalQuestion(question) {
  return {
    ...serializeStudentQuestion(question), correctAnswer: question.correctAnswer,
    explanation: [...question.explanation], concepts: [...question.concepts], formulas: [...question.formulas],
    validation: structuredClone(question.validation),
  };
}
