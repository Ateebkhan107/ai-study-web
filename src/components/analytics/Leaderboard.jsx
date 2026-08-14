"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Trophy, Flame, Crown, Medal, Award, Zap, Shield } from "lucide-react";
import { getLevelFromXP } from "@/utils/levelEngine";

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
        const top10 = Array.isArray(allUsers) ? allUsers.slice(0, 10) : [];
        
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
                isCurrentUserAppended: true
              });
            }
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
  }, [currentUser?.id]);

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
          cardBg: "bg-white/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800",
          border: "border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50",
          rankColor: "text-slate-400 dark:text-slate-500",
          rankBg: "bg-slate-100 dark:bg-slate-800",
          Icon: null,
          xpColor: "text-slate-800 dark:text-slate-100",
        };
    }
  };

  return (
    <div className={`relative overflow-hidden bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-500 ${
      compact ? "p-4 sm:p-5" : "p-6 lg:p-8"
    }`}>

      {/* ── HEADER ── */}
      <div className={`relative z-10 flex items-center gap-3 ${compact ? "mb-4" : "mb-8"}`}>
        <div className={`flex items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm ${
          compact ? "h-9 w-9" : "w-12 h-12"
        }`}>
          <Trophy className={`${compact ? "h-5 w-5" : "w-6 h-6"} text-indigo-500 dark:text-indigo-400`} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className={`font-black tracking-tight text-slate-900 dark:text-white ${
            compact ? "text-xl" : "text-2xl"
          }`}>
            Global Leaderboard
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
            Top Performers
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Includes clearly identified sample leaderboard data.
          </p>
        </div>
      </div>

      {/* ── LIST ── */}
      <div className={`relative z-10 flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
        {users.length === 0 && (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
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
                <div className={`flex items-center gap-4 ${compact ? "my-3" : "my-6"}`}>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white/50 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                    Your Rank
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                </div>
              )}
              
            <div
              className={`group relative flex items-center justify-between rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${compact ? "min-h-[64px] p-3 sm:p-3.5" : "p-5"} ${theme.cardBg} ${isCurrentUser ? "border-indigo-400 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20" : theme.border}`}
              style={{ transitionDelay: `${displayIndex * 50}ms` }}
            >

              {/* ── LEFT SIDE ── */}
              <div className={`flex min-w-0 items-center z-10 ${compact ? "gap-3" : "gap-4 sm:gap-5"}`}>
                
                {/* RANK INDICATOR */}
                <div className={`flex items-center justify-center rounded-xl shrink-0 ${theme.rankBg} transition-transform duration-500 group-hover:scale-110 ${
                  compact ? "h-10 w-10" : "w-12 h-12"
                }`}>
                  {RankIcon ? (
                    <RankIcon className={`${compact ? "h-5 w-5" : "w-6 h-6"} ${theme.rankColor}`} strokeWidth={2.5} />
                  ) : (
                    <span className={`${compact ? "text-sm" : "text-lg"} font-black ${theme.rankColor}`}>
                      #{user.rank}
                    </span>
                  )}
                </div>

                {/* USER INFO */}
                <div className="flex min-w-0 flex-col">
                  <h3 className={`${compact ? "text-sm" : "text-base"} truncate font-bold tracking-tight mb-1 transition-colors duration-300 ${isTopThree ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`}>
                    {user.name || "Student"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* XP Indicator */}
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <Flame className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" strokeWidth={2.5} />
                      <span className={compact ? "hidden sm:inline" : ""}>{user.xp} XP earned</span>
                      <span className={compact ? "sm:hidden" : "hidden"}>{user.xp} XP</span>
                    </div>

                    <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

                    {/* Level Badge */}
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
                      <Shield className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                      <span className="text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">
                        {getLevelFromXP(user.xp).title} <span className="opacity-60">Lvl {getLevelFromXP(user.xp).currentLevel}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT SIDE / XP ── */}
              <div className="flex flex-col items-end z-10 shrink-0 pl-3">
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
