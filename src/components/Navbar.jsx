"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

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

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();

  const [mounted, setMounted] = useState(false);
  const [track, setTrack] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadUserData() {
      try {
        const [profileRes, subscriptionRes] = await Promise.all([
          fetch("/api/profile", { cache: "no-store" }),
          fetch("/api/subscription", { cache: "no-store" }),
        ]);

        if (profileRes.ok) {
          const profile = await profileRes.json();
          const exam = profile?.exam || profile?.current_track?.toUpperCase();

          if (exam) {
            setTrack(String(exam).toUpperCase());
          }
        }

        if (subscriptionRes.ok) {
          const subscriptionData = await subscriptionRes.json();
          setIsPro(Boolean(subscriptionData?.isPro));
        } else {
          setIsPro(false);
        }
      } catch (error) {
        console.error("Failed to load navbar user data:", error);
        setIsPro(false);
      }
    }

    loadUserData();
  }, [user]);

  if (!mounted) return null;

  // Hide Navbar completely during active exam sessions
  if (pathname === "/test/session" || pathname === "/pyq/session") {
    return null;
  }

  const toggleTheme = () => {
    const dark = document.documentElement.classList.contains("dark");

    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  const renderNavLink = (item, mobile = false) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => mobile && setMobileOpen(false)}
      className={`relative rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group ${
        mobile ? "flex min-h-11 items-center px-4 py-3" : "px-3 py-2 xl:px-4"
      } ${
        isActive(item.href)
          ? "text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
          : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-50 dark:hover:bg-white/5"
      }`}
    >
      <span className="relative z-10">{item.name}</span>
      {!mobile && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      {!mobile && isActive(item.href) && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.6)]" />
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-indigo-500/10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-colors duration-500">
      {/* ── Subtle animated bottom glow line ── */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 lg:gap-6 relative z-10">

        {/* Logo */}
        <div className="shrink-0 transform transition-transform duration-300 hover:scale-105">
          <Link href="/dashboard">
            <Logo size={80} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
          {navItems.map((item) => renderNavLink(item))}

          {/* PrepZii Pro */}
          {!isPro ? (
            <Link
              href="/pro"
              className="relative ml-2 inline-flex items-center justify-center px-5 py-2 rounded-xl text-sm font-bold overflow-hidden transition-all duration-500 hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-400 text-white shadow-[0_4px_15px_rgba(251,191,36,0.3)] hover:shadow-[0_6px_20px_rgba(251,191,36,0.5)]"
            >
              {/* Shimmer effect overlay */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10 flex items-center gap-1.5 drop-shadow-sm">
                ⭐ PRO
              </span>
            </Link>
          ) : (
            <div className="ml-2 flex items-center px-4 py-2">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 text-[15px] tracking-wide drop-shadow-sm">
                PrepZii Pro ✨
              </span>
            </div>
          )}
        </nav>

        {/* Right Side */}
        <div className="shrink-0 flex items-center gap-2 sm:gap-3">

          <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md hover:border-indigo-500/30 active:scale-95 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 text-slate-600 dark:text-slate-300 transition-transform duration-700 group-hover:rotate-[360deg]">
              <Moon className="w-5 h-5 dark:hidden" />
              <Sun className="w-5 h-5 hidden dark:block" />
            </span>
          </button>

          <div className="transform transition-transform duration-300 hover:scale-105">
            <NotificationBell track={track} />
          </div>

          <div className="transform transition-transform duration-300 hover:scale-105">
            <ProfileMenu />
          </div>

          <button
            onClick={() => setMobileOpen((value) => !value)}
            className="xl:hidden relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200/50 bg-white/50 text-slate-700 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-indigo-500/30 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-slate-300"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {mobileOpen && (
        <div className="xl:hidden border-t border-indigo-500/10 bg-white/95 px-4 py-4 shadow-lg backdrop-blur-xl dark:bg-[#020617]/95">
          <nav className="mx-auto grid max-w-7xl grid-cols-1 gap-1 sm:grid-cols-2">
            {navItems.map((item) => renderNavLink(item, true))}
            {!isPro && (
              <Link
                href="/pro"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-400 px-4 py-3 text-sm font-bold text-white shadow-[0_4px_15px_rgba(251,191,36,0.3)] sm:col-span-2"
              >
                ⭐ PRO
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
