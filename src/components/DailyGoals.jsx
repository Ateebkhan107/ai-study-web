"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2, Circle, Sparkles, Target, Zap } from "lucide-react";

export default function DailyGoals() {
  const { user } = useUser();

  const [goals, setGoals] = useState([]);
  const [track, setTrack] = useState(null);

  // =============================
  // LOAD USER EXAM
  // =============================

  useEffect(() => {
    if (!user) return;

    async function loadUser() {
      const { data } = await supabase
        .from("user_profiles")
        .select("exam")
        .eq("clerk_user_id", user.id)
        .single();

      setTrack(data?.exam || "JEE");
    }

    loadUser();
  }, [user]);

  // =============================
  // LOAD DAILY GOALS
  // =============================

  useEffect(() => {
    if (!track || !user) return;

    async function loadGoals() {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("daily_goals")
        .select(
          `
*,
user_daily_goals(
user_id,
progress,
completed,
goal_date
)
`
        )
        .eq("is_active", true)
        .in("target", [track, "ALL"])
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.log("Daily goals error:", error);
        return;
      }

      const formatted = (data || []).map((goal) => {
        const progressData = goal.user_daily_goals?.find(
          (item) => item.user_id === user.id && item.goal_date === today
        );

        return {
          ...goal,
          progress: progressData?.progress || 0,
          completed: progressData?.completed || false,
        };
      });

      setGoals(formatted);
    }

    loadGoals();
  }, [track, user?.id]);

  const completed = goals.filter((g) => g.completed).length;

  const percentage = goals.length
    ? (completed / goals.length) * 100
    : 0;

  return (
    <div className="relative overflow-hidden bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-2xl border border-indigo-100/50 dark:border-indigo-500/10 rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-500">
      
      {/* ── Background Glow ── */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-gradient-to-tr from-pink-500/20 to-orange-500/20 dark:from-pink-500/10 dark:to-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Header Section ── */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mb-3">
            <Target className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <h2 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">
              Daily Goals
            </h2>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            You've completed <span className="text-slate-800 dark:text-white font-bold">{completed}</span> out of {goals.length} tasks today.
          </p>
        </div>

        {/* Overall Progress */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {Math.round(percentage)}%
            </span>
          </div>
          <div className="w-32 sm:w-48 h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -translate-x-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Goals Grid ── */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {goals.map((goal, index) => {
          const isComplete = goal.completed;
          const progressPct = Math.min((goal.progress / goal.target_value) * 100, 100);

          return (
            <div
              key={goal.id}
              className={`group relative rounded-2xl p-5 border transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 overflow-hidden
                ${
                  isComplete
                    ? "bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-500/10 dark:to-teal-500/5 border-emerald-200/50 dark:border-emerald-500/20"
                    : "bg-white/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50"
                }
              `}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              
              {/* Subtle hover background gradient for incomplete goals */}
              {!isComplete && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              )}

              <div className="relative z-10 flex items-start justify-between mb-4">
                <div
                  className={`flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110
                    ${isComplete ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"}
                  `}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-7 h-7 drop-shadow-sm" />
                  ) : (
                    <Circle className="w-7 h-7" />
                  )}
                </div>

                <div className={`flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm backdrop-blur-md transition-all duration-300
                  ${isComplete 
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-orange-500/20" 
                    : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white"
                  }
                `}>
                  <Zap className="w-3 h-3 fill-current" />
                  +{goal.xp} XP
                </div>
              </div>

              <div className="relative z-10 space-y-1.5 mb-4">
                <h3 className={`text-base font-bold leading-snug transition-colors duration-300
                  ${isComplete ? "text-emerald-900 dark:text-emerald-300 line-through decoration-emerald-500/30" : "text-slate-800 dark:text-slate-100"}
                `}>
                  {goal.title}
                </h3>
                <p className={`text-xs font-medium leading-relaxed
                  ${isComplete ? "text-emerald-700/60 dark:text-emerald-400/50" : "text-slate-500 dark:text-slate-400"}
                `}>
                  {goal.description}
                </p>
              </div>

              {!isComplete && (
                <div className="relative z-10 mt-auto pt-2">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                    <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">
                      {goal.progress} / {goal.target_value}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
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