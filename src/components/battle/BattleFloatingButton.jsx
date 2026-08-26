"use client";

import Link from "next/link";
import { Swords } from "lucide-react";

export default function BattleFloatingButton() {
  return (
    <Link
      href="/battle"
      aria-label="Battle Arena"
      className="group fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-brand/45 bg-[var(--surface)] text-brand shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand/50 dark:bg-[var(--surface-elevated)] dark:shadow-black/30 sm:bottom-7 sm:right-7 sm:h-14 sm:w-14"
    >
      <Swords className="h-5 w-5" aria-hidden="true" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-200 sm:block">
        Battle Arena
      </span>
    </Link>
  );
}
