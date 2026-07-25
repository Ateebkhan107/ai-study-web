"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Trophy, Flame, Crown, Medal, Award, Zap, Shield } from "lucide-react";
import { getTopLeaderboard, getUserRank } from "@/lib/leaderboard";

export default function Leaderboard() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);

  // =============================
  // LOAD GLOBAL LEADERBOARD
  // =============================

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const top10 = await getTopLeaderboard();
        
        // Add rank to top 10 for easier rendering
        const rankedTop10 = top10.map((u, i) => ({ ...u, rank: i + 1 }));
        setUsers(rankedTop10);

        // If user is logged in, check if they are in top 10
        if (currentUser?.id) {
          const inTop10 = rankedTop10.find(u => u.user_id === currentUser.id);
          if (!inTop10) {
            const rankData = await getUserRank(currentUser.id);
            if (rankData) {
              setCurrentUserData({
                ...rankData.userData,
                rank: rankData.rank,
                user_id: currentUser.id,
                isCurrentUserAppended: true
              });
            }
          } else {
            setCurrentUserData(null);
          }
        }
      } catch (error) {
        console.log("Leaderboard error:", error);
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
          cardBg: "bg-gradient-to-r from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10",
          border: "border-amber-300/50 dark:border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
          rankColor: "text-amber-500 dark:text-amber-400",
          rankBg: "bg-amber-100 dark:bg-amber-500/20",
          Icon: Crown,
          xpGradient: "from-amber-500 to-orange-500",
        };
      case 1:
        return {
          cardBg: "bg-gradient-to-r from-slate-300/20 to-slate-200/10 dark:from-slate-400/20 dark:to-slate-500/10",
          border: "border-slate-300 dark:border-slate-500/30 shadow-[0_0_15px_rgba(148,163,184,0.1)]",
          rankColor: "text-slate-500 dark:text-slate-300",
          rankBg: "bg-slate-200 dark:bg-slate-600/30",
          Icon: Medal,
          xpGradient: "from-slate-500 to-slate-400 dark:from-slate-300 dark:to-slate-100",
        };
      case 2:
        return {
          cardBg: "bg-gradient-to-r from-orange-500/10 to-rose-500/5 dark:from-orange-500/20 dark:to-rose-500/10",
          border: "border-orange-200 dark:border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]",
          rankColor: "text-orange-500 dark:text-orange-400",
          rankBg: "bg-orange-100 dark:bg-orange-500/20",
          Icon: Award,
          xpGradient: "from-orange-500 to-rose-500",
        };
      default:
        return {
          cardBg: "bg-white/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800",
          border: "border-slate-100 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50",
          rankColor: "text-slate-400 dark:text-slate-500",
          rankBg: "bg-slate-100 dark:bg-slate-800",
          Icon: null,
          xpGradient: "from-indigo-500 to-purple-500",
        };
    }
  };

  return (
    <div className="relative overflow-hidden bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-2xl rounded-3xl border border-indigo-100/50 dark:border-indigo-500/10 p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-500">
      
      {/* ── Ambient Background Glows ── */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-gradient-to-tr from-pink-500/20 to-orange-500/20 dark:from-pink-500/10 dark:to-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── HEADER ── */}
      <div className="relative z-10 flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
          <Trophy className="w-6 h-6 text-indigo-500 dark:text-indigo-400" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Global Leaderboard
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
            Top Performers
          </p>
        </div>
      </div>

      {/* ── LIST ── */}
      <div className="relative z-10 flex flex-col gap-3">
        {users.length === 0 && (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Trophy className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              No rankings available yet.
            </p>
          </div>
        )}

        {(() => {
          const displayUsers = [...users];

          if (currentUserData) {
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
                <div className="flex items-center gap-4 my-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white/50 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                    Your Rank
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                </div>
              )}
              
            <div
              className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${theme.cardBg} ${isCurrentUser ? "border-indigo-400 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20" : theme.border}`}
              style={{ transitionDelay: `${displayIndex * 50}ms` }}
            >
              {/* Shimmer effect for 1st place */}
              {rankIndex === 0 && (
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-[shimmer_2s_infinite] pointer-events-none rounded-2xl" />
              )}

              {/* ── LEFT SIDE ── */}
              <div className="flex items-center gap-4 sm:gap-5 z-10">
                
                {/* RANK INDICATOR */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${theme.rankBg} transition-transform duration-500 group-hover:scale-110`}>
                  {RankIcon ? (
                    <RankIcon className={`w-6 h-6 ${theme.rankColor}`} strokeWidth={2.5} />
                  ) : (
                    <span className={`text-lg font-black ${theme.rankColor}`}>
                      #{user.rank}
                    </span>
                  )}
                </div>

                {/* USER INFO */}
                <div className="flex flex-col">
                  <h3 className={`text-base font-bold tracking-tight mb-1 transition-colors duration-300 ${isTopThree ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`}>
                    {user.name || "Student"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* XP Indicator */}
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <Flame className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" strokeWidth={2.5} />
                      {user.xp} XP earned
                    </div>

                    <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

                    {/* Level Badge */}
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
                      <Shield className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                      <span className="text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">
                        {user.badge} <span className="opacity-60">Lvl {user.level}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT SIDE / XP ── */}
              <div className="flex flex-col items-end z-10 shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl sm:text-3xl font-black tracking-tighter bg-gradient-to-br ${theme.xpGradient} bg-clip-text text-transparent`}>
                    {user.xp}
                  </span>
                  <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">
                    XP
                  </span>
                </div>
                
                {/* Decorative mini zap on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 absolute right-4 top-1/2 -translate-y-1/2 blur-xl">
                  <Zap className={`w-12 h-12 ${theme.rankColor}`} />
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