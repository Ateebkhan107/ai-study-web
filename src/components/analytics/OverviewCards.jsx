"use client";

function formatPercent(value) {
  return value === null || value === undefined ? "—" : `${value}%`;
}

function formatNumber(value) {
  return typeof value === "number" ? value.toLocaleString() : "—";
}

export default function OverviewCards({ stats }) {
  const overview = stats?.overview || {};
  const cards = [
    {
      label: "Questions Practiced",
      value: formatNumber(overview.questionsPracticed),
      sub: overview.questionsPracticedThisWeek > 0 ? `+${overview.questionsPracticedThisWeek} this week` : "answered questions only",
    },
    {
      label: "Overall Accuracy",
      value: formatPercent(overview.overallAccuracy),
      sub: "correct / answered",
    },
    {
      label: "Tests Completed",
      value: formatNumber(overview.testsCompleted),
      sub: "submitted tests",
    },
    {
      label: "Average Score",
      value: formatPercent(overview.averageScore),
      sub: "completed tests only",
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
      <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 dark:divide-[var(--border-subtle)] lg:grid-cols-4 lg:divide-y-0">
        {cards.map((s) => (
          <div key={s.label} className="min-w-0 p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
              {s.value}
            </p>
            <p className="mt-1 text-xs font-normal text-slate-500 dark:text-slate-500">
              {s.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
