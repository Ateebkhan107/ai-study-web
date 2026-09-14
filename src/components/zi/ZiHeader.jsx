import { X, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";

export default function ZiHeader({ onClose, assistantState = "idle" }) {
  return (
    <header className="relative shrink-0 border-b border-[var(--border-subtle)] bg-[var(--card)]/50 px-4 pb-5 pt-6 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border border-brand/20 bg-gradient-to-br from-brand/20 to-brand/5 shadow-sm">
            <Logo size={28} showText={false} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-display text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Zi Assistant
              </h2>
              {assistantState === "thinking" && (
                <Sparkles className="h-3.5 w-3.5 text-brand animate-pulse" />
              )}
            </div>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand/80">
              {assistantState === "thinking" ? "Connecting concepts..." : "Study Intelligence"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="prepzii-interactive flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[var(--surface-elevated)] text-slate-400 transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-white"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>
    </header>
  );
}
