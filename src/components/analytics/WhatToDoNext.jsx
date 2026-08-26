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
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">
          What To Do Next
        </h2>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Based on your real performance data
        </p>
      </div>

      <div className="flex gap-4 border-t border-slate-200 pt-4 dark:border-[var(--border-subtle)]">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand text-xs font-semibold text-slate-950">
          1
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">
            {item.title}
          </p>

          <p className="my-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
            {item.description}
          </p>

          <Link
            href={item.href}
            className="inline-block rounded-md bg-brand px-4 py-2 text-xs font-semibold text-slate-950 transition-colors duration-150 hover:bg-brand-hover"
          >
            {item.cta} →
          </Link>
        </div>
      </div>
    </div>
  );
}
