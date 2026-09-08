import { Activity, X } from "lucide-react";
import ZiCoreOrb from "@/components/zi/ZiCoreOrb";

export default function ZiHeader({ onClose, assistantState = "idle", plan }) {
  const stateLabel = assistantState === "thinking" ? "thinking" : "idle";
  let labelText = "Core";
  let badgeClass = "border-brand/35 bg-brand/10 text-brand";

  if (plan === "AI_MODE") {
    labelText = "AI Mode";
    badgeClass = "border-amber-400/50 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-amber-500 font-black shadow-[0_0_8px_rgba(251,191,36,0.25)]";
  } else if (plan === "PRO") {
    labelText = "Pro";
    badgeClass = "border-orange-400/40 bg-orange-500/10 text-orange-500 font-bold";
  }


  return (
    <header className="relative shrink-0 border-b border-white/10 px-4 pb-4 pt-5 sm:px-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <ZiCoreOrb size="md" state={assistantState} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-3xl font-black leading-none text-white">
                Zi
              </h2>
              <span className={`rounded-full border px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.16em] ${badgeClass}`}>
                {labelText}
              </span>
            </div>
            <p className="mt-1 max-w-64 text-xs font-semibold leading-5 text-stone-300">
              PrepZii&apos;s personal study intelligence
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="prepzii-interactive flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition-colors hover:border-brand/50 hover:bg-brand/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label="Close Zi panel"
        >
          <X className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-stone-300">
        <Activity className="h-3.5 w-3.5 text-brand" strokeWidth={2.4} />
        <span className="text-brand">{stateLabel}</span>
        <span className="h-1 w-1 rounded-full bg-stone-500" aria-hidden="true" />
        <span>{assistantState === "thinking" ? "composing study notes" : "ready for the next move"}</span>
      </div>
    </header>
  );
}
