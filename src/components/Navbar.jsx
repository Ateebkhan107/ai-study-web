"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import ProfileMenu from "@/components/ProfileMenu";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import { supabase } from "@/lib/supabaseClient";

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
        console.log("Profile Error:", profileError);
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

      console.log("========== PRO DEBUG ==========");
      console.log("Current Clerk User:", user.id);
      console.log("Subscription:", subscription);
      console.log("Subscription Error:", subscriptionError);
      console.log("===============================");

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
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <div className="shrink-0">
          <Link href="/dashboard">
            <Logo size={80} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(item.href)
                  ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {item.name}

              {isActive(item.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-black dark:bg-white rounded-full" />
              )}
            </Link>
          ))}

          {/* PrepZii Pro */}
          <Link
            href={isPro ? "/pro" : "/pricing"}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              isPro
                ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                : "bg-[#1e3a5f] text-white hover:opacity-90"
            }`}
          >
            {isPro ? "⭐ PRO" : "PrepZii Pro"}
          </Link>
        </nav>

        {/* Right Side */}
        <div className="shrink-0 flex items-center gap-3">

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800"
          >
            🌙
          </button>

          <NotificationBell track={track} />

          <ProfileMenu />

        </div>
      </div>
    </header>
  );
}