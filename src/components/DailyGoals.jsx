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
    <div className={`relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-2xl transition-all duration-500 dark:border-slate-800 dark:bg-[#0f172a]/80 ${
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
          <div className={`overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${
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
      <div className={`relative z-10 grid grid-cols-1 gap-2.5 sm:gap-3 ${
        compact ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3 lg:gap-4"
      }`}>
        {goals.map((goal, index) => {
          const isComplete = goal.completed;
          const progressPct = Math.min((goal.progress / goal.target_value) * 100, 100);

          return (
            <div
              key={goal.id}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-sm ${
                  compact ? "p-3 sm:p-4" : "p-3.5 sm:p-5"
              }
                ${
                  isComplete
                    ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200/50 dark:border-emerald-500/20"
                    : "bg-white/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50"
                }
              `}
              style={{ transitionDelay: `${index * 50}ms` }}
            >

              <div className={`relative z-10 flex items-start justify-between ${
                compact ? "mb-2.5" : "mb-3"
              }`}>
                <div
                  className={`flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110
                    ${isComplete ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"}
                  `}
                >
                  {isComplete ? (
                    <CheckCircle2 className={`${compact ? "h-5 w-5" : "h-6 w-6"} drop-shadow-sm`} />
                  ) : (
                    <Circle className={compact ? "h-5 w-5" : "h-6 w-6"} />
                  )}
                </div>

                <div className={`flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md transition-all duration-300
                  ${isComplete 
                    ? "bg-amber-500 text-white" 
                    : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/20"
                  }
                `}>
                  <Zap className="w-3 h-3 fill-current" />
                  +{goal.xp} XP
                </div>
              </div>

              <div className={`relative z-10 space-y-1 ${compact ? "mb-2.5" : "mb-3"}`}>
                <h3 className={`text-sm font-bold leading-snug transition-colors duration-300 sm:text-base
                  ${isComplete ? "text-emerald-900 dark:text-emerald-300 line-through decoration-emerald-500/30" : "text-slate-800 dark:text-slate-100"}
                `}>
                  {goal.title}
                </h3>
                <p className={`text-xs font-medium leading-snug
                  ${isComplete ? "text-emerald-700/60 dark:text-emerald-400/50" : "text-slate-500 dark:text-slate-400"}
                `}>
                  {goal.description}
                </p>
              </div>

              {!isComplete && (
                <div className="relative z-10 mt-auto pt-1">
                  <div className="mb-1.5 flex items-end justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                    <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">
                      {goal.progress} / {goal.target_value}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
              
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
