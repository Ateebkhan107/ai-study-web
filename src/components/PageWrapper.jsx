"use client";

/**
 * Premium page wrapper for consistent dashboard-level spacing and headers.
 * The dashboard layout owns the shared background treatment.
 *
 * Props:
 *  - title: string — page heading
 *  - subtitle: string — small text below heading
 *  - badge: string — glassmorphic pill text
 *  - badgeIcon: ReactNode — optional icon shown before badge text
 *  - badgeVariant: "brand" | "emerald" — color of badge
 *  - children: ReactNode
 */
export default function PageWrapper({
  title,
  subtitle,
  badge,
  badgeIcon,
  badgeVariant = "brand",
  children,
}) {
  const badgeColors =
    badgeVariant === "emerald"
      ? "border-emerald-500/20 bg-[var(--card)]/70 dark:bg-emerald-500/10 from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400"
      : "border-indigo-500/20 bg-[var(--card)]/70 dark:bg-indigo-500/10 from-indigo-600 to-brand-hover dark:from-indigo-400 dark:to-brand-hover";

  return (
    <div className="relative min-h-screen w-full min-w-0">
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
                {badgeIcon && (
                  <span className={`flex h-4 w-4 items-center justify-center ${badgeColors.split(" ").slice(3).join(" ")}`}>
                    {badgeIcon}
                  </span>
                )}
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
