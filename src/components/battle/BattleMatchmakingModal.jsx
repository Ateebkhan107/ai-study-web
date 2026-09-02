"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  playCountdownTick,
  playGoSound,
  playMatchmakingPulse,
  playOpponentFound,
  speakAnnouncer,
  unlockAudioContext,
} from "@/lib/battleAudio";
import { StarsBackground } from "@/components/ui/stars-background";


function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function initials(name) {
  return String(name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "S";
}

export function BattleMatchmakingModal({
  isOpen,
  profile,
  matchedData, // { battleId, opponent } if matched
  onCancel,
}) {
  const router = useRouter();
  const [phase, setPhase] = useState("searching"); // "searching" | "vs" | "countdown"
  const [count, setCount] = useState(3);
  const pulseIntervalRef = useRef(null);

  // Initialize audio context on modal open
  useEffect(() => {
    if (isOpen) {
      unlockAudioContext();
    }
  }, [isOpen]);

  // Handle pulse sound during searching
  useEffect(() => {
    if (!isOpen || phase !== "searching") {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      return;
    }

    playMatchmakingPulse();
    pulseIntervalRef.current = setInterval(() => {
      playMatchmakingPulse();
    }, 2800);

    return () => {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    };
  }, [isOpen, phase]);

  // Trigger VS screen and countdown when matched
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) {
      setPhase("searching");
      setCount(3);
      return;
    }

    if (matchedData?.battleId) {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      setPhase("vs");
      playOpponentFound();
      speakAnnouncer("Opponent found");

      const vsTimer = setTimeout(() => {
        setPhase("countdown");
        setCount(3);
        playCountdownTick(3);
        speakAnnouncer("Three");

        const c2 = setTimeout(() => {
          setCount(2);
          playCountdownTick(2);
          speakAnnouncer("Two");
        }, 800);

        const c1 = setTimeout(() => {
          setCount(1);
          playCountdownTick(1);
          speakAnnouncer("One");
        }, 1600);

        const cGo = setTimeout(() => {
          setCount("GO!");
          playGoSound();
          speakAnnouncer("Go!");
        }, 2400);

        const cStart = setTimeout(() => {
          router.push(`/battle/${matchedData.battleId}`);
        }, 3000);

        return () => {
          clearTimeout(c2);
          clearTimeout(c1);
          clearTimeout(cGo);
          clearTimeout(cStart);
        };
      }, 1600);

      return () => clearTimeout(vsTimer);
    }
  }, [isOpen, matchedData, router]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const opponentName = matchedData?.opponent?.displayName || matchedData?.opponent?.username || "Opponent";
  const opponentRating = matchedData?.opponent?.arena_rating || 1000;
  const myRating = profile?.arena_rating || 1000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-brand/40 bg-[linear-gradient(180deg,#141414,#0B0B0B)] p-6 sm:p-10 shadow-2xl shadow-brand/10 text-center">
        {/* Subtle Stars Background */}
        <StarsBackground className="pointer-events-none -z-10 opacity-70" />
        
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-brand/15 blur-3xl" />

        {phase === "searching" && (
          <div className="relative z-10 flex flex-col items-center">
            {/* Sonar Radar Animation */}
            <div className="relative mb-8 flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-brand/20 animate-ping duration-1000 opacity-60" />
              <div className="absolute inset-4 rounded-full border border-brand/30 animate-pulse" />
              <div className="absolute inset-8 rounded-full border border-dashed border-brand/40 animate-spin-slow" />
              
              <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-brand/15 border-2 border-brand text-brand shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                <span className="text-2xl sm:text-3xl font-black font-display">{initials(profile?.full_name || profile?.username)}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-brand mb-3">
              <span className="h-2 w-2 rounded-full bg-brand animate-ping" />
              Matchmaking
            </div>

            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wider text-white font-display">
              Searching for Opponent
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 font-semibold max-w-md">
              Pairing you with a same-track <span className="text-brand">{profile?.exam || "JEE"}</span> contender of comparable rating.
            </p>

            <div className="mt-8 flex items-center justify-center gap-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-3">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Rating</p>
                <p className="text-base font-black text-white">{myRating} Elo</p>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Track</p>
                <p className="text-base font-black text-brand">{profile?.exam || "JEE"}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="mt-8 rounded-full border border-white/20 bg-white/5 px-8 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 hover:border-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
            >
              Cancel Search
            </button>
          </div>
        )}

        {(phase === "vs" || phase === "countdown") && (
          <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-6">
              Opponent Matched!
            </div>

            {/* VS Card Grid */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6 w-full max-w-lg mb-8">
              {/* Player 1 (You) */}
              <div className="flex flex-col items-center rounded-2xl border border-brand/40 bg-brand/10 p-4 sm:p-5 shadow-lg shadow-brand/5">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-brand flex items-center justify-center text-slate-950 font-black text-xl sm:text-2xl font-display mb-3 border border-white/20">
                  {initials(profile?.full_name || profile?.username)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand">YOU</span>
                <span className="text-sm sm:text-lg font-black text-white truncate max-w-[120px]">{profile?.full_name || profile?.username}</span>
                <span className="text-xs text-slate-400 font-semibold">{myRating} Elo</span>
              </div>

              {/* VS Emblem */}
              <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-brand text-slate-950 font-black text-lg sm:text-xl font-display shadow-[0_0_20px_rgba(234,179,8,0.5)] animate-pulse">
                VS
              </div>

              {/* Player 2 (Opponent) */}
              <div className="flex flex-col items-center rounded-2xl border border-slate-700 bg-white/5 p-4 sm:p-5">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center text-white font-black text-xl sm:text-2xl font-display mb-3">
                  {initials(opponentName)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">OPPONENT</span>
                <span className="text-sm sm:text-lg font-black text-white truncate max-w-[120px]">{opponentName}</span>
                <span className="text-xs text-slate-400 font-semibold">{opponentRating} Elo</span>
              </div>
            </div>

            {/* Countdown Overlay */}
            {phase === "countdown" && (
              <div className="flex flex-col items-center">
                <div className="text-6xl sm:text-8xl font-black font-display text-brand animate-in zoom-in-50 duration-200 drop-shadow-[0_0_35px_rgba(234,179,8,0.6)]">
                  {count}
                </div>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                  Battle commencing...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BattleMatchmakingModal;
