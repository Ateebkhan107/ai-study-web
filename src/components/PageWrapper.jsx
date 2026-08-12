"use client";

import { Star, Sparkle } from "lucide-react";

/**
 * Premium page wrapper that gives every page the dashboard-level
 * ambient background (dot grid, animated glows, floating stars).
 *
 * Props:
 *  - title: string — page heading
 *  - subtitle: string — small text below heading
 *  - badge: string — glassmorphic pill text (e.g. "JEE Test Arena 🚀")
 *  - badgeVariant: "purple" | "emerald" — color of badge
 *  - children: ReactNode
 */
export default function PageWrapper({
  title,
  subtitle,
  badge,
  badgeVariant = "purple",
  children,
}) {
  const badgeColors =
    badgeVariant === "emerald"
      ? "border-emerald-500/20 bg-white/70 dark:bg-emerald-500/10 from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400"
      : "border-indigo-500/20 bg-white/70 dark:bg-indigo-500/10 from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400";

  return (
    <div className="relative min-h-screen w-full min-w-0">
      {/* ── Full Bleed Background Layer ──────────────────────────── */}
      <div
        className="absolute inset-y-0 left-1/2 z-0 h-full w-dvw -translate-x-1/2 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Dot Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:32px_32px] opacity-50" />

        {/* Ambient Color Glows */}
        <div className="absolute top-0 left-0 w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[30%] right-0 w-[40%] h-[40%] rounded-full bg-violet-500/10 dark:bg-violet-500/15 blur-[100px] mix-blend-screen animate-[pulse_12s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-[20%] w-[40%] h-[40%] rounded-full bg-pink-500/8 dark:bg-pink-500/10 blur-[120px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]" />

        {/* Floating Decorative Stars */}
        <Star className="absolute top-[12%] left-[7%] w-5 h-5 text-amber-500/40 dark:text-amber-300/50 animate-[pulse_4s_ease-in-out_infinite] rotate-12" fill="currentColor" />
        <Sparkle className="absolute top-[22%] right-[9%] w-4 h-4 text-indigo-500/40 dark:text-indigo-300/50 animate-[pulse_3s_ease-in-out_infinite_0.5s]" fill="currentColor" />
        <Star className="absolute top-[50%] left-[4%] w-3.5 h-3.5 text-purple-500/40 dark:text-purple-300/50 animate-[pulse_5s_ease-in-out_infinite_1s] -rotate-12" fill="currentColor" />
        <Sparkle className="absolute bottom-[25%] right-[6%] w-5 h-5 text-pink-500/40 dark:text-pink-300/50 animate-[pulse_4s_ease-in-out_infinite_1.5s]" fill="currentColor" />
      </div>

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl min-w-0 space-y-4 px-3 py-4 sm:space-y-8 sm:px-6 sm:py-10 lg:space-y-10 lg:px-8 lg:py-14">
        {/* Header */}
        {(title || badge) && (
          <div className="relative space-y-3 animate-slideUp">
            {badge && (
              <div
                className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-sm transition-all duration-500 hover:border-opacity-60 ${badgeColors.split(" ").slice(0, 3).join(" ")}`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                <p
                  className={`text-xs font-bold bg-gradient-to-r bg-clip-text text-transparent uppercase tracking-widest ${badgeColors.split(" ").slice(3).join(" ")}`}
                >
                  {badge}
                </p>
              </div>
            )}

            {title && (
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm break-words">
                {title}
              </h1>
            )}

            {subtitle && (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
