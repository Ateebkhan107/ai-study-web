"use client";

import { useState } from "react";

export default function ZiQuickQuiz({ questions }) {
  const [answers, setAnswers] = useState({});

  if (!questions?.length) return null;

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-brand">
        Quick check
      </div>
      <div className="space-y-3">
        {questions.map((question, questionIndex) => {
          const selected = answers[questionIndex];
          const isLocked = selected !== undefined;
          const isCorrect = selected === question.correctIndex;

          return (
            <div key={`${questionIndex}-${question.question}`} className="space-y-2">
              <div className="text-xs font-bold leading-5 text-slate-800 dark:text-slate-100">
                {question.question}
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label={question.question}>
                {question.options.map((option, optionIndex) => {
                  const isSelected = selected === optionIndex;
                  const isAnswer = question.correctIndex === optionIndex;

                  return (
                    <button
                      key={`${optionIndex}-${option}`}
                      type="button"
                      disabled={isLocked}
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (!isLocked) setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }));
                      }}
                      className={`min-h-9 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                        isLocked && isAnswer
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                          : isLocked && isSelected
                          ? "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
                          : "border-slate-200 bg-white text-slate-600 hover:border-brand/50 hover:text-brand dark:border-white/10 dark:bg-black/20 dark:text-slate-300"
                      } disabled:cursor-default`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {isLocked ? (
                <div className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                  <span className={`font-black ${isCorrect ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
                    {isCorrect ? "Correct." : "Not quite."}
                  </span>{" "}
                  {question.explanation}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
