"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import ZiComposer from "@/components/zi/ZiComposer";
import ZiHeader from "@/components/zi/ZiHeader";
import ZiMessages from "@/components/zi/ZiMessages";
import ZiSuggestions from "@/components/zi/ZiSuggestions";

import { Lock, X } from "lucide-react";
import Link from "next/link";

export default function ZiPanel({
  isOpen,
  messages,
  input,
  isThinking,
  isGenerating,
  pageType,
  entityType,
  onClose,
  onInputChange,
  onSend,
  onStop,
  onSuggestionSelect,
  isLocked,
  plan,
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }, [pathname]);

  const panelTransformClass = isOpen
    ? "translate-y-0 sm:translate-x-0"
    : "translate-y-full sm:translate-x-[calc(100%+1rem)] sm:translate-y-0";

  
  if (isLocked) {
    return (
      <div
        className={`fixed inset-0 z-[65] pointer-events-none transition-[visibility] ${
          isOpen ? "" : "invisible"
        }`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 z-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }`}
          onClick={onClose}
          aria-label="Close Zi"
          tabIndex={-1}
        />
        <div
          className={`absolute inset-x-2 bottom-3 top-2 z-10 mx-auto flex w-auto max-w-[28rem] flex-col overflow-hidden rounded-[2rem] border border-brand/20 bg-slate-50 shadow-2xl transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none dark:border-brand/10 dark:bg-slate-950 sm:inset-auto sm:bottom-[calc(6.5rem+env(safe-area-inset-bottom))] sm:right-6 sm:top-20 sm:w-[30rem] sm:max-w-none ${panelTransformClass}`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-black dark:hover:text-white pointer-events-auto"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" strokeWidth={2.4} />
          </button>
          <div className="flex h-full flex-col items-center justify-center p-8 text-center pointer-events-auto">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Lock className="h-10 w-10" strokeWidth={2} />
            </div>
            <h2 className="mb-3 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Mode
            </h2>
            <div className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-200">
              ₹2,000/month
            </div>
            <p className="mb-8 text-[0.95rem] font-medium leading-relaxed text-slate-600 dark:text-slate-400">
              Unlock Zi AI and the complete AI study companion experience.
            </p>
            <Link
              href="/pricing"
              onClick={onClose}
              className="inline-flex h-12 w-full max-w-[240px] items-center justify-center rounded-xl bg-brand px-6 font-display text-lg font-bold text-white shadow-lg shadow-brand/25 transition-all hover:scale-105 active:scale-95"
            >
              Upgrade to AI Mode
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const assistantState = isThinking || isGenerating ? "thinking" : "idle";

  return (
    <div
      className={`fixed inset-0 z-[65] pointer-events-none transition-[visibility] ${
        isOpen ? "" : "invisible"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={`absolute inset-0 z-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
          isOpen ? "pointer-events-auto opacity-100" : "opacity-0"
        }`}
        aria-label="Close Zi panel"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="zi-panel-title"
        className={`zi-console-surface pointer-events-auto absolute bottom-0 right-0 z-10 flex h-[min(94dvh,calc(100dvh-0.5rem))] w-full max-w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-brand/20 text-slate-900 dark:text-white shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none sm:bottom-4 sm:right-4 sm:top-4 sm:h-auto sm:w-[min(460px,calc(100vw-2rem))] sm:rounded-[1.75rem] ${
          isOpen ? "zi-panel-reveal" : ""
        } ${panelTransformClass}`}
      >
        <span id="zi-panel-title" className="sr-only">
          Zi assistant panel
        </span>
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand/80 to-transparent" aria-hidden="true" />
        <ZiHeader plan={plan} onClose={onClose} assistantState={assistantState} />
        <ZiMessages messages={messages} isThinking={isThinking} />
        <ZiSuggestions
          onSelect={onSuggestionSelect}
          disabled={isThinking}
          pageType={pageType}
          entityType={entityType}
        />
        <ZiComposer
          value={input}
          onChange={onInputChange}
          onSend={onSend}
          onStop={onStop}
          disabled={isGenerating}
          isGenerating={isGenerating}
        />
      </aside>
    </div>
  );
}
