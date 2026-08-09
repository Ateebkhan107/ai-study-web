"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Target, Trophy, Flame } from "lucide-react";

// Mapping for dynamic, colorful styling based on stat labels
const STAT_STYLES = {
  "Accuracy": {
    icon: Target,
    borderHover: "hover:border-emerald-200 dark:hover:border-emerald-500/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    valueColor: "text-slate-800 dark:text-slate-100"
  },
  "Rank": {
    icon: Trophy,
    borderHover: "hover:border-amber-200 dark:hover:border-amber-500/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    valueColor: "text-slate-800 dark:text-slate-100"
  },
  "Study Streak": {
    icon: Flame,
    borderHover: "hover:border-rose-200 dark:hover:border-rose-500/30",
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-500/10",
    valueColor: "text-slate-800 dark:text-slate-100"
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
            className={`group relative overflow-hidden rounded-2xl bg-white/50 dark:bg-slate-800/40 p-6 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 transition-all duration-300 hover:shadow-sm ${style.borderHover}`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            
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
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${style.iconBg} transition-transform duration-300 group-hover:scale-105`}>
                <Icon className={`w-6 h-6 ${style.iconColor}`} strokeWidth={2.5} />
              </div>
            </div>

            <div className="relative z-10 flex items-end justify-between">
              <h3 className={`text-4xl sm:text-5xl font-black tracking-tighter ${style.valueColor}`}>
                {stat.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
