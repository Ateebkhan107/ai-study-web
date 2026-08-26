"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle, Zap } from "lucide-react";

const ROADMAP_VIEWBOX = { width: 360, height: 112 };
const ROADMAP_PATH = "M 16 56 C 72 18, 116 18, 172 56 S 272 94, 344 56";

export default function DailyGoals({ compact = false }) {
  const { user } = useUser();
  const pathname = usePathname();

  const [goals, setGoals] = useState([]);
  const roadmapPathRef = useRef(null);
  const [roadmapMetrics, setRoadmapMetrics] = useState({ totalLength: 0, points: [] });

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
  const activeGoalIndex = nextGoal
    ? Math.max(0, goals.findIndex((goal) => goal.id === nextGoal.id))
    : Math.max(0, goals.length - 1);

  const percentage = goals.length
    ? (completed / goals.length) * 100
    : 0;
  const activePathLength = roadmapMetrics.points[activeGoalIndex]?.length || 0;
  const activePathWidth = roadmapMetrics.totalLength
    ? (activePathLength / roadmapMetrics.totalLength) * 100
    : percentage;

  useEffect(() => {
    const path = roadmapPathRef.current;
    if (!path || goals.length === 0) {
      setRoadmapMetrics({ totalLength: 0, points: [] });
      return;
    }

    const totalLength = path.getTotalLength();
    const points = Array.from({ length: goals.length }, (_, index) => {
      const length = goals.length === 1
        ? totalLength / 2
        : (index / (goals.length - 1)) * totalLength;
      const point = path.getPointAtLength(length);
      return { x: point.x, y: point.y, length };
    });

    setRoadmapMetrics({ totalLength, points });
  }, [goals.length]);

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

      </div>

      <div className="relative z-10 mt-4">
        {goals.length === 0 ? (
          <p className="rounded-xl border border-slate-200/70 bg-slate-50/40 p-3 text-sm font-semibold text-slate-500 dark:border-[var(--border)]/60 dark:bg-[var(--surface-elevated)]/25 dark:text-slate-400">
            No active goals for today.
          </p>
        ) : (
          <>
            <div className="relative overflow-x-auto overflow-y-hidden px-1 pb-1 pt-2">
              <div className="relative min-h-[10.5rem]" style={{ minWidth: `${Math.max(420, goals.length * 112)}px` }}>
                {goals.length > 1 && (
                  <svg
                    className="absolute left-0 top-0 h-28 w-full overflow-visible"
                    viewBox={`0 0 ${ROADMAP_VIEWBOX.width} ${ROADMAP_VIEWBOX.height}`}
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      ref={roadmapPathRef}
                      d={ROADMAP_PATH}
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="5"
                      className="text-slate-200 dark:text-[var(--border)]"
                    />
                    <path
                      d={ROADMAP_PATH}
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="5"
                      className="text-brand transition-all duration-700 ease-out dark:text-brand"
                      pathLength="100"
                      strokeDasharray={`${activePathWidth} 100`}
                    />
                  </svg>
                )}

                {goals.map((goal, index) => {
                  const isComplete = goal.completed;
                  const isCurrent = nextGoal?.id === goal.id;
                  const point = roadmapMetrics.points[index] || {
                    x: ROADMAP_VIEWBOX.width * (goals.length > 1 ? index / (goals.length - 1) : 0.5),
                    y: ROADMAP_VIEWBOX.height / 2,
                  };

                  return (
                    <div
                      key={goal.id}
                      className="absolute w-24 -translate-x-1/2 text-center"
                      style={{
                        left: `${(point.x / ROADMAP_VIEWBOX.width) * 100}%`,
                        top: `${(point.y / ROADMAP_VIEWBOX.height) * 112}px`,
                      }}
                    >
                      <div
                        className={`relative mx-auto flex -translate-y-1/2 items-center justify-center rounded-full border text-[10px] font-black transition-colors ${
                          isComplete
                            ? "h-7 w-7 border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                            : isCurrent
                              ? "h-9 w-9 border-brand bg-brand text-slate-950 shadow-sm shadow-brand/25 ring-4 ring-brand/15"
                              : "h-7 w-7 border-slate-300 bg-[var(--card)] text-slate-400 dark:border-slate-600 dark:bg-[var(--surface)] dark:text-slate-500"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex flex-col items-center justify-start h-[3.5rem] pt-1">
                        <p
                          className={`max-w-[5.75rem] truncate whitespace-nowrap text-center text-[10px] font-bold leading-tight sm:text-[11px] ${
                            isComplete
                              ? "text-emerald-700 dark:text-emerald-400"
                              : isCurrent
                                ? "text-slate-900 dark:text-white"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                          title={goal.title}
                        >
                          {goal.title}
                        </p>
                        {isCurrent ? (
                          <p className="mt-2 w-fit rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-brand">
                            In progress
                          </p>
                        ) : (
                          <div className="mt-2 h-[18px]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="-mt-2 rounded-xl border-y border-r border-l-[3px] border-slate-200/70 border-l-brand bg-slate-50 p-4 shadow-sm relative z-20 mx-1 dark:border-y-[var(--border)]/60 dark:border-r-[var(--border)]/60 dark:bg-[var(--surface-elevated)]/40">
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
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        Next Up
      </p>
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[2px] border-slate-300 bg-white shadow-sm dark:border-slate-600 dark:bg-[var(--surface)]" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="min-w-0">
              <h3 className="whitespace-normal break-words text-[15px] font-black leading-tight text-slate-950 dark:text-white">
                {goal.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {goal.description}
              </p>
            </div>
            <div className="flex shrink-0 w-fit items-center gap-1.5 rounded-lg bg-brand px-2.5 py-1 text-[11px] font-black text-slate-950 shadow-sm">
              <Zap className="h-3 w-3 fill-current" />
              +{goal.xp} XP
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex items-end justify-between gap-2">
              {targetValue > 1 && (
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {progress} / {goal.target_value}
                </span>
              )}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/50">
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
