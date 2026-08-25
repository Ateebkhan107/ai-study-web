"use client";

import { Check } from "lucide-react";

// QuestionCard.jsx
// Props:
//   question  — full question object (see mockData shape)
//   index     — 0-based question index (for display as "Q1, Q2...")
//
// Supabase note: swap mockData import for a server action / useEffect fetch
// passing the same question shape.

const SUBJECT_COLORS = {
  Physics: {
    bg: "bg-blue-500/10 dark:bg-blue-400/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
  },
  Chemistry: {
    bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  Mathematics: {
    bg: "bg-brand/8 dark:bg-indigo-400/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
  },
};

const DIFFICULTY_COLORS = {
  Easy: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  Medium: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  Hard: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
};

function getOptionState(optionId, userAnswer, correctAnswer) {
  if (optionId === correctAnswer) return "correct";
  if (optionId === userAnswer && userAnswer !== correctAnswer) return "wrong";
  return "neutral";
}

const OPTION_STYLES = {
  correct: {
    wrapper:
      "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15",
    label:
      "bg-emerald-500 text-white",
    text: "text-emerald-700 dark:text-emerald-300 font-medium",
    icon: (
      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
  },
  wrong: {
    wrapper:
      "border-rose-500 bg-rose-500/10 dark:bg-rose-500/15",
    label:
      "bg-rose-500 text-white",
    text: "text-rose-700 dark:text-rose-300 font-medium",
    icon: (
      <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  neutral: {
    wrapper:
      "border-slate-200 dark:border-[var(--border)] bg-[var(--card)] dark:bg-[var(--surface-elevated)]/50 hover:border-slate-300 dark:hover:border-slate-600",
    label:
      "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
    text: "text-slate-700 dark:text-slate-300",
    icon: null,
  },
};

export default function QuestionCard({ question, index }) {
  const subjectStyle =
    SUBJECT_COLORS[question.subject] || SUBJECT_COLORS.Physics;
  const difficultyStyle =
    DIFFICULTY_COLORS[question.difficulty] || DIFFICULTY_COLORS.Medium;

  const unattempted = question.userAnswer === null;

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${subjectStyle.bg} ${subjectStyle.text} ${subjectStyle.border}`}
        >
          {question.subject}
        </span>
        <span className="text-slate-400 dark:text-slate-500 text-xs">›</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {question.chapter}
        </span>
        <span className="text-slate-400 dark:text-slate-500 text-xs">›</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {question.topic}
        </span>
        <span
          className={`ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyStyle}`}
        >
          {question.difficulty}
        </span>
      </div>

      {/* Question */}
      <div>
        <div className="flex gap-3">
          <span className="shrink-0 w-8 h-8 rounded-lg bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <p className="text-slate-800 dark:text-slate-100 text-base leading-relaxed font-medium pt-0.5">
            {question.question}
          </p>
        </div>
      </div>

      {/* Unattempted Banner */}
      {unattempted && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          You did not attempt this question
        </div>
      )}

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option) => {
          const state = getOptionState(
            option.id,
            question.userAnswer,
            question.correctAnswer
          );
          const style = OPTION_STYLES[state];

          return (
            <div
              key={option.id}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors ${style.wrapper}`}
            >
              {/* Option Label */}
              <span
                className={`shrink-0 w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${style.label}`}
              >
                {option.id}
              </span>

              {/* Option Text */}
              <span className={`flex-1 text-sm ${style.text}`}>
                {option.text}
              </span>

              {/* State Icon */}
              {style.icon}

              {/* "Your answer" / "Correct" chips */}
              <div className="flex gap-1.5 shrink-0">
                {option.id === question.userAnswer &&
                  option.id !== question.correctAnswer && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      Your Answer
                    </span>
                  )}
                {option.id === question.userAnswer &&
                  option.id === question.correctAnswer && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      Your Answer
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                {option.id === question.correctAnswer &&
                  option.id !== question.userAnswer && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      Correct
                    </span>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Marks Info */}
      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Correct: +{question.marks.correct}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          Wrong: {question.marks.wrong}
        </span>
        {question.timeTaken > 0 && (
          <span className="flex items-center gap-1.5 ml-auto">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Time: {question.timeTaken}s
          </span>
        )}
      </div>
    </div>
  );
}
