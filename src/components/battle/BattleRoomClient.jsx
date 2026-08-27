"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession, useUser } from "@clerk/nextjs";
import { ArrowLeft, ArrowRight, Check, Clock, Loader2, RotateCcw, Trophy } from "lucide-react";
import { OptionContentRenderer, QuestionContentRenderer } from "@/components/questions/QuestionRenderer";
import { useClerkSupabase } from "@/lib/useClerkSupabase";

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
  if (!startedAt || !completedAt) return "In progress";
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

function ResultPanel({ battle, userId, onRematch, rematchMessage, reviewOpen, setReviewOpen }) {
  const me = getMe(battle, userId);
  const opponent = getOpponent(battle, userId);
  const rows = [me, opponent].filter(Boolean);
  const resultText = !battle.winner_user_id
    ? "Draw"
    : battle.winner_user_id === userId
      ? "You won"
      : "Battle complete";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-[var(--border-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand">Battle Complete</p>
            <h1 className="mt-1 text-3xl font-black font-display text-slate-950 dark:text-white">{resultText}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {me?.profile.displayName} vs {opponent?.profile.displayName || "Opponent"}
            </p>
          </div>
          <Trophy className="h-8 w-8 text-brand" />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-[var(--border-subtle)]">
                <th className="py-3 font-black">Student</th>
                <th className="py-3 font-black">Score</th>
                <th className="py-3 font-black">Correct</th>
                <th className="py-3 font-black">Wrong</th>
                <th className="py-3 font-black">Skipped</th>
                <th className="py-3 font-black">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[var(--border-subtle)]">
              {rows.map((player) => (
                <tr key={player.user_id}>
                  <td className="py-4">
                    <p className="font-black text-slate-950 dark:text-white">{player.profile.displayName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">@{player.profile.username}</p>
                  </td>
                  <td className="py-4 text-lg font-black font-display text-slate-950 dark:text-white">{player.score}</td>
                  <td className="py-4 text-emerald-600 dark:text-emerald-300">{player.correct_count}</td>
                  <td className="py-4 text-rose-500">{player.wrong_count}</td>
                  <td className="py-4 text-slate-500">{player.skipped_count}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-300">{formatElapsed(battle.started_at, player.completed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setReviewOpen(!reviewOpen)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand dark:border-[var(--border-subtle)] dark:text-slate-200"
          >
            Review Questions
          </button>
          <button
            type="button"
            onClick={onRematch}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand dark:border-[var(--border-subtle)] dark:text-slate-200"
          >
            <RotateCcw className="h-4 w-4" />
            Rematch
          </button>
          <Link href="/dashboard" className="rounded-lg bg-brand px-4 py-2 text-sm font-black text-slate-950">
            Back to Dashboard
          </Link>
        </div>
        {rematchMessage && <p className="mt-3 text-sm font-semibold text-brand">{rematchMessage}</p>}
      </div>

      {reviewOpen && (
        <div className="mt-5 space-y-3">
          {battle.questions.map((question, index) => (
            <div key={question.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Question {index + 1}</p>
              <QuestionContentRenderer question={question} legacyText={question.question} legacyImage={question.question_image} />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Correct answer: {question.correct_option || question.numerical_answer || (question.correct_options || []).join(", ") || "Available in explanation"}
              </p>
              {question.explanation && (
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{question.explanation}</p>
              )}
            </div>
          ))}
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
    const fallback = setInterval(() => loadBattle().catch(() => {}), 5000);
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
      // Polling still keeps the room authoritative.
    }
  }

  async function saveAnswer(question, value) {
    if (!question || hasFinished || battle?.status !== "ACTIVE") return;
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
    if (!window.confirm("Finish your battle attempt? You cannot change answers after finishing.")) return;
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
      setRematchMessage("Rematch request sent as a new challenge.");
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
        <div className="rounded-xl border border-rose-300/40 bg-rose-50 p-5 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>
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

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/battle" className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:text-slate-900 dark:border-[var(--border-subtle)] dark:text-slate-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{battle.exam} Battle</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
              <span className="font-black text-slate-950 dark:text-white">You</span>
              <span className="text-slate-400">vs</span>
              <span className="font-black text-slate-950 dark:text-white">{opponent?.profile.displayName || "Opponent"}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-md border border-slate-200 px-3 py-1.5 font-bold text-slate-700 dark:border-[var(--border-subtle)] dark:text-slate-200">
            You {me?.answeredCount || 0}/10
          </span>
          <span className="rounded-md border border-slate-200 px-3 py-1.5 font-bold text-slate-700 dark:border-[var(--border-subtle)] dark:text-slate-200">
            Opponent {opponent?.answeredCount || 0}/10
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border border-brand/30 bg-brand/10 px-3 py-1.5 font-black text-slate-800 dark:text-brand">
            <Clock className="h-4 w-4" />
            {formatClock(elapsed)}
          </span>
        </div>
      </div>

      {hasFinished && (
        <div className="mb-4 rounded-lg border border-brand/30 bg-brand/10 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Your attempt is submitted. Waiting for the opponent to finish.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-amber-300/50 bg-amber-100/60 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-brand/30 dark:bg-brand/10 dark:text-brand">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] lg:sticky lg:top-20">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Palette</p>
            {saving && <Loader2 className="h-4 w-4 animate-spin text-brand" />}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {(battle.questions || []).map((question, index) => {
              const active = index === currentIdx;
              const answered = answers[question.id] !== undefined && answers[question.id] !== null;
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentIdx(index)}
                  className={cx(
                    "aspect-square rounded-md border text-sm font-black transition",
                    active
                      ? "border-brand bg-brand text-slate-950"
                      : answered
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "border-slate-200 bg-white text-slate-500 hover:border-brand/50 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-slate-300"
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-2 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-[var(--border-subtle)] dark:text-slate-400">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-brand" />Current</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-emerald-300 bg-emerald-50 dark:bg-emerald-500/10" />Answered</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-slate-200 bg-white dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]" />Not answered</div>
          </div>
        </aside>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6 lg:p-8">
          {currentQuestion && (
            <>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-[var(--border-subtle)]">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Question {currentIdx + 1} of {battle.questions.length}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {currentQuestion.subject}{currentQuestion.chapter ? ` · ${currentQuestion.chapter}` : ""}
                  </p>
                </div>
                <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-500 dark:border-[var(--border-subtle)] dark:text-slate-400">
                  +4 / -1
                </span>
              </div>

              <QuestionContentRenderer
                question={currentQuestion}
                legacyText={currentQuestion.question}
                legacyImage={currentQuestion.question_image}
                className="text-base leading-8 sm:text-lg"
              />

              {String(currentQuestion.question_type || "").toLowerCase().includes("numerical") ? (
                <div className="mt-6 max-w-xl">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Numerical answer</label>
                  <input
                    defaultValue={answers[currentQuestion.id] || ""}
                    disabled={hasFinished}
                    onBlur={(event) => saveAnswer(currentQuestion, event.target.value.trim())}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 outline-none transition focus:border-brand dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-white"
                    placeholder="Enter answer"
                  />
                </div>
              ) : (
                <div className="mt-6 space-y-2.5">
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
                          "group flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70 sm:px-4",
                          selected
                            ? "border-brand bg-brand/10 text-slate-950 dark:text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-brand/50 hover:bg-slate-50 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-300 dark:hover:bg-[var(--surface-elevated)]/45"
                        )}
                      >
                        <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-sm font-black", selected ? "border-brand bg-brand text-slate-950" : "border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400")}>
                          {letter}
                        </span>
                        <OptionContentRenderer option={optionText} fallbackText={optionText} fallbackImage={optionImage} optionId={letter} className="text-sm font-medium sm:text-base" />
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentIdx((index) => Math.max(0, index - 1))}
                  disabled={currentIdx === 0}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-40 dark:border-[var(--border-subtle)] dark:text-slate-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                <div className="flex gap-2">
                  {currentIdx < battle.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIdx((index) => Math.min(battle.questions.length - 1, index + 1))}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-brand-hover"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={finishBattle}
                      disabled={finishing || hasFinished}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
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
