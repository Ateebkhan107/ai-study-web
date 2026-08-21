"use client";

// QuestionNavigator.jsx
// Props:
//   questions      — full question array
//   currentIndex   — currently active question index
//   onSelect       — (index) => void
//   filter         — "all" | "wrong" | "unattempted"
//   onFilterChange — (filter) => void
//   visibleIndices — number[] of indices visible under current filter

function getQuestionStatus(question) {
  if (question.userAnswer === null) return "unattempted";
  if (question.userAnswer === question.correctAnswer) return "correct";
  return "wrong";
}

const STATUS_STYLES = {
  correct: {
    base: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    active: "ring-2 ring-emerald-500 bg-emerald-500 text-white border-emerald-500",
  },
  wrong: {
    base: "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300",
    active: "ring-2 ring-rose-500 bg-rose-500 text-white border-rose-500",
  },
  unattempted: {
    base: "bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400",
    active: "ring-2 ring-amber-500 bg-amber-500 text-white border-amber-500",
  },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "wrong", label: "Wrong" },
  { id: "unattempted", label: "Skipped" },
];

export default function QuestionNavigator({
  questions,
  currentIndex,
  onSelect,
  filter,
  onFilterChange,
  visibleIndices,
}) {
  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-700/50">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f.id
                ? "bg-[var(--card)] dark:bg-[var(--surface-elevated)] text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const status = getQuestionStatus(q);
          const style = STATUS_STYLES[status];
          const isActive = idx === currentIndex;
          const isVisible = visibleIndices.includes(idx);

          if (!isVisible) return null;

          return (
            <button
              key={q.id}
              onClick={() => onSelect(idx)}
              title={`Q${idx + 1}: ${status}`}
              className={`w-full aspect-square rounded-lg border text-xs font-bold transition-all ${
                isActive ? style.active : style.base
              } ${!isActive ? "hover:scale-105" : ""}`}
            >
              {idx + 1}
            </button>
          );
        })}

        {visibleIndices.length === 0 && (
          <div className="col-span-5 text-center py-4 text-xs text-slate-400 dark:text-slate-500">
            No questions match this filter
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="space-y-1.5 pt-1">
        {[
          { color: "bg-emerald-500", label: "Correct" },
          { color: "bg-rose-500", label: "Wrong" },
          { color: "bg-slate-300 dark:bg-slate-600", label: "Not Attempted" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-sm ${color} shrink-0`} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}