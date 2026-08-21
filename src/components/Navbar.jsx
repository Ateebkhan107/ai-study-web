"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import ProfileMenu from "@/components/ProfileMenu";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import { Menu, Moon, Sun, X } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Test", href: "/test" },
  { name: "PYQ", href: "/pyq" },
  { name: "Community", href: "/community" },
  { name: "Analytics", href: "/analytics" },
  { name: "Profile", href: "/profile" },
];

export default function Navbar({
  accountType = "STUDENT",
  institutes = [],
  isPro = false,
  track = null,
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide Navbar completely during active exam sessions
  if (pathname === "/test/session" || pathname === "/pyq/session") {
    return null;
  }

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

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  const isInstituteAdminAccount = accountType === "INSTITUTE_ADMIN";
  const hasInstituteAccess = institutes.length > 0;
  const instituteNavLabel = institutes.length === 1 ? institutes[0].name : "Institute";
  const instituteNavItem = { name: instituteNavLabel, href: "/institute" };
  const visibleNavItems = isInstituteAdminAccount
    ? [instituteNavItem]
    : [
        ...navItems.slice(0, 5),
        ...(hasInstituteAccess || pathname.startsWith("/institute")
          ? [instituteNavItem]
          : []),
        ...navItems.slice(5),
      ];

  const renderNavLink = (item, mobile = false) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => mobile && setMobileOpen(false)}
      className={`group relative overflow-hidden font-semibold transition-colors duration-200 ${
        mobile
          ? "flex min-h-11 items-center rounded-xl px-3.5 py-2.5 text-sm"
          : "inline-flex h-9 items-center justify-center rounded-lg px-3 text-[13px] xl:px-3.5"
      } ${
        isActive(item.href)
          ? "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-200"
          : "text-slate-500 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[var(--surface-hover)] dark:hover:text-slate-100"
      }`}
    >
      <span className="relative z-10 whitespace-nowrap">{item.name}</span>
      {!mobile && isActive(item.href) && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-indigo-500/80 dark:bg-indigo-300/80" />
      )}
    </Link>
  );

  const proLink = !isInstituteAdminAccount ? (
    <Link
      href="/pro"
      onClick={() => mobileOpen && setMobileOpen(false)}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-extrabold tracking-wide transition-all duration-200 hover:-translate-y-px ${
        isPro
          ? "border border-indigo-300/40 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/15 dark:border-indigo-400/20 dark:text-indigo-300"
          : "border border-amber-300/50 bg-amber-400/15 text-amber-700 hover:bg-amber-400/20 hover:text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/15 dark:hover:text-amber-200"
      }`}
    >
      {!isPro && <span aria-hidden="true" className="text-[12px] leading-none">★</span>}
      <span>{isPro ? `${track || ""} Pro` : "PRO"}</span>
    </Link>
  ) : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-[var(--card)]/90 shadow-[0_1px_18px_rgba(32,33,30,0.06)] backdrop-blur-xl transition-colors duration-200 dark:border-[var(--border-subtle)]/80 dark:bg-[var(--background)]/92 dark:shadow-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

        <div className="flex min-w-0 shrink-0 items-center">
          <Link
            href="/dashboard"
            className="flex h-10 items-center gap-2 rounded-lg pr-1 text-slate-950 transition-colors duration-200 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-200"
            aria-label="PrepZii dashboard"
          >
            <Logo size={29} showText={false} />
            <span className="text-[17px] font-black uppercase tracking-normal sm:text-[18px]">
              PREPZII
            </span>
          </Link>
        </div>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center lg:flex"
          aria-label="Primary navigation"
        >
          <div className="flex h-11 max-w-full items-center gap-0.5 rounded-xl border border-slate-200/70 bg-slate-100/55 p-1 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/60">
          {visibleNavItems.map((item) => renderNavLink(item))}
          </div>
        </nav>

        <div className="flex h-10 shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          <div className="hidden items-center lg:flex">
            {proLink}
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-[var(--card)]/70 text-slate-600 shadow-sm transition-colors duration-200 hover:border-indigo-300/70 hover:bg-slate-100 hover:text-indigo-600 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/70 dark:text-slate-300 dark:shadow-none dark:hover:border-indigo-400/30 dark:hover:bg-[var(--surface-hover)] dark:hover:text-indigo-200 sm:h-[38px] sm:w-[38px]"
            aria-label="Toggle theme"
          >
            <span className="flex items-center justify-center">
              <Moon className="h-[17px] w-[17px] dark:hidden sm:h-[18px] sm:w-[18px]" />
              <Sun className="hidden h-[17px] w-[17px] dark:block sm:h-[18px] sm:w-[18px]" />
            </span>
          </button>

          <div className="flex h-9 w-9 items-center justify-center sm:h-[38px] sm:w-[38px]">
            <NotificationBell track={track} />
          </div>

          <div className="flex h-9 w-9 items-center justify-center sm:h-[38px] sm:w-[38px]">
            <ProfileMenu />
          </div>

          <button
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-[var(--card)]/70 text-slate-700 shadow-sm transition-colors duration-200 hover:border-indigo-300/70 hover:bg-slate-100 hover:text-indigo-600 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/70 dark:text-slate-300 dark:shadow-none dark:hover:border-indigo-400/30 dark:hover:bg-[var(--surface-hover)] dark:hover:text-indigo-200 sm:h-[38px] sm:w-[38px] lg:hidden"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]" /> : <Menu className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]" />}
          </button>

        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200/70 bg-[var(--card)]/95 px-4 py-3 shadow-lg backdrop-blur-xl dark:border-[var(--border-subtle)]/80 dark:bg-[var(--background)]/95 lg:hidden">
          <nav className="mx-auto grid max-w-7xl grid-cols-1 gap-1.5 sm:grid-cols-2" aria-label="Mobile navigation">
            {visibleNavItems.map((item) => renderNavLink(item, true))}
            {proLink && (
              <div className="mt-1 flex min-h-11 items-center sm:col-span-2">
                {proLink}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
