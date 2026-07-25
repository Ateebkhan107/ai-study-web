"use client";

import { Target, Trophy, Flame, TrendingUp } from "lucide-react";

const STAT_STYLES = {
  "Tests Taken": {
    icon: Target,
    accent: "#6366F1",
    gradient: "from-indigo-500 to-violet-500",
    bgPattern: "from-indigo-500/10 via-violet-500/5 to-transparent dark:from-indigo-500/20 dark:via-violet-500/5",
  },
  "Average Score": {
    icon: TrendingUp,
    accent: "#10b981",
    gradient: "from-emerald-500 to-teal-500",
    bgPattern: "from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-500/20 dark:via-teal-500/5",
  },
  "Accuracy": {
    icon: Trophy,
    accent: "#f59e0b",
    gradient: "from-amber-500 to-orange-500",
    bgPattern: "from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-500/20 dark:via-orange-500/5",
  },
  "Study Streak": {
    icon: Flame,
    accent: "#ef4444",
    gradient: "from-rose-500 to-pink-500",
    bgPattern: "from-rose-500/10 via-pink-500/5 to-transparent dark:from-rose-500/20 dark:via-pink-500/5",
  },
};

export default function OverviewCards({ stats }) {
  const cards = [
    {
      label: "Tests Taken",
      value: stats?.totalTests ?? 0,
      sub: "completed tests",
    },
    {
      label: "Average Score",
      value: `${stats?.averageScore ?? 0}%`,
      sub: "overall performance",
    },
    {
      label: "Accuracy",
      value: `${stats?.accuracy ?? 0}%`,
      sub: "questions accuracy",
    },
    {
      label: "Study Streak",
      value: stats?.streak ?? 0,
      sub: (stats?.streak === 1 ? "day" : "days") + " active streak",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((s, index) => {
        const style = STAT_STYLES[s.label] || STAT_STYLES["Tests Taken"];
        const Icon = style.icon;

        return (
          <div
            key={s.label}
            className={`group relative overflow-hidden rounded-3xl bg-white/70 dark:bg-[#0f172a]/60 p-5 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg animate-slideUp`}
            style={{ animationDelay: `${index * 75}ms` }}
          >
            {/* Animated Gradient Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${style.bgPattern} opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {s.label}
                </p>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                  style={{ background: `${style.accent}15` }}
                >
                  <Icon size={18} style={{ color: style.accent }} />
                </div>
              </div>

              <p
                className={`text-3xl font-extrabold tracking-tight mb-1 bg-gradient-to-br ${style.gradient} bg-clip-text text-transparent`}
              >
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