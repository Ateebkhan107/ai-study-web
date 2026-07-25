"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles } from "lucide-react";

export default function UserGreeting() {
  const { user } = useUser();

  const [name, setName] = useState("");
  const [mounted, setMounted] = useState(false);

  async function loadProfile() {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("clerk_user_id", user.id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setName(data.full_name);
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
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-slate-800 dark:text-slate-100 flex flex-wrap items-center gap-3 sm:gap-4 transition-all duration-700">
        
        <span className="opacity-90">Hey,</span>
        
        <span className="relative inline-block">
          {/* ── Ambient Background Glow ── */}
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-2xl opacity-20 dark:opacity-40 animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />

          {/* ── Flowing Gradient Text ── */}
          <span className="relative z-10 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-[length:200%_auto] animate-[shimmer_4s_linear_infinite] bg-clip-text text-transparent drop-shadow-sm">
            {firstName}
          </span>

          {/* ── Interactive Animated Underline ── */}
          <span className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-1.5 sm:h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-left shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
        </span>

        {/* ── Animating Premium Icon ── */}
        <div className="relative flex items-center justify-center ml-2">
          <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full" />
          <Sparkles className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-amber-500 dark:text-amber-400 animate-[pulse_2s_ease-in-out_infinite] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" strokeWidth={2.5} />
        </div>

      </h1>
    </div>
  );
}