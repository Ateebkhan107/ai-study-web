"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ProfileMenu from "@/components/ProfileMenu";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import {
  BarChart3,
  BookOpenCheck,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Moon,
  Star,
  Sun,
  UserRound,
  Users,
  X,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Test", href: "/test", icon: ClipboardList },
  { name: "PYQ", href: "/pyq", icon: BookOpenCheck },
  { name: "Community", href: "/community", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
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

    return (
    <Link
      key={item.href}
      href={item.href}
      prefetch={PREFETCHED_NAV_HREFS.has(item.href) ? true : undefined}
      onMouseEnter={() => router.prefetch(item.href)}
      onFocus={() => router.prefetch(item.href)}
      onClick={() => {
        setPendingHref(item.href);
        if (mobile) setMobileOpen(false);
      }}
      className={`group relative overflow-hidden font-semibold transition-colors duration-200 ${
        mobile
          ? "flex min-h-11 items-center rounded-xl px-3.5 py-2.5 text-sm"
          : "inline-flex h-11 items-center justify-center px-2.5 text-[13px] xl:px-3.5"
      } ${
        active
          ? mobile
            ? "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-200"
            : "font-extrabold text-slate-950 dark:text-white"
          : mobile
            ? "text-slate-500 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[var(--surface-hover)] dark:hover:text-slate-100"
            : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
      }`}
    >
      {Icon && (
        <Icon
          className={`relative z-10 shrink-0 ${
            mobile ? "mr-2 h-4 w-4" : "mr-1.5 h-3.5 w-3.5"
          }`}
          strokeWidth={2.4}
        />
      )}
      <span className="relative z-10 whitespace-nowrap">{item.name}</span>
      {!mobile && active && (
        <span className="absolute bottom-1.5 left-3 right-3 h-0.5 rounded-full bg-brand" />
      )}
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
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-extrabold tracking-wide transition-all duration-200 hover:-translate-y-px ${
        isPro
          ? "border border-indigo-300/40 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/15 dark:border-indigo-400/20 dark:text-indigo-300"
          : "border border-amber-300/50 bg-amber-400/15 text-amber-700 hover:bg-amber-400/20 hover:text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/15 dark:hover:text-amber-200"
      }`}
    >
      {!isPro && <Star aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" />}
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
            <Logo size={26} showText={false} className="lg:hidden" />
            <Logo size={30} showText={false} className="hidden lg:flex" />
            <span className="text-[14px] font-black uppercase tracking-normal min-[360px]:text-[15px] sm:text-[18px] lg:text-[21px]">
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
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/70 bg-[var(--card)]/70 text-slate-600 shadow-sm transition-colors duration-200 hover:border-indigo-300/70 hover:bg-slate-100 hover:text-indigo-600 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/70 dark:text-slate-300 dark:shadow-none dark:hover:border-indigo-400/30 dark:hover:bg-[var(--surface-hover)] dark:hover:text-indigo-200 min-[360px]:h-9 min-[360px]:w-9 sm:h-[38px] sm:w-[38px]"
            aria-label="Toggle theme"
          >
            <span className="flex items-center justify-center">
              <Moon className="h-[17px] w-[17px] dark:hidden sm:h-[18px] sm:w-[18px]" />
              <Sun className="hidden h-[17px] w-[17px] dark:block sm:h-[18px] sm:w-[18px]" />
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
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/70 bg-[var(--card)]/70 text-slate-700 shadow-sm transition-colors duration-200 hover:border-indigo-300/70 hover:bg-slate-100 hover:text-indigo-600 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/70 dark:text-slate-300 dark:shadow-none dark:hover:border-indigo-400/30 dark:hover:bg-[var(--surface-hover)] dark:hover:text-indigo-200 min-[360px]:h-9 min-[360px]:w-9 sm:h-[38px] sm:w-[38px] lg:hidden"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]" /> : <Menu className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]" />}
          </button>

        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200/70 bg-[var(--card)]/95 px-3 py-3 shadow-lg backdrop-blur-xl dark:border-[var(--border-subtle)]/80 dark:bg-[var(--background)]/95 lg:hidden">
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
