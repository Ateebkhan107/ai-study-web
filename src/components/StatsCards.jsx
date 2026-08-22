"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Flame, Trophy, Zap } from "lucide-react";

export default function StatsCards() {
  const { user, isLoaded } = useUser();

  const [stats, setStats] = useState({
    rank: null,
    streak: null,
    xp: null,
  });

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadStats() {
      try {
        const [statsResponse, profileResponse] = await Promise.all([
          fetch("/api/dashboard-stats", { cache: "no-store" }),
          fetch("/api/profile", { cache: "no-store" }),
        ]);

        if (!statsResponse.ok) {
          throw new Error(`Failed to load stats: ${statsResponse.status}`);
        }

        const data = await statsResponse.json();
        const profile = profileResponse.ok ? await profileResponse.json() : {};

        setStats({
          rank: data.rank ?? profile.rank ?? null,
          streak: data.streak ?? profile.streak ?? null,
          xp: profile.xp ?? null,
        });
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      }
    }

    loadStats();
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="h-full rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="mb-3 h-12 animate-pulse overflow-hidden rounded-xl bg-slate-100/70 last:mb-0 dark:bg-[var(--surface-elevated)]/50"
          >
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        Performance
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-1">
        {stats.rank !== null && (
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-[var(--surface-elevated)]/40">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
              <Trophy className="h-4 w-4" />
              <p className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">#{stats.rank}</p>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">Rank</p>
          </div>
        )}

        {stats.streak !== null && (
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-[var(--surface-elevated)]/40">
            <div className="flex items-center gap-2 text-rose-500">
              <Flame className="h-4 w-4" />
              <p className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">{stats.streak}</p>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">Day streak</p>
          </div>
        )}

        {stats.xp !== null && (
          <div className="col-span-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10 lg:col-span-1">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
              <Zap className="h-4 w-4 fill-current" />
              <p className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                {Number(stats.xp).toLocaleString()} XP
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
