import "server-only";

export const AI_SOURCE = "AI_GENERATED";
// Allowlist shared by both sources. Answer keys, solutions, hints, validation
// evidence and provider metadata must never enter the active session DTO.
export function sessionQuestion(question, source = "QUESTION_BANK") {
  if (!["QUESTION_BANK", AI_SOURCE].includes(source)) throw new Error("Unknown question source");
  const ai = source === AI_SOURCE;
  const optionImages = ai
    ? [null, null, null, null]
    : (question.option_images || [
        question.option_a_image || null,
        question.option_b_image || null,
        question.option_c_image || null,
        question.option_d_image || null,
      ]);
  return {
    id: question.id,
    exam: question.exam,
    subject: question.subject,
    chapter: question.chapter,
    topic: question.topic,
    difficulty: question.difficulty,
    question_type: ai ? "MCQ" : question.question_type,
    text: ai ? question.statement : question.text,
    options: [...question.options],
    question_image: ai ? null : question.question_image,
    option_images: optionImages,
    option_a_image: ai ? null : (question.option_a_image || optionImages?.[0] || null),
    option_b_image: ai ? null : (question.option_b_image || optionImages?.[1] || null),
    option_c_image: ai ? null : (question.option_c_image || optionImages?.[2] || null),
    option_d_image: ai ? null : (question.option_d_image || optionImages?.[3] || null),
    marks: ai ? 4 : question.marks,
    negative_marks: ai ? 1 : question.negative_marks,
    ...(ai ? { sourceType: AI_SOURCE } : {}),
  };
}
export function generatedReviewQuestion(row, selected) {
  const q = row.content;
  const letter = (index) => index === null || index === undefined ? null : "ABCD"[index];
  return { id: row.id, selected_option: letter(selected), correct_option: letter(q.correctAnswer),
    is_correct: selected !== null && selected !== undefined && selected === q.correctAnswer,
    questions: { id: row.id, sourceType: AI_SOURCE, exam: q.exam, subject: q.subject, chapter: q.chapter, topic: q.topic,
      question_text: q.statement, option_a: q.options[0], option_b: q.options[1], option_c: q.options[2], option_d: q.options[3],
      explanation: q.explanation.map((step, i) => `${i + 1}. ${step}`).join("\n\n") } };
}
