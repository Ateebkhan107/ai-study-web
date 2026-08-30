"use client";

import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

const CFG = {
  critical: {
    dot: "bg-red-500 dark:bg-red-400",
    label: "Critical",
  },
  needs_work: {
    dot: "bg-amber-500 dark:bg-amber-400",
    label: "Needs Work",
  },
  improving: {
    dot: "bg-indigo-500 dark:bg-indigo-400",
    label: "Improving",
  },
  strong: {
    dot: "bg-emerald-500 dark:bg-emerald-400",
    label: "Strong",
  },
};

function EmptyState({ minimumAttempts }) {
  return (
    <div className="flex flex-col items-start justify-between rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50 p-4 transition-all duration-200 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/20 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Compass className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Not enough chapter data yet</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Complete {minimumAttempts}+ questions in any chapter to calculate your weakness report and revision priorities.
          </p>
        </div>
      </div>
      <div className="mt-4 w-full pt-3 border-t border-slate-200/60 dark:border-[var(--border-subtle)]">
        <Link
          href="/pyq"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-brand-hover"
        >
          <span>Practice Chapters</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function WeakTopics({ weakChapters, minimumAttempts = 3 }) {
  const chapters = weakChapters?.items || [];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5 min-w-0">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100">
            Weak Chapters
          </h2>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Requires {minimumAttempts}+ answered questions per chapter
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">
          {weakChapters?.allCount || 0} mapped
        </span>
      </div>

      {chapters.length === 0 ? (
        <EmptyState minimumAttempts={minimumAttempts} />
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-[var(--border-subtle)]">
          {chapters.map((chapter, index) => {
            const cfg = CFG[chapter.status] || CFG.needs_work;
            return (
              <div key={`${chapter.subject}-${chapter.chapter}-${index}`} className="flex min-w-0 items-center gap-4 py-3.5">
                <div className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {chapter.chapter}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{chapter.subject}</p>
                </div>

                <span className="hidden text-xs text-slate-400 dark:text-slate-500 sm:inline">
                  {chapter.attempted} attempted
                </span>

                <div className="hidden w-40 items-center gap-3 sm:flex">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)]">
                    <div className="h-full rounded-full bg-brand dark:bg-brand" style={{ width: `${chapter.accuracy}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-black tabular-nums text-slate-900 dark:text-white">
                    {chapter.accuracy}%
                  </span>
                </div>

                <span className="text-xs font-black tabular-nums text-slate-900 dark:text-white sm:hidden">
                  {chapter.accuracy}%
                </span>

                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${chapter.statusClassName}`}>
                  {chapter.statusLabel || cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
