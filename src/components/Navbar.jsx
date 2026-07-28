"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import ProfileMenu from "@/components/ProfileMenu";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import { supabase } from "@/lib/supabaseClient";
import { Moon, Sun } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Test", href: "/test" },
  { name: "PYQ", href: "/pyq" },
  { name: "Analytics", href: "/analytics" },
  { name: "Profile", href: "/profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();

  const [mounted, setMounted] = useState(false);
  const [track, setTrack] = useState(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadUserData() {
      // -----------------------------
      // Load User Exam
      // -----------------------------
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("exam")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (profileError) {
//         console.log("Profile Error:", profileError);
      }

      if (profile?.exam) {
        setTrack(profile.exam.toUpperCase());
      }

      // -----------------------------
      // Load Subscription
      // -----------------------------
      const {
        data: subscription,
        error: subscriptionError,
      } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("clerk_user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

//       console.log("========== PRO DEBUG ==========");
//       console.log("Current Clerk User:", user.id);
//       console.log("Subscription:", subscription);
//       console.log("Subscription Error:", subscriptionError);
//       console.log("===============================");

      if (
        subscription &&
        subscription.expires_at &&
        new Date(subscription.expires_at) > new Date()
      ) {
        setIsPro(true);
      } else {
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

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-indigo-500/10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-colors duration-500">
      {/* ── Subtle animated bottom glow line ── */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8 relative z-10">

        {/* Logo */}
        <div className="shrink-0 transform transition-transform duration-300 hover:scale-105">
          <Link href="/dashboard">
            <Logo size={80} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group ${
                isActive(item.href)
                  ? "text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                  : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <span className="relative z-10">{item.name}</span>
              
              {/* Subtle hover background sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {isActive(item.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.6)]" />
              )}
            </Link>
          ))}

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
        <div className="shrink-0 flex items-center gap-4">

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

        </div>
      </div>
    </header>
  );
}