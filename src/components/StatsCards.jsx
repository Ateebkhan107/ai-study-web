"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import AnimatedNumber from "@/components/AnimatedNumber";

function CustomRankIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 19h14" />
      <path d="M7 19V9l5-4 5 4v10" />
      <path d="M9.5 11.5h5" />
      <path d="M10.5 15h3" />
      <path d="M12 5v14" />
    </svg>
  );
}

function CustomStreakIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21c-3.8 0-6.5-2.7-6.5-6.4 0-2.8 1.7-5.2 4.8-7.5.1 2.1.9 3.6 2.3 4.5.2-3 1.6-5.5 4.1-7.6.2 2.6.8 4.6 1.8 6.1.7 1.1 1 2.4 1 3.8 0 4.1-3 7.1-7.5 7.1Z" />
      <path d="M12 17.8c-1.4 0-2.4-1-2.4-2.3 0-1 .6-1.9 1.8-2.8.1.8.4 1.3.9 1.7.1-1.1.6-2.1 1.5-2.9.1 1 .3 1.7.7 2.3.3.4.4.9.4 1.4 0 1.6-1.1 2.6-2.9 2.6Z" />
    </svg>
  );
}

function CustomXpIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 2 4 13h7l-1 9 10-13h-7l1-7Z" />
      <path d="M7.5 13h3.5" />
      <path d="M13 9h3.5" />
    </svg>
  );
}

function TrendBadge({ value, fallback, positiveIsGood = true }) {
  if (typeof value !== "number" || value === 0) {
    return (
      <span className="rounded-full border border-amber-200/70 bg-amber-100/55 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-700 dark:border-brand/25 dark:bg-brand/10 dark:text-brand">
        {fallback}
      </span>
    );
  }

  const improved = positiveIsGood ? value > 0 : value < 0;
  const symbol = value > 0 ? "▲" : "▼";

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black tracking-[0.08em] ${
      improved
        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
        : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300"
    }`}>
      {symbol}{Math.abs(value)}
    </span>
  );
}

export default function StatsCards() {
  const { user, isLoaded } = useUser();

  const [stats, setStats] = useState({
    rank: null,
    rankTrend: null,
    streak: null,
    xp: null,
    xpToday: null,
  });

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadStats() {
      try {
        const statsResponse = await fetch("/api/dashboard-stats", { cache: "no-store" });

        if (!statsResponse.ok) {
          throw new Error(`Failed to load stats: ${statsResponse.status}`);
        }

        const data = await statsResponse.json();

        setStats({
          rank: data.rank ?? null,
          rankTrend: data.rankTrend ?? null,
          streak: data.streak ?? null,
          xp: data.xp ?? null,
          xpToday: data.xpToday ?? null,
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
    <div className="relative h-full overflow-hidden rounded-2xl border border-amber-200/70 bg-[var(--card)] p-4 shadow-sm dark:border-brand/20 dark:bg-[var(--surface)] sm:p-5">
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Performance
        </p>
        <span className="rounded-full border border-brand/25 bg-brand/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-amber-700 dark:text-brand">
          Leaderboard sync
        </span>
      </div>

      <div className="mt-4 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-3 lg:grid-cols-1">
        {stats.rank !== null && (
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-3 shadow-sm dark:border-brand/20 dark:bg-brand/10 sm:p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2 text-amber-700 dark:text-brand">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-white/80 text-amber-600 shadow-sm dark:border-brand/25 dark:bg-black/20 dark:text-brand">
                  <CustomRankIcon className="h-4 w-4" />
                </span>
                <AnimatedNumber
                  number={stats.rank}
                  prefix="#"
                  className="truncate text-2xl font-black font-display tracking-tight text-slate-950 dark:text-white sm:text-3xl"
                />
              </div>
              <TrendBadge value={stats.rankTrend} fallback="Live" positiveIsGood={false} />
            </div>
            <p className="mt-1 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">Rank</p>
          </div>
        )}

        {stats.streak !== null && (
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-3 shadow-sm dark:border-brand/20 dark:bg-brand/10 sm:p-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-brand">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-white/80 text-amber-600 shadow-sm dark:border-brand/25 dark:bg-black/20 dark:text-brand">
                <CustomStreakIcon className="h-4 w-4" />
              </span>
              <AnimatedNumber
                number={stats.streak}
                className="text-2xl font-black font-display tracking-tight text-slate-950 dark:text-white sm:text-3xl"
              />
            </div>
            <p className="mt-1 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">Day streak</p>
          </div>
        )}

        {stats.xp !== null && (
          <div className="col-span-2 rounded-xl border border-amber-300/80 bg-gradient-to-br from-amber-50 to-amber-100/70 p-3.5 shadow-sm dark:border-brand/30 dark:from-brand/15 dark:to-brand/5 lg:col-span-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2 text-amber-700 dark:text-brand">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-white/85 text-amber-600 shadow-sm dark:border-brand/25 dark:bg-black/20 dark:text-brand">
                  <CustomXpIcon className="h-4 w-4" />
                </span>
                <AnimatedNumber
                  number={stats.xp}
                  suffix=" XP"
                  className="truncate text-xl font-black font-display tracking-tight text-slate-950 dark:text-white sm:text-2xl"
                />
              </div>
              <TrendBadge value={stats.xpToday} fallback="Total XP" />
            </div>
            <p className="mt-1 text-[11px] sm:text-xs font-bold text-amber-700/70 dark:text-brand/75">Matches Your Position</p>
          </div>
        )}
      </div>
    </div>
  );
}
