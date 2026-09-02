"use client";

import { useEffect, useState } from "react";
import { Activity, Flame, Trophy, Swords } from "lucide-react";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "Just now";
  const sec = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

export function BattleLiveFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadFeed() {
      try {
        const res = await fetch("/api/battle/feed");
        const json = await res.json();
        if (!cancelled && json.events) {
          setEvents(json.events);
        }
      } catch (err) {
        console.error("Failed to load feed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFeed();
    const interval = setInterval(loadFeed, 10000); // 10s auto-refresh
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-[var(--border-subtle)]">
        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          Live Arena Feed
        </div>
        <span className="text-[10px] font-bold text-slate-400">Realtime</span>
      </div>

      <div className="mt-3 space-y-2.5">
        {loading && events.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading feed...</div>
        ) : events.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No recent events yet.</div>
        ) : (
          events.slice(0, 5).map((ev) => {
            const isStreak = ev.event_type === "streak";
            const isTier = ev.event_type === "tier_up";
            const isChamp = ev.event_type === "champion";

            return (
              <div
                key={ev.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 transition hover:border-brand/30 dark:border-white/5 dark:bg-white/[0.02]"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    {isStreak ? (
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                    ) : isTier || isChamp ? (
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <Swords className="h-3.5 w-3.5 text-brand" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {ev.message}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-bold text-slate-400">
                  {formatRelativeTime(ev.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default BattleLiveFeed;
