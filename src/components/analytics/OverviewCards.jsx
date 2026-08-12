"use client";

import { BarChart3, CheckCircle2, ListChecks, Target } from "lucide-react";

const STAT_STYLES = {
  "Questions Practiced": {
    icon: ListChecks,
    accent: "#6366F1",
    gradient: "from-indigo-500 to-violet-500",
    bgPattern: "from-indigo-500/10 via-violet-500/5 to-transparent dark:from-indigo-500/20 dark:via-violet-500/5",
  },
  "Overall Accuracy": {
    icon: Target,
    accent: "#10b981",
    gradient: "from-emerald-500 to-teal-500",
    bgPattern: "from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-500/20 dark:via-teal-500/5",
  },
  "Tests Completed": {
    icon: CheckCircle2,
    accent: "#f59e0b",
    gradient: "from-amber-500 to-orange-500",
    bgPattern: "from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-500/20 dark:via-orange-500/5",
  },
  "Average Score": {
    icon: BarChart3,
    accent: "#D4537E",
    gradient: "from-rose-500 to-pink-500",
    bgPattern: "from-rose-500/10 via-pink-500/5 to-transparent dark:from-rose-500/20 dark:via-pink-500/5",
  },
};

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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((s, index) => {
        const style = STAT_STYLES[s.label];
        const Icon = style.icon;

        return (
          <div
            key={s.label}
            className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/50 dark:bg-[#0f172a]/60 sm:p-5"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.bgPattern} opacity-50 transition-opacity duration-200 group-hover:opacity-90`} />

            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="min-w-0 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {s.label}
                </p>
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${style.accent}15` }}
                >
                  <Icon size={17} style={{ color: style.accent }} />
                </div>
              </div>

              <p className={`mb-1 bg-gradient-to-br ${style.gradient} bg-clip-text text-3xl font-extrabold tracking-tight text-transparent`}>
                {s.value}
              </p>

              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {s.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
