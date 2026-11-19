function normalizeText(value) {
  return String(value ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
}

function questionContentKey(question) {
  const text = normalizeText(question.question_text ?? question.text)
    .replace(/^(?:question|q\.?)\s*\d+\s*[:.)]\s*/i, "");
  const image = normalizeText(question.question_image);
  if (!text && !image) return null;

  const options = ["a", "b", "c", "d"]
    .map((letter, index) => JSON.stringify([
      normalizeText(question.options?.[index] ?? question[`option_${letter}`]),
      normalizeText(question.option_images?.[index] ?? question[`option_${letter}_image`]),
    ]))
    .sort();

  return JSON.stringify([text, image, options]);
}

export function uniqueMockQuestions(questions, alreadySelected = []) {
  const ids = new Set(alreadySelected.map((question) => String(question.id)));
  const content = new Set(alreadySelected.map(questionContentKey).filter(Boolean));

  return questions.filter((question) => {
    if (!question?.id) return false;
    const id = String(question.id);
    if (ids.has(id)) return false;
    ids.add(id);

    const key = questionContentKey(question);
    if (key && content.has(key)) return false;
    if (key) content.add(key);
    return true;
  });
}
