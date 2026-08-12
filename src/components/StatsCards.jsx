"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Trophy, Flame } from "lucide-react";

// Mapping for dynamic, colorful styling based on stat labels
const STAT_STYLES = {
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

export default function StatsCards({ compact = false, stacked = false }) {
  const { user, isLoaded } = useUser();

  const [stats, setStats] = useState([
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
      <div className={`grid grid-cols-1 gap-3 ${stacked ? "md:grid-cols-2 lg:grid-cols-1" : "md:grid-cols-2"} ${compact ? "" : "gap-4"}`}>
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl border border-slate-200/50 bg-slate-50/50 dark:border-slate-800/50 dark:bg-slate-900/30 ${
              compact ? "h-[84px]" : "h-[128px]"
            }`}
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-3 ${
      stacked ? "md:grid-cols-2 lg:grid-cols-1" : "md:grid-cols-2 lg:gap-5"
    }`}>
      {stats.map((stat, index) => {
        const style = STAT_STYLES[stat.label] || STAT_STYLES["Rank"];
        const Icon = style.icon;

        return (
          <div
            key={stat.label}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-xl transition-all duration-300 hover:shadow-sm dark:border-slate-700/50 dark:bg-slate-800/40 ${compact ? "p-3.5 sm:p-4" : "p-4 sm:p-5"} ${style.borderHover}`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            
            <div className={`relative z-10 flex items-start justify-between ${
              compact ? "mb-2" : "mb-4"
            }`}>
              <div className="space-y-1">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-300">
                  {stat.label}
                </p>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {stat.sub}
                </p>
              </div>

              {/* Dynamic Icon Container */}
              <div className={`flex items-center justify-center rounded-xl ${style.iconBg} transition-transform duration-300 group-hover:scale-105 ${
                compact ? "h-8 w-8" : "h-9 w-9"
              }`}>
                <Icon className={`${compact ? "h-4 w-4" : "h-5 w-5"} ${style.iconColor}`} strokeWidth={2.5} />
              </div>
            </div>

            <div className="relative z-10 flex items-end justify-between">
              <h3 className={`font-black tracking-tighter ${compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"} ${style.valueColor}`}>
                {stat.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
