"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Target, Trophy, Flame } from "lucide-react";

// Mapping for dynamic, colorful styling based on stat labels
const STAT_STYLES = {
  "Accuracy": {
    icon: Target,
    bgPattern: "from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-500/20 dark:via-teal-500/5",
    borderHover: "hover:border-emerald-400/50 dark:hover:border-emerald-500/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20 shadow-emerald-500/20",
    glow: "group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] dark:group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]",
    valueGradient: "from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300"
  },
  "Rank": {
    icon: Trophy,
    bgPattern: "from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-500/20 dark:via-orange-500/5",
    borderHover: "hover:border-amber-400/50 dark:hover:border-amber-500/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-500/20 shadow-amber-500/20",
    glow: "group-hover:shadow-[0_8px_30px_rgba(245,158,11,0.2)] dark:group-hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]",
    valueGradient: "from-amber-500 to-orange-500 dark:from-amber-300 dark:to-orange-400"
  },
  "Study Streak": {
    icon: Flame,
    bgPattern: "from-rose-500/10 via-pink-500/5 to-transparent dark:from-rose-500/20 dark:via-pink-500/5",
    borderHover: "hover:border-rose-400/50 dark:hover:border-rose-500/50",
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-100 dark:bg-rose-500/20 shadow-rose-500/20",
    glow: "group-hover:shadow-[0_8px_30px_rgba(225,29,72,0.2)] dark:group-hover:shadow-[0_8px_30px_rgba(225,29,72,0.15)]",
    valueGradient: "from-rose-500 to-pink-500 dark:from-rose-400 dark:to-pink-300"
  }
};

export default function StatsCards() {
  const { user, isLoaded } = useUser();

  const [stats, setStats] = useState([
    {
      label: "Accuracy",
      value: "0%",
      sub: "Your performance",
      icon: "◎",
    },
    {
      label: "Rank",
      value: "#--",
      sub: "Based on XP",
      icon: "◇",
    },
    {
      label: "Study Streak",
      value: "0",
      sub: "Consecutive days"
    },
  ]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadStats() {
      try {
        const response = await fetch("/api/dashboard-stats", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to load stats: ${response.status}`);
        }

        const data = await response.json();

        setStats([
          {
            label: "Accuracy",
            value: `${data.accuracy || 0}%`,
            sub: "Your performance",
            icon: "◎", // Logic preserved, mapped to Lucide below
          },
          {
            label: "Rank",
            value: `#${data.rank || "--"}`,
            sub: "Based on XP",
            icon: "◇",
          },
          {
            label: "Study Streak",
            value: `${data.streak || 0}`,
            sub: "Consecutive days"
          },
        ]);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      }
    }

    loadStats();
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="relative h-[160px] overflow-hidden rounded-3xl border border-slate-200/50 bg-slate-50/50 dark:border-slate-800/50 dark:bg-slate-900/30"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
      {stats.map((stat, index) => {
        const style = STAT_STYLES[stat.label] || STAT_STYLES["Accuracy"];
        const Icon = style.icon;

        return (
          <div
            key={stat.label}
            className={`group relative overflow-hidden rounded-3xl bg-white/70 dark:bg-[#0f172a]/60 p-6 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-all duration-500 hover:-translate-y-1 ${style.borderHover} ${style.glow}`}
            style={{ transitionDelay: `${index * 75}ms` }}
          >
            {/* Animated Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${style.bgPattern} opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
            
            <div className="relative z-10 flex items-start justify-between mb-6">
              <div className="space-y-1.5">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-300">
                  {stat.label}
                </p>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {stat.sub}
                </p>
              </div>

              {/* Dynamic Icon Container */}
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${style.iconBg} shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6`}>
                <Icon className={`w-6 h-6 ${style.iconColor}`} strokeWidth={2.5} />
              </div>
            </div>

            <div className="relative z-10 flex items-end justify-between">
              <h3 className={`text-4xl sm:text-5xl font-black tracking-tighter bg-gradient-to-br ${style.valueGradient} bg-clip-text text-transparent drop-shadow-sm`}>
                {stat.value}
              </h3>
              
              {/* Subtle visual decoration behind text on hover */}
              <div className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-2xl">
                <Icon className={`w-24 h-24 ${style.iconColor}`} />
              </div>
            </div>
            
            {/* Ambient edge highlight */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white dark:via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        );
      })}
    </div>
  );
}
