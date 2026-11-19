import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import { uniqueMockQuestions } from "../questionUniqueness.js";
import { allocateQuestionCounts } from "../questionDistribution.js";

const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "./supabase.js" && context.parentURL?.endsWith("/questions.js")) {
      return { url: "data:text/javascript,export const supabase = null;", shortCircuit: true };
    }
    return next(specifier, context);
  },
});
const { getQuestions } = await import("../questions.js");
hooks.deregister();

function bankRow(subject, index, extra = {}) {
  return {
    id: `${subject}-${index}`,
    subject,
    chapter: index % 2 ? "Kinematics" : "Thermodynamics",
    question_type: index % 5 ? "MCQ" : "Numerical",
    difficulty: ["Easy", "Medium", "Hard"][index % 3],
    question_text: `${subject} question ${index}`,
    option_a: "First",
    option_b: "Second",
    option_c: "Third",
    option_d: "Fourth",
    ...extra,
  };
}

function mockBank(rows, { repeatAcrossPages = false } = {}) {
  return {
    from() {
      const filters = [];
      return {
        select() { return this; },
        order(field) { assert.equal(field, "id"); return this; },
        eq(field, value) { filters.push((row) => row[field] === value); return this; },
        in(field, values) { filters.push((row) => values.includes(row[field])); return this; },
        async range(start, end) {
          const matching = rows.filter((row) => filters.every((filter) => filter(row)));
          if (repeatAcrossPages && start === 1000) return { data: matching.slice(0, 1) };
          return { data: matching.slice(start, end + 1) };
        },
      };
    },
  };
}

test("mock bank returns every supported count without repeated IDs or imported copies", async () => {
  const rows = [];
  for (const [exam, subjects, counts] of [
    ["JEE Main", ["Physics", "Chemistry", "Mathematics"], [10, 20, 30, 40, 60, 75, 90]],
    ["NEET", ["Physics", "Chemistry", "Biology"], [10, 15, 20, 30, 45, 60, 90, 135, 180]],
  ]) {
    for (const subject of subjects) {
      for (let index = 0; index < 100; index++) {
        const question = bankRow(subject, index, { exam, id: `${exam}-${subject}-${index}` });
        rows.push(question);
        rows.push({
          ...question,
          id: question.id + "-copy",
          question_text: `Question 12: ${question.question_text}  `,
          option_a: question.option_b,
          option_b: question.option_a,
        });
      }
    }

    const client = mockBank(rows, { repeatAcrossPages: true });
    for (const count of counts) {
      const questions = await getQuestions({ exam, subject: "all", difficulty: "mixed", limit: count, client });
      assert.equal(questions.length, count, `${exam} ${count}`);
      assert.equal(new Set(questions.map((question) => question.id)).size, count);
      assert.equal(uniqueMockQuestions(questions).length, count);
      const distribution = allocateQuestionCounts(exam, count, subjects);
      for (const subject of subjects) {
        assert.equal(questions.filter((q) => q.subject === subject).length, distribution[subject]);
      }
    }
  }
});

test("overlapping subjects are deduplicated and a strict short pool is never padded", async () => {
  const a = bankRow("Physics", 1, { exam: "JEE Main" });
  const b = bankRow("Mathematics", 2, { exam: "JEE Main", question_text: a.question_text });
  const c = bankRow("Mathematics", 3, { exam: "JEE Main" });
  const client = mockBank([a, { ...a, id: "physics-copy" }, b, c]);
  const questions = await getQuestions({
    exam: "JEE Main", subject: "Physics,Maths,Mathematics", limit: 4, strictFilters: true, client,
  });
  assert.deepEqual(questions.map((question) => question.id).sort(), [a.id, c.id].sort());
});

test("shared wording with different answer choices or diagrams remains playable", () => {
  const question = bankRow("Physics", 1, { question_text: "Which statement is true?" });
  const otherOptions = { ...question, id: "other-options", option_d: "Different statement" };
  const anotherDiagram = { ...question, id: "diagram", question_image: "/question-diagram.png" };
  const differentMath = { ...question, id: "math", question_text: "Which statement is true for Q?" };
  assert.deepEqual(uniqueMockQuestions([question, otherOptions, anotherDiagram, differentMath]), [
    question, otherOptions, anotherDiagram, differentMath,
  ]);
});
