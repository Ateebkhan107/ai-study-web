"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { Volume2, VolumeX, Mic, MicOff, Flame, Trophy, Shield, Swords, Users, RefreshCw } from "lucide-react";
import { getSoundEnabled, setSoundEnabled, getVoiceEnabled, setVoiceEnabled, unlockAudioContext } from "@/lib/battleAudio";
import BattleMatchmakingModal from "./BattleMatchmakingModal";
import BattleLeaderboard from "./BattleLeaderboard";
import BattleLiveFeed from "./BattleLiveFeed";
import BattleChampionCelebration from "./BattleChampionCelebration";
import { StarsBackground } from "@/components/ui/stars-background";


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
          <p className={cx("truncate text-lg text-slate-900 dark:text-white", "font-display")}>
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
            className="rounded-md px-2.5 py-1.5 text-xs font-bold text-slate-400 transition hover:text-rose-500"
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
  const [username, setUsername] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchMessage, setSearchMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Audio Toggles
  const [soundOn, setSoundOn] = useState(() => getSoundEnabled());
  const [voiceOn, setVoiceOn] = useState(() => getVoiceEnabled());

  // Matchmaking Modal State
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [matchedData, setMatchedData] = useState(null);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    unlockAudioContext();
  }

  function toggleVoice() {
    const next = !voiceOn;
    setVoiceOn(next);
    setVoiceEnabled(next);
    unlockAudioContext();
  }

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

    if (queueData.status === "matched" && queueData.battleId) {
      setMatchedData({ battleId: queueData.battleId, opponent: queueData.opponent });
      setMatchModalOpen(true);
    }
  }, []);

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
    }, queueStatus === "queued" || matchModalOpen ? 2500 : 8000);
    return () => clearInterval(interval);
  }, [queueStatus, matchModalOpen, refreshBasics]);

  async function findOpponent() {
    unlockAudioContext();
    setBusy(true);
    setError("");
    setMatchModalOpen(true);
    try {
      const data = await fetchJson("/api/battle/queue", { method: "POST" });
      posthog.capture("battle_matchmaking_started", {
        exam: profile?.exam,
        matched_immediately: Boolean(data.status === "matched" && data.battleId),
      });

      if (data.status === "matched" && data.battleId) {
        setMatchedData({ battleId: data.battleId, opponent: data.opponent });
      } else {
        setQueueStatus("queued");
      }
    } catch (err) {
      setError(err.message);
      setMatchModalOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function leaveQueue() {
    await fetchJson("/api/battle/queue", { method: "DELETE" }).catch(() => {});
    setQueueStatus("idle");
    setMatchModalOpen(false);
    setMatchedData(null);
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
    unlockAudioContext();
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
        setMatchedData({ battleId: data.battleId, opponent: null });
        setMatchModalOpen(true);
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

  const myRating = profile?.arena_rating || 1000;
  const myStreak = profile?.win_streak || 0;
  const myTier = profile?.tier || { name: "Bronze", icon: "🛡️" };

  return (
    <main className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Ambient Arena Stars Background */}
      <StarsBackground className="pointer-events-none -z-10 opacity-60" />
      
      {/* Monthly Champion Celebration Pop-up */}
      <BattleChampionCelebration />

      {/* Matchmaking VS & Countdown Modal */}
      <BattleMatchmakingModal
        isOpen={matchModalOpen}
        profile={{ ...profile, arena_rating: myRating }}
        matchedData={matchedData}
        onCancel={leaveQueue}
      />

      {/* HEADER CONTROLS (Title + Sound & Voice Toggles) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-brand">
            <CustomSwordsIcon className="h-3.5 w-3.5" />
            Battle Arena
          </div>
          <h1 className={cx("mt-2 text-3xl sm:text-5xl uppercase tracking-tight text-slate-950 dark:text-white", "font-display")}>
            PrepZii 1v1 Arena
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
            Realtime 10-question sprint on {profile?.exam || "JEE"} track.
          </p>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
          <button
            type="button"
            onClick={toggleSound}
            title={soundOn ? "Sound Effects Enabled" : "Sound Muted"}
            className={cx(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition",
              soundOn
                ? "bg-brand/15 text-brand"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
            )}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">SFX</span>
          </button>

          <button
            type="button"
            onClick={toggleVoice}
            title={voiceOn ? "Arena Announcer Enabled" : "Announcer Muted"}
            className={cx(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition",
              voiceOn
                ? "bg-brand/15 text-brand"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
            )}
          >
            {voiceOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            <span className="hidden sm:inline">Voice</span>
          </button>
        </div>
      </div>

      {/* FIGHT CARD HERO BANNER */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.84))] shadow-sm dark:border-[var(--border-subtle)] dark:bg-[linear-gradient(180deg,#181818,#141414)]">
        <div className="absolute inset-x-0 top-0 h-px bg-brand/35" aria-hidden="true" />

        <div className="relative flex w-full flex-row">
          {/* Center VS Emblem */}
          <div className="absolute left-1/2 top-1/2 z-20 flex h-10 w-10 sm:h-14 sm:w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand border-4 border-slate-50 dark:border-[#141414] shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            <span className={cx("text-sm sm:text-xl font-black text-slate-950", "font-display")}>VS</span>
          </div>

          {/* Left Player Side (You) */}
          <div className="relative w-1/2 bg-slate-100 p-4 sm:px-10 sm:py-8 dark:bg-[#111] flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">YOU</span>
            <span className={cx("mt-1 text-base sm:text-3xl text-slate-900 dark:text-white uppercase truncate w-full", "font-display")}>
              {profile?.full_name || profile?.fullName || "Student"}
            </span>
            <span className="text-xs text-slate-500 font-semibold">@{profile?.username}</span>

            {/* Elo Rating & Tier Badge */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-brand/40 bg-brand/10 px-2.5 py-0.5 text-xs font-black text-brand font-display">
                {myRating} Elo
              </span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold text-slate-400">
                {myTier.icon} {myTier.name}
              </span>
              {myStreak >= 2 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-black text-amber-500">
                  <Flame className="h-3 w-3" /> {myStreak} Streak
                </span>
              )}
            </div>
          </div>

          {/* Right Opponent Side */}
          <div className="relative w-1/2 bg-slate-50 p-4 sm:px-10 sm:py-8 dark:bg-[#0a0a0a] flex flex-col items-center sm:items-end text-center sm:text-right">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">OPPONENT</span>
            <span className={cx("mt-1 text-base sm:text-3xl text-slate-400 dark:text-slate-600 uppercase truncate w-full", "font-display")}>
              {queueStatus === "queued" ? "SEARCHING..." : "OPEN SLOT"}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {queueStatus === "queued" ? "Matching opponent..." : "Waiting for battle"}
            </span>
            <div className="mt-3">
              <span className="rounded-md border border-dashed border-slate-300 dark:border-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                Live matchmaking
              </span>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-amber-300/50 bg-amber-100/60 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-brand/30 dark:bg-brand/10 dark:text-brand">
          {error}
        </div>
      )}

      {/* PRIMARY ACTIONS & LIVE FEED GRID */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        
        {/* Left Column: Matchmaking CTA & Direct Challenge */}
        <div className="space-y-6">
          
          {/* Start Matchmaking Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-brand p-6 sm:p-8 shadow-sm transition hover:shadow-md">
            <div className="pointer-events-none absolute -right-6 -top-6 text-amber-500/20 dark:text-amber-600/20 transition-transform duration-700 ease-out group-hover:scale-110">
              <RadarIcon className="h-36 w-36 sm:h-48 sm:w-48" />
            </div>

            <div className="relative z-10">
              <span className="rounded-md bg-slate-950/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-950">
                1v1 Ranked Match
              </span>
              <h2 className={cx("mt-2 text-2xl sm:text-4xl text-slate-950 uppercase tracking-wide", "font-display")}>
                Find Opponent
              </h2>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-amber-950/80 max-w-sm">
                Compete against a fellow {profile?.exam || "JEE"} aspirant for Arena Elo rating points.
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={findOpponent}
                  disabled={busy}
                  className="rounded-full bg-slate-950 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-md hover:bg-slate-900 transition active:scale-95 disabled:opacity-50"
                >
                  Start Matchmaking
                </button>
              </div>
            </div>
          </div>

          {/* Direct Challenge Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
            <h3 className={cx("text-lg font-black text-slate-900 dark:text-white uppercase", "font-display")}>
              Direct Challenge
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Challenge a friend or classmate by their username.
            </p>

            <form onSubmit={searchUsername} className="mt-4 flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter @username"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-white"
              />
              <button
                type="submit"
                disabled={busy || !username.trim()}
                className="rounded-xl bg-slate-900 dark:bg-white dark:text-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-800 transition disabled:opacity-40"
              >
                Find
              </button>
            </form>

            {searchMessage && (
              <p className="mt-2 text-xs font-bold text-brand">{searchMessage}</p>
            )}

            {searchedUser && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-brand/30 bg-brand/10 p-3">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{searchedUser.displayName}</p>
                  <p className="text-xs text-slate-400">@{searchedUser.username} · {searchedUser.exam}</p>
                </div>
                <button
                  type="button"
                  onClick={sendChallenge}
                  disabled={busy}
                  className="rounded-lg bg-brand px-3.5 py-1.5 text-xs font-black uppercase text-slate-950 hover:bg-brand-hover transition"
                >
                  Challenge
                </button>
              </div>
            )}

            {/* Pending Challenges List */}
            {challenges.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Challenges</p>
                {challenges.map((c) => (
                  <ChallengeRow key={c.id} challenge={c} onRespond={respondToChallenge} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Feed & Battle History */}
        <div className="space-y-6">
          <BattleLiveFeed />

          {/* Recent Battle History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
            <h3 className={cx("text-base font-black text-slate-900 dark:text-white uppercase mb-3", "font-display")}>
              Your Recent Battles
            </h3>

            {history.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No battle history yet.</p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 5).map((h) => {
                  const won = h.result === "Won";
                  return (
                    <div
                      key={h.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-white/5 dark:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-2">
                        <span className={cx(
                          "rounded-md px-2 py-0.5 text-[10px] font-black uppercase",
                          won ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}>
                          {h.result}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          vs @{h.opponent.username || "Opponent"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black font-display text-slate-900 dark:text-white">{h.score}</span>
                        <span className="block text-[10px] text-slate-400">{formatDate(h.date)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MONTHLY SEASONS LEADERBOARD */}
      <section className="pt-2">
        <BattleLeaderboard />
      </section>
    </main>
  );
}
