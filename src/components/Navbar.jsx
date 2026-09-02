"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ProfileMenu from "@/components/ProfileMenu";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import {
  Compass,
  Scroll,
  Building2,
  Target,
  LineChart,
  Menu,
  Moon,
  Star,
  Sun,
  UserRound,
  Swords,
  X,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Compass },
  { name: "Test", href: "/test", icon: Target },
  { name: "PYQ", href: "/pyq", icon: Scroll },
  { name: "Community", href: "/community", icon: Swords },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Profile", href: "/profile", icon: UserRound },
];
const PREFETCHED_NAV_HREFS = new Set(["/dashboard", "/test", "/pyq", "/community", "/analytics"]);

export default function Navbar({
  accountType = "STUDENT",
  institutes = [],
  isPro = false,
  track = null,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState(null);

  const toggleTheme = () => {
    const dark = document.documentElement.classList.contains("dark");

    if (dark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
      localStorage.setItem("theme", "dark");
    }
  };

  const isInstituteAdminAccount = accountType === "INSTITUTE_ADMIN";
  const hasInstituteAccess = institutes.length > 0;
  const instituteNavLabel = institutes.length === 1 ? institutes[0].name : "Institute";
  const instituteNavItem = { name: instituteNavLabel, href: "/institute", icon: Building2 };
  const visibleNavItems = isInstituteAdminAccount
    ? [instituteNavItem]
    : [
        ...navItems.slice(0, 5),
        ...(hasInstituteAccess || pathname.startsWith("/institute")
          ? [instituteNavItem]
          : []),
        ...navItems.slice(5),
      ];
  const prefetchHrefKey = [
    ...visibleNavItems.map((item) => item.href),
    !isInstituteAdminAccount ? "/pro" : "",
  ].filter(Boolean).join("|");

  useEffect(() => {
    const prefetchVisibleRoutes = () => {
      prefetchHrefKey.split("|").forEach((href) => {
        if (href && href !== pathname) router.prefetch(href);
      });
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(prefetchVisibleRoutes, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(prefetchVisibleRoutes, 250);
    return () => window.clearTimeout(timeoutId);
  }, [pathname, prefetchHrefKey, router]);

  const renderNavLink = (item, mobile = false) => {
    const Icon = item.icon;
    const activePathname = pendingHref && pendingHref !== pathname ? pendingHref : pathname;
    const active = activePathname === item.href || activePathname.startsWith(item.href + "/");

    const tourAttr = {
      "/dashboard": "tour-dashboard",
      "/test": "tour-tests",
      "/pyq": "tour-pyqs",
      "/community": "tour-community",
      "/analytics": "tour-analytics",
    }[item.href];

    return (
    <Link
      key={item.href}
      href={item.href}
      data-tour={tourAttr}
      prefetch={PREFETCHED_NAV_HREFS.has(item.href) ? true : undefined}
      onMouseEnter={() => router.prefetch(item.href)}
      onFocus={() => router.prefetch(item.href)}
      onClick={() => {
        setPendingHref(item.href);
        if (mobile) setMobileOpen(false);
      }}
      className={`group prepzii-interactive relative overflow-hidden font-bold ${
        mobile
          ? "flex min-h-11 items-center rounded-xl px-3.5 py-2.5 text-sm"
          : "inline-flex h-9 items-center justify-center rounded-xl px-3.5 text-[13px] mx-0.5"
      } ${
        active
          ? mobile
            ? "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400"
            : "bg-amber-500/15 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.2)] dark:shadow-[inset_0_0_0_1px_rgba(251,191,36,0.15)]"
          : mobile
            ? "text-slate-500 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[var(--surface-hover)] dark:hover:text-slate-100"
            : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[var(--surface-elevated)]/50 dark:hover:text-white"
      }`}
    >
      {Icon && (
        <Icon
          className={`prepzii-interactive-icon relative z-10 shrink-0 ${
            mobile ? "mr-2 h-4 w-4" : "mr-1.5 h-3.5 w-3.5"
          } ${active ? "text-amber-600 dark:text-amber-400" : ""}`}
          strokeWidth={2.4}
        />
      )}
      <span className="relative z-10 whitespace-nowrap">{item.name}</span>
    </Link>
    );
  };

  const proLink = !isInstituteAdminAccount ? (
    <Link
      href="/pro"
      onMouseEnter={() => router.prefetch("/pro")}
      onFocus={() => router.prefetch("/pro")}
      onClick={() => {
        setPendingHref("/pro");
        if (mobileOpen) setMobileOpen(false);
      }}
      className={`prepzii-interactive inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 text-[12px] uppercase font-black tracking-widest hover:shadow-lg ${
        isPro
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
          : "bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-600 hover:shadow-amber-500/30 dark:from-amber-500 dark:to-amber-600 dark:text-white"
      }`}
    >
      {!isPro && <Star aria-hidden="true" className="prepzii-interactive-icon h-3.5 w-3.5" fill="currentColor" />}
      <span>{isPro ? `${track || ""} Pro` : "PRO"}</span>
    </Link>
  ) : null;

  // Hide Navbar completely during active exam sessions
  if (pathname === "/test/session" || pathname === "/pyq/session") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full max-w-full border-b border-slate-200/70 bg-[var(--card)]/90 shadow-[0_1px_18px_rgba(32,33,30,0.06)] backdrop-blur-xl transition-colors duration-200 dark:border-[var(--border-subtle)]/80 dark:bg-[var(--background)]/92 dark:shadow-none lg:top-4 lg:mx-auto lg:mt-4 lg:w-[calc(100%-32px)] lg:max-w-7xl lg:rounded-[20px] lg:border lg:border-slate-200/80 lg:bg-white/95 lg:shadow-none lg:backdrop-blur-none lg:dark:border-white/10 lg:dark:bg-[#11110f]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-1.5 px-2.5 sm:h-16 sm:gap-3 sm:px-6 lg:h-[70px] lg:px-7 xl:px-8">

        <div className="flex min-w-0 shrink-0 items-center">
          <Link
            href="/dashboard"
            className="flex h-10 min-w-0 items-center gap-1.5 rounded-lg pr-1 text-slate-950 transition-colors duration-200 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-200 sm:gap-2 lg:h-12 lg:gap-2.5"
            aria-label="PrepZii dashboard"
          >
            <Logo size={24} showText={false} className="lg:hidden shrink-0" />
            <Logo size={30} showText={false} className="hidden lg:flex shrink-0" />
            <span className="block text-[13px] min-[360px]:text-[15px] sm:text-[18px] font-black uppercase tracking-tight lg:tracking-normal lg:text-[21px] truncate">
              PREPZII
            </span>
          </Link>
        </div>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center lg:flex"
          aria-label="Primary navigation"
        >
          <div className="flex h-12 max-w-full items-center gap-2 xl:gap-3">
          {visibleNavItems.map((item) => renderNavLink(item))}
          </div>
        </nav>

        <div className="flex h-10 shrink-0 items-center justify-end gap-1 sm:gap-2 lg:h-12 lg:gap-2.5">
          <div className="hidden items-center lg:flex">
            {proLink}
          </div>

          <button
            onClick={toggleTheme}
            className="prepzii-interactive group flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[var(--surface-hover)] dark:hover:text-slate-100 min-[360px]:h-9 min-[360px]:w-9 sm:h-[38px] sm:w-[38px]"
            aria-label="Toggle theme"
          >
            <span className="flex items-center justify-center">
              <Moon className="prepzii-interactive-icon h-[17px] w-[17px] dark:hidden sm:h-[18px] sm:w-[18px]" strokeWidth={2.5} />
              <Sun className="prepzii-interactive-icon hidden h-[17px] w-[17px] dark:block sm:h-[18px] sm:w-[18px]" strokeWidth={2.5} />
            </span>
          </button>

          <div className="flex h-8 w-8 items-center justify-center min-[360px]:h-9 min-[360px]:w-9 sm:h-[38px] sm:w-[38px]">
            <NotificationBell track={track} />
          </div>

          <div className="flex h-8 w-8 items-center justify-center min-[360px]:h-9 min-[360px]:w-9 sm:h-[38px] sm:w-[38px]">
            <ProfileMenu />
          </div>

          <button
            onClick={() => setMobileOpen((value) => !value)}
            className="prepzii-interactive group flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[var(--surface-hover)] dark:hover:text-slate-100 min-[360px]:h-9 min-[360px]:w-9 sm:h-[38px] sm:w-[38px] lg:hidden"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="prepzii-interactive-icon h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]" strokeWidth={2.5} /> : <Menu className="prepzii-interactive-icon h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]" strokeWidth={2.5} />}
          </button>

        </div>
      </div>

      {mobileOpen && (
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-150 border-t border-slate-200/70 bg-[var(--card)]/95 px-3 py-3 shadow-lg backdrop-blur-xl dark:border-[var(--border-subtle)]/80 dark:bg-[var(--background)]/95 lg:hidden">
          <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-1.5" aria-label="Mobile navigation">
            {visibleNavItems.map((item) => renderNavLink(item, true))}
            {proLink && (
              <div className="col-span-2 mt-1 flex min-h-11 items-center">
                {proLink}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
