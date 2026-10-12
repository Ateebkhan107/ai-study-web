"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Send, Sparkles } from "lucide-react";
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
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-900 dark:bg-[#F5C518] dark:text-black">
        {fallback}
      </span>
    );
  }

  const improved = positiveIsGood ? value > 0 : value < 0;
  const symbol = value > 0 ? "▲" : "▼";

  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black tracking-[0.08em] ${
      improved
        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-500 dark:text-black"
        : "bg-rose-100 text-rose-900 dark:bg-rose-500 dark:text-black"
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

  const [quickQuestion, setQuickQuestion] = useState("");

  const handleAskZi = (promptText) => {
    if (!promptText) return;
    window.dispatchEvent(
      new CustomEvent("prepzii:open-zi", { detail: { prompt: promptText } })
    );
  };

  const handleMiniSubmit = (e) => {
    e.preventDefault();
    const q = quickQuestion.trim();
    if (!q) return;
    handleAskZi(q);
    setQuickQuestion("");
  };

  if (!isLoaded) {
    return (
      <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#2A2A2A] dark:bg-[#141414]">
        <div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="mb-3 h-12 animate-pulse overflow-hidden rounded-xl bg-slate-100 last:mb-0 dark:bg-[#1A1A1A]"
            >
            </div>
          ))}
        </div>
        <div className="mt-4 h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-[#1A1A1A]" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border-[1.5px] border-[var(--snb-border)] bg-white p-4 shadow-[var(--snb-shadow)] dark:border-[var(--snb-border)] dark:bg-[#141414] sm:p-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Performance
          </p>
          <span className="rounded-full border border-amber-300/80 bg-amber-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-amber-900 shadow-[1px_1px_0px_rgba(202,138,4,0.2)] dark:border-brand dark:bg-brand dark:text-black">
            Leaderboard sync
          </span>
        </div>

        <div className="mt-4 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-3 lg:grid-cols-1">
          {stats.rank !== null && (
            <div className="rounded-xl border-[1.5px] border-[var(--snb-border)] bg-[var(--surface-secondary)] p-3 shadow-[var(--snb-shadow)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--snb-shadow-hover)] dark:border-[var(--snb-border)] dark:bg-[#1A1A1A] sm:p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 text-amber-700 dark:text-[#F5C518]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-amber-300/70 bg-white text-amber-600 shadow-[1px_1px_0px_rgba(202,138,4,0.2)] dark:border-[#2A2A2A] dark:bg-[#2A2A2A] dark:text-[#F5C518]">
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
            <div className="rounded-xl border-[1.5px] border-[var(--snb-border)] bg-[var(--surface-secondary)] p-3 shadow-[var(--snb-shadow)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--snb-shadow-hover)] dark:border-[var(--snb-border)] dark:bg-[#1A1A1A] sm:p-3.5">
              <div className="flex items-center gap-2 text-amber-700 dark:text-[#F5C518]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-amber-300/70 bg-white text-amber-600 shadow-[1px_1px_0px_rgba(202,138,4,0.2)] dark:border-[#2A2A2A] dark:bg-[#2A2A2A] dark:text-[#F5C518]">
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
            <div className="col-span-2 rounded-xl border-[1.5px] border-[#9A7407] bg-brand p-3.5 shadow-[2.5px_2.5px_0px_rgba(30,42,68,0.2)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_rgba(30,42,68,0.25)] dark:border-brand dark:bg-brand dark:shadow-[2.5px_2.5px_0px_rgba(0,0,0,0.65)] lg:col-span-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 text-black dark:text-black">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-black/30 bg-white text-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.15)] dark:border-black dark:bg-black dark:text-[#F5C518]">
                    <CustomXpIcon className="h-4 w-4" />
                  </span>
                  <AnimatedNumber
                    number={stats.xp}
                    suffix=" XP"
                    className="truncate text-xl font-black font-display tracking-tight text-black dark:text-black sm:text-2xl"
                  />
                </div>
                <TrendBadge value={stats.xpToday} fallback="Total XP" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zi AI Quick Tutor Widget */}
      <div className="mt-4 flex flex-col rounded-xl border-[1.5px] border-amber-300/70 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 p-3 shadow-sm dark:border-amber-500/20 dark:bg-none dark:bg-[#18181C] dark:shadow-none">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-amber-300 bg-amber-400 text-stone-950 shadow-sm dark:border-amber-400/50">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xs font-black tracking-tight text-slate-900 dark:text-white">
                  Zi AI Tutor
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  24×7
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Instant doubts & concepts
              </p>
            </div>
          </div>
          <Link
            href="/zi"
            className="inline-flex items-center gap-0.5 rounded-lg border border-amber-300/60 bg-white/80 px-2 py-0.5 text-[10px] font-bold text-amber-800 transition-colors hover:border-amber-400 hover:bg-amber-100/70 hover:text-amber-950 dark:border-white/10 dark:bg-[#222228] dark:text-amber-400 dark:hover:border-amber-400/40 dark:hover:bg-amber-400/10 dark:hover:text-amber-300"
            title="Open full tutor workspace"
          >
            Full view
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Quick Revision Doubts */}
        <div className="mt-2.5 space-y-1.5">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-400">
            Quick revision doubts
          </p>
          <div className="flex flex-col gap-1.5">
            {[
              {
                icon: "⚡",
                text: "5-min rapid concept review",
                prompt: "Give me a quick 5-minute high-yield concept review for my exam syllabus.",
              },
              {
                icon: "💡",
                text: "Explain tricky formula traps",
                prompt: "Explain the trickiest formula traps and common mistakes in JEE/NEET questions.",
              },
              {
                icon: "🎯",
                text: "How to avoid silly mistakes?",
                prompt: "What are 3 practical steps I can take today to eliminate silly calculation mistakes and boost test accuracy?",
              },
            ].map((chip) => (
              <button
                key={chip.text}
                type="button"
                onClick={() => handleAskZi(chip.prompt)}
                className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200/80 bg-white/90 px-2.5 py-1.5 text-left text-[11px] font-semibold text-slate-700 shadow-sm transition-all hover:border-amber-400/60 hover:bg-amber-50/70 hover:text-slate-950 dark:border-white/10 dark:bg-[#202026] dark:text-slate-200 dark:hover:border-amber-400/40 dark:hover:bg-amber-400/10 dark:hover:text-white"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="text-xs">{chip.icon}</span>
                  <span className="truncate">{chip.text}</span>
                </span>
                <ArrowRight className="h-3 w-3 shrink-0 text-slate-400 transition-colors group-hover:text-amber-600 dark:text-slate-500 dark:group-hover:text-amber-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Mini Ask Input */}
        <form onSubmit={handleMiniSubmit} className="mt-2.5 flex items-center gap-1.5">
          <input
            type="text"
            value={quickQuestion}
            onChange={(e) => setQuickQuestion(e.target.value)}
            placeholder="Ask Zi a doubt or topic..."
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/40 dark:border-white/10 dark:bg-[#202026] dark:text-white dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!quickQuestion.trim()}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-bold shadow-sm transition-all hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:bg-amber-400 dark:text-black dark:hover:bg-amber-300 dark:disabled:bg-white/10 dark:disabled:text-slate-600"
            aria-label="Send to Zi"
          >
            <Send className="h-3 w-3" strokeWidth={2.4} />
          </button>
        </form>
      </div>
    </div>
  );
}
