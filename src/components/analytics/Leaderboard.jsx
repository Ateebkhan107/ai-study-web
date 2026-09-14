"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Trophy, Crown } from "lucide-react";
import { getLevelFromXP } from "@/utils/levelEngine";
import Link from "next/link";
import AnimatedNumber from "@/components/AnimatedNumber";

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
    <div className={`relative bg-white dark:bg-[#141414] rounded-xl border border-slate-200 dark:border-[#2A2A2A] transition-colors duration-200 ${
      compact ? "p-4 sm:p-5" : "p-4 sm:p-6 lg:p-7"
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
          <Link href="/analytics#leaderboard" className="shrink-0 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-black transition-colors bg-[#F5C518] px-2.5 py-1.5 rounded-md">
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
        {/* DOCKED "YOUR POSITION" */}
        {currentUserData && (
          <div className="mt-4 sm:mt-5 rounded-xl border border-[#F5C518] bg-[#F5C518] relative overflow-hidden">
            
            <div className="px-3 py-1.5 sm:py-2 border-b border-black/10 bg-black/5 flex justify-center items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/80">Your Position</span>
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
    <div className={`relative overflow-hidden rounded-xl border border-[#F5C518] bg-[#F5C518] shadow-none ${compact ? "p-2.5 sm:p-4" : "p-4 sm:p-5"}`}>

      <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* RANK INDICATOR */}
        <div className="flex shrink-0 items-center justify-center">
          <div className={`flex items-center justify-center rounded-full bg-black text-[#F5C518] ${compact ? "w-11 h-11" : "w-12 h-12 sm:w-14 sm:h-14"}`}>
            <Crown className={`${compact ? "w-5 h-5 sm:w-6 sm:h-6" : "w-6 h-6 sm:w-7 sm:h-7"}`} strokeWidth={2.5} />
          </div>
        </div>

        {/* USER INFO */}
        <div className="min-w-0 flex-1 pl-1 sm:pl-2">
          <div className="flex items-center gap-2">
            <h3 className={`${compact ? "text-sm sm:text-base" : "text-base sm:text-lg"} font-black tracking-tight text-black truncate`}>
              {user.name || "Student"}
            </h3>
            {isCurrentUser && (
              <span className="shrink-0 rounded bg-black px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F5C518]">You</span>
            )}
          </div>
          <p className={`hidden sm:block ${compact ? "text-xs" : "text-sm"} mt-0.5 truncate font-semibold text-black/80`}>
            {levelData.title} · Level {levelData.currentLevel}
          </p>
        </div>

        {/* XP BADGE */}
        <div className="shrink-0 flex flex-col items-end pl-2">
          <div className="flex items-baseline gap-1">
            <span className={`${compact ? "text-lg sm:text-2xl" : "text-xl sm:text-3xl"} font-black tabular-nums tracking-tighter text-black`}>
              <AnimatedNumber number={user.xp} />
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-black/70">XP</span>
          </div>
          <span className="hidden sm:inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-black/70 mt-1">Leader</span>
        </div>
      </div>
    </div>
  );
}

function StandardRow({ user, isCurrentUser, compact, isDocked, transparent }) {
  const levelData = getLevelFromXP(user.xp);
  
  const isHighlightedRow = isCurrentUser || isDocked;

  // Rank indicator styles
  let rankIndicator = null;
  if (user.rank === 2) {
    rankIndicator = (
      <div className={`flex items-center justify-center rounded-full bg-slate-300 dark:bg-[#333333] shadow-none ${compact ? "w-8 h-8" : "w-9 h-9"}`}>
        <span className="text-black dark:text-white font-black text-sm">2</span>
      </div>
    );
  } else if (user.rank === 3) {
    rankIndicator = (
      <div className={`flex items-center justify-center rounded-full bg-orange-300 dark:bg-orange-800 shadow-none ${compact ? "w-7 h-7" : "w-8 h-8"}`}>
        <span className="text-black dark:text-white font-black text-sm">3</span>
      </div>
    );
  } else {
    rankIndicator = (
      <div className={`flex items-center justify-center rounded-md border ${
        isHighlightedRow 
          ? "border-black/20 bg-black/10 text-black" 
          : "border-slate-200 dark:border-[#2A2A2A] bg-slate-50 dark:bg-[#1A1A1A] text-slate-400 dark:text-slate-500"
      } ${compact ? "w-6 h-6" : "w-7 h-7"}`}>
        <span className="font-bold text-[10px] sm:text-xs">{user.rank}</span>
      </div>
    );
  }

  return (
    <div className={`group relative flex items-center justify-between transition-colors duration-150 ${
      transparent ? "" : "border-t border-slate-200 dark:border-[#2A2A2A] first:border-t-0 hover:bg-slate-50 dark:hover:bg-[#1F1F1F]"
    } ${
      isCurrentUser && !isDocked ? "bg-[#F5C518] dark:bg-[#F5C518]" : ""
    } ${compact ? "px-3 py-3 sm:px-4 sm:py-3" : "px-4 py-3 sm:px-5 sm:py-4"}`}>
      
      {/* LEFT SIDE */}
      <div className={`flex min-w-0 flex-1 items-center z-10 ${compact ? "gap-3" : "gap-4"}`}>
        
        {/* RANK */}
        <div className={`flex shrink-0 items-center justify-center ${compact ? "w-8" : "w-10"}`}>
          {rankIndicator}
        </div>

        {/* USER INFO */}
        <div className="min-w-0 flex-1 pl-1">
          <div className="flex items-center gap-2">
            <h3 className={`${compact ? "text-sm" : "text-base"} truncate font-semibold tracking-normal ${
              isHighlightedRow ? "text-black" : "text-slate-950 dark:text-white"
            }`}>
              {user.name || "Student"}
            </h3>
            {isCurrentUser && !isDocked && (
              <span className="shrink-0 rounded bg-black px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F5C518]">You</span>
            )}
          </div>
          <p className={`hidden sm:block ${compact ? "text-[11px]" : "text-xs"} mt-0.5 truncate font-normal ${
            isHighlightedRow ? "text-black/80" : "text-slate-500 dark:text-slate-400"
          }`}>
            {levelData.title} · Level {levelData.currentLevel}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE / XP */}
      <div className="z-10 shrink-0 pl-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:py-1 rounded-full ${
          isCurrentUser && !isDocked
            ? "text-black"
            : isDocked 
              ? "bg-[#F5C518] text-black" 
              : "bg-slate-100 text-slate-700 dark:bg-[#141414] dark:text-slate-300"
        }`}>
          <span className="font-bold tabular-nums text-sm sm:text-base">
            <AnimatedNumber number={user.xp} />
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">XP</span>
        </div>
      </div>
    </div>
  );
}
