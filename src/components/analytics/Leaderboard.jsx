"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Trophy, Crown, Medal } from "lucide-react";
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

  const getRankIcon = (rank) => {
    if (rank === 1) return Crown;
    if (rank === 2) return Medal;
    if (rank === 3) return Medal;
    return null;
  };

  return (
    <div className={`relative bg-white dark:bg-[var(--surface)] rounded-xl border border-slate-200 dark:border-[var(--border-subtle)] shadow-sm transition-colors duration-200 ${
      compact ? "p-3 sm:p-4" : "p-4 sm:p-6 lg:p-7"
    }`}>

      {/* ── HEADER ── */}
      <div className={`relative z-10 flex items-center justify-between gap-3 ${compact ? "mb-2" : "mb-4 sm:mb-6"}`}>
        <div className="flex min-w-0 items-center gap-3">
        <div className={`flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] ${
          compact ? "h-7 w-7 sm:h-8 sm:w-8" : "w-9 h-9 sm:w-10 sm:h-10"
        }`}>
          <Trophy className={`${compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "w-5 h-5"} text-slate-500 dark:text-slate-400`} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h2 className={`font-semibold tracking-normal text-slate-950 dark:text-white ${
            compact ? "text-base sm:text-lg" : "text-xl sm:text-2xl"
          }`}>
            Leaderboard
          </h2>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-500 mt-1">
            {compact ? "Top 5" : "Top 10"}
          </p>
        </div>
        </div>
        {compact && (
          <Link href="/analytics" className="shrink-0 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            View full
          </Link>
        )}
      </div>

      {/* ── LIST ── */}
      <div className="relative z-10 overflow-hidden rounded-lg border border-slate-200 dark:border-[var(--border-subtle)]">
        {users.length === 0 && (
          <div className="text-center py-10">
            <Trophy className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
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
            const RankIcon = getRankIcon(user.rank);
            const isFirstPlace = user.rank === 1;
            const isCurrentUser = currentUser?.id === user.user_id;
            const levelData = getLevelFromXP(user.xp);

          return (
            <div key={user.user_id + (user.isCurrentUserAppended ? "_appended" : "")}>
            {user.isCurrentUserAppended && (
                <div className="border-t border-slate-200 dark:border-[var(--border-subtle)] bg-slate-50/70 px-3 py-1.5 dark:bg-[var(--surface-elevated)]/35">
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
                    Your position
                  </span>
                </div>
              )}
              
            <div
              className={`group relative flex items-center justify-between border-t border-slate-200 transition-colors duration-150 first:border-t-0 dark:border-[var(--border-subtle)] ${compact ? "min-h-[46px] px-3 py-2.5" : "min-h-[64px] px-3.5 py-3 sm:px-4 sm:py-4"} ${
                isCurrentUser
                  ? "bg-amber-50/70 dark:bg-brand/10"
                  : "bg-white hover:bg-slate-50/80 dark:bg-[var(--surface)] dark:hover:bg-[var(--surface-elevated)]/55"
              }`}
              style={{ transitionDelay: `${displayIndex * 50}ms` }}
            >

              {/* ── LEFT SIDE ── */}
              <div className={`flex min-w-0 flex-1 items-center z-10 ${compact ? "gap-3" : "gap-3.5 sm:gap-4"}`}>
                
                {/* RANK INDICATOR */}
                <div className={`${compact ? "w-7" : "w-9 sm:w-10"} flex shrink-0 items-center justify-center`}>
                  {RankIcon ? (
                    <RankIcon
                      className={`${compact ? "h-4 w-4" : "h-5 w-5"} ${
                        isFirstPlace
                          ? "text-brand"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                      strokeWidth={2.1}
                    />
                  ) : (
                    <span className={`${compact ? "text-xs" : "text-sm"} font-semibold tabular-nums text-slate-500 dark:text-slate-500`}>
                      {user.rank}
                    </span>
                  )}
                </div>

                {/* USER INFO */}
                <div className="min-w-0 flex-1">
                  <h3 className={`${compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"} truncate font-semibold tracking-normal text-slate-950 dark:text-white`}>
                    {user.name || "Student"}
                  </h3>
                  <p className={`${compact ? "text-[11px]" : "text-xs"} mt-0.5 truncate font-normal text-slate-500 dark:text-slate-500`}>
                    {levelData.title} · Level {levelData.currentLevel}
                  </p>
                </div>
              </div>

              {/* ── RIGHT SIDE / XP ── */}
              <div className="z-10 shrink-0 pl-3 text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span className={`${compact ? "text-sm sm:text-base" : "text-base sm:text-lg"} font-semibold tabular-nums tracking-normal ${
                    isFirstPlace || isCurrentUser
                      ? "text-brand"
                      : "text-slate-900 dark:text-slate-100"
                  }`}>
                    {user.xp}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-500">
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
