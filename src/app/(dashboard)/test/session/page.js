"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getQuestions } from "@/lib/questions";
import Logo from "@/components/Logo";
import { createTestSession } from "@/services/testSessions";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { updateGoalProgress } from "@/utils/updateGoalProgress";
import { updateStreak } from "@/utils/streak";
import { useStrictExamMode } from "@/hooks/useStrictExamMode";
import { calculateQuestionScore } from "@/lib/analyticsHelpers";

const LETTERS = ["A", "B", "C", "D"];

// --- UI Helper Icons ---
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const MinusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);
const TargetIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
  </svg>
);

function TestSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const [exam, setExam] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // 1. Extract URL Parameters
  const durationParam = Number(searchParams.get("duration")) || 30;
  const countParam = Number(searchParams.get("count")) || 20;
  const mode = searchParams.get("mode") || "custom";
  const subjectParam = searchParams.get("subjects") || searchParams.get("subject") || "Mixed Subjects";
  const chapterParam = searchParams.get("chapters") || searchParams.get("chapter") || "All Chapters";
  const difficultyParam = searchParams.get("difficulty") || "Mixed";

  // 2. State Management
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(durationParam * 60);
  const [attemptId, setAttemptId] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const timerRef = useRef(null);
  const submitRef = useRef(null);

  // Apply Strict Exam Mode while the session is active and not finishing
  useStrictExamMode(!finishing && questions.length > 0);

  useEffect(() => {
    async function loadExam() {
      if (!user) return;
      const { data } = await supabase
        .from("user_profiles")
        .select("exam")
        .eq("clerk_user_id", user.id)
        .single();
      setExam(data?.exam || "JEE");
    }
    loadExam();
  }, [user]);

  // 3. Initialize the Test Pool
  useEffect(() => {
    async function loadQuestions() {
      if (!exam) return;
      try {
        const fetched = await getQuestions({
          exam: exam === "NEET" ? "NEET" : "JEE Main",
          subject: subjectParam,
          chapter: chapterParam,
          difficulty: difficultyParam,
          limit: countParam,
        });

        if (!fetched.length) {
          alert("No questions found.");
          return;
        }

        const shuffled = [...fetched].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setTimeLeft(durationParam * 60);

        if (user) {
          const session = await createTestSession({
            userId: user.id,
            exam: exam === "NEET" ? "NEET" : "JEE Main",
            subjects: [subjectParam],
            chapters: [chapterParam],
            difficulty: difficultyParam,
            questions: shuffled,
            duration: durationParam,
          });
          setSessionId(session.id);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load questions.");
      }
    }
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectParam, difficultyParam, countParam, durationParam, user, exam]);

  async function handleSubmit() {
    if (finishing) return;
    setFinishing(true);
    try {
      let correct = 0;
      const attempted = Object.keys(answers).length;
      let wrong = 0;
      let score = 0;
      let totalMarks = 0;

      questions.forEach((question) => {
        const result = calculateQuestionScore(question, answers[question.id], exam);
        totalMarks += result.maxScore;
        score += result.scoreDelta;

        if (result.isCorrect) {
          correct += 1;
        } else if (result.attempted) {
          wrong += 1;
        }
      });

      const { data: attempt, error } = await supabase
        .from("test_attempts")
        .insert({
          user_id: user.id,
          session_id: sessionId || crypto.randomUUID(),
          score: score,
          total_marks: totalMarks,
          correct_answers: correct,
          wrong_answers: wrong,
          attempted,
          total_questions: questions.length,
          duration_minutes: Number(searchParams.get("duration")) || 15,
          time_taken_seconds: durationParam * 60 - timeLeft,
        })
        .select()
        .single();

      if (error) throw error;
      setAttemptId(attempt.id);

      const answerRows = questions.map((q) => ({
        attempt_id: attempt.id,
        question_id: q.id,
        selected_option:
          answers[q.id] !== undefined ? ["A", "B", "C", "D"][answers[q.id]] : null,
        is_correct: answers[q.id] === q.correct,
      }));

      const { error: answerError } = await supabase
        .from("user_answers")
        .insert(answerRows);

      if (answerError) throw answerError;

      await updateGoalProgress(user.id, "TEST", 1);
      await updateStreak(user.id);

      const xpResponse = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "test",
          correctAnswers: correct,
          totalQuestions: questions.length,
        }),
      });

      const xpData = await xpResponse.json();
//       console.log("TEST XP UPDATED 👉", xpData);

      router.replace(`/test/result/${attempt.id}`);
      clearInterval(timerRef.current);
    } catch (err) {
      console.error("SAVE ERROR 👉", err);
      alert(err.message);
      setFinishing(false);
    }
  }

  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  // 4. Timer Logic
  useEffect(() => {
    if (questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [questions.length, finishing]);

  // 5. Handlers
  const handleSelect = (qId, optIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  // 6. Formatting
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const isTimerDanger = timeLeft < 300;
  const activeQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Loading State
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="flex flex-col items-center gap-4 animate-slideUp">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500 animate-spin" />
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Generating Test...
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {subjectParam} · {countParam} questions · {durationParam} min
          </p>
        </div>
      </div>
    );
  }

  // Active Test UI
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/50 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo size={28} />
            <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700" />
            <span className="hidden sm:block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {mode === "quick" ? "Quick Session" : "Custom Test"}
            </span>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black tabular-nums text-sm transition-all duration-300 ${
              isTimerDanger
                ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 shadow-sm shadow-rose-500/10"
                : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-700/50"
            }`}
          >
            {isTimerDanger && <span className="animate-pulse">⏳</span>}
            {formatTime(timeLeft)}
          </div>

          {/* Progress + Submit */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {answeredCount}/{questions.length}
              </span>
              <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
            >
              Submit Test
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Question Palette ── */}
        <aside className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/50 p-5 h-fit lg:sticky lg:top-24 shadow-sm animate-slideUp">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Question Palette
            </p>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isActive = currentIdx === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`aspect-square rounded-xl text-sm font-bold flex items-center justify-center transition-all duration-200 cursor-pointer
                      ${isActive ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#0f172a] scale-110" : ""}
                      ${
                        isAnswered
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                          : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/50 hover:border-indigo-500/30 dark:hover:border-indigo-500/30"
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20" />
                Answered
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50" />
                Unvisited
              </div>
            </div>
          </div>
        </aside>

        {/* ── Question Content ── */}
        <section className="lg:col-span-3 flex flex-col order-1 lg:order-2">
          <div className="flex-1 bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/50 p-6 sm:p-8 shadow-sm animate-slideUp" style={{ animationDelay: "75ms" }}>
            {/* Question meta */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                {activeQ.subject}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {activeQ.chapter}
              </span>
            </div>

            {/* Question text */}
            <p className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white leading-relaxed mb-8">
              {activeQ.text}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {activeQ.options.map((opt, idx) => {
                const isSelected = answers[activeQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(activeQ.id, idx)}
                    className={`group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer
                      ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm shadow-indigo-500/10"
                          : "bg-white/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-700/50 hover:border-indigo-500/40 dark:hover:border-indigo-500/30 text-slate-700 dark:text-slate-300 hover:-translate-y-0.5"
                      }`}
                  >
                    <span
                      className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-sm font-black border-2 transition-all duration-200
                        ${
                          isSelected
                            ? "border-indigo-500 bg-gradient-to-br from-indigo-500 to-violet-500 text-white"
                            : "border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 group-hover:border-indigo-500/40"
                        }`}
                    >
                      {LETTERS[idx]}
                    </span>
                    <span className="text-base font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Clear selection */}
            {answers[activeQ.id] !== undefined && (
              <button
                onClick={() => {
                  const newAnswers = { ...answers };
                  delete newAnswers[activeQ.id];
                  setAnswers(newAnswers);
                }}
                className="mt-4 text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between animate-slideUp" style={{ animationDelay: "150ms" }}>
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-6 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl font-bold text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              ← Previous
            </button>
            <button
              onClick={() =>
                setCurrentIdx((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
              disabled={currentIdx === questions.length - 1}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
            >
              Save & Next →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function TestSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500 animate-spin" />
        </div>
      }
    >
      <TestSessionContent />
    </Suspense>
  );
}
