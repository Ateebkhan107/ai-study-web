"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Trophy, Crown } from "lucide-react";
import { getLevelFromXP } from "@/utils/levelEngine";
import Link from "next/link";

function uniqueLeaderboardUsers(users = []) {
  const usersById = new Map();

  for (const user of users) {
    const userId = String(user?.user_id || "").trim();
    if (!userId) continue;
    if (!usersById.has(userId)) {
      usersById.set(userId, user);
    }
  }

  return [...usersById.values()];
}

export default function Leaderboard({ compact = false }) {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);

  // =============================
  // LOAD GLOBAL LEADERBOARD
  // =============================

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const response = await fetch("/api/pyq/leaderboard", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load leaderboard");
        }

        const allUsers = uniqueLeaderboardUsers(await response.json());
        const limit = compact ? 5 : 10;
        const topUsers = Array.isArray(allUsers) ? allUsers.slice(0, limit) : [];
        const rankedTopUsers = topUsers.map((u, i) => ({ ...u, rank: i + 1 }));
        setUsers(rankedTopUsers);

        if (currentUser?.id) {
          const userFullIndex = Array.isArray(allUsers)
            ? allUsers.findIndex((u) => u.user_id === currentUser.id)
            : -1;
            
          if (userFullIndex >= limit) {
            setCurrentUserData({
              ...allUsers[userFullIndex],
              rank: userFullIndex + 1,
            });
          } else {
            setCurrentUserData(null);
          }
        }
      } catch (error) {
//         console.log("Leaderboard error:", error);
      }
    }

    if (currentUser?.id !== undefined) {
      loadLeaderboard();
    }
  }, [compact, currentUser?.id]);

  return (
    <div className={`relative bg-white dark:bg-[var(--surface)] rounded-xl border border-slate-200 dark:border-[var(--border-subtle)] shadow-sm transition-colors duration-200 ${
      compact ? "p-2.5 sm:p-4" : "p-4 sm:p-6 lg:p-7"
    }`}>
      
      <style>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer-slide 3s infinite;
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className={`relative z-10 flex items-center justify-between gap-3 ${compact ? "mb-3" : "mb-5 sm:mb-6"}`}>
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] ${
            compact ? "h-8 w-8 sm:h-9 sm:w-9" : "w-10 h-10 sm:w-11 sm:h-11"
          }`}>
            <Trophy className={`${compact ? "h-4 w-4 sm:h-4.5 sm:w-4.5" : "w-5 h-5"} text-slate-500 dark:text-slate-400`} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h2 className={`font-bold tracking-tight text-slate-950 dark:text-white ${
              compact ? "text-base sm:text-lg" : "text-xl sm:text-2xl"
            }`}>
              Leaderboard
            </h2>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mt-0.5">
              {compact ? "Top 5" : "Top 10"}
            </p>
          </div>
        </div>
        {compact && (
          <Link href="/analytics#leaderboard" className="shrink-0 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand hover:text-brand-hover dark:text-brand dark:hover:text-amber-400 transition-colors bg-brand/10 px-2.5 py-1.5 rounded-md">
            View full
          </Link>
        )}
      </div>

      {/* ── LIST ── */}
      <div className="relative z-10">
        {users.length === 0 && (
          <div className="text-center py-10 rounded-xl border border-dashed border-slate-200 dark:border-[var(--border-subtle)]">
            <Trophy className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No rankings available yet.
            </p>
          </div>
        )}

        {users.length > 0 && (
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {/* RANK 1 CARD */}
            {users[0] && (
              <RankOneCard 
                user={users[0]} 
                isCurrentUser={currentUser?.id === users[0].user_id} 
                compact={compact} 
              />
            )}
            
            {/* RANKS 2+ */}
            {users.length > 1 && (
              <div className="flex flex-col rounded-xl border border-slate-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--surface)] overflow-hidden shadow-sm">
                {users.slice(1).map((user) => (
                  <StandardRow 
                    key={user.user_id} 
                    user={user} 
                    isCurrentUser={currentUser?.id === user.user_id} 
                    compact={compact} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* DOCKED "YOUR POSITION" */}
        {currentUserData && (
          <div className="mt-4 sm:mt-5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-[0_0_15px_rgba(99,102,241,0.08)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/50 dark:via-indigo-500/10 to-transparent -translate-x-full animate-shimmer" style={{ animationDelay: '1.5s' }} />
            
            <div className="px-3 py-1.5 sm:py-2 border-b border-indigo-100 dark:border-indigo-500/20 bg-indigo-100/40 dark:bg-indigo-500/10 flex justify-center items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-400 shadow-sm">Your Position</span>
            </div>
            
            <div className="relative bg-transparent">
              <StandardRow 
                user={currentUserData} 
                isCurrentUser={true} 
                compact={compact} 
                isDocked={true} 
                transparent={true} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RankOneCard({ user, isCurrentUser, compact }) {
  const levelData = getLevelFromXP(user.xp);
  
  return (
    <div className={`relative overflow-hidden rounded-xl border border-amber-200 dark:border-brand/30 bg-gradient-to-r from-amber-100 to-amber-50/50 dark:from-brand/20 dark:to-brand/5 shadow-sm ${compact ? "p-2.5 sm:p-4" : "p-4 sm:p-5"}`}>
      
      {/* SHIMMER ANIMATION */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent -translate-x-full animate-shimmer" style={{ animationDelay: '0s' }} />

      <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* RANK INDICATOR */}
        <div className="flex shrink-0 items-center justify-center">
          <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 dark:from-brand dark:to-amber-600 text-white shadow-[0_4px_15px_rgba(234,179,8,0.4)] ${compact ? "w-11 h-11" : "w-12 h-12 sm:w-14 sm:h-14"}`}>
            <Crown className={`${compact ? "w-5 h-5 sm:w-6 sm:h-6" : "w-6 h-6 sm:w-7 sm:h-7"} drop-shadow-md`} strokeWidth={2.5} />
          </div>
        </div>

        {/* USER INFO */}
        <div className="min-w-0 flex-1 pl-1 sm:pl-2">
          <div className="flex items-center gap-2">
            <h3 className={`${compact ? "text-sm sm:text-base" : "text-base sm:text-lg"} font-black tracking-tight text-slate-950 dark:text-white truncate`}>
              {user.name || "Student"}
            </h3>
            {isCurrentUser && (
              <span className="shrink-0 rounded bg-brand/20 dark:bg-brand/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-white">You</span>
            )}
          </div>
          <p className={`${compact ? "text-xs" : "text-sm"} mt-0.5 truncate font-semibold text-slate-600 dark:text-slate-300`}>
            {levelData.title} · Level {levelData.currentLevel}
          </p>
        </div>

        {/* XP BADGE */}
        <div className="shrink-0 flex flex-col items-end pl-2">
          <div className="flex items-baseline gap-1">
            <span className={`${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"} font-black tabular-nums tracking-tighter text-amber-600 dark:text-brand`}>
              {user.xp.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-500 dark:text-brand/80">XP</span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600 dark:text-brand mt-1">Leader</span>
        </div>
      </div>
    </div>
  );
}

function StandardRow({ user, isCurrentUser, compact, isDocked, transparent }) {
  const levelData = getLevelFromXP(user.xp);
  
  // Rank indicator styles
  let rankIndicator = null;
  if (user.rank === 2) {
    rankIndicator = (
      <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600 shadow-sm ${compact ? "w-8 h-8" : "w-9 h-9"}`}>
        <span className="text-slate-800 dark:text-white font-black text-sm">2</span>
      </div>
    );
  } else if (user.rank === 3) {
    rankIndicator = (
      <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-orange-300/80 to-orange-400/80 dark:from-orange-700/80 dark:to-orange-900/80 shadow-sm ${compact ? "w-7 h-7" : "w-8 h-8"}`}>
        <span className="text-orange-950 dark:text-orange-50 font-black text-sm">3</span>
      </div>
    );
  } else {
    rankIndicator = (
      <div className={`flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[var(--surface-elevated)] ${compact ? "w-6 h-6" : "w-7 h-7"}`}>
        <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] sm:text-xs">{user.rank}</span>
      </div>
    );
  }

  return (
    <div className={`group relative flex items-center justify-between transition-colors duration-150 ${
      transparent ? "" : "border-t border-slate-200 dark:border-[var(--border-subtle)] first:border-t-0 hover:bg-slate-50/80 dark:hover:bg-[var(--surface-elevated)]/55"
    } ${
      isCurrentUser && !isDocked ? "bg-indigo-50/40 dark:bg-indigo-500/5" : ""
    } ${compact ? "px-2.5 py-2 sm:px-3 sm:py-3" : "px-3.5 py-3 sm:px-4 sm:py-4"}`}>
      
      {/* LEFT SIDE */}
      <div className={`flex min-w-0 flex-1 items-center z-10 ${compact ? "gap-3" : "gap-4"}`}>
        
        {/* RANK */}
        <div className={`flex shrink-0 items-center justify-center ${compact ? "w-8" : "w-10"}`}>
          {rankIndicator}
        </div>

        {/* USER INFO */}
        <div className="min-w-0 flex-1 pl-1">
          <div className="flex items-center gap-2">
            <h3 className={`${compact ? "text-sm" : "text-base"} truncate font-semibold tracking-normal text-slate-950 dark:text-white`}>
              {user.name || "Student"}
            </h3>
            {isCurrentUser && !isDocked && (
              <span className="shrink-0 rounded bg-indigo-100 dark:bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">You</span>
            )}
          </div>
          <p className={`${compact ? "text-[11px]" : "text-xs"} mt-0.5 truncate font-normal text-slate-500 dark:text-slate-400`}>
            {levelData.title} · Level {levelData.currentLevel}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE / XP */}
      <div className="z-10 shrink-0 pl-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:py-1 rounded-full ${
          isCurrentUser || isDocked
            ? "bg-indigo-100/70 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400"
            : "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300"
        }`}>
          <span className="font-bold tabular-nums text-sm sm:text-base">
            {user.xp.toLocaleString()}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">XP</span>
        </div>
      </div>
    </div>
  );
}
