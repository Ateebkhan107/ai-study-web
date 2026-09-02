"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { CheckCircle2, Zap } from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";

const ROADMAP_VIEWBOX = { width: 360, height: 112 };
const ROADMAP_PATH = "M 16 56 C 72 18, 116 18, 172 56 S 272 94, 344 56";

function getGoalCountLabel(count) {
  return count === 1 ? "Goal" : "Goals";
}

function getRoadmapLayout(goalCount) {
  if (goalCount <= 1) {
    return {
      minHeight: 112,
      minWidth: 260,
      path: "M 112 56 H 248",
      svgHeight: 88,
    };
  }

  if (goalCount === 2) {
    return {
      minHeight: 136,
      minWidth: 360,
      path: "M 36 56 C 118 30, 242 30, 324 56",
      svgHeight: 96,
    };
  }

  if (goalCount === 3) {
    return {
      minHeight: 176,
      minWidth: 420,
      path: "M 24 56 C 82 22, 136 22, 180 56 S 278 90, 336 56",
      svgHeight: 112,
    };
  }

  return {
    minHeight: 208,
    minWidth: Math.max(480, goalCount * 140),
    path: ROADMAP_PATH,
    svgHeight: 128,
  };
}

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
  const roadmapLayout = getRoadmapLayout(goals.length);
  const activePathLength = roadmapMetrics.points[activeGoalIndex]?.length || 0;
  const activePathWidth = goals.length === 1
    ? percentage
    : roadmapMetrics.totalLength
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
  }, [goals.length, roadmapLayout.path]);

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
            <p className="text-xs font-black tracking-[0.08em] text-slate-700 dark:text-slate-200">
              <AnimatedNumber number={goals.length} /> {getGoalCountLabel(goals.length)}
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
            {/* DESKTOP CURVED ROADMAP */}
            {goals.length === 1 ? (
              <div className="hidden sm:flex justify-center px-1 pb-4 pt-3">
                {goals.map((goal, index) => {
                  const isComplete = goal.completed;
                  const isCurrent = nextGoal?.id === goal.id;

                  return (
                    <div key={goal.id} className="relative flex min-h-[6rem] w-full max-w-sm flex-col items-center justify-center text-center">
                      <div className="absolute left-8 right-8 top-8 h-1 rounded-full bg-slate-200 dark:bg-[var(--border)]" aria-hidden="true" />
                      <div
                        className={`relative z-10 flex items-center justify-center rounded-full border text-[10px] font-black transition-colors ${
                          isComplete
                            ? "h-8 w-8 border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                            : isCurrent
                              ? "h-10 w-10 border-brand bg-brand text-slate-950 shadow-sm shadow-brand/25 ring-4 ring-brand/15"
                              : "h-8 w-8 border-slate-300 bg-[var(--card)] text-slate-400 dark:border-slate-600 dark:bg-[var(--surface)] dark:text-slate-500"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        ) : (
                          <AnimatedNumber number={index + 1} />
                        )}
                      </div>
                      <p
                        className={`mt-2 max-w-[12rem] text-center text-[11px] font-bold leading-tight ${
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
                      {isCurrent && (
                        <p className="mt-1.5 w-fit rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-brand">
                          In progress
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="hidden sm:block relative overflow-x-auto overflow-y-hidden px-1 pb-1 pt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div
                  className="relative"
                  style={{
                    minHeight: `${roadmapLayout.minHeight}px`,
                    minWidth: `${roadmapLayout.minWidth}px`,
                  }}
                >
                  <svg
                    className="absolute left-0 top-0 w-full overflow-visible"
                    style={{ height: `${roadmapLayout.svgHeight}px` }}
                    viewBox={`0 0 ${ROADMAP_VIEWBOX.width} ${ROADMAP_VIEWBOX.height}`}
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      ref={roadmapPathRef}
                      d={roadmapLayout.path}
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="5"
                      className="text-slate-200 dark:text-[var(--border)]"
                    />
                    <path
                      d={roadmapLayout.path}
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="5"
                      className="text-brand transition-all duration-700 ease-out dark:text-brand"
                      pathLength="100"
                      strokeDasharray={`${activePathWidth} 100`}
                    />
                  </svg>

                  {goals.map((goal, index) => {
                    const isComplete = goal.completed;
                    const isCurrent = nextGoal?.id === goal.id;
                    const point = roadmapMetrics.points[index] || {
                      x: ROADMAP_VIEWBOX.width * (index / (goals.length - 1)),
                      y: ROADMAP_VIEWBOX.height / 2,
                    };

                    return (
                      <div
                        key={goal.id}
                        className="absolute w-28 -translate-x-1/2 text-center"
                        style={{
                          left: `${(point.x / ROADMAP_VIEWBOX.width) * 100}%`,
                          top: `${(point.y / ROADMAP_VIEWBOX.height) * roadmapLayout.svgHeight}px`,
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
                            <AnimatedNumber number={index + 1} />
                          )}
                        </div>
                        <div className="flex flex-col items-center justify-start h-[4.5rem] pt-1">
                          <p
                            className={`max-w-[6.5rem] text-center text-[10px] font-bold leading-tight sm:text-[11px] ${
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
                            <p className="mt-1.5 w-fit rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-brand">
                              In progress
                            </p>
                          ) : (
                            <div className="mt-1.5 h-[18px]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MOBILE VERTICAL MILESTONES */}
            <div className="sm:hidden flex flex-col gap-6 px-1 pt-3 pb-6">
              {goals.map((goal, index) => {
                const isComplete = goal.completed;
                const isCurrent = nextGoal?.id === goal.id;
                
                return (
                  <div key={goal.id} className={`relative flex items-center gap-4 ${isComplete ? "opacity-60" : "opacity-100"}`}>
                    {index !== goals.length - 1 && (
                      <div className={`absolute left-[13px] top-7 bottom-[-24px] w-[2px] ${
                        isComplete ? "bg-brand/80" : "bg-slate-200 dark:bg-slate-700"
                      }`} />
                    )}
                    <div
                      className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-black transition-colors ${
                        isComplete
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                          : isCurrent
                            ? "border-brand bg-brand text-slate-950 ring-4 ring-brand/15 shadow-sm scale-110"
                            : "border-slate-300 bg-[var(--card)] text-slate-400 dark:border-slate-600 dark:bg-[var(--surface)]"
                      }`}
                    >
                      {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-bold leading-tight ${
                        isComplete ? "text-[11px] text-emerald-700 dark:text-emerald-400 truncate"
                        : isCurrent ? "text-[13px] text-slate-900 dark:text-white"
                        : "text-[12px] text-slate-500 dark:text-slate-400"
                      }`}>
                        {goal.title}
                      </p>
                      {isCurrent && (
                        <p className="mt-1 w-fit rounded-full bg-brand/10 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-brand uppercase tracking-wider">
                          In progress
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border-y border-r border-l-[3px] border-slate-200/70 border-l-brand bg-slate-50 p-4 shadow-sm relative z-20 mx-1 dark:border-y-[var(--border)]/60 dark:border-r-[var(--border)]/60 dark:bg-[var(--surface-elevated)]/40 mt-2 sm:-mt-2">
              {nextGoal ? (
                <NextGoalCard goal={nextGoal} />
              ) : (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="text-[15px] font-black text-emerald-700 dark:text-emerald-300">
                      Today&apos;s mission complete
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
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
              +<AnimatedNumber number={goal.xp} /> XP
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex items-end justify-between gap-2">
              {targetValue > 1 && (
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <AnimatedNumber number={progress} /> / <AnimatedNumber number={targetValue} />
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
