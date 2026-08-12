"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function UserGreeting() {
  const { user } = useUser();

  const [name, setName] = useState("");
  const [mounted, setMounted] = useState(false);

  async function loadProfile() {
    try {
      const response = await fetch("/api/profile", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setName(data.full_name || "");
    } catch (error) {
      return;
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (user) {
      loadProfile();
    }
  }, [user]);

  const firstName = name ? name.split(" ")[0] : "Student";

  // Display a premium loading skeleton while mounting
  if (!mounted) {
    return (
      <div className="py-1">
        <div className="h-11 w-64 animate-pulse rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 sm:h-12 sm:w-96 lg:h-14" />
      </div>
    );
  }

  return (
    <div className="group relative inline-flex items-center py-1 sm:py-1.5">
      <h1 className="flex flex-wrap items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl lg:text-5xl">
        
        <span className="opacity-90">Hey,</span>
        
        <span className="relative inline-block text-indigo-600 dark:text-indigo-400">
          {firstName}
        </span>

        {/* ── Animating Premium Icon ── */}
        <div className="relative ml-1 flex items-center justify-center">
          <Sparkles className="h-7 w-7 text-amber-500 opacity-80 dark:text-amber-400 sm:h-8 sm:w-8 lg:h-10 lg:w-10" strokeWidth={2} />
        </div>

      </h1>
    </div>
  );
}
