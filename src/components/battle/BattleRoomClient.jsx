"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Flame,
  Loader2,
  RotateCcw,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { OptionContentRenderer, QuestionContentRenderer } from "@/components/questions/QuestionRenderer";
import { useClerkSupabase } from "@/lib/useClerkSupabase";
import {
  getSoundEnabled,
  getVoiceEnabled,
  playAnswerSelect,
  playDefeatChime,
  playTimerWarning,
  playVictoryFanfare,
  setSoundEnabled,
  speakAnnouncer,
  unlockAudioContext,
} from "@/lib/battleAudio";
import { StarsBackground } from "@/components/ui/stars-background";


const LETTERS = ["A", "B", "C", "D"];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function normalizeOption(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return null;
  return value;
}

function formatElapsed(startedAt, completedAt) {
  if (!startedAt || !completedAt) return "—";
  const seconds = Math.max(0, Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function formatClock(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function getOpponent(battle, userId) {
  return battle?.players?.find((player) => player.user_id !== userId) || null;
}

function getMe(battle, userId) {
  return battle?.players?.find((player) => player.user_id === userId) || null;
}

function answerMatches(selected, optionId) {
  if (Array.isArray(selected)) return selected.includes(optionId);
  return selected === optionId;
}

function ResultPanel({
  battle,
  userId,
  onRematch,
  rematchMessage,
  reviewOpen,
  setReviewOpen,
}) {
  const router = useRouter();
  const me = getMe(battle, userId);
  const opponent = getOpponent(battle, userId);
  const soundPlayedRef = useRef(false);

  const isWinner = battle.winner_user_id === userId;
  const isDraw = !battle.winner_user_id;

  useEffect(() => {
    if (!soundPlayedRef.current) {
      soundPlayedRef.current = true;
      if (isWinner) {
        playVictoryFanfare();
        speakAnnouncer("Victory");
      } else if (!isDraw) {
        playDefeatChime();
        speakAnnouncer("Defeat");
      }
    }
  }, [isWinner, isDraw]);

  const ratingChange = me?.rating_change ?? 0;
  const ratingBefore = me?.rating_before ?? me?.arena_rating ?? 1000;
  const ratingAfter = me?.rating_after ?? ratingBefore + ratingChange;

  const totalQuestions = (battle.question_ids || []).length || 10;
  const mySeconds = me?.completed_at && battle.started_at
    ? Math.max(1, Math.round((new Date(me.completed_at).getTime() - new Date(battle.started_at).getTime()) / 1000))
    : 0;
  const avgResponseTime = mySeconds ? (mySeconds / totalQuestions).toFixed(1) : "—";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10 animate-in fade-in zoom-in-95 duration-300">
      
      {/* MAIN RESULT CARD */}
      <div className={cx(
        "relative overflow-hidden rounded-3xl border p-6 sm:p-10 shadow-2xl text-center",
        isWinner
          ? "border-brand/60 bg-[linear-gradient(180deg,#1c1808,#121212)] shadow-brand/15"
          : isDraw
          ? "border-slate-700 bg-[linear-gradient(180deg,#181818,#101010)]"
          : "border-rose-500/30 bg-[linear-gradient(180deg,#1c0d0d,#121212)]"
      )}>
        {/* Subtle Stars Background */}
        <StarsBackground className="pointer-events-none -z-10 opacity-70" />
        
        {/* Glow backdrop */}
        <div className={cx(
          "pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-30",
          isWinner ? "bg-brand" : isDraw ? "bg-slate-400" : "bg-rose-500"
        )} />

        <div className="relative z-10 flex flex-col items-center">
          
          {/* Outcome Emblem */}
          <div className={cx(
            "mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-black uppercase tracking-[0.2em]",
            isWinner
              ? "border border-brand/40 bg-brand/15 text-brand"
              : isDraw
              ? "border border-slate-600 bg-slate-800 text-slate-300"
              : "border border-rose-500/40 bg-rose-500/15 text-rose-400"
          )}>
            {isWinner ? <Trophy className="h-3.5 w-3.5" /> : <Swords className="h-3.5 w-3.5" />}
            {isWinner ? "Match Victory" : isDraw ? "Match Draw" : "Defeat"}
          </div>

          <h1 className={cx(
            "text-4xl sm:text-7xl font-black font-display uppercase tracking-tight",
            isWinner ? "text-white" : isDraw ? "text-slate-200" : "text-white"
          )}>
            {isWinner ? "Victory" : isDraw ? "Draw" : "Defeat"}
          </h1>

          {/* Large Score Comparison */}
          <div className="mt-4 flex items-center justify-center gap-6 sm:gap-10">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-widest text-brand">YOU</p>
              <p className="text-4xl sm:text-6xl font-black font-display text-white mt-0.5">{me?.score ?? 0}</p>
            </div>
            <span className="text-2xl sm:text-4xl font-black text-slate-600 font-display">—</span>
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">{opponent?.profile?.displayName || "OPPONENT"}</p>
              <p className="text-4xl sm:text-6xl font-black font-display text-slate-400 mt-0.5">{opponent?.score ?? 0}</p>
            </div>
          </div>

          {/* Elo Rating Change Pill */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 backdrop-blur-sm">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Arena Rating:</span>
            <span className="text-lg font-black font-display text-white">{ratingAfter} Elo</span>
            <span className={cx(
              "rounded-lg px-2.5 py-0.5 text-xs font-black",
              ratingChange > 0
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : ratingChange < 0
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "bg-white/10 text-slate-300"
            )}>
              {ratingChange >= 0 ? `+${ratingChange}` : ratingChange} Elo
            </span>
            {me?.win_streak >= 2 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-xs font-black text-amber-400">
                <Flame className="h-3.5 w-3.5" /> {me.win_streak} Streak
              </span>
            )}
          </div>

          {/* Stat Summary Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Correct</p>
              <p className="text-xl font-black font-display text-emerald-400 mt-1">{me?.correct_count ?? 0}/{totalQuestions}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Wrong</p>
              <p className="text-xl font-black font-display text-rose-400 mt-1">{me?.wrong_count ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Avg Time</p>
              <p className="text-xl font-black font-display text-white mt-1">{avgResponseTime}s</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Time</p>
              <p className="text-xl font-black font-display text-white mt-1">{formatElapsed(battle.started_at, me?.completed_at)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={onRematch}
              className="flex-1 min-w-[130px] rounded-xl bg-brand py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md hover:bg-brand-hover transition active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Rematch
            </button>
            <button
              type="button"
              onClick={() => router.push("/battle")}
              className="flex-1 min-w-[130px] rounded-xl border border-white/20 bg-white/10 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-white/15 transition active:scale-95"
            >
              Find New Match
            </button>
            <button
              type="button"
              onClick={() => setReviewOpen(!reviewOpen)}
              className="w-full rounded-xl border border-white/10 bg-transparent py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:border-brand/40 transition"
            >
              {reviewOpen ? "Hide Review" : "Review Answers"}
            </button>
          </div>

          {rematchMessage && (
            <p className="mt-3 text-xs font-bold text-brand animate-pulse">{rematchMessage}</p>
          )}
        </div>
      </div>

      {/* DETAILED QUESTION REVIEW */}
      {reviewOpen && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-black font-display text-white uppercase tracking-wide">
            Question Review & Solutions
          </h3>
          {battle.questions.map((question, index) => {
            const myAnswer = battle.answers?.[question.id];
            const isCorrect = myAnswer === question.correct_option;
            return (
              <div
                key={question.id}
                className={cx(
                  "rounded-2xl border p-5 sm:p-6 bg-[#141414]",
                  isCorrect ? "border-emerald-500/30" : "border-rose-500/30"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Question {index + 1}
                  </span>
                  <span className={cx(
                    "rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase",
                    isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                  )}>
                    {isCorrect ? "Correct (+4)" : myAnswer ? "Incorrect (-1)" : "Skipped (0)"}
                  </span>
                </div>

                <QuestionContentRenderer
                  question={question}
                  legacyText={question.question}
                  legacyImage={question.question_image}
                  className="text-sm sm:text-base leading-7"
                />

                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <span className="text-slate-400">Your Answer: <strong className={isCorrect ? "text-emerald-400" : "text-rose-400"}>{myAnswer || "None"}</strong></span>
                  <span className="text-slate-400">Correct Answer: <strong className="text-emerald-400">{question.correct_option || question.numerical_answer || "N/A"}</strong></span>
                </div>

                {question.explanation && (
                  <div className="mt-3 rounded-xl bg-white/[0.03] p-3.5 text-xs leading-6 text-slate-300">
                    <strong className="block text-[10px] font-black uppercase tracking-wider text-brand mb-1">Explanation</strong>
                    {question.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BattleRoomClient({ battleId }) {
  const { user } = useUser();
  const { isLoaded, session } = useSession();
  const supabase = useClerkSupabase();
  const channelRef = useRef(null);
  const [battle, setBattle] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rematchMessage, setRematchMessage] = useState("");

  const [soundOn, setSoundOn] = useState(() => getSoundEnabled());

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    unlockAudioContext();
  }

  const userId = user?.id;
  const currentQuestion = battle?.questions?.[currentIdx];
  const me = getMe(battle, userId);
  const opponent = getOpponent(battle, userId);
  const hasFinished = Boolean(me?.completed_at);

  const loadBattle = useCallback(async () => {
    const data = await fetchJson(`/api/battle/matches/${battleId}`);
    setBattle(data.battle);
    setAnswers(data.battle.answers || {});
    if (data.battle.started_at) {
      setElapsed(Math.max(0, Math.round((Date.now() - new Date(data.battle.started_at).getTime()) / 1000)));
    }
  }, [battleId]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadBattle()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loadBattle]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!battle?.started_at || battle.status === "FINISHED") return;
    const timer = setInterval(() => {
      setElapsed(Math.max(0, Math.round((Date.now() - new Date(battle.started_at).getTime()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [battle?.started_at, battle?.status]);

  // Realtime Supabase broadcast & table synchronization
  useEffect(() => {
    if (!battleId || !isLoaded || !session || !supabase) return;
    let cancelled = false;

    async function subscribe() {
      const token = await session.getToken().catch(() => null);
      if (!token || cancelled) return;
      await supabase.realtime.setAuth(token);
      if (cancelled) return;

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channel = supabase
        .channel(`battle-${battleId}`)
        .on("broadcast", { event: "progress" }, () => {
          loadBattle().catch(() => {});
        })
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "battle_matches", filter: `id=eq.${battleId}` },
          () => loadBattle().catch(() => {})
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "battle_players", filter: `battle_id=eq.${battleId}` },
          () => loadBattle().catch(() => {})
        )
        .subscribe();

      channelRef.current = channel;
    }

    subscribe();
    const fallback = setInterval(() => loadBattle().catch(() => {}), 4000);
    return () => {
      cancelled = true;
      clearInterval(fallback);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [battleId, isLoaded, loadBattle, session, supabase]);

  async function broadcastProgress() {
    try {
      await channelRef.current?.send({
        type: "broadcast",
        event: "progress",
        payload: { battleId },
      });
    } catch {
      // Fallback polling keeps state authoritative
    }
  }

  async function saveAnswer(question, value) {
    if (!question || hasFinished || battle?.status !== "ACTIVE") return;
    playAnswerSelect();
    setSaving(true);
    setError("");
    setAnswers((previous) => ({ ...previous, [question.id]: value }));
    try {
      await fetchJson(`/api/battle/matches/${battleId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, selectedAnswer: value }),
      });
      await broadcastProgress();
      await loadBattle();
    } catch (err) {
      setError(err.message);
      await loadBattle().catch(() => {});
    } finally {
      setSaving(false);
    }
  }

  function selectOption(question, optionId) {
    const type = String(question.question_type || "MCQ").toLowerCase();
    if (type.includes("multiple")) {
      const current = Array.isArray(answers[question.id]) ? answers[question.id] : [];
      const next = current.includes(optionId)
        ? current.filter((item) => item !== optionId)
        : [...current, optionId].sort();
      saveAnswer(question, next);
      return;
    }
    saveAnswer(question, optionId);
  }

  async function finishBattle() {
    if (!window.confirm("Finish and submit your battle answers?")) return;
    setFinishing(true);
    setError("");
    try {
      const data = await fetchJson(`/api/battle/matches/${battleId}/finish`, { method: "POST" });
      setBattle(data.battle);
      await broadcastProgress();
    } catch (err) {
      setError(err.message);
    } finally {
      setFinishing(false);
    }
  }

  async function requestRematch() {
    setRematchMessage("");
    try {
      await fetchJson(`/api/battle/matches/${battleId}/rematch`, { method: "POST" });
      setRematchMessage("Rematch challenge sent!");
    } catch (err) {
      setRematchMessage(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error && !battle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-300">{error}</div>
      </div>
    );
  }

  if (battle?.status === "FINISHED") {
    return (
      <ResultPanel
        battle={battle}
        userId={userId}
        onRematch={requestRematch}
        rematchMessage={rematchMessage}
        reviewOpen={reviewOpen}
        setReviewOpen={setReviewOpen}
      />
    );
  }

  const myAnswered = Object.keys(answers).length;
  const totalQuestions = (battle?.questions || []).length || 10;
  const oppAnswered = opponent?.answeredCount || 0;

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 lg:px-8 space-y-4">
      
      {/* ARENA BATTLE HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
        
        {/* Matchup & Opponent Live State */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/battle"
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:text-slate-900 dark:border-[var(--border-subtle)] dark:text-slate-400 dark:hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand">{battle.exam} 1v1 Arena</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[9px] font-black text-emerald-400 uppercase">Live</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-black text-slate-900 dark:text-white">You</span>
              <span className="text-xs text-slate-400">vs</span>
              <span className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[140px]">
                {opponent?.profile?.displayName || "Opponent"}
              </span>
            </div>
          </div>
        </div>

        {/* Live Counters, Timer & Audio */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Opponent Progress Badge */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-white/5 dark:bg-white/5 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Opponent: {oppAnswered}/{totalQuestions}
          </div>

          {/* Player Progress Badge */}
          <div className="rounded-xl border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-black text-brand">
            You: {myAnswered}/{totalQuestions}
          </div>

          {/* Clock */}
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
            <Clock className="h-3.5 w-3.5 text-brand" />
            {formatClock(elapsed)}
          </div>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-white dark:border-white/10"
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {hasFinished && (
        <div className="rounded-xl border border-brand/40 bg-brand/10 p-3.5 text-xs sm:text-sm font-semibold text-brand text-center animate-pulse">
          Your answers have been submitted. Waiting for opponent to complete the battle.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-amber-300 bg-amber-100 p-3 text-xs font-semibold text-amber-900 dark:border-brand/30 dark:bg-brand/10 dark:text-brand">
          {error}
        </div>
      )}

      {/* QUESTION ARENA GRID */}
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        
        {/* Question Palette Sidebar */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] lg:sticky lg:top-20 h-fit">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Questions</span>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />}
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {(battle.questions || []).map((q, index) => {
              const active = index === currentIdx;
              const answered = answers[q.id] !== undefined && answers[q.id] !== null;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(index)}
                  className={cx(
                    "aspect-square rounded-lg border text-xs font-black transition",
                    active
                      ? "border-brand bg-brand text-slate-950 shadow-sm"
                      : answered
                      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-brand/40 dark:border-white/5 dark:bg-white/5 dark:text-slate-300"
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-[10px] font-bold text-slate-400">
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-brand" /> Current</div>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-emerald-500/20 border border-emerald-500/40" /> Answered</div>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-white/5 border border-white/10" /> Unanswered</div>
          </div>
        </aside>

        {/* Question Reading & Answer Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
          {currentQuestion && (
            <>
              {/* Question Header */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-white/5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand">
                    Question {currentIdx + 1} of {battle.questions.length}
                  </span>
                  <p className="text-xs font-bold text-slate-400">
                    {currentQuestion.subject}{currentQuestion.chapter ? ` · ${currentQuestion.chapter}` : ""}
                  </p>
                </div>
                <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[11px] font-black text-slate-400 dark:border-white/10">
                  +4 / -1
                </span>
              </div>

              {/* Question Statement */}
              <QuestionContentRenderer
                question={currentQuestion}
                legacyText={currentQuestion.question}
                legacyImage={currentQuestion.question_image}
                className="text-base sm:text-lg leading-8"
              />

              {/* Options */}
              {String(currentQuestion.question_type || "").toLowerCase().includes("numerical") ? (
                <div className="mt-6 max-w-md">
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">Numerical Value</label>
                  <input
                    defaultValue={answers[currentQuestion.id] || ""}
                    disabled={hasFinished}
                    onBlur={(event) => saveAnswer(currentQuestion, event.target.value.trim())}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 outline-none transition focus:border-brand dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Enter answer"
                  />
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {LETTERS.map((letter) => {
                    const optionText = currentQuestion[`option_${letter.toLowerCase()}`];
                    const optionImage = currentQuestion[`option_${letter.toLowerCase()}_image`];
                    if (!optionText && !optionImage) return null;
                    const selected = answerMatches(normalizeOption(answers[currentQuestion.id]), letter);
                    return (
                      <button
                        key={letter}
                        type="button"
                        disabled={hasFinished}
                        onClick={() => selectOption(currentQuestion, letter)}
                        className={cx(
                          "group flex w-full items-start gap-3 rounded-xl border p-3.5 sm:p-4 text-left transition disabled:cursor-not-allowed",
                          selected
                            ? "border-brand bg-brand/10 text-white shadow-sm"
                            : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-brand/40 hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-200 dark:hover:bg-white/5"
                        )}
                      >
                        <span className={cx(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-black transition",
                          selected ? "border-brand bg-brand text-slate-950" : "border-slate-300 text-slate-400 dark:border-slate-700"
                        )}>
                          {letter}
                        </span>
                        <OptionContentRenderer
                          option={optionText}
                          fallbackText={optionText}
                          fallbackImage={optionImage}
                          optionId={letter}
                          className="text-sm sm:text-base font-medium"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Navigation & Submit */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  disabled={currentIdx === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black uppercase text-slate-500 hover:text-white disabled:opacity-30 dark:border-white/10 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Prev
                </button>

                <div className="flex gap-2">
                  {currentIdx < battle.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIdx((i) => Math.min(battle.questions.length - 1, i + 1))}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-6 py-2.5 text-xs font-black uppercase text-slate-950 hover:bg-brand-hover transition active:scale-95"
                    >
                      Next <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={finishBattle}
                      disabled={finishing || hasFinished}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-6 py-2.5 text-xs font-black uppercase text-slate-950 hover:bg-brand-hover transition active:scale-95 disabled:opacity-50"
                    >
                      {finishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Finish Battle
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
