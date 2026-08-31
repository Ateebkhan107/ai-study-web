"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

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

function CustomSwordsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M19 21l2-2" />
      <path d="M9.5 6.5L21 18v3h-3L6.5 9.5" />
      <path d="M5 5l1.5 1.5" />
    </svg>
  );
}

function RadarIcon(props) {
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2v20" />
        <path d="M2 12h20" />
        <circle cx="12" cy="12" r="10" />
      </svg>
      <div className="absolute inset-0 rounded-full border-2 border-brand/50 animate-ping" />
      <div className="absolute top-1/2 left-1/2 w-1/2 h-[2px] bg-brand origin-left animate-spin-slow" />
    </div>
  );
}

function HourglassIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cx("animate-pulse", props.className)} {...props}>
      <path d="M5 22h14" />
      <path d="M5 2h14" />
      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
      <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
      <path d="M12 12v3" className="animate-bounce" />
    </svg>
  );
}

// Simple CountUp hook
function useCountUp(endValue, durationMs = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime = null;
    let animationFrame;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percent = Math.min(progress / durationMs, 1);
      // ease out cubic
      const ease = 1 - Math.pow(1 - percent, 3);
      setCount(Math.floor(ease * endValue));
      if (percent < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [endValue, durationMs]);
  return count;
}

function ScoreComparison({ scoreString }) {
  const [myStr, oppStr] = (scoreString || "0 - 0").split(" - ");
  const myScore = parseInt(myStr, 10) || 0;
  const oppScore = parseInt(oppStr, 10) || 0;
  
  const animatedMy = useCountUp(myScore);
  const animatedOpp = useCountUp(oppScore);

  const total = Math.max(myScore + oppScore, 1);
  const myPercent = (myScore / total) * 100;
  
  return (
    <div className="flex w-32 flex-col gap-1.5 sm:w-40">
      <div className="flex justify-between text-xs font-black">
        <span className="text-slate-900 dark:text-white">{animatedMy}</span>
        <span className="text-slate-500 dark:text-slate-400">{animatedOpp}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/50">
        <div 
          className="h-full bg-brand transition-all duration-1000 ease-out" 
          style={{ width: `${myPercent}%` }}
        />
      </div>
    </div>
  );
}

function ChallengeRow({ challenge, onRespond }) {
  const incoming = challenge.direction === "incoming";
  
  let accent = "border-l-brand";
  let statusColor = "text-amber-600 bg-amber-50 dark:bg-brand/10 dark:text-brand";
  if (challenge.status === "ACCEPTED" || challenge.status === "MATCHED") {
    accent = "border-l-emerald-500";
    statusColor = "text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400";
  } else if (challenge.status === "DECLINED") {
    accent = "border-l-rose-500";
    statusColor = "text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400";
  } else if (!incoming) {
    accent = "border-l-slate-400";
    statusColor = "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300";
  }

  return (
    <div className={cx(
      "relative flex animate-in slide-in-from-right-4 fade-in duration-300 items-center justify-between gap-3 rounded-r-xl border-y border-r border-slate-200 border-l-[4px] bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-y-[var(--border-subtle)] dark:border-r-[var(--border-subtle)] dark:bg-[var(--surface)]",
      accent
    )}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">
          <p className={cx("truncate text-xl text-slate-900 dark:text-white", "font-display")}>
            {challenge.opponent.displayName}
          </p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {incoming ? "Challenged you" : "You challenged"}
          </p>
        </div>
      </div>
      {incoming && challenge.status === "PENDING" ? (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onRespond(challenge.id, "decline")}
            className="rounded-md px-2 py-1.5 text-xs font-bold text-slate-400 transition hover:text-rose-500"
          >
            DECLINE
          </button>
          <button
            type="button"
            onClick={() => onRespond(challenge.id, "accept")}
            className="rounded-md bg-brand px-3 py-1.5 text-xs font-black text-slate-950 shadow-sm transition hover:bg-brand-hover"
          >
            ACCEPT
          </button>
        </div>
      ) : (
        <span className={cx("shrink-0 rounded px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em]", statusColor)}>
          {challenge.status}
        </span>
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
      posthog.capture("battle_matchmaking_started", {
        exam: profile?.exam,
        matched_immediately: Boolean(data.status === "matched" && data.battleId),
      });
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
      posthog.capture("battle_challenge_sent", {
        exam: searchedUser.exam,
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
      posthog.capture("battle_challenge_responded", {
        response: action,
        match_created: Boolean(data.battleId),
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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
      {/* HERO SECTION - Real VS Matchup */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.84))] shadow-sm dark:border-[var(--border-subtle)] dark:bg-[linear-gradient(180deg,#181818,#141414)]">
        <div className="absolute inset-x-0 top-0 h-px bg-brand/35" aria-hidden="true" />
        
        <div className="hidden sm:block px-4 pt-5 pb-4 sm:px-6 sm:pt-7 sm:pb-6">
          <div className="inline-flex items-center gap-2 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-brand">
            <CustomSwordsIcon className="h-3.5 w-3.5" />
            Battle Arena
          </div>
          <h1 className={cx("mt-3 text-3xl tracking-wide text-slate-950 dark:text-white sm:text-5xl lg:text-6xl uppercase", "font-display")}>
            PrepZii 1v1 Arena
          </h1>
          <p className="mt-1 text-sm leading-6 font-semibold text-slate-600 dark:text-slate-400 max-w-2xl">
            Same paper set. Same exam track. A focused head-to-head sprint for serious {profile?.exam || "JEE"} practice.
          </p>
        </div>
        
        {/* Mobile Header Title */}
        <div className="sm:hidden px-4 pt-4 pb-2 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-brand">
            <CustomSwordsIcon className="h-3 w-3" />
            Battle Arena
          </div>
        </div>

        {/* Fight Card Split */}
        <div className="relative flex w-full flex-row sm:mt-2 sm:border-t border-slate-200 dark:border-slate-800">
           {/* Divider (Diagonal slash) */}
           <div className={cx(
             "absolute left-1/2 top-0 z-20 hidden sm:flex h-full w-14 -translate-x-1/2 skew-x-[-15deg] items-center justify-center border-x-4 border-slate-50 dark:border-[#141414] transition-colors duration-500",
             queueStatus === "queued" ? "bg-brand/80 shadow-[0_0_25px_rgba(245,181,0,0.6)] animate-pulse" : "bg-brand"
           )}>
             <span className={cx("skew-x-[15deg] text-3xl text-slate-950 shadow-sm", "font-display")}>VS</span>
           </div>
           
           <div className={cx(
             "absolute left-1/2 top-1/2 z-20 flex sm:hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[2.5px] border-slate-50 dark:border-[#141414] transition-colors duration-500",
             queueStatus === "queued" ? "bg-brand/80 shadow-[0_0_15px_rgba(245,181,0,0.6)] animate-pulse" : "bg-brand"
           )}>
             <span className={cx("text-sm text-slate-950", "font-display")}>VS</span>
           </div>

           {/* Left Side (Player) */}
           <div className="relative w-1/2 bg-slate-100 p-3 sm:px-10 sm:py-12 dark:bg-[#111]">
             <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">
               <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-brand">You</span>
               <span className={cx("mt-0.5 sm:mt-1 text-sm sm:text-4xl text-slate-900 dark:text-white uppercase truncate w-full", "font-display")}>
                 <span className="sm:hidden">{initials(profile?.full_name || profile?.fullName)}</span>
                 <span className="hidden sm:inline">{profile?.full_name || profile?.fullName || "Student"}</span>
               </span>
               <span className="text-[10px] sm:text-sm font-semibold text-slate-500">@{profile?.username}</span>
             </div>
           </div>
           
           {/* Right Side (Opponent) */}
           <div className="relative w-1/2 bg-slate-50 p-3 sm:px-10 sm:py-12 dark:bg-[#0a0a0a] flex flex-col items-center sm:items-end text-center sm:text-right">
             <div className={cx("relative z-10 flex flex-col items-center sm:items-end w-full", queueStatus === "queued" ? "animate-pulse" : "")}>
               <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Opponent</span>
               <span className={cx("mt-0.5 sm:mt-1 text-sm sm:text-4xl text-slate-300 dark:text-slate-600 uppercase truncate w-full", "font-display")}>
                 <span className="sm:hidden">{queueStatus === "queued" ? "Wait" : "?"}</span>
                 <span className="hidden sm:inline">{queueStatus === "queued" ? "SEARCHING..." : "OPEN SLOT"}</span>
               </span>
               <span className="text-[10px] sm:text-sm font-semibold text-slate-400/80 leading-tight">
                 <span className="sm:hidden">{queueStatus === "queued" ? "Searching..." : "Ready"}</span>
                 <span className="hidden sm:inline">{queueStatus === "queued" ? "Awaiting a worthy opponent" : "Waiting for a challenger"}</span>
               </span>
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
        <div className="mt-5 rounded-xl border border-brand/35 bg-brand/10 p-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Choose a username from Profile before entering Battle Arena.
        </div>
      )}

      {/* UTILITY PANELS */}
      <section className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-4">
          
          {/* Find Opponent (Primary CTA) */}
          <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-brand px-4 py-5 sm:px-8 sm:py-10 shadow-sm transition hover:shadow-md">
            {/* Background radar/reticle graphic */}
            <div className="pointer-events-none absolute -right-8 -top-8 sm:-right-10 sm:-top-10 text-amber-500/20 dark:text-amber-600/20 transition-transform duration-700 ease-out group-hover:scale-110">
              <RadarIcon className="h-28 w-28 sm:h-56 sm:w-56" />
            </div>
            
            <div className="relative z-10 flex flex-col items-start">
              <h2 className={cx("text-xl sm:text-4xl text-slate-950 uppercase tracking-wide", "font-display")}>Find Opponent</h2>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-semibold text-amber-900/90 max-w-xs sm:max-w-sm">Enter the queue for a same-track {profile?.exam || "JEE"} matchup.</p>
              
              <div className="mt-4 sm:mt-8 w-full max-w-xs">
                {queueStatus === "queued" ? (
                  <div className="space-y-2 sm:space-y-3">
                    <div className="rounded-lg sm:rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-sm">
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black text-slate-950">
                        <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                        SEARCHING...
                      </div>
                    </div>
                    {waitedLongEnough && (
                      <p className="text-[11px] sm:text-sm font-semibold text-amber-900/80">Taking a bit longer than usual...</p>
                    )}
                    <div className="flex gap-2">
                      <button type="button" onClick={leaveQueue} className="flex-1 rounded-lg sm:rounded-xl bg-slate-950/10 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold text-slate-900 transition hover:bg-slate-950/20">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={findOpponent}
                    disabled={busy || !profile?.username}
                    className="group/btn relative overflow-hidden flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-slate-950 px-3 py-3 sm:px-4 sm:py-4 text-xs sm:text-sm font-black text-brand shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                      {busy ? <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" /> : <CustomSwordsIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                      Start Matchmaking
                    </span>
                    <div className="absolute inset-0 w-0 bg-white/10 transition-all duration-500 ease-out group-hover/btn:w-full" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Challenge by Username (Secondary) */}
          <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
            <h2 className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Direct Challenge</h2>
            
            <form onSubmit={searchUsername} className="sm:mt-3 flex flex-row gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 sm:left-3.5 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter @username"
                  className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-900 outline-none transition focus:border-brand focus:bg-white dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-white dark:focus:border-brand dark:focus:bg-[var(--surface-elevated)]"
                />
              </div>
              <button type="submit" disabled={busy} className="rounded-lg sm:rounded-xl bg-slate-100 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-[#1a1a1a] dark:text-slate-300 dark:hover:bg-[#222]">
                <span className="hidden sm:inline">Lookup</span>
                <span className="sm:hidden">Find</span>
              </button>
            </form>
            {searchedUser && (
              <div className="mt-4 flex animate-in fade-in slide-in-from-bottom-2 duration-300 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/50">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-700 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-200">
                    {initials(searchedUser.displayName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950 dark:text-white">{searchedUser.displayName}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">@{searchedUser.username} · {searchedUser.exam}</p>
                  </div>
                </div>
                <button type="button" onClick={sendChallenge} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-brand-hover transition">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  Challenge
                </button>
              </div>
            )}
            {searchMessage && <p className="mt-3 text-xs font-semibold text-brand animate-in fade-in">{searchMessage}</p>}
          </div>
        </div>

        {/* Pending Challenges Feed */}
        <aside className={cx("flex flex-col gap-3", !challenges.length ? "hidden sm:flex" : "")}>
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">
            <HourglassIcon className="h-4 w-4 text-brand" />
            Live Feed
          </h2>
          <div className="flex flex-col gap-2.5">
            {challenges.length ? (
              challenges.slice(0, 5).map((challenge) => (
                <ChallengeRow key={challenge.id} challenge={challenge} onRespond={respondToChallenge} />
              ))
            ) : (
              <div className="rounded-xl border-l-[4px] border-l-slate-300 border-y border-r border-slate-200 bg-slate-50/50 p-5 dark:border-l-slate-700 dark:border-y-[var(--border-subtle)] dark:border-r-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No active challenges.</p>
                <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">Incoming requests and sent challenges will appear here.</p>
              </div>
            )}
          </div>
        </aside>
      </section>

      {/* MATCH HISTORY AS SCORECARDS */}
      {/* MATCH HISTORY AS SCORECARDS */}
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-black font-display text-slate-950 dark:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-brand">
              <path d="M8 21h8" />
              <path d="M12 17v4" />
              <path d="M7 4h10" />
              <path d="M7 4c0 3.314-2.686 6-6 6v3c0 3.866 3.134 7 7 7h8c3.866 0 7-3.134 7-7v-3c-3.314 0-6-2.686-6-6" />
            </svg>
            Recent Battles
          </h2>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Match History</span>
        </div>
        
        <div className="mt-3 sm:mt-6 flex flex-col gap-0 sm:gap-3">
          {history.length ? (
            <>
              {history.map((item, idx) => (
                <div key={item.id} className={cx(
                  "relative overflow-hidden sm:border border-slate-200 sm:bg-slate-50/50 py-3 sm:py-4 px-1 sm:px-5 transition hover:border-slate-300 dark:border-[var(--border-subtle)] sm:dark:bg-[var(--surface-elevated)]/30 sm:hover:border-slate-700 sm:rounded-lg",
                  idx !== history.length - 1 ? "border-b" : "",
                  idx >= 3 ? "hidden sm:block" : ""
                )}>
                  {/* Ticket Cutouts */}
                  <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-r border-slate-200 bg-white dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] hidden sm:block" />
                  <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-l border-slate-200 bg-white dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] hidden sm:block" />

                  {/* Desktop Layout */}
                  <div className="hidden sm:grid gap-4 sm:grid-cols-[minmax(0,1.2fr)_auto_auto] sm:items-center sm:px-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-200">
                        {initials(item.opponent.displayName)}
                      </div>
                      <div className="min-w-0">
                        <p className={cx("truncate text-xl text-slate-900 dark:text-white", "font-display")}>{item.opponent.displayName}</p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">@{item.opponent.username || "student"} · {formatDate(item.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:justify-center">
                       <ScoreComparison scoreString={item.score} />
                    </div>

                    <div className="flex sm:justify-end">
                      <div className={cx(
                        "inline-flex items-center justify-center border-[2.5px] px-2.5 py-0.5 text-sm font-black uppercase tracking-widest",
                        item.result === "Won" ? "border-brand text-brand shadow-[0_0_10px_rgba(245,181,0,0.2)] rotate-[-2deg]" 
                        : item.result === "Lost" ? "border-rose-500 text-rose-500 rotate-[3deg] opacity-90"
                        : "border-slate-400 text-slate-400 rotate-[-1deg]"
                      )}>
                        {item.result}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="flex sm:hidden items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[120px]">{item.opponent.displayName}</span>
                      <span className={cx("text-[10px] font-black px-1.5 py-0.5 rounded", item.result === "Won" ? "bg-amber-100 text-amber-700 dark:bg-brand/20 dark:text-brand" : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-500")}>
                        {item.result === "Won" ? "W" : "L"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[13px] font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{item.score}</span>
                      <span className="text-slate-400">{formatDate(item.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {history.length > 3 && (
                <button type="button" className="sm:hidden mt-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition py-2 text-center w-full">
                  View all battles ({history.length})
                </button>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Your battle history will appear here after your first completed match.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
