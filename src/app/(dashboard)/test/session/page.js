"use client";

import { memo, useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { useUser } from "@clerk/nextjs";
import { useStrictExamMode } from "@/hooks/useStrictExamMode";
import { useQuestionImagePreload } from "@/hooks/useQuestionImagePreload";
import MathText from "@/components/MathText";

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

const PaletteIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
  </svg>
);

const QuestionPalette = memo(function QuestionPalette({
  questions,
  answers,
  currentIdx,
  onSelectQuestion,
}) {
  return (
    <div className="bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/60 dark:border-[var(--border)]/50 p-4 sm:p-5 h-fit lg:sticky lg:top-24 shadow-sm animate-slideUp">
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
        Question Palette
      </p>
      <div className="grid max-h-[60vh] grid-cols-5 gap-2 overflow-y-auto pr-1 sm:max-h-none">
        {questions.map((question, index) => {
          const value = answers[question.id];
          const isAnswered = value !== undefined && String(value).trim() !== "";
          const isActive = currentIdx === index;

          return (
            <button
              key={question.id}
              onClick={() => onSelectQuestion(index)}
              className={`aspect-square rounded-xl text-sm font-bold flex items-center justify-center transition-all duration-200 cursor-pointer
                ${isActive ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[var(--surface)] scale-110" : ""}
                ${
                  isAnswered
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                    : "bg-slate-50 dark:bg-[var(--surface-elevated)]/50 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-[var(--border)]/50 hover:border-indigo-500/30 dark:hover:border-indigo-500/30"
                }
              `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[var(--border-subtle)] grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20" />
          Answered
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200 dark:bg-[var(--surface-elevated)]/50 dark:border-[var(--border)]/50" />
          Unvisited
        </div>
      </div>
    </div>
  );
});

const TestQuestionPanel = memo(function TestQuestionPanel({
  activeQuestion,
  currentIdx,
  totalQuestions,
  selectedAnswer,
  onSelect,
  onNumericalChange,
  onClear,
}) {
  if (!activeQuestion) return null;

  return (
    <div className="min-w-0 flex-1 bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/60 dark:border-[var(--border)]/50 p-3.5 sm:p-6 lg:p-8 shadow-sm animate-slideUp" style={{ animationDelay: "75ms" }}>
      <div className="mb-4 flex flex-wrap items-center gap-1.5 sm:mb-6 sm:gap-2">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Question {currentIdx + 1} of {totalQuestions}
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
          {activeQuestion.subject}
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)] text-slate-500 dark:text-slate-400">
          {activeQuestion.chapter}
        </span>
      </div>

      <MathText className="mb-4 min-w-0 text-[15px] font-medium leading-relaxed text-slate-900 dark:text-white sm:mb-8 sm:text-lg lg:text-xl">
        {activeQuestion.text}
      </MathText>

      {activeQuestion.question_image && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-[var(--card)]/80 p-2 dark:border-[var(--border)]/60 dark:bg-[var(--background)]/30 sm:mb-8">
          <img
            src={activeQuestion.question_image}
            alt="Question visual"
            className="mx-auto h-auto max-h-[70vh] w-full max-w-4xl object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {activeQuestion.question_type === "Numerical" ? (
        <div className="max-w-xl">
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Enter numerical answer
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={selectedAnswer ?? ""}
            onChange={(event) => onNumericalChange(activeQuestion.id, event.target.value)}
            className="w-full rounded-2xl border-2 border-slate-200 bg-[var(--card)]/70 px-5 py-4 text-lg font-semibold text-slate-900 outline-none transition focus:border-indigo-500 dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]/40 dark:text-white"
            placeholder="Enter answer"
          />
        </div>
      ) : (
      <div className="space-y-2.5 sm:space-y-3">
        {activeQuestion.options.map((option, optionIndex) => {
          const isMultipleCorrect = activeQuestion.question_type === "Multiple Correct";
          const isSelected = isMultipleCorrect
            ? Array.isArray(selectedAnswer) && selectedAnswer.includes(optionIndex)
            : selectedAnswer === optionIndex;

          return (
            <button
              key={`${activeQuestion.id}-${optionIndex}`}
              onClick={() => onSelect(activeQuestion, optionIndex)}
              className={`group w-full flex items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left transition-all duration-200 cursor-pointer sm:gap-4 sm:px-5 sm:py-4
                ${
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm shadow-brand/10"
                    : "bg-[var(--card)]/50 dark:bg-[var(--surface-elevated)]/30 border-slate-200/60 dark:border-[var(--border)]/50 hover:border-indigo-500/40 dark:hover:border-indigo-500/30 text-slate-700 dark:text-slate-300 hover:-translate-y-0.5"
                }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-black transition-all duration-200 sm:h-9 sm:w-9
                  ${
                    isSelected
                      ? "border-indigo-500 bg-gradient-to-br from-brand to-brand-hover text-white"
                      : "border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 group-hover:border-indigo-500/40"
                  }`}
              >
                {LETTERS[optionIndex]}
              </span>
              <MathText className="min-w-0 text-sm sm:text-base font-medium">{option}</MathText>
            </button>
          );
        })}
      </div>
      )}

      {selectedAnswer !== undefined && (
        <button
          onClick={() => onClear(activeQuestion.id)}
          className="mt-4 text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
        >
          Clear Selection
        </button>
      )}
    </div>
  );
});

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
  const labelParam = searchParams.get("label") || "";
  const subjectParam = searchParams.get("subjects") || searchParams.get("subject") || "Mixed Subjects";
  const chapterParam = searchParams.get("chapters") || searchParams.get("chapter") || "All Chapters";
  const difficultyParam = searchParams.get("difficulty") || "Mixed";
  const sourceTypeParam = searchParams.get("sourceType") || "";
  const instituteSlugParam = searchParams.get("instituteSlug") || "";
  const instituteTestIdParam = searchParams.get("instituteTestId") || "";

  // 2. State Management
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(durationParam * 60);
  const [finishing, setFinishing] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const timerRef = useRef(null);
  const submitRef = useRef(null);

  // Apply Strict Exam Mode while the session is active and not finishing
  useStrictExamMode(!finishing && questions.length > 0);
  useQuestionImagePreload(questions, currentIdx, 2);

  // 3. Initialize the Test Pool
  useEffect(() => {
    async function loadQuestions() {
      if (!user) return;
      try {
        const response = await fetch("/api/test-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            duration: durationParam,
            count: countParam,
            subject: subjectParam,
            chapter: chapterParam,
            difficulty: difficultyParam,
            mode,
            label: labelParam,
            sourceType: sourceTypeParam,
            instituteSlug: instituteSlugParam,
            instituteTestId: instituteTestIdParam,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || `Failed to load test session: ${response.status}`);
        }

        const data = await response.json();

        if (!data.questions?.length) {
          alert("No questions found.");
          return;
        }

        setExam(data.track || "JEE");
        setQuestions(data.questions);
        setTimeLeft(durationParam * 60);
        setSessionId(data.sessionId || null);
      } catch (err) {
        console.error(err);
        alert("Failed to load questions.");
      }
    }
    loadQuestions();
  }, [subjectParam, chapterParam, difficultyParam, mode, labelParam, sourceTypeParam, instituteSlugParam, instituteTestIdParam, countParam, durationParam, user]);

  const handleSubmit = useCallback(async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      const response = await fetch("/api/test-session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          answers,
          timeTakenSeconds: durationParam * 60 - timeLeft,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit test: ${response.status}`);
      }

      const data = await response.json();

      router.replace(`/test/result/${data.attemptId}`);
      clearInterval(timerRef.current);
    } catch (err) {
      console.error("SAVE ERROR", err);
      alert(err.message);
      setFinishing(false);
    }
  }, [answers, durationParam, finishing, router, sessionId, timeLeft]);

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
  const handleSelect = useCallback((question, optIdx) => {
    setAnswers((prev) => {
      if (question.question_type !== "Multiple Correct") {
        return { ...prev, [question.id]: optIdx };
      }

      const selected = Array.isArray(prev[question.id]) ? prev[question.id] : [];
      const nextSelected = selected.includes(optIdx)
        ? selected.filter((index) => index !== optIdx)
        : [...selected, optIdx].sort((a, b) => a - b);
      if (nextSelected.length === 0) {
        const next = { ...prev };
        delete next[question.id];
        return next;
      }
      return { ...prev, [question.id]: nextSelected };
    });
  }, []);

  const handleNumericalChange = useCallback((qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }, []);

  const handleClearSelection = useCallback((qId) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  }, []);

  const handleSelectQuestion = useCallback((index) => {
    setCurrentIdx(index);
    setPaletteOpen(false);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIdx((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1));
  }, [questions.length]);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 dark:border-[var(--border-subtle)] border-t-indigo-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Loading State
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4 animate-slideUp">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-[var(--border-subtle)] border-t-indigo-500 animate-spin" />
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[var(--background)]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[var(--card)]/80 dark:bg-[var(--surface)]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-[var(--border)]/50 px-2.5 py-2.5 sm:px-6 sm:py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Logo size={24} />
            <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700" />
            <span className="hidden sm:block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {mode === "quick" ? "Quick Session" : "Custom Test"}
            </span>
          </div>

          {/* Timer */}
          <div
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-black tabular-nums transition-all duration-300 sm:gap-2 sm:px-4 ${
              isTimerDanger
                ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 shadow-sm shadow-rose-500/10"
                : "bg-slate-100 dark:bg-[var(--surface-elevated)] text-slate-900 dark:text-white border border-slate-200/60 dark:border-[var(--border)]/50"
            }`}
          >
            {isTimerDanger && <span className="animate-pulse">⏳</span>}
            {formatTime(timeLeft)}
          </div>

          {/* Progress + Submit */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-[var(--card)]/80 px-2.5 py-2 text-xs font-bold text-slate-700 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]/70 dark:text-slate-200 sm:min-h-10 sm:gap-2 sm:px-3 lg:hidden"
            >
              <PaletteIcon />
              Palette
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {answeredCount}/{questions.length}
              </span>
              <div className="w-20 h-1.5 bg-slate-200 dark:bg-[var(--surface-elevated)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="rounded-xl bg-brand px-3 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 sm:px-6"
            >
              <span className="sm:hidden">Submit</span>
              <span className="hidden sm:inline">Submit Test</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto p-2.5 pb-24 sm:p-6 sm:pb-28 lg:pb-6 grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* ── Question Palette ── */}
        <aside className="hidden lg:col-span-1 lg:order-1 lg:block">
          <QuestionPalette
            questions={questions}
            answers={answers}
            currentIdx={currentIdx}
            onSelectQuestion={handleSelectQuestion}
          />
        </aside>

        {/* ── Question Content ── */}
        <section className="min-w-0 lg:col-span-3 flex flex-col order-1 lg:order-2">
          <TestQuestionPanel
            activeQuestion={activeQ}
            currentIdx={currentIdx}
            totalQuestions={questions.length}
            selectedAnswer={activeQ ? answers[activeQ.id] : undefined}
            onSelect={handleSelect}
            onNumericalChange={handleNumericalChange}
            onClear={handleClearSelection}
          />

          {/* Navigation */}
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-slate-200/70 bg-[var(--card)]/90 px-4 py-3 backdrop-blur-xl dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/90 sm:px-6 lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-0 animate-slideUp" style={{ animationDelay: "150ms" }}>
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="min-h-11 flex-1 rounded-xl border border-slate-200/60 dark:border-[var(--border)]/50 bg-[var(--card)]/70 px-4 py-3 text-sm font-bold text-slate-700 backdrop-blur-xl disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-indigo-500/30 dark:bg-[var(--surface)]/60 dark:text-slate-200 dark:hover:border-indigo-500/30 sm:flex-none sm:px-6"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentIdx === questions.length - 1}
              className="min-h-11 flex-1 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 sm:flex-none sm:px-6"
            >
              Save & Next →
            </button>
          </div>
        </section>
      </main>

      {paletteOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close question palette"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setPaletteOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto rounded-t-3xl bg-slate-50 p-4 shadow-2xl dark:bg-[var(--background)]">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
            <QuestionPalette
              questions={questions}
              answers={answers}
              currentIdx={currentIdx}
              onSelectQuestion={handleSelectQuestion}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TestSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[var(--background)] flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 dark:border-[var(--border-subtle)] border-t-indigo-500 animate-spin" />
        </div>
      }
    >
      <TestSessionContent />
    </Suspense>
  );
}
