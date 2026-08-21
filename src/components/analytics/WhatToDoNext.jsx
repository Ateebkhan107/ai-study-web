"use client";

import Link from "next/link";

export default function WhatToDoNext({ action }) {
  const item = action || {
    title: "Take your first test",
    description: "Complete a test to start building your performance profile.",
    href: "/test",
    cta: "Start Test",
  };

  return (
    <div className="glass-card min-w-0 p-5">
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100">
          What To Do Next
        </h2>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Based on your real performance data
        </p>
      </div>

      <div className="flex gap-4 rounded-xl border border-slate-200/60 p-4 transition-all duration-200 hover:-translate-y-0.5 dark:border-[var(--border)]/50">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white dark:bg-indigo-500 dark:text-white">
          1
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {item.title}
          </p>

          <p className="my-2 text-xs text-gray-500 dark:text-gray-400">
            {item.description}
          </p>

          <Link
            href={item.href}
            className="inline-block rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20"
          >
            {item.cta} →
          </Link>
        </div>
      </div>
    </div>
  );
}
