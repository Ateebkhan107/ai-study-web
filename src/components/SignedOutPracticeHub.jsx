"use client";

import { useState } from "react";
import Link from "next/link";
import { Scroll, Target, Swords, ArrowRight, Zap } from "lucide-react";
import AuthGateModal from "@/components/auth/AuthGateModal";

export default function SignedOutPracticeHub({ activeTrackKey = "JEE" }) {
  const [showBattleAuthGate, setShowBattleAuthGate] = useState(false);

  const trackParam = activeTrackKey?.toLowerCase() === "neet" ? "neet" : "jee";
  const pyqHref = `/pyq?track=${trackParam}`;
  const testHref = `/test?track=${trackParam}`;

  return (
    <div className="min-w-0">
      <div className="relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-[#2A2A2A] dark:bg-[#141414] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Instant Practice Hub
            </p>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-400">
              Free Access
            </span>
          </div>

          <h2 className="mt-2 text-base sm:text-lg font-black font-display tracking-tight text-slate-950 dark:text-white">
            Start Solving Without Friction
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Jump directly into authentic exam simulations and high-yield question sets:
          </p>

          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Action 1: PYQs */}
            <Link
              href={pyqHref}
              className="group relative flex flex-col justify-between rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 transition-all duration-200 hover:border-amber-400 hover:bg-amber-50 hover:shadow-sm dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:hover:border-amber-500/50"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-600 dark:border-[#2A2A2A] dark:bg-[#2A2A2A] dark:text-[#F5C518]">
                    <Scroll className="h-4 w-4" />
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    2021–2025
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-black font-display text-slate-950 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Shift PYQs
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  Official papers with exam timer, +4/-1 marks & diagrams.
                </p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                Solve Papers <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Action 2: Mock Tests */}
            <Link
              href={testHref}
              className="group relative flex flex-col justify-between rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-3.5 transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:hover:border-indigo-500/50"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200 bg-white text-indigo-600 dark:border-[#2A2A2A] dark:bg-[#2A2A2A] dark:text-indigo-400">
                    <Target className="h-4 w-4" />
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    Custom
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-black font-display text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Mock Tests
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  Chapter-wise tests, rapid quizzes & full syllabus mocks.
                </p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                Start Test <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Action 3: Arena */}
            <Link
              href="/battle"
              onClick={(e) => {
                e.preventDefault();
                setShowBattleAuthGate(true);
              }}
              className="group relative flex flex-col justify-between rounded-xl border border-rose-200/80 bg-rose-50/40 p-3.5 transition-all duration-200 hover:border-rose-400 hover:bg-rose-50 hover:shadow-sm dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:hover:border-rose-500/50 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 dark:border-[#2A2A2A] dark:bg-[#2A2A2A] dark:text-rose-400">
                    <Swords className="h-4 w-4" />
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    1v1 Live
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-black font-display text-slate-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Peer Battles
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  Compete head-to-head with aspirants in real-time speed rounds.
                </p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
                Enter Arena <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>

        {/* Guest status bar */}
        <div className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50/70 p-2.5 sm:px-3 text-xs font-semibold text-slate-600 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            Guest Mode active — all papers & formula books are accessible.
          </span>
          <Link
            href="/sign-up"
            className="font-bold text-amber-700 hover:text-amber-800 dark:text-brand dark:hover:text-amber-300 underline underline-offset-2"
          >
            Create account to save streaks →
          </Link>
        </div>
      </div>

      <AuthGateModal
        isOpen={showBattleAuthGate}
        onClose={() => setShowBattleAuthGate(false)}
        targetUrl="/battle"
        featureName="1v1 Battle Arena"
        title="Sign in to enter the 1v1 Arena"
        message="Sign in or create your free account to challenge students in real-time battles and climb the leaderboard."
      />
    </div>
  );
}
