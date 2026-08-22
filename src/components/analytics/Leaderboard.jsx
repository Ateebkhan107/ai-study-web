"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Trophy, Flame, Crown, Medal, Award, Shield } from "lucide-react";
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
        const top10 = Array.isArray(allUsers) ? allUsers.slice(0, compact ? 5 : 10) : [];
        
        // Add rank to top 10 for easier rendering
        const rankedTop10 = top10.map((u, i) => ({ ...u, rank: i + 1 }));
        setUsers(rankedTop10);

        // If user is logged in, check if they are in top 10
        if (currentUser?.id) {
          const inTop10 = rankedTop10.find(u => u.user_id === currentUser.id);
          if (!inTop10) {
            const rankData = Array.isArray(allUsers)
              ? allUsers.find((user) => user.user_id === currentUser.id)
              : null;
            if (rankData) {
              setCurrentUserData({
                ...rankData,
                isCurrentUserAppended: true,
              });
            }
          } else {
            const inDashboardTopFive = compact && rankedTop10.some((u) => u.user_id === currentUser.id);
            setCurrentUserData(
              compact && !inDashboardTopFive
                ? { ...inTop10, isCurrentUserAppended: true }
                : null
            );
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

  // Helper for dynamic rank styling
  const getRankTheme = (index) => {
    switch (index) {
      case 0:
        return {
          cardBg: "bg-amber-50/80 dark:bg-amber-500/10",
          border: "border-amber-200 dark:border-amber-500/30",
          rankColor: "text-amber-500 dark:text-amber-400",
          rankBg: "bg-amber-100 dark:bg-amber-500/20",
          Icon: Crown,
          xpColor: "text-amber-600 dark:text-amber-400",
        };
      case 1:
        return {
          cardBg: "bg-slate-100/80 dark:bg-slate-500/10",
          border: "border-slate-300 dark:border-slate-500/30",
          rankColor: "text-slate-500 dark:text-slate-300",
          rankBg: "bg-slate-200 dark:bg-slate-600/30",
          Icon: Medal,
          xpColor: "text-slate-600 dark:text-slate-300",
        };
      case 2:
        return {
          cardBg: "bg-orange-50/80 dark:bg-orange-500/10",
          border: "border-orange-200 dark:border-orange-500/30",
          rankColor: "text-orange-500 dark:text-orange-400",
          rankBg: "bg-orange-100 dark:bg-orange-500/20",
          Icon: Award,
          xpColor: "text-orange-600 dark:text-orange-400",
        };
      default:
        return {
          cardBg: "bg-[var(--card)]/50 dark:bg-[var(--surface-elevated)]/40 hover:bg-[var(--card)] dark:hover:bg-slate-800",
          border: "border-slate-200 dark:border-[var(--border)]/50 hover:border-indigo-300 dark:hover:border-indigo-500/50",
          rankColor: "text-slate-400 dark:text-slate-500",
          rankBg: "bg-slate-100 dark:bg-[var(--surface-elevated)]",
          Icon: null,
          xpColor: "text-slate-800 dark:text-slate-100",
        };
    }
  };

  return (
    <div className={`relative overflow-hidden bg-[var(--card)]/80 dark:bg-[var(--surface)]/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-[var(--border-subtle)] shadow-sm transition-all duration-500 ${
      compact ? "p-3 sm:p-5" : "p-4 sm:p-6 lg:p-8"
    }`}>

      {/* ── HEADER ── */}
      <div className={`relative z-10 flex items-center justify-between gap-3 ${compact ? "mb-3" : "mb-5 sm:mb-8"}`}>
        <div className="flex min-w-0 items-center gap-3">
        <div className={`flex items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm ${
          compact ? "h-7 w-7 sm:h-8 sm:w-8" : "w-10 h-10 sm:w-12 sm:h-12"
        }`}>
          <Trophy className={`${compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "w-5 h-5 sm:w-6 sm:h-6"} text-indigo-500 dark:text-indigo-400`} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <h2 className={`font-black tracking-tight text-slate-900 dark:text-white ${
            compact ? "text-base sm:text-lg" : "text-xl sm:text-2xl"
          }`}>
            Leaderboard
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
            Top 5
          </p>
        </div>
        </div>
        {compact && (
          <Link href="/analytics" className="shrink-0 text-xs font-black text-indigo-500 hover:text-indigo-600 dark:text-indigo-300">
            View full →
          </Link>
        )}
      </div>

      {/* ── LIST ── */}
      <div className={`relative z-10 flex flex-col ${compact ? "gap-1.5" : "gap-3"}`}>
        {users.length === 0 && (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-[var(--border-subtle)] rounded-2xl">
            <Trophy className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              No rankings available yet.
            </p>
          </div>
        )}

        {(() => {
          const displayUsers = uniqueLeaderboardUsers(users);

          if (currentUserData && !displayUsers.some((user) => user.user_id === currentUserData.user_id)) {
            displayUsers.push(currentUserData);
          }

          return displayUsers.map((user, displayIndex) => {
            const rankIndex = user.rank - 1; // 0-based index for themes
            const theme = getRankTheme(rankIndex);
            const RankIcon = theme.Icon;
            const isTopThree = rankIndex < 3;
            const isCurrentUser = currentUser?.id === user.user_id;

          return (
            <div key={user.user_id + (user.isCurrentUserAppended ? "_appended" : "")}>
            {user.isCurrentUserAppended && (
                <div className={`flex items-center gap-4 ${compact ? "my-1.5" : "my-6"}`}>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500 tracking-widest">
                    •••
                  </span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>
              )}
              
            <div
              className={`group relative flex items-center justify-between rounded-xl border transition-colors duration-200 ${compact ? "min-h-[42px] px-2.5 py-2 sm:min-h-[46px] sm:px-3" : "p-3 sm:p-5"} ${theme.cardBg} ${isCurrentUser ? "border-brand/60 dark:border-brand/60 ring-1 ring-brand/25" : theme.border}`}
              style={{ transitionDelay: `${displayIndex * 50}ms` }}
            >

              {/* ── LEFT SIDE ── */}
              <div className={`flex min-w-0 flex-1 items-center z-10 ${compact ? "gap-2.5" : "gap-4 sm:gap-5"}`}>
                
                {/* RANK INDICATOR */}
                <div className={`flex items-center justify-center rounded-lg shrink-0 ${theme.rankBg} ${
                  compact ? "h-7 w-7" : "w-10 h-10 sm:w-12 sm:h-12"
                }`}>
                  {RankIcon ? (
                    <RankIcon className={`${compact ? "h-3.5 w-3.5" : "w-5 h-5 sm:w-6 sm:h-6"} ${theme.rankColor}`} strokeWidth={2.5} />
                  ) : (
                    <span className={`${compact ? "text-xs" : "text-lg"} font-black ${theme.rankColor}`}>
                      #{user.rank}
                    </span>
                  )}
                </div>

                {/* USER INFO */}
                <div className={`grid min-w-0 flex-1 items-center ${compact ? "grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(120px,auto)_auto] sm:gap-3" : "grid-cols-1"}`}>
                  <h3 className={`${compact ? "text-xs sm:text-sm" : "text-base"} truncate font-bold tracking-tight transition-colors duration-300 ${isTopThree ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`}>
                    {user.name || "Student"}
                  </h3>

                  <div className={`${compact ? "hidden sm:inline-flex" : "inline-flex"} items-center gap-1 rounded-md border border-slate-200 bg-slate-200/50 px-1.5 py-0.5 backdrop-blur-sm dark:border-[var(--border)] dark:bg-[var(--surface-elevated)] sm:px-2`}>
                    <Shield className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {getLevelFromXP(user.xp).title} <span className="opacity-60">L{getLevelFromXP(user.xp).currentLevel}</span>
                    </span>
                  </div>

                  <div className={`${compact ? "flex" : "sm:hidden"} shrink-0 items-center justify-end gap-1 text-[11px] font-black ${theme.xpColor}`}>
                    <Flame className="h-3 w-3 text-rose-500 dark:text-rose-400" strokeWidth={2.5} />
                    <span>{user.xp} XP</span>
                  </div>
                </div>
              </div>

              {/* ── RIGHT SIDE / XP ── */}
              <div className={`z-10 hidden shrink-0 flex-col items-end pl-3 ${compact ? "hidden" : "sm:flex"}`}>
                <div className="flex items-baseline gap-1">
                  <span className={`${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"} font-black tracking-tight ${theme.xpColor}`}>
                    {user.xp}
                  </span>
                  <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">
                    XP
                  </span>
                </div>
              </div>

            </div>
            </div>
          );
        }); })()}
      </div>
    </div>
  );
}
