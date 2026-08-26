"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Loader2, Search, Send, Shield, Swords, Trophy, UserRound, X } from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function formatDate(value) {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short" }).format(new Date(value));
}

function ChallengeRow({ challenge, onRespond }) {
  const incoming = challenge.direction === "incoming";
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-200 py-3 first:border-t-0 dark:border-[var(--border-subtle)]">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {challenge.opponent.displayName}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          @{challenge.opponent.username || "student"} · {incoming ? "challenged you" : "pending"}
        </p>
      </div>
      {incoming && challenge.status === "PENDING" ? (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onRespond(challenge.id, "decline")}
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:text-rose-500 dark:border-[var(--border-subtle)]"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => onRespond(challenge.id, "accept")}
            className="rounded-md bg-brand px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-brand-hover"
          >
            Accept
          </button>
        </div>
      ) : (
        <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">{challenge.status}</span>
      )}
    </div>
  );
}

export default function BattleArenaClient() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [queueStatus, setQueueStatus] = useState("idle");
  const [queueStartedAt, setQueueStartedAt] = useState(null);
  const [username, setUsername] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchMessage, setSearchMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [waitedLongEnough, setWaitedLongEnough] = useState(false);

  const refreshBasics = useCallback(async function refreshBasics() {
    const [profileData, historyData, challengeData, queueData] = await Promise.all([
      fetchJson("/api/profile"),
      fetchJson("/api/battle/history"),
      fetchJson("/api/battle/challenges"),
      fetchJson("/api/battle/queue"),
    ]);

    setProfile(profileData);
    setHistory(historyData.history || []);
    setChallenges(challengeData.challenges || []);
    setQueueStatus(queueData.status || "idle");
    if (queueData.status === "matched" && queueData.battleId) router.push(`/battle/${queueData.battleId}`);
  }, [router]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    refreshBasics()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshBasics]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const interval = setInterval(() => {
      refreshBasics().catch(() => {});
    }, queueStatus === "queued" ? 2500 : 6000);
    return () => clearInterval(interval);
  }, [queueStatus, refreshBasics]);

  useEffect(() => {
    if (queueStatus !== "queued" || !queueStartedAt) return;
    const timeout = setTimeout(() => setWaitedLongEnough(true), 15000);
    return () => clearTimeout(timeout);
  }, [queueStartedAt, queueStatus]);

  async function findOpponent() {
    setBusy(true);
    setError("");
    try {
      const data = await fetchJson("/api/battle/queue", { method: "POST" });
      if (data.status === "matched" && data.battleId) {
        router.push(`/battle/${data.battleId}`);
        return;
      }
      setQueueStatus("queued");
      setQueueStartedAt(Date.now());
      setWaitedLongEnough(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function leaveQueue() {
    await fetchJson("/api/battle/queue", { method: "DELETE" }).catch(() => {});
    setQueueStatus("idle");
    setQueueStartedAt(null);
    setWaitedLongEnough(false);
  }

  async function searchUsername(e) {
    e.preventDefault();
    const query = username.trim().replace(/^@/, "");
    if (!query) return;
    setBusy(true);
    setSearchedUser(null);
    setSearchMessage("");
    try {
      const data = await fetchJson(`/api/battle/challenges?username=${encodeURIComponent(query)}`);
      if (!data.user) {
        setSearchMessage("No student found with that username.");
      } else {
        setSearchedUser(data.user);
      }
    } catch (err) {
      setSearchMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function sendChallenge() {
    if (!searchedUser?.username) return;
    setBusy(true);
    setError("");
    try {
      await fetchJson("/api/battle/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: searchedUser.username }),
      });
      setSearchMessage("Challenge sent.");
      await refreshBasics();
    } catch (err) {
      setSearchMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function respondToChallenge(id, action) {
    setBusy(true);
    try {
      const data = await fetchJson(`/api/battle/challenges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (data.battleId) {
        router.push(`/battle/${data.battleId}`);
        return;
      }
      await refreshBasics();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-brand">
            <Swords className="h-3.5 w-3.5" />
            Battle Arena
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">1v1 Question Battle</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Ten shared questions, same exam track, server-scored results. Competitive practice without turning PrepZii into an arcade.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {["10 Questions", "Mixed Chapters", profile?.exam || "JEE", "~12 min"].map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center font-semibold text-slate-700 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-amber-300/50 bg-amber-100/60 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-brand/30 dark:bg-brand/10 dark:text-brand">
          {error}
        </div>
      )}

      {!profile?.username && (
        <div className="mb-5 rounded-xl border border-brand/35 bg-brand/10 p-4 text-sm text-slate-700 dark:text-slate-200">
          Choose a username from Profile before entering Battle Arena.
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.6fr)]">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Find Opponent</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Match with the first available {profile?.exam || "JEE"} student.</p>
              </div>
              <div className="rounded-lg border border-brand/25 bg-brand/10 p-2 text-brand">
                <Shield className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6">
              {queueStatus === "queued" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <Loader2 className="h-4 w-4 animate-spin text-brand" />
                    Searching for an opponent
                  </div>
                  {waitedLongEnough && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No opponent found yet.</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={findOpponent} className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-slate-950">Keep Searching</button>
                    <button type="button" onClick={leaveQueue} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-[var(--border-subtle)] dark:text-slate-300">Stop</button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={findOpponent}
                  disabled={busy || !profile?.username}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
                  Find Opponent
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Challenge by Username</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Search a classmate by @username and send a direct challenge.</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-2 text-slate-500 dark:border-[var(--border-subtle)] dark:text-slate-300">
                <Search className="h-5 w-5" />
              </div>
            </div>
            <form onSubmit={searchUsername} className="mt-5 flex gap-2">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-brand dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-white"
              />
              <button type="submit" disabled={busy} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand dark:border-[var(--border-subtle)] dark:text-slate-200">
                Search
              </button>
            </form>
            {searchedUser && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950 dark:text-white">{searchedUser.displayName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">@{searchedUser.username} · {searchedUser.exam}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {(searchedUser.stats?.wins || 0)}W · {(searchedUser.stats?.losses || 0)}L
                  </p>
                </div>
                <button type="button" onClick={sendChallenge} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-black text-slate-950">
                  <Send className="h-3.5 w-3.5" />
                  Challenge
                </button>
              </div>
            )}
            {searchMessage && <p className="mt-3 text-sm font-semibold text-brand">{searchMessage}</p>}
          </div>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
            <Clock className="h-4 w-4 text-brand" />
            Challenges
          </h2>
          <div className="mt-4">
            {challenges.length ? (
              challenges.slice(0, 5).map((challenge) => (
                <ChallengeRow key={challenge.id} challenge={challenge} onRespond={respondToChallenge} />
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500 dark:border-[var(--border-subtle)] dark:text-slate-400">
                No pending challenges yet.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
          <Trophy className="h-4 w-4 text-brand" />
          Recent Battles
        </h2>
        <div className="mt-3 divide-y divide-slate-200 dark:divide-[var(--border-subtle)]">
          {history.length ? history.map((item) => (
            <div key={item.id} className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900 dark:text-white">{item.opponent.displayName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">@{item.opponent.username || "student"}</p>
              </div>
              <span className={cx("font-black", item.result === "Won" ? "text-emerald-600 dark:text-emerald-300" : item.result === "Lost" ? "text-slate-500" : "text-brand")}>{item.result}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{item.score}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(item.date)}</span>
            </div>
          )) : (
            <p className="py-6 text-sm text-slate-500 dark:text-slate-400">Your battle history will appear here after your first completed match.</p>
          )}
        </div>
      </section>
    </main>
  );
}
