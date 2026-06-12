"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileMenu from "@/components/ProfileMenu";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";

// ─── Mock notification count ──────────────────────────────────────────────────
// Replace with a Supabase realtime subscription or API call when ready.
const notificationCount = 3;

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Test", href: "/test" },
  { name: "PYQ", href: "/pyq" },
  { name: "Analytics", href: "/analytics" },
  { name: "Profile", href: "/profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;

    setDark(next);

    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <div className="flex-shrink-0 text-black dark:text-white">
          <Link href="/dashboard">
            <Logo size={80} className="cursor-pointer" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-1">

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
            >
              <button
                className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150
                  ${
                    isActive(item.href)
                      ? "text-black dark:text-white bg-gray-100 dark:bg-gray-800"
                      : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
              >
                {item.name}

                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-black dark:bg-white rounded-full" />
                )}
              </button>
            </Link>
          ))}

          {/* PRO */}
          <Link href="/pro">
            <button className="px-4 py-2 text-sm font-bold rounded-lg bg-[#1e3a5f] text-white opacity-90 hover:opacity-100 transition-opacity duration-150">
              PRO
            </button>
          </Link>

        </nav>

        {/* Right Side */}
        <div className="flex-shrink-0 flex items-center gap-3">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150"
          >
            {dark ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-yellow-400"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-600"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Notification Bell */}
          <NotificationBell count={notificationCount} />

          {/* Profile */}
          <ProfileMenu />

        </div>
      </div>
    </header>
  );
}