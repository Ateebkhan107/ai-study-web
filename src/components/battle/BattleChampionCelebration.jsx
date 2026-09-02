"use client";

import { useEffect, useState } from "react";
import { Trophy, Sparkles, X } from "lucide-react";

export function BattleChampionCelebration() {
  const [award, setAward] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function checkChampion() {
      try {
        const res = await fetch("/api/battle/champion");
        const data = await res.json();
        if (data.isChampion && data.award) {
          setAward(data.award);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Champion check error", err);
      }
    }
    checkChampion();
  }, []);

  async function handleDismiss() {
    setIsOpen(false);
    if (award?.id) {
      await fetch("/api/battle/champion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awardId: award.id }),
      }).catch(() => {});
    }
  }

  if (!isOpen || !award) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-brand bg-[linear-gradient(180deg,#181818,#0F0F0F)] p-8 text-center shadow-[0_0_60px_rgba(234,179,8,0.25)]">
        
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-brand/20 blur-3xl" />

        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-brand/20 border-2 border-brand text-brand shadow-[0_0_40px_rgba(234,179,8,0.4)] animate-bounce">
            <Trophy className="h-12 w-12 text-brand" />
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-300 animate-spin-slow" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-brand mb-2">
            <Trophy className="h-3.5 w-3.5 text-brand" />
            <span>Arena Champion Award</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-display">
            You Won the Arena!
          </h2>

          <p className="mt-2 text-sm text-slate-300 font-semibold max-w-sm">
            You claimed the #1 rank in the season and earned the coveted title:
          </p>

          <div className="mt-6 rounded-2xl border border-brand/40 bg-brand/10 px-6 py-4 text-center">
            <p className="text-[11px] font-black uppercase tracking-widest text-brand">Permanent Honor Badge</p>
            <p className="mt-1 text-lg sm:text-xl font-black text-white font-display">
              {award.badge_name || "Arena Champion"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Final Rating: <span className="text-brand font-bold">{award.arena_rating} Elo</span> · {award.wins} Victories
            </p>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="mt-8 w-full rounded-2xl bg-brand py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-brand/20 hover:bg-brand-hover transition"
          >
            Claim & Enter Arena
          </button>
        </div>
      </div>
    </div>
  );
}

export default BattleChampionCelebration;
