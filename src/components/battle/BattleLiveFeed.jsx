"use client";

import { useCallback, useEffect, useState } from "react";
import { Crown, Flame, Swords, Trophy, Radio } from "lucide-react";
import { useClerkSupabase } from "@/lib/useClerkSupabase";

function sanitizeMessage(msg) {
  if (!msg) return "";
  return String(msg)
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "")
    .trim();
}

function formatRelativeTime(dateStr, now) {
  if (!dateStr) return "Just now";
  const sec = Math.max(0, Math.floor(((now || Date.now()) - new Date(dateStr).getTime()) / 1000));
  if (sec < 4) return "Just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function BattleLiveFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const supabase = useClerkSupabase();

  /* eslint-disable react-hooks/set-state-in-effect */
  // 1-second live clock update so timestamps tick in real time (e.g. 5s ago, 12s ago...)
  useEffect(() => {
    setNow(Date.now());
    const clockInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const loadFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/battle/feed");
      const json = await res.json();
      if (json.events) {
        setEvents(json.events);
      }
    } catch (err) {
      console.error("Failed to load live feed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Initial load + 6s polling fallback
  useEffect(() => {
    loadFeed();
    const interval = setInterval(loadFeed, 6000);
    return () => clearInterval(interval);
  }, [loadFeed]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Realtime Supabase subscription for instant live events
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("arena_live_feed_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "battle_events" },
        (payload) => {
          if (payload.new) {
            setEvents((prev) => {
              const exists = prev.some((e) => e.id === payload.new.id);
              if (exists) return prev;
              return [{ ...payload.new, isNew: true }, ...prev.slice(0, 14)];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "battle_matches", filter: "status=eq.FINISHED" },
        () => {
          loadFeed();
        }
      )
      .on(
        "broadcast",
        { event: "arena_event" },
        (payload) => {
          if (payload.payload) {
            setEvents((prev) => {
              const exists = prev.some((e) => e.id === payload.payload.id);
              if (exists) return prev;
              return [{ ...payload.payload, isNew: true }, ...prev.slice(0, 14)];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadFeed]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-[var(--border-subtle)]">
        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          Live Arena Feed
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <Radio className="h-3 w-3 animate-pulse text-emerald-500" />
          Realtime
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        {loading && events.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading live arena feed...</div>
        ) : events.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No recent arena battles yet.</div>
        ) : (
          events.slice(0, 5).map((ev) => {
            const isStreak = ev.event_type === "streak";
            const isTier = ev.event_type === "tier_up";
            const isChamp = ev.event_type === "champion";

            return (
              <div
                key={ev.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 transition hover:border-brand/30 dark:border-white/5 dark:bg-white/[0.02] animate-in fade-in duration-300"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    {isStreak ? (
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                    ) : isTier ? (
                      <Crown className="h-3.5 w-3.5 text-amber-500" />
                    ) : isChamp ? (
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <Swords className="h-3.5 w-3.5 text-brand" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate inline-flex items-center gap-1.5">
                    <span>{sanitizeMessage(ev.message)}</span>
                    {isStreak && <Flame className="h-3 w-3 text-amber-500 shrink-0 inline" />}
                    {isTier && <Crown className="h-3 w-3 text-amber-500 shrink-0 inline" />}
                    {isChamp && <Trophy className="h-3 w-3 text-amber-400 shrink-0 inline" />}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-bold text-slate-400 tabular-nums">
                  {formatRelativeTime(ev.created_at, now)}
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

