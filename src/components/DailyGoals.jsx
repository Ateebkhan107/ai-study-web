"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle, Zap } from "lucide-react";

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
  const nextGoal = goals.find((goal) => !goal.completed);

  const percentage = goals.length
    ? (completed / goals.length) * 100
    : 0;
  const activePathWidth = goals.length > 1
    ? (Math.min(completed, goals.length - 1) / (goals.length - 1)) * 100
    : percentage;

  return (
    <div className={`relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-[var(--card)] shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] ${
      compact ? "p-3 sm:p-4" : "p-4 sm:p-5"
    }`}>

      <div className="relative z-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Today&apos;s Mission
            </p>
            {completed > 0 && goals.length > 0 && (
              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-700 dark:text-slate-200">
                {completed === goals.length
                    ? (
                      <span className="inline-flex items-center gap-1">
                        All done
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    )
                    : `${completed} of ${goals.length} done`}
              </p>
            )}
          </div>
          {completed === 0 && goals.length > 0 ? (
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-700 dark:text-slate-200">
              {goals.length} goals
            </p>
          ) : completed > 0 && completed < goals.length ? (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {completed === 1
                ? "Nice. You're moving."
                : completed * 2 === goals.length
                  ? "Halfway there."
                  : completed === goals.length - 1
                    ? "One left."
                    : "Keep going."}
            </p>
          ) : null}
        </div>

        {completed === 0 && goals.length > 0 && (
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Ready when you are.
          </p>
        )}

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)]">
          <div
            className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="relative z-10 mt-4">
        {goals.length === 0 ? (
          <p className="rounded-xl border border-slate-200/70 bg-slate-50/40 p-3 text-sm font-semibold text-slate-500 dark:border-[var(--border)]/60 dark:bg-[var(--surface-elevated)]/25 dark:text-slate-400">
            No active goals for today.
          </p>
        ) : (
          <>
            <div className="relative px-1.5">
              <div className="absolute left-4 right-4 top-3 h-0.5 overflow-hidden rounded-full bg-slate-200 dark:bg-[var(--border)]">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: `${activePathWidth}%` }}
                />
              </div>

              <div
                className="relative grid min-w-0"
                style={{ gridTemplateColumns: `repeat(${goals.length}, minmax(0, 1fr))` }}
              >
                {goals.map((goal, index) => {
                  const isComplete = goal.completed;

                  return (
                    <div key={goal.id} className="min-w-0 text-center">
                      <div
                        className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-black transition-colors ${
                          isComplete
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-[var(--card)] text-slate-400 dark:border-slate-600 dark:bg-[var(--surface)] dark:text-slate-500"
                        }`}
                      >
                        {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <p className="mt-1 text-[10px] font-black text-slate-400 dark:text-slate-500">
                        {index + 1}
                      </p>
                      <p
                        className={`mx-auto mt-0.5 min-h-[2rem] max-w-[7rem] whitespace-normal break-words text-center text-[10px] font-bold leading-tight [text-wrap:balance] sm:text-[11px] ${
                          isComplete
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                        title={goal.title}
                      >
                        {goal.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50/40 p-3 dark:border-[var(--border)]/60 dark:bg-[var(--surface-elevated)]/25">
              {nextGoal ? (
                <NextGoalCard goal={nextGoal} />
              ) : (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                      Today&apos;s mission complete
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      All {goals.length} goals finished.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
    </div>
  );
}

function NextGoalCard({ goal }) {
  const targetValue = Number(goal.target_value) || 0;
  const progress = Number(goal.progress) || 0;
  const progressPct = targetValue ? Math.min((progress / targetValue) * 100, 100) : 0;

  return (
    <div className="min-w-0">
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        Next Up
      </p>
      <div className="flex min-w-0 items-start gap-2.5">
        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="whitespace-normal break-words text-sm font-black leading-tight text-slate-900 dark:text-white">
                {goal.title}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {goal.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <Zap className="h-2.5 w-2.5 fill-current" />
              +{goal.xp} XP
            </div>
          </div>

          <div className="mt-2">
            <div className="mb-1 flex items-end justify-between gap-2">
              {targetValue > 1 && (
                <span className="text-[11px] font-bold text-slate-400">
                  {progress} / {goal.target_value}
                </span>
              )}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)]">
              <div
                className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
