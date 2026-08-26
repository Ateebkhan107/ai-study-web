"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2, Search, Send, Swords, Trophy, UserRound } from "lucide-react";

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

function initials(name) {
  return String(name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "S";
}

function PlayerSlot({ label, name, username, exam, placeholder = false }) {
  return (
    <div className={cx(
      "flex min-w-0 items-center gap-3 rounded-xl border px-3 py-3 sm:px-4",
      placeholder
        ? "border-dashed border-slate-300/80 bg-slate-50/70 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30"
        : "border-slate-200 bg-white/85 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]"
    )}>
      <div className={cx(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-sm font-black",
        placeholder
          ? "border-slate-300 text-slate-400 dark:border-slate-700 dark:text-slate-500"
          : "border-brand/35 bg-brand/10 text-brand"
      )}>
        {placeholder ? <UserRound className="h-5 w-5" /> : initials(name)}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-black text-slate-950 dark:text-white sm:text-base">{name}</p>
        <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
          {placeholder ? "Waiting for a challenger" : `@${username || "username"} · ${exam || "JEE"}`}
        </p>
      </div>
    </div>
  );
}

function ChallengeRow({ challenge, onRespond }) {
  const incoming = challenge.direction === "incoming";
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/70 px-3 py-3 transition hover:border-brand/40 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/35">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand/25 bg-brand/10 text-xs font-black text-brand">
          {initials(challenge.opponent.displayName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-900 dark:text-white">
            {challenge.opponent.displayName}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            @{challenge.opponent.username || "student"} · {incoming ? "incoming challenge" : "challenge sent"}
          </p>
        </div>
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
        <span className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-slate-500 dark:border-[var(--border-subtle)] dark:text-slate-400">{challenge.status}</span>
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
    const profileData = await fetchJson("/api/profile");
    setProfile(profileData);

    if (!profileData?.username) {
      setHistory([]);
      setChallenges([]);
      setQueueStatus("idle");
      setError("");
      return;
    }

    const [historyData, challengeData, queueData] = await Promise.all([
      fetchJson("/api/battle/history"),
      fetchJson("/api/battle/challenges"),
      fetchJson("/api/battle/queue"),
    ]);

    setHistory(historyData.history || []);
    setChallenges(challengeData.challenges || []);
    setQueueStatus(queueData.status || "idle");
    setError("");
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
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.84))] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[linear-gradient(180deg,#181818,#141414)] sm:p-6 lg:p-7">
        <div className="absolute inset-x-0 top-0 h-px bg-brand/35" aria-hidden="true" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-brand">
              <Swords className="h-3.5 w-3.5" />
              Battle Arena
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              PrepZii 1v1 Arena
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Same paper set. Same exam track. A focused head-to-head sprint for serious JEE/NEET practice.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-black uppercase tracking-[0.11em] text-slate-500 dark:text-slate-400">
              {["10 Questions", "Mixed Chapters", profile?.exam || "JEE", "~12 min"].map((item, index) => (
                <span key={item} className="inline-flex items-center gap-3">
                  {index > 0 && <span className="h-1 w-1 rounded-full bg-brand/70" />}
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full max-w-xl">
            <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_80px_minmax(0,1fr)]">
              <PlayerSlot
                label="You"
                name={profile?.full_name || profile?.fullName || "Student"}
                username={profile?.username}
                exam={profile?.exam || "JEE"}
              />
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand/40 bg-brand/10 text-brand shadow-[0_0_0_8px_rgba(245,181,0,0.04)] motion-safe:animate-pulse">
                <span className="text-lg font-black tracking-tight">VS</span>
              </div>
              <PlayerSlot label="Opponent" name="Open Slot" placeholder />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-5 rounded-lg border border-amber-300/50 bg-amber-100/60 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-brand/30 dark:bg-brand/10 dark:text-brand">
          {error}
        </div>
      )}

      {!profile?.username && (
        <div className="mt-5 rounded-xl border border-brand/35 bg-brand/10 p-4 text-sm text-slate-700 dark:text-slate-200">
          Choose a username from Profile before entering Battle Arena.
        </div>
      )}

      <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.62fr)]">
        <div className="grid gap-4 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-xl border border-brand/25 bg-brand/[0.07] p-5 shadow-sm dark:bg-brand/[0.08]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Find Opponent</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">Enter the queue for a same-track {profile?.exam || "JEE"} matchup.</p>
              </div>
              <div className="rounded-lg border border-brand/30 bg-brand/10 p-2 text-brand">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6">
              {queueStatus === "queued" ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-brand/25 bg-white/60 px-3 py-3 dark:bg-[var(--surface)]/70">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-100">
                      <Loader2 className="h-4 w-4 animate-spin text-brand" />
                      Searching for an opponent
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">We’ll move both players to the same room when a match is ready.</p>
                  </div>
                  {waitedLongEnough && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No opponent found yet.</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={findOpponent} className="rounded-lg bg-brand px-4 py-2 text-sm font-black text-slate-950 shadow-sm transition hover:bg-brand-hover">Keep Searching</button>
                    <button type="button" onClick={leaveQueue} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-[var(--border-subtle)] dark:text-slate-300">Stop</button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={findOpponent}
                  disabled={busy || !profile?.username}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3.5 text-sm font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
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
                <h2 className="text-lg font-black text-slate-950 dark:text-white">Challenge by Username</h2>
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
              <button type="submit" disabled={busy} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand disabled:opacity-50 dark:border-[var(--border-subtle)] dark:text-slate-200">
                Search
              </button>
            </form>
            {searchedUser && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 dark:bg-[var(--surface-elevated)]/50">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-700 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-200">
                    {initials(searchedUser.displayName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950 dark:text-white">{searchedUser.displayName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">@{searchedUser.username} · {searchedUser.exam}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {(searchedUser.stats?.wins || 0)}W · {(searchedUser.stats?.losses || 0)}L
                    </p>
                  </div>
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
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
                <Clock className="h-4 w-4 text-brand" />
                Pending Challenges
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Incoming and outgoing battle requests.</p>
            </div>
          </div>
          <div className="mt-4">
            {challenges.length ? (
              <div className="space-y-2">
                {challenges.slice(0, 5).map((challenge) => (
                  <ChallengeRow key={challenge.id} challenge={challenge} onRespond={respondToChallenge} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-slate-50 px-4 py-5 dark:bg-[var(--surface-elevated)]/35">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No challenges waiting.</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search a username or start random matchmaking.</p>
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
            <Trophy className="h-4 w-4 text-brand" />
            Recent Battles
          </h2>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Match History</span>
        </div>
        <div className="mt-4 divide-y divide-slate-200 dark:divide-[var(--border-subtle)]">
          {history.length ? history.map((item) => (
            <div key={item.id} className="grid gap-3 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-700 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-slate-200">
                  {initials(item.opponent.displayName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-900 dark:text-white">{item.opponent.displayName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">@{item.opponent.username || "student"}</p>
                </div>
              </div>
              <span className={cx("w-fit rounded-md px-2 py-1 text-xs font-black uppercase tracking-[0.08em]", item.result === "Won" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : item.result === "Lost" ? "bg-slate-100 text-slate-500 dark:bg-[var(--surface-elevated)] dark:text-slate-400" : "bg-brand/10 text-brand")}>{item.result}</span>
              <span className="font-black text-slate-800 dark:text-slate-100">{item.score}</span>
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
