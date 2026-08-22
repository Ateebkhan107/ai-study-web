"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle, Target, Zap } from "lucide-react";

export default function DailyGoals({ compact = false }) {
  const { user } = useUser();
  const pathname = usePathname();

  const [goals, setGoals] = useState([]);

  // =============================
  // LOAD DAILY GOALS
  // =============================

  useEffect(() => {
    if (!user?.id) return;

    async function loadGoals() {
      try {
        const response = await fetch("/api/daily-goals", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setGoals(data.goals || []);
      } catch (error) {
        return;
      }
    }

    loadGoals();

    // Listen for tab focus to silently refresh goals
    const handleFocus = () => loadGoals();
    window.addEventListener("focus", handleFocus);
    
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [user?.id, pathname]);

  const completed = goals.filter((g) => g.completed).length;

  const percentage = goals.length
    ? (completed / goals.length) * 100
    : 0;

  return (
    <div className={`relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-[var(--card)]/80 shadow-sm backdrop-blur-2xl transition-all duration-500 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/80 ${
      compact ? "p-3 sm:p-5" : "p-3 sm:p-5 lg:p-6"
    }`}>

      {/* ── Header Section ── */}
      <div className={`relative z-10 flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center ${
        compact ? "mb-3 sm:mb-4" : "mb-4 sm:mb-5"
      }`}>
        <div>
          <div className={`inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 dark:border-indigo-500/20 dark:bg-indigo-500/10 ${
            compact ? "mb-1" : "mb-1.5 sm:mb-2"
          }`}>
            <Target className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <h2 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">
              Daily Goals
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
            You&apos;ve completed <span className="text-slate-800 dark:text-white font-bold">{completed}</span> out of {goals.length} tasks today.
          </p>
        </div>

        {/* Overall Progress */}
        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
          <div className="flex items-center gap-3">
            <span className={`font-black text-slate-800 dark:text-slate-100 ${
              compact ? "text-xl" : "text-xl sm:text-2xl"
            }`}>
              {Math.round(percentage)}%
            </span>
          </div>
          <div className={`overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)] ${
            compact ? "h-1.5 w-36 sm:w-40" : "h-2 w-36 sm:w-44"
          }`}>
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Goals Grid ── */}
      <div className="relative z-10 overflow-hidden rounded-xl border border-slate-200/70 bg-[var(--card)]/45 dark:border-[var(--border)]/60 dark:bg-[var(--surface-elevated)]/25 md:grid md:grid-cols-2">
        {goals.map((goal, index) => {
          const isComplete = goal.completed;
          const progressPct = Math.min((goal.progress / goal.target_value) * 100, 100);

          return (
            <div
              key={goal.id}
              className={`group relative overflow-hidden border-b border-slate-200/70 p-3 transition-all duration-300 last:border-b-0 dark:border-[var(--border)]/60 md:border-r md:last:border-b md:even:border-r-0 ${
                isComplete
                  ? "bg-emerald-50/35 dark:bg-emerald-500/5"
                  : "hover:bg-slate-50/60 dark:hover:bg-[var(--surface-elevated)]/40"
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >

              <div className="relative z-10 flex items-start gap-2.5">
                <div
                  className={`mt-0.5 flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110
                    ${isComplete ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"}
                  `}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 drop-shadow-sm" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <h3 className={`min-w-0 text-sm font-bold leading-snug transition-colors duration-300
                      ${isComplete ? "text-emerald-900 dark:text-emerald-300 line-through decoration-emerald-500/30" : "text-slate-800 dark:text-slate-100"}
                    `}>
                      {goal.title}
                    </h3>
                    <div className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-sm backdrop-blur-md transition-all duration-300
                      ${isComplete
                        ? "bg-amber-500 text-white"
                        : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/20"
                      }
                    `}>
                      <Zap className="h-2.5 w-2.5 fill-current" />
                      +{goal.xp} XP
                    </div>
                  </div>
                  <p className={`mt-0.5 line-clamp-1 text-xs font-medium leading-snug
                    ${isComplete ? "text-emerald-700/60 dark:text-emerald-400/50" : "text-slate-500 dark:text-slate-400"}
                  `}>
                    {goal.description}
                  </p>

                  {!isComplete && (
                    <div className="relative z-10 mt-2">
                      <div className="mb-1 flex items-end justify-between">
                        <span className="text-[11px] font-bold text-slate-400">
                          {goal.progress} / {goal.target_value}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)]">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all duration-1000 ease-out"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
