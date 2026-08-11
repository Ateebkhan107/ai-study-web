const EXAM_SUBJECT_WEIGHTS = {
  NEET: { Physics: 1, Chemistry: 1, Biology: 2 },
  JEE: { Physics: 1, Chemistry: 1, Mathematics: 1 },
};

export function normalizeExamName(exam) {
  return String(exam || "").toUpperCase().startsWith("NEET") ? "NEET" : "JEE";
}

export function normalizeSubjectName(subject) {
  const value = String(subject || "").trim();
  return value === "Maths" ? "Mathematics" : value;
}

export function getExamSubjects(exam, displayNames = false) {
  const subjects = Object.keys(EXAM_SUBJECT_WEIGHTS[normalizeExamName(exam)]);
  return displayNames ? subjects.map((subject) => subject === "Mathematics" ? "Maths" : subject) : subjects;
}

// Largest-remainder allocation keeps the requested total exact for any custom
// count, while producing 45/45/90 for NEET 180 and 25/25/25 for JEE 75.
export function allocateQuestionCounts(exam, total, selectedSubjects) {
  const examName = normalizeExamName(exam);
  const weights = EXAM_SUBJECT_WEIGHTS[examName];
  const requested = (selectedSubjects?.length ? selectedSubjects : Object.keys(weights))
    .map(normalizeSubjectName)
    .filter((subject, index, list) => weights[subject] && list.indexOf(subject) === index);

  if (requested.length === 0 || !Number.isFinite(Number(total)) || Number(total) <= 0) return {};

  const targetTotal = Math.floor(Number(total));
  const totalWeight = requested.reduce((sum, subject) => sum + weights[subject], 0);
  const rows = requested.map((subject, order) => {
    const exact = targetTotal * weights[subject] / totalWeight;
    return { subject, order, count: Math.floor(exact), fraction: exact - Math.floor(exact) };
  });

  let remaining = targetTotal - rows.reduce((sum, row) => sum + row.count, 0);
  const remainderOrder = [...rows].sort((a, b) => b.fraction - a.fraction || a.order - b.order);
  for (let index = 0; index < remaining; index += 1) {
    remainderOrder[index % remainderOrder.length].count += 1;
  }

  return Object.fromEntries(rows.map(({ subject, count }) => [subject, count]));
}

export function selectQuestionsByDistribution(questions, exam, total, selectedSubjects, shuffle = false) {
  const counts = allocateQuestionCounts(exam, total, selectedSubjects);
  const selected = [];

  for (const [subject, count] of Object.entries(counts)) {
    const pool = questions.filter((question) => normalizeSubjectName(question.subject) === subject);
    const ordered = shuffle ? [...pool].sort(() => Math.random() - 0.5) : pool;
    selected.push(...ordered.slice(0, count));
  }

  return {
    questions: selected,
    counts,
    complete: selected.length === Object.values(counts).reduce((sum, count) => sum + count, 0),
  };
}
