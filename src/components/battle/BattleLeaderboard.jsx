"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

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
  const rows = (data?.leaderboard || []).slice(0, 10);
  const myRank = data?.myRank;
  const myInTop10 = rows.some((r) => r.isMe);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1">
        <Trophy className="h-3.5 w-3.5 text-brand" />
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-brand">Arena Rankings</span>
      </div>
      <h3 className="text-lg font-black font-display text-slate-900 dark:text-white uppercase mb-3">
        Leaderboard
      </h3>

      {/* Season Selector */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 mb-3 scrollbar-none">
        <button
          type="button"
          onClick={() => setSeason("all-time")}
          className={cx(
            "shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition",
            season === "all-time"
              ? "bg-brand text-slate-950"
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
              "shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition",
              season === s.id
                ? "bg-brand text-slate-950"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            {s.name?.replace(" Season", "") || s.id}
          </button>
        ))}
      </div>

      {/* Your Rank — pinned above table, only if outside top 10 */}
      {myRank && !myInTop10 && (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-brand/40 bg-brand/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand text-slate-950 text-[11px] font-black font-display">
              #{myRank.rank}
            </span>
            <div>
              <p className="text-[11px] font-black text-slate-900 dark:text-white leading-none">
                @{myRank.username}
                <span className="ml-1 text-[9px] font-black text-brand uppercase">(You)</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black font-display text-brand leading-none">{myRank.arenaRating} <span className="text-[10px] font-bold text-slate-400">Marks</span></p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
              <span className="text-emerald-500">{myRank.wins}W</span>
              {" – "}
              <span className="text-rose-500">{myRank.losses}L</span>
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[160px] items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : rows.length === 0 ? (
        <div className="py-8 text-center text-xs font-semibold text-slate-400">
          No battles recorded yet. Be the first to rank!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 dark:border-slate-800">
              <tr className="text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                <th className="py-1.5 px-1 font-black w-8">#</th>
                <th className="py-1.5 px-1 font-black">Student</th>
                <th className="py-1.5 px-1 font-black text-right">Marks</th>
                <th className="py-1.5 px-1 font-black text-right hidden sm:table-cell">W / L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {rows.map((player) => {
                const rankBadgeClass =
                  player.rank === 1
                    ? "bg-amber-400 text-slate-950"
                    : player.rank === 2
                    ? "bg-slate-300 text-slate-900"
                    : player.rank === 3
                    ? "bg-amber-700/80 text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";

                return (
                  <tr
                    key={player.userId}
                    className={cx(
                      "transition-colors",
                      player.isMe
                        ? "bg-brand/5 dark:bg-brand/10"
                        : "hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                    )}
                  >
                    {/* Rank */}
                    <td className="py-2 px-1">
                      <span className={cx("inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-black font-display", rankBadgeClass)}>
                        {player.rank}
                      </span>
                    </td>

                    {/* Student */}
                    <td className="py-2 px-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[110px] sm:max-w-[170px] leading-none">
                        {player.displayName}
                        {player.isMe && (
                          <span className="ml-1 text-[9px] font-black text-brand uppercase">(You)</span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">@{player.username}</p>
                    </td>

                    {/* Marks */}
                    <td className="py-2 px-1 text-right">
                      <span className={cx("font-black font-display text-sm", player.rank <= 3 ? "text-brand" : "text-slate-900 dark:text-white")}>
                        {player.arenaRating}
                      </span>
                    </td>

                    {/* W/L */}
                    <td className="py-2 px-1 text-right text-[11px] hidden sm:table-cell whitespace-nowrap">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{player.wins}W</span>
                      <span className="text-slate-300 dark:text-slate-600 mx-0.5">–</span>
                      <span className="text-rose-500 font-bold">{player.losses}L</span>
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
