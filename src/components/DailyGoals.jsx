"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { CheckCircle2, Zap, MessageCircle, FileText, BookOpen, Layers, Target } from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";

function getGoalCountLabel(count) {
  return count === 1 ? "Goal" : "Goals";
}

function getIconForGoal(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("community") || t.includes("doubt") || t.includes("message")) return MessageCircle;
  if (t.includes("test") || t.includes("quiz")) return FileText;
  if (t.includes("pyq") || t.includes("question")) return BookOpen;
  if (t.includes("revise") || t.includes("card") || t.includes("revision")) return Layers;
  return Target;
}

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

  return (
    <div className={`relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#2A2A2A] dark:bg-[#141414] ${
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
          <div className="text-right">
            {completed < goals.length && goals.length > 0 && (
              <>
                <p className="text-xs font-black tracking-[0.08em] text-slate-700 dark:text-slate-200">
                  <AnimatedNumber number={goals.length} /> {getGoalCountLabel(goals.length)}
                </p>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
                  Resets at 12:00 AM
                </p>
              </>
            )}
          </div>
        </div>

        {goals.length > 0 && completed < goals.length && (
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            {completed === 0 
              ? "You haven't started today's mission yet."
              : `${goals.length - completed} ${goals.length - completed === 1 ? 'task' : 'tasks'} left · resets at midnight`}
          </p>
        )}
      </div>

      <div className="relative z-10 mt-6 sm:mt-8">
        {goals.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-500 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-slate-400">
            No active goals for today.
          </p>
        ) : (
          <div className="flex flex-col gap-0 pb-2">
            {goals.map((goal, index) => {
              const isComplete = goal.completed;
              const isCurrent = nextGoal?.id === goal.id;
              const Icon = getIconForGoal(goal.title);
              const isLast = index === goals.length - 1;
              const targetValue = Number(goal.target_value) || 0;
              const progress = Number(goal.progress) || 0;
              const progressPct = targetValue ? Math.min((progress / targetValue) * 100, 100) : 0;
              
              return (
                <div key={goal.id} className="relative flex items-stretch gap-4 sm:gap-5 group">
                  {/* Functional Path Line */}
                  {!isLast && (
                     <div className={`absolute left-[0.9375rem] top-8 w-0.5 h-full ${
                       isComplete ? "bg-emerald-500" : "bg-slate-200 dark:bg-[#2A2A2A]"
                     }`} />
                  )}
                  
                  {/* Node */}
                  <div className="relative z-10 flex flex-col items-center py-2 shrink-0">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-md border ${
                      isComplete 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : isCurrent
                          ? "bg-[#F5C518] border-[#F5C518] text-black"
                          : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-slate-500"
                    }`}>
                       {isComplete ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Icon className="h-4 w-4" />}
                    </div>
                  </div>
                  
                  {/* Content Card */}
                  <div className={`mb-4 flex-1 rounded-md border p-3 sm:p-4 ${
                    isCurrent 
                      ? "border-[#F5C518] bg-slate-50 dark:bg-[#18181A]" 
                      : isComplete
                        ? "border-slate-200 bg-white opacity-60 dark:border-[#2A2A2A] dark:bg-[#141414]"
                        : "border-slate-200 bg-white dark:border-[#2A2A2A] dark:bg-[#141414]"
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                       <div className="min-w-0">
                          {isCurrent && (
                             <span className="mb-1.5 inline-block rounded bg-[#F5C518] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black">
                               Do This Now
                             </span>
                          )}
                          <h3 className={`text-sm font-bold truncate ${isCurrent ? "text-slate-900 dark:text-slate-100" : isComplete ? "text-slate-500 dark:text-slate-400 line-through" : "text-slate-600 dark:text-slate-300"}`}>
                            {goal.title}
                          </h3>
                          {goal.description && (
                            <p className={`mt-1 text-xs truncate ${isCurrent ? "text-slate-600 dark:text-slate-400" : "text-slate-500"}`}>
                              {goal.description}
                            </p>
                          )}
                       </div>
                       {/* XP Badge */}
                       {!isComplete && (
                         <div className={`flex items-center gap-1 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                           isCurrent ? "bg-[#F5C518] text-black" : "bg-slate-100 text-slate-500 dark:bg-[#2A2A2A] dark:text-slate-400"
                         }`}>
                           <Zap className="h-3 w-3 fill-current" />
                           {goal.xp} XP
                         </div>
                       )}
                    </div>
                    
                    {/* Progress Bar for Current */}
                    {isCurrent && targetValue > 0 && (
                       <div className="mt-3">
                          <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                             <span>Progress</span>
                             <span>{progress} / {targetValue}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-[#2A2A2A]">
                             <div className="h-full bg-[#F5C518] transition-all duration-500" style={{ width: `${progressPct}%` }} />
                          </div>
                       </div>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* Completion Message */}
            {!nextGoal && goals.length > 0 && (
              <div className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-50 p-4 dark:border-emerald-500/10 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="text-[15px] font-black text-emerald-700 dark:text-emerald-400">
                      Today&apos;s mission complete
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      All {goals.length} goals finished. Outstanding work!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
    </div>
  );
}
