import test from "node:test";
import assert from "node:assert/strict";
import { createRequire, registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const babel = require("next/dist/compiled/babel/core");
const root = fileURLToPath(new URL("../../../", import.meta.url));
const data = (code) => `data:text/javascript,${encodeURIComponent(code)}`;
const hooks = registerHooks({
  resolve(specifier, context, next) {
    const mocks = { "server-only": "export {};", "@clerk/nextjs": 'export const useUser=()=>({});',
      "next/navigation": 'export const useRouter=()=>({push(){},replace(){}});export const useSearchParams=()=>new URLSearchParams();',
      "@/components/Logo": 'export default function Logo(){return null}',
      "@/lib/zi/ZiEntityContext": 'export const useRegisterZiEntity=()=>{};',
      "@/hooks/useStrictExamMode": 'export const useStrictExamMode=()=>{};',
      "@/hooks/useQuestionImagePreload": 'export const useQuestionImagePreload=()=>{};' };
    if (mocks[specifier]) return { url: data(mocks[specifier]), shortCircuit: true };
    let filename;
    if (specifier.startsWith("@/")) filename = path.join(root, specifier.slice(2));
    else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:") && context.parentURL.includes("/src/")) filename = fileURLToPath(new URL(specifier, context.parentURL));
    if (filename) for (const suffix of ["", ".js", ".jsx"]) if (existsSync(filename + suffix) && path.extname(filename + suffix)) return next(pathToFileURL(filename + suffix).href, context);
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".css")) return { format: "module", source: "export {};", shortCircuit: true };
    if (url.endsWith(".jsx") || url.endsWith("/test/session/page.js")) {
      let source = readFileSync(new URL(url), "utf8");
      // Expose the existing internal engine components in this test loader only.
      if (url.endsWith("/test/session/page.js")) source += "\nexport { TestQuestionPanel, QuestionPalette };";
      return { format: "module", source: babel.transformSync(source, { filename: fileURLToPath(url), babelrc: false, configFile: false,
        presets: [[require("next/dist/compiled/babel/preset-react"), { runtime: "automatic" }]], }).code, shortCircuit: true };
    }
    return next(url, context);
  },
});
const { sessionQuestion } = await import("../../../lib/tests/questionSource.server.js");
const { TestQuestionPanel, QuestionPalette } = await import("../../../app/(dashboard)/test/session/page.js");
const { default: MathText } = await import("../../MathText.jsx");
const q = { id: "fixture", exam: "JEE Main", subject: "Physics", chapter: "Rotational Motion", statement: "Use $\\tau=I\\alpha$ for the specified rigid body.", options: ["$I$", "$2I$", "$3I$", "$4I$"], correctAnswer: 0, explanation: ["Private step"], question_type: "MCQ", text: "Use $\\tau=I\\alpha$ for the specified rigid body.", correct: 0 };
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));
for (const source of ["QUESTION_BANK", "AI_GENERATED"]) test(`${source} uses the same actual question component and KaTeX renderer`, () => {
  const question = sessionQuestion(q, source);
  const html = render(TestQuestionPanel, { activeQuestion: question, currentIdx: 0, totalQuestions: 5, selectedAnswer: 0, isMarked: true });
  assert.ok(html.includes("katex")); assert.ok(html.includes("Question 1 of 5")); assert.ok(html.includes("Marked for Review"));
  assert.ok(!html.includes("Private step")); assert.ok(!html.includes("Correct Answer"));
});
test("existing palette distinguishes unanswered null, selected A, and review marks", () => {
  const questions = [{ id: "a" }, { id: "b" }];
  const html = render(QuestionPalette, { questions, answers: { a: null, b: 0 }, markedForReview: { b: true }, visitedQuestions: { a: true }, currentIdx: 0 });
  assert.ok(html.includes('aria-label="Question 1"')); assert.ok(html.includes('aria-label="Question 2, marked for review, answered"'));
});
test("existing solution renderer displays step-by-step math after submission", () => {
  const html = render(MathText, { children: "1. Apply $\\tau=I\\alpha$.\n\n2. Hence $\\alpha=\\tau/I$." });
  assert.ok(html.includes("katex")); assert.ok(html.includes("Apply")); assert.ok(html.includes("Hence"));
});
test.after(() => hooks.deregister());
