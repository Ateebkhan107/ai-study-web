"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Shield, Sparkles, X, ArrowRight, Lock } from "lucide-react";

export default function AuthGateModal({
  isOpen,
  onClose,
  targetUrl = "/dashboard",
  title = "Sign in to continue your preparation",
  message = "Create your free account to start practicing and track your progress.",
  featureName = null,
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const safeTarget = targetUrl && targetUrl.startsWith("/") && !targetUrl.startsWith("//")
    ? targetUrl
    : "/dashboard";

  const encodedTarget = encodeURIComponent(safeTarget);
  const signInHref = `/sign-in?redirect_url=${encodedTarget}`;
  const signUpHref = `/sign-up?redirect_url=${encodedTarget}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-white/20 dark:bg-[#0A0A0C] text-slate-900 dark:text-white transition-all animate-in zoom-in-95 duration-200 sm:p-7">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Icon & Pill */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm">
            <Shield className="h-6 w-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <Sparkles className="h-3 w-3" />
            <span>Account Required</span>
            {featureName && <span className="opacity-75">• {featureName}</span>}
          </div>

          <h2
            id="auth-gate-title"
            className="mt-3.5 text-xl font-black font-display tracking-tight text-slate-950 dark:text-white sm:text-2xl"
          >
            {title}
          </h2>

          <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
            {message}
          </p>
        </div>

        {/* Action CTAs */}
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href={signInHref}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300 px-4 text-sm font-black text-slate-950 transition-colors shadow-md active:scale-[0.99]"
          >
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href={signUpHref}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-800/60 dark:hover:bg-slate-800 px-4 text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <span>Create Free Account</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="mt-1 text-center text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Continue browsing as guest
          </button>
        </div>
      </div>
    </div>
  );
}
