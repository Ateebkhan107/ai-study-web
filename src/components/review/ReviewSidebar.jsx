"use client";

import QuestionNavigator from "./QuestionNavigator";

// ReviewSidebar.jsx
// Props:
//   stats          — { correct, wrong, unattempted, accuracy, weakTopics }
//   sessionMeta    — { testName, date, score, maxScore }
//   questions      — full questions array
//   currentIndex   — number
//   onSelect       — (index) => void
//   filter         — string
//   onFilterChange — (filter) => void
//   visibleIndices — number[]

const SUBJECT_ACCENT = {
  Physics: "bg-blue-500",
  Chemistry: "bg-emerald-500",
  Mathematics: "bg-indigo-500",
};

function StatCard({ value, label, color }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-[var(--border)]">
      <span className={`text-xl font-bold ${color}`}>{value}</span>
      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

export default function ReviewSidebar({
  stats,
  sessionMeta,
  questions,
  currentIndex,
  onSelect,
  filter,
  onFilterChange,
  visibleIndices,
}) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (stats.accuracy / 100) * circumference;

  return (
    <div className="space-y-5">
      {/* Test Info Card */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-[var(--border)] bg-[var(--card)] dark:bg-[var(--surface-elevated)]/60">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
          Test Name
        </p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
          {sessionMeta.testName}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {sessionMeta.date}
        </p>
      </div>

      {/* Score + Accuracy */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-[var(--border)] bg-[var(--card)] dark:bg-[var(--surface-elevated)]/60">
        <div className="flex items-center gap-4">
          {/* Circular Accuracy */}
          <div className="relative shrink-0">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="36"
                cy="36"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={
                  stats.accuracy >= 70
                    ? "text-emerald-500"
                    : stats.accuracy >= 40
                    ? "text-amber-500"
                    : "text-rose-500"
                }
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-slate-800 dark:text-slate-100 leading-none">
                {stats.accuracy}%
              </span>
            </div>
          </div>

          {/* Score & Stats */}
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Score</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {sessionMeta.score} / {sessionMeta.maxScore}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${(sessionMeta.score / sessionMeta.maxScore) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Accuracy across attempted
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          value={stats.correct}
          label="Correct"
          color="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          value={stats.wrong}
          label="Wrong"
          color="text-rose-600 dark:text-rose-400"
        />
        <StatCard
          value={stats.unattempted}
          label="Skipped"
          color="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Weak Topics */}
      {stats.weakTopics.length > 0 && (
        <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h3 className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
              Needs Attention
            </h3>
          </div>
          <div className="space-y-2">
            {stats.weakTopics.map((topic) => (
              <div key={topic.subject} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        SUBJECT_ACCENT[topic.subject] || "bg-slate-400"
                      }`}
                    />
                    {topic.subject}
                  </span>
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    {topic.wrongCount}/{topic.total} wrong
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all"
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Navigator */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-[var(--border)] bg-[var(--card)] dark:bg-[var(--surface-elevated)]/60">
        <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
          Question Navigator
        </h3>
        <QuestionNavigator
          questions={questions}
          currentIndex={currentIndex}
          onSelect={onSelect}
          filter={filter}
          onFilterChange={onFilterChange}
          visibleIndices={visibleIndices}
        />
      </div>
    </div>
  );
}