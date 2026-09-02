"use client";

import { useEffect, useState } from "react";
import { Trophy, Flame, Shield, ChevronRight, User } from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function BattleLeaderboard({ initialSeason = "all-time" }) {
  const [season, setSeason] = useState(initialSeason);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const res = await fetch(`/api/battle/leaderboard?season=${encodeURIComponent(season)}`);
        const json = await res.json();
        if (!cancelled && json.leaderboard) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [season]);

  const seasonsList = data?.seasons || [];
  const rows = data?.leaderboard || [];
  const myRank = data?.myRank;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
      
      {/* Header & Season Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-[var(--border-subtle)]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-brand">
            <Trophy className="h-3.5 w-3.5" />
            Arena Rankings
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white uppercase mt-0.5">
            Leaderboard
          </h3>
        </div>

        {/* Season Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-[#111]">
          <button
            type="button"
            onClick={() => setSeason("all-time")}
            className={cx(
              "rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider transition shrink-0",
              season === "all-time"
                ? "bg-brand text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            All Time
          </button>
          {seasonsList.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSeason(s.id)}
              className={cx(
                "rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider transition shrink-0",
                season === s.id
                  ? "bg-brand text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {s.id}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned "Your Rank" Bar */}
      {myRank && (
        <div className="my-4 flex items-center justify-between rounded-xl border border-brand/40 bg-brand/10 p-3 sm:px-4 sm:py-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-slate-950 font-black font-display text-sm">
              #{myRank.rank}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand">Your Standing</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                @{myRank.username} · <span className="text-slate-500 dark:text-slate-400 font-semibold">{myRank.tier?.name || "Bronze"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-base sm:text-lg font-black font-display text-brand">{myRank.arenaRating} Elo</p>
              <p className="text-[10px] font-bold text-slate-500">{myRank.wins}W - {myRank.losses}L</p>
            </div>
          </div>
        </div>
      )}

      {/* Table Content */}
      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          No battles recorded for this season yet. Be the first to rank!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-2 font-black">Rank</th>
                <th className="py-2.5 px-2 font-black">Student</th>
                <th className="py-2.5 px-2 font-black text-right">Rating</th>
                <th className="py-2.5 px-2 font-black text-center hidden sm:table-cell">W/L</th>
                <th className="py-2.5 px-2 font-black text-right hidden sm:table-cell">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {rows.map((player) => {
                const isTop3 = player.rank <= 3;
                const rankBadgeClass = player.rank === 1
                  ? "bg-amber-400 text-slate-950 font-black"
                  : player.rank === 2
                  ? "bg-slate-300 text-slate-900 font-black"
                  : player.rank === 3
                  ? "bg-amber-700/80 text-white font-black"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

                return (
                  <tr
                    key={player.userId}
                    className={cx(
                      "transition hover:bg-slate-50 dark:hover:bg-white/[0.02]",
                      player.isMe ? "bg-brand/5 dark:bg-brand/10" : ""
                    )}
                  >
                    <td className="py-3 px-2">
                      <span className={cx("inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-display", rankBadgeClass)}>
                        {player.rank}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-black text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[200px]">
                            {player.displayName}
                            {player.isMe && <span className="ml-1.5 text-[10px] font-black text-brand uppercase">(You)</span>}
                          </p>
                          <p className="text-xs text-slate-400">@{player.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="font-black font-display text-sm sm:text-base text-slate-900 dark:text-white">
                        {player.arenaRating}
                      </span>
                      <span className="block text-[10px] font-bold text-slate-400">{player.tier?.name}</span>
                    </td>
                    <td className="py-3 px-2 text-center text-xs font-semibold text-slate-500 hidden sm:table-cell">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{player.wins}W</span>
                      {" - "}
                      <span className="text-rose-500 font-bold">{player.losses}L</span>
                    </td>
                    <td className="py-3 px-2 text-right text-xs font-semibold text-slate-500 hidden sm:table-cell">
                      {player.winStreak >= 2 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600 dark:text-brand font-black">
                          <Flame className="h-3 w-3" />
                          {player.winStreak}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BattleLeaderboard;
