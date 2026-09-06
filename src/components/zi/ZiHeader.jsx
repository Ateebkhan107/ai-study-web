import { X } from "lucide-react";

export default function ZiHeader({ onClose }) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3 dark:border-[var(--border-subtle)] sm:px-5">
      <div className="min-w-0">
        <h2 className="font-display text-xl font-black leading-none text-slate-950 dark:text-white">
          Zi
        </h2>
        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Your personal study companion
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="prepzii-interactive flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-[var(--border)] dark:text-slate-400 dark:hover:bg-[var(--surface-elevated)] dark:hover:text-white"
        aria-label="Close Zi panel"
      >
        <X className="h-4 w-4" strokeWidth={2.4} />
      </button>
    </header>
  );
}
