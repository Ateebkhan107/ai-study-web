"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles, Target, FileText, Clock, ArrowRight } from "lucide-react";

export default function AnalyticsUnlockBanner({ stats }) {
  const overview = stats?.overview || {};
  const counts = stats?.counts || {};
  const readiness = stats?.examReadiness || {};

  const pyqAnswered = Number(counts.answeredPyqQuestions ?? overview.questionsPracticed ?? 0);
  const mockCompleted = Number(counts.completedTests ?? overview.testsCompleted ?? 0);
  const timedAnswered = Number(readiness.counts?.timedAnswered ?? 0);

  const PYQ_TARGET = 20;
  const MOCK_TARGET = 1;
  const TIMED_TARGET = 20;

  const pyqDone = pyqAnswered >= PYQ_TARGET;
  const mockDone = mockCompleted >= MOCK_TARGET;
  const timedDone = timedAnswered >= TIMED_TARGET;

  const milestones = [
    {
      id: "pyq",
      label: "PYQ Practice",
      current: pyqAnswered,
      target: PYQ_TARGET,
      unit: "questions",
      completed: pyqDone,
      icon: Target,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      border: "border-blue-200 dark:border-blue-500/30",
      cta: "Practice PYQs",
      href: "/pyq",
    },
    {
      id: "mock",
      label: "Mock Test",
      current: mockCompleted,
      target: MOCK_TARGET,
      unit: "test",
      completed: mockDone,
      icon: FileText,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      border: "border-rose-200 dark:border-rose-500/30",
      cta: "Start Test",
      href: "/test",
    },
    {
      id: "speed",
      label: "Speed Drill",
      current: timedAnswered,
      target: TIMED_TARGET,
      unit: "timed Qs",
      completed: timedDone,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      border: "border-amber-200 dark:border-amber-500/30",
      cta: "Timed Test",
      href: "/test",
    },
  ];

  const completedCount = milestones.filter((m) => m.completed).length;
  const totalMilestones = milestones.length;
  const overallPercent = Math.round(
    (Math.min(pyqAnswered / PYQ_TARGET, 1) * 0.45 +
      Math.min(mockCompleted / MOCK_TARGET, 1) * 0.45 +
      Math.min(timedAnswered / TIMED_TARGET, 1) * 0.1) *
      100
  );

  // If already 100% unlocked across all 3 key requirements, don't show the unlock banner
  if (pyqDone && mockDone && timedDone) {
    return null;
  }

  // Generate dynamic contextual headline
  let headline = "";
  if (mockCompleted === 0 && pyqAnswered === 0) {
    headline = `Complete 1 mock test & ${PYQ_TARGET} PYQs to unlock your full exam readiness report`;
  } else if (!mockDone && !pyqDone) {
    const remainingPyq = Math.max(0, PYQ_TARGET - pyqAnswered);
    headline = `Complete 1 test & ${remainingPyq} more PYQs to unlock composite analytics`;
  } else if (!mockDone) {
    headline = "Submit your first mock test to unlock accuracy curves and readiness scores";
  } else if (!pyqDone) {
    const remainingPyq = Math.max(0, PYQ_TARGET - pyqAnswered);
    headline = `Answer ${remainingPyq} more PYQ questions to complete your subject & chapter breakdown`;
  } else {
    headline = "Complete a timed test drill to unlock speed & time pace analytics";
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-4 shadow-sm transition-all duration-300 dark:border-brand/30 dark:bg-gradient-to-br dark:from-brand/10 dark:via-[var(--surface)] dark:to-brand/5 dark:bg-[var(--surface)] sm:p-5">
      {/* Background Watermark Accent */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-brand/10 blur-2xl dark:bg-brand/15" />

      <div className="relative z-10">
        {/* Header Eyebrow & Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand text-slate-950 shadow-sm">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-800 dark:text-brand sm:text-[11px]">
              Unlock Full Analytics
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 shadow-2xs dark:border-brand/30 dark:bg-[var(--surface-elevated)] dark:text-brand">
              <span>{completedCount} of {totalMilestones} Unlocked</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>{overallPercent}%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Headline */}
        <div className="mt-2.5">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white sm:text-base">
            {headline}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Every question you answer sharpens your readiness curve, chapter insights, and AI recommendations.
          </p>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-[var(--surface-elevated)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-amber-500 transition-all duration-700 ease-out"
            style={{ width: `${Math.max(5, overallPercent)}%` }}
          />
        </div>

        {/* Milestone Steps with Inline CTAs */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {milestones.map((m) => {
            const Icon = m.icon;
            const progressPct = Math.min(100, Math.round((m.current / m.target) * 100));

            return (
              <div
                key={m.id}
                className={`flex flex-col justify-between rounded-xl border p-3 transition-all duration-200 ${
                  m.completed
                    ? "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-950/20"
                    : "border-slate-200/80 bg-white/70 hover:border-slate-300 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/50 dark:hover:border-slate-600"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${m.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${m.color}`} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {m.label}
                      </span>
                    </div>

                    {m.completed ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Done
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold tabular-nums text-slate-600 dark:text-slate-400">
                        {m.current}/{m.target}
                      </span>
                    )}
                  </div>

                  {!m.completed && (
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface)]">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  )}
                </div>

                {!m.completed && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[var(--border-subtle)]/60">
                    <Link
                      href={m.href}
                      className="inline-flex w-full items-center justify-between rounded-lg bg-slate-100/90 px-2.5 py-1.5 text-[11px] font-bold text-slate-900 transition-colors hover:bg-brand hover:text-slate-950 dark:bg-[var(--surface)] dark:text-slate-200 dark:hover:bg-brand dark:hover:text-slate-950"
                    >
                      <span>{m.cta}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
