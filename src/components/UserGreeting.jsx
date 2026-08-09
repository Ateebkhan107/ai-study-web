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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const firstName = name ? name.split(" ")[0] : "Student";

  // Display a premium loading skeleton while mounting
  if (!mounted) {
    return (
      <div className="py-2">
        <div className="h-14 sm:h-16 lg:h-20 w-64 sm:w-96 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative group inline-flex items-center py-2 sm:py-4">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex flex-wrap items-center gap-2 sm:gap-3">
        
        <span className="opacity-90">Hey,</span>
        
        <span className="relative inline-block text-indigo-600 dark:text-indigo-400">
          {firstName}
        </span>

        {/* ── Animating Premium Icon ── */}
        <div className="relative flex items-center justify-center ml-1">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-amber-500 dark:text-amber-400 opacity-80" strokeWidth={2} />
        </div>

      </h1>
    </div>
  );
}
