"use client";

import Link from "next/link";
import { Swords } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function BattleFloatingButton() {
  const { user } = useUser();
  const [pendingCount, setPendingCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Check local storage for tooltip
    const tooltipSeen = localStorage.getItem("prepzii_battle_tooltip_seen");
    if (!tooltipSeen) {
      // Delay showing tooltip slightly for a nice entrance
      setTimeout(() => setShowTooltip(true), 1500);
    }

    async function checkChallenges() {
      try {
        const res = await fetch("/api/battle/challenges");
        if (res.ok) {
          const data = await res.json();
          const incomingPending = (data.challenges || []).filter(c => c.direction === "incoming" && c.status === "PENDING").length;
          setPendingCount(incomingPending);
        }
      } catch (e) {}
    }
    checkChallenges();
    const interval = setInterval(checkChallenges, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user]);

  const dismissTooltip = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTooltip(false);
    localStorage.setItem("prepzii_battle_tooltip_seen", "true");
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7 flex flex-col items-end gap-3 pointer-events-none">
      {/* Tooltip */}
      {showTooltip && (
        <div className="relative mr-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-auto">
          <div className="rounded-xl border border-brand/30 bg-white/95 p-3.5 text-xs font-semibold text-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md dark:bg-[#1a1a1a]/95 dark:text-slate-200 max-w-[220px]">
            <p>Challenge others to a 1v1 battle!</p>
            <button onClick={dismissTooltip} className="mt-2 text-brand hover:text-brand-hover font-black uppercase tracking-wider text-[10px]">Got it</button>
          </div>
          <div className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 border-b border-r border-brand/30 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md" />
        </div>
      )}

      {/* Button */}
      <Link
        href="/battle"
        aria-label="Battle Arena"
        className="group relative flex h-11 w-11 sm:h-14 sm:w-auto items-center justify-center gap-0 sm:gap-2.5 rounded-full border border-brand/45 bg-white sm:pl-5 sm:pr-6 text-brand shadow-md sm:shadow-lg shadow-brand/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand/50 dark:bg-[var(--surface-elevated)] dark:shadow-black/30 pointer-events-auto"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="hidden sm:block absolute inset-0 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <Swords className="relative z-10 h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden="true" strokeWidth={2.5} />
        <span className="hidden sm:block relative z-10 text-sm font-black uppercase tracking-[0.15em] sm:text-[15px]">Arena</span>

        {pendingCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white dark:ring-[var(--surface-elevated)] animate-bounce">
            {pendingCount}
          </span>
        )}
      </Link>
    </div>
  );
}
