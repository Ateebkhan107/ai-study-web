"use client";

import { Zap, Target, FileText, Trophy } from "lucide-react";

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
      id: "questions",
      label: "Questions Practiced",
      value: formatNumber(overview.questionsPracticed),
      hasValue: typeof overview.questionsPracticed === "number" && overview.questionsPracticed > 0,
      sub:
        overview.questionsPracticedThisWeek > 0
          ? `+${overview.questionsPracticedThisWeek} this week`
          : overview.questionsPracticed > 0
            ? "total answered"
            : "Start practice to track",
      badge: overview.questionsPracticedThisWeek > 0 ? `+${overview.questionsPracticedThisWeek}` : null,
      icon: Zap,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      border: "border-amber-200/60 dark:border-amber-500/20",
      gradient: "from-amber-50/40 to-transparent dark:from-amber-950/10 dark:to-transparent",
    },
    {
      id: "accuracy",
      label: "Overall Accuracy",
      value: formatPercent(overview.overallAccuracy),
      hasValue: overview.overallAccuracy !== null && overview.overallAccuracy !== undefined,
      sub: overview.overallAccuracy !== null ? "correct / answered" : "Unlocks on 1st answer",
      badge: null,
      icon: Target,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      border: "border-emerald-200/60 dark:border-emerald-500/20",
      gradient: "from-emerald-50/40 to-transparent dark:from-emerald-950/10 dark:to-transparent",
    },
    {
      id: "tests",
      label: "Tests Completed",
      value: formatNumber(overview.testsCompleted),
      hasValue: typeof overview.testsCompleted === "number" && overview.testsCompleted > 0,
      sub: overview.testsCompleted > 0 ? "submitted tests" : "0 / 1 test completed",
      badge: null,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      border: "border-blue-200/60 dark:border-blue-500/20",
      gradient: "from-blue-50/40 to-transparent dark:from-blue-950/10 dark:to-transparent",
    },
    {
      id: "average",
      label: "Average Score",
      value: formatPercent(overview.averageScore),
      hasValue: overview.averageScore !== null && overview.averageScore !== undefined,
      sub: overview.averageScore !== null ? "completed tests only" : "Unlocks with 1st test",
      badge: null,
      icon: Trophy,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
      border: "border-orange-200/60 dark:border-orange-500/20",
      gradient: "from-orange-50/40 to-transparent dark:from-orange-950/10 dark:to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[var(--card)] bg-gradient-to-br ${card.gradient} p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5 ${card.border}`}
          >
            {/* Top Eyebrow Row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 sm:text-[11px]">
                {card.label}
              </span>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
            </div>

            {/* Metric Value & Subtitle */}
            <div className="mt-3 sm:mt-4">
              <div className="flex items-baseline gap-2">
                <p className="font-display text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl tabular-nums">
                  {card.value}
                </p>
                {card.badge && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                    {card.badge}
                  </span>
                )}
              </div>
              <p
                className={`mt-1 text-xs font-semibold ${
                  card.hasValue
                    ? "text-slate-500 dark:text-slate-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
