"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getPYQ, savePYQAttempts } from "@/lib/pyq";
import { canShowStructuredQuestionText, shouldShowQuestionImageFallback, shouldShowRequiredQuestionImage } from "@/lib/pyqDisplay";
import { getBookmarks, toggleBookmark } from "@/utils/bookmarks";
import Logo from "@/components/Logo";
import { useStrictExamMode } from "@/hooks/useStrictExamMode";
import { useQuestionImagePreload } from "@/hooks/useQuestionImagePreload";
import MathText from "@/components/MathText";

const LETTERS = ["A", "B", "C", "D"];

function originalQuestionNumber(question, fallback) {
  const match = question?.question?.match(/^\s*Question\s+(\d+)\s*:/i);
  return match ? Number(match[1]) : fallback;
}

const modeLabels = {
  full: "📄 Full Paper",
  chapter: "📚 Chapter Wise",
  random: "🎲 Random PYQs",
  mistakes: "🔁 Mistake Revision",
};

const RemoveOrangeFilter = () => (
  <svg width="0" height="0" className="absolute">
    <filter id="remove-orange">
      <feColorMatrix
        type="matrix"
        values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 1 0"
      />
    </filter>
  </svg>
);

const PaletteIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
  </svg>
);

const PALETTE_LEGEND = [
  {
    key: "answered",
    label: "Answered",
    className: "bg-emerald-600 border-emerald-600 text-white",
  },
  {
    key: "current",
    label: "Current",
    className: "bg-indigo-600 border-indigo-600 text-white",
  },
  {
    key: "visited",
    label: "Visited",
    className: "bg-amber-100 border-amber-300 text-amber-700",
  },
  {
    key: "notVisited",
    label: "Not Visited",
    className: "bg-slate-100 border-slate-200 text-slate-500",
  },
];

const compactImageClassName =
  "max-h-[55vh] w-auto max-w-full rounded-lg border border-slate-200/70 object-contain dark:border-[var(--border)]/60";

const PaletteButton = memo(function PaletteButton({
  label,
  isActive,
  isAnswered,
  isVisited,
  onClick,
}) {
  let stateClassName =
    "border-slate-200 bg-[var(--card)] text-slate-500 hover:border-slate-300 dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]/60 dark:text-slate-400";

  if (isAnswered) {
    stateClassName =
      "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/20";
  } else if (isVisited) {
    stateClassName =
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-300";
  }

  if (isActive) {
    stateClassName =
      "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 ring-2 ring-indigo-200 dark:ring-indigo-500/30";
  }

  return (
    <button
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-[10px] border text-[12px] font-semibold transition-colors ${stateClassName}`}
    >
      {label}
    </button>
  );
});

const QuestionPalette = memo(function QuestionPalette({
  questions,
  answers,
  currentIndex,
  visitedQuestionIds,
  mode,
  onSelectQuestion,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-[var(--card)]/95 p-3 shadow-sm dark:border-[var(--border)]/60 dark:bg-[var(--surface)]/95">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Question Palette
        </p>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-[var(--surface-elevated)] dark:text-slate-300">
          {questions.length} Qs
        </span>
      </div>

      <div className="grid max-h-[calc(100vh-11.5rem)] grid-cols-5 gap-2 overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const answer = answers[q.id];
          const isAnswered = answer !== undefined && answer !== null && String(answer).trim() !== "";
          const isVisited = visitedQuestionIds.has(q.id);

          return (
            <PaletteButton
              key={q.id}
              label={mode === "full" ? originalQuestionNumber(q, idx + 1) : idx + 1}
              isActive={currentIndex === idx}
              isAnswered={isAnswered}
              isVisited={isVisited}
              onClick={() => onSelectQuestion(idx)}
            />
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-slate-200/70 pt-3 text-[11px] text-slate-600 dark:border-[var(--border)]/60 dark:text-slate-400">
        {PALETTE_LEGEND.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-[4px] border ${item.className}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const QuestionOption = memo(function QuestionOption({
  optionKey,
  index,
  optionText,
  optionImage,
  isSelected,
  onSelect,
}) {
  return (
    <button
      onClick={() => onSelect(optionKey)}
      className={`group flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors ${
        isSelected
          ? "border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-100"
          : "border-slate-200/70 bg-[var(--card)] text-slate-700 hover:border-indigo-300 dark:border-[var(--border)]/60 dark:bg-[var(--surface)]/40 dark:text-slate-300 dark:hover:border-indigo-500/40"
      }`}
    >
      <span
        className={`mt-0.5 flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold ${
          isSelected
            ? "border-indigo-600 bg-indigo-600 text-white"
            : "border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400"
        }`}
      >
        {LETTERS[index]}
      </span>
      <span className="min-w-0 flex-1">
        {optionImage ? (
          <img
            src={optionImage}
            alt={`Option ${LETTERS[index]} visual`}
            className={compactImageClassName}
            loading="lazy"
            decoding="async"
            style={{ filter: "url(#remove-orange)" }}
          />
        ) : (
          <MathText className="text-[14px] leading-5.5 text-inherit">{optionText}</MathText>
        )}
      </span>
    </button>
  );
});

export default function PYQSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const [questions, setQuestions] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [visitedQuestionIds, setVisitedQuestionIds] = useState(() => new Set());
  
  // Timer state for Full Paper mode (180 mins = 10800 secs)
  const [timeLeft, setTimeLeft] = useState(180 * 60);

  // Apply Strict Exam Mode while the session is active and not finishing
  useStrictExamMode(!finishing && questions.length > 0);
  useQuestionImagePreload(questions, currentIndex, 2);

  const exam = searchParams.get("exam") || "JEE";
  const subjectsParam = searchParams.get("subjects") || "";
  const yearsParam = searchParams.get("years") || "";
  const mode = searchParams.get("mode") || "full";
  const chapter = searchParams.get("chapter") || "";
  const examType = searchParams.get("exam_type") || "";
  const attempt = searchParams.get("attempt") || "";
  const shift = searchParams.get("shift") || "";
  const examId = searchParams.get("exam_id") || "";
  const attemptLabel = searchParams.get("attempt_label") || attempt;
  const shiftLabel = searchParams.get("shift_label") || shift;

  const subjectLabels = subjectsParam ? subjectsParam.split(",") : [];
  const years = yearsParam ? yearsParam.split(",").map(Number) : [];
  const shouldLoadWholePaper = mode === "full";
  const shouldLoadBalancedRandom = mode === "random" && (exam === "JEE" || exam === "NEET");

  useEffect(() => {
    if (finishing || questions.length === 0 || mode !== "full") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishDeck(); // Auto-submit when time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishing, questions.length, mode]);

  useEffect(() => {
    let cancelled = false;

    async function loadPYQ() {
      const requestedSubjects = shouldLoadBalancedRandom
        ? [""]
        : shouldLoadWholePaper && subjectLabels.length === 0
          ? [""]
          : subjectLabels;
      if (requestedSubjects.length === 0) {
        if (!cancelled) setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError("");
      try {
        const results = await Promise.all(
          requestedSubjects.map((label) =>
            getPYQ(exam, label, {
              mode,
              year: years.length > 0 ? years.join(",") : undefined,
              chapter,
              userId: user?.id,
              examType,
              attempt,
              shift,
              examId,
            })
          )
        );

        let combined = results.flat();
        const seen = new Set();
        combined = combined.filter((q) => {
          if (seen.has(q.id)) return false;
          seen.add(q.id);
          return true;
        });

        if (years.length > 0) {
          combined = combined.filter((q) => years.includes(q.year));
        }

        if (mode === "random") {
          combined = combined.sort(() => Math.random() - 0.5);
        } else if (mode === "full") {
          // Absolute Sequence Guarantee for Full Papers
          combined = combined.sort((a, b) => {
            const numA = originalQuestionNumber(a, -1);
            const numB = originalQuestionNumber(b, -1);
            if (numA !== -1 && numB !== -1) {
              return numA - numB;
            }
            return new Date(a.created_at) - new Date(b.created_at);
          });
        } else {
          // For Chapter and Mistakes, sort by Year (desc) then by creation order
          combined = combined.sort((a, b) => {
            if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
            return new Date(a.created_at) - new Date(b.created_at);
          });
        }

        if (cancelled) return;
        setQuestions(combined);
        
        if (user?.id) {
          const bms = await getBookmarks(user.id);
          if (cancelled) return;
          setBookmarkedIds(new Set(bms));
        }

        setCurrentIndex(0);
        setAnswers({});
        setVisitedQuestionIds(new Set(combined[0]?.id ? [combined[0].id] : []));
      } catch (error) {
        console.error("Failed to load PYQ session:", error);
        setLoadError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadPYQ();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectsParam, yearsParam, mode, chapter, exam, user?.id, examType, attempt, shift, examId, shouldLoadWholePaper, shouldLoadBalancedRandom]);

  const currentQuestion = questions[currentIndex];
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;
  const qType = currentQuestion?.question_type || "MCQ";
  const displayedQuestionNumber = mode === "full" ? originalQuestionNumber(currentQuestion, currentIndex + 1) : currentIndex + 1;
  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter(
        (value) => value !== undefined && value !== null && String(value).trim() !== ""
      ).length,
    [answers]
  );
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const markVisitedByIndex = useCallback((index) => {
    const questionId = questions[index]?.id;
    if (!questionId) return;
    setVisitedQuestionIds((prev) => {
      if (prev.has(questionId)) return prev;
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  }, [questions]);

  const handleSelectOption = useCallback((option) => {
    if (!currentQuestion) return;
    if (qType === "MULTIPLE_CORRECT") {
      setAnswers((prev) => {
        const current = Array.isArray(prev[currentQuestion.id]) ? prev[currentQuestion.id] : [];
        let nextAns;
        if (current.includes(option)) {
          nextAns = current.filter((o) => o !== option);
        } else {
          nextAns = [...current, option].sort();
        }
        if (nextAns.length === 0) {
          const copy = { ...prev };
          delete copy[currentQuestion.id];
          return copy;
        }
        return { ...prev, [currentQuestion.id]: nextAns };
      });
    } else {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
    }
  }, [currentQuestion, qType]);

  const handleNumericalChange = useCallback((val) => {
    if (!currentQuestion) return;
    if (val === "") {
      setAnswers((prev) => {
        const copy = { ...prev };
        delete copy[currentQuestion.id];
        return copy;
      });
    } else {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
    }
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => {
      const nextIndex = Math.min(i + 1, questions.length - 1);
      markVisitedByIndex(nextIndex);
      return nextIndex;
    });
  }, [markVisitedByIndex, questions.length]);

  const handleBack = useCallback(() => {
    setCurrentIndex((i) => {
      const nextIndex = Math.max(i - 1, 0);
      markVisitedByIndex(nextIndex);
      return nextIndex;
    });
  }, [markVisitedByIndex]);

  const handleSelectQuestion = useCallback((index) => {
    markVisitedByIndex(index);
    setCurrentIndex(index);
    setPaletteOpen(false);
  }, [markVisitedByIndex]);

  async function handleFinishDeck() {
    if (questions.length === 0 || finishing) return;
    setFinishing(true);

    const answeredQuestions = questions.filter((q) => answers[q.id]);
    const submission = answeredQuestions.map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id],
      chapter: q.chapter,
      subject: q.subject,
      exam: q.exam,
    }));

    let gradingResults = [];

    if (submission.length > 0) {
      const response = await savePYQAttempts(submission);
      gradingResults = Array.isArray(response?.results) ? response.results : [];
    }

    const resultMap = new Map(gradingResults.map((result) => [result.question_id, result]));

    let correct = 0;
    let wrong = 0;
    let score = 0;
    let maxScore = 0;

    const reviewData = questions.map((q) => {
      maxScore += (Number(q.marks_positive) || 4);
      
      const selected = answers[q.id];
      const isAnswered = selected !== undefined && selected !== null && selected !== "";
      const serverResult = resultMap.get(q.id);
      const isCorrect = isAnswered && Boolean(serverResult?.is_correct);
      if (isAnswered && isCorrect) {
        correct += 1;
        score += (Number(q.marks_positive) || 4);
      }
      if (isAnswered && !isCorrect) {
        wrong += 1;
        score -= Math.abs(q.marks_negative !== undefined && q.marks_negative !== null ? Number(q.marks_negative) : 1);
      }
      return {
        id: q.id,
        question: q.question,
        question_image: q.question_image,
        subject: q.subject,
        chapter: q.chapter,
        difficulty: q.difficulty,
        year: q.year,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        option_a_image: q.option_a_image,
        option_b_image: q.option_b_image,
        option_c_image: q.option_c_image,
        option_d_image: q.option_d_image,
        correct_option: serverResult?.correct_option ?? null,
        explanation: serverResult?.explanation ?? null,
        explanation_image: serverResult?.explanation_image ?? null,
        selected: selected || null,
        question_type: q.question_type || "MCQ",
        numerical_answer: serverResult?.numerical_answer ?? null,
        correct_options: serverResult?.correct_options ?? null,
        numerical_min: serverResult?.numerical_min ?? null,
        numerical_max: serverResult?.numerical_max ?? null,
      };
    });

    const skipped = questions.length - answeredQuestions.length;
    const attempted = correct + wrong;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("pyq_session_review", JSON.stringify(reviewData));
    }

    const resultParams = new URLSearchParams();
    resultParams.set("exam", exam);
    resultParams.set("subjects", subjectLabels.join(","));
    resultParams.set("mode", mode);
    resultParams.set("total", String(questions.length));
    resultParams.set("correct", String(correct));
    resultParams.set("wrong", String(wrong));
    resultParams.set("skipped", String(skipped));
    resultParams.set("accuracy", String(accuracy));
    resultParams.set("score", String(score));
    resultParams.set("maxScore", String(maxScore));
    if (examType) resultParams.set("exam_type", examType);
    if (attempt) resultParams.set("attempt", attempt);
    if (shift) resultParams.set("shift", shift);
    if (attemptLabel) resultParams.set("attempt_label", attemptLabel);
    if (shiftLabel) resultParams.set("shift_label", shiftLabel);

    router.push(`/pyq/session/results?${resultParams.toString()}`);
  }

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4 animate-slideUp">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-[var(--border-subtle)] border-t-indigo-500 animate-spin" />
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Loading PYQs...
          </p>
        </div>
      </div>
    );
  }

  // ── Error / Empty ──
  if (loadError || (!loading && questions.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[var(--background)]">
        <div className="text-center animate-slideUp">
          <div className="text-5xl mb-4">{loadError ? "⚠️" : "📭"}</div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {loadError || "No PYQs Found"}
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Try different filters or subjects.</p>
          <button
            onClick={() => router.push("/pyq")}
            className="mt-6 px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 transition-all duration-300"
          >
            Back to PYQ Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[var(--background)]">
      <RemoveOrangeFilter />
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[var(--card)]/95 px-4 py-2.5 backdrop-blur-xl dark:border-[var(--border)]/60 dark:bg-[var(--surface)]/95 sm:px-5">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Logo size={26} />
            <div className="hidden h-5 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
            <div className="min-w-0">
              <span className="block truncate text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {modeLabels[mode] || modeLabels.full}
              </span>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {subjectLabels.join(", ")} · {exam}
                {years.length > 0 ? ` · ${years[0]}${years.length > 1 ? `–${years[years.length - 1]}` : ""}` : ""}
                {attemptLabel ? ` · ${attemptLabel}` : ""}
                {shiftLabel ? ` · ${shiftLabel}` : ""}
              </p>
            </div>
          </div>

          {/* Full Paper Timer */}
          {mode === "full" && (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className={`text-sm font-semibold tabular-nums ${timeLeft < 300 ? "text-rose-500" : "text-slate-700 dark:text-slate-300"}`}>
                {String(Math.floor(timeLeft / 3600)).padStart(2, "0")}:{String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Progress + Finish */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-[var(--card)] px-3 py-2 text-xs font-bold text-slate-700 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-slate-200 lg:hidden"
            >
              <PaletteIcon />
              Palette
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {answeredCount}/{questions.length}
              </span>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-[var(--surface-elevated)]">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleFinishDeck}
              disabled={questions.length === 0 || finishing}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {finishing ? "Finishing..." : "Finish Deck"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid flex-1 w-full min-w-0 max-w-[1600px] grid-cols-1 gap-4 px-3 py-3 pb-24 sm:px-4 sm:pb-28 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-4 lg:pb-3">
        {/* ── Question Palette ── */}
        <aside className="hidden lg:order-1 lg:block">
          <div className="lg:sticky lg:top-[72px]">
            <QuestionPalette
              questions={questions}
              answers={answers}
              currentIndex={currentIndex}
              visitedQuestionIds={visitedQuestionIds}
              mode={mode}
              onSelectQuestion={handleSelectQuestion}
            />
          </div>
        </aside>

        {/* ── Question Content ── */}
        <section className="order-1 flex min-w-0 flex-col lg:order-2">
          <div
            className="rounded-2xl border border-slate-200/70 bg-[var(--card)]/95 p-3 shadow-sm dark:border-[var(--border)]/60 dark:bg-[var(--surface)]/95 sm:p-4"
            style={{ animationDelay: "75ms" }}
          >
            {/* Question meta */}
            <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Question {displayedQuestionNumber} of {questions.length}
                </span>
                {qType !== "MCQ" && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                    {qType === "MULTIPLE_CORRECT" ? "Multi-Select" : "Numerical"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (!user?.id) return;
                    const qId = String(currentQuestion.id);
                    const isB = bookmarkedIds.has(qId);
                    
                    // Optimistic
                    const previous = new Set(bookmarkedIds);
                    const next = new Set(bookmarkedIds);
                    if (isB) next.delete(qId); else next.add(qId);
                    setBookmarkedIds(next);
                    
                    // DB
                    const saved = await toggleBookmark(user.id, qId);
                    if (saved === isB) {
                      setBookmarkedIds(previous);
                    }
                  }}
                  className={`rounded-lg border p-2 transition-colors duration-200 ${
                    bookmarkedIds.has(String(currentQuestion.id))
                      ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "border-slate-200 bg-[var(--card)] text-slate-400 hover:text-indigo-500 dark:border-[var(--border)]/60 dark:bg-[var(--surface)]/30 dark:text-slate-500"
                  }`}
                  title="Save Question"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={bookmarkedIds.has(String(currentQuestion.id)) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                </button>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{currentQuestion.year}</span>
              </div>
            </div>

            {/* Subject + Chapter tags */}
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                {currentQuestion.subject}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 dark:bg-[var(--surface-elevated)] dark:text-slate-300">
                {currentQuestion.chapter}
              </span>
            </div>

            {/* Question image */}
            {shouldShowQuestionImageFallback(currentQuestion) && (
              <img
                src={currentQuestion.question_image}
                alt="Question visual"
                className={`${compactImageClassName} mb-2.5`}
                loading="lazy"
                decoding="async"
                style={{ filter: "url(#remove-orange)" }}
              />
            )}

            {canShowStructuredQuestionText(currentQuestion) && (
              <MathText className="max-w-[1100px] text-[14.5px] leading-6.5 text-slate-900 dark:text-white sm:text-[15px]">
                {currentQuestion.question}
              </MathText>
            )}

            {shouldShowRequiredQuestionImage(currentQuestion) && (
              <img
                src={currentQuestion.question_image}
                alt="Question visual"
                className={`${compactImageClassName} mt-3 mb-2.5`}
                loading="lazy"
                decoding="async"
                style={{ filter: "url(#remove-orange)" }}
              />
            )}

            {/* Options */}
            <div className="mt-3">
              {qType === "NUMERICAL" ? (
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Enter your answer
                  </label>
                  <input
                    type="number"
                    placeholder="Enter numerical answer"
                    value={selectedOption || ""}
                    onChange={(e) => handleNumericalChange(e.target.value)}
                    className="w-full max-w-md rounded-lg border border-slate-200 bg-[var(--card)] px-4 py-2.5 text-[15px] font-medium text-slate-900 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-[var(--border)]/60 dark:bg-[var(--surface)]/40 dark:text-white"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {["a", "b", "c", "d"].map((option, idx) => {
                    const isSelected =
                      qType === "MULTIPLE_CORRECT"
                        ? Array.isArray(selectedOption) && selectedOption.includes(option)
                        : selectedOption === option;

                    return (
                      <QuestionOption
                        key={option}
                        optionKey={option}
                        index={idx}
                        optionText={currentQuestion[`option_${option}`]}
                        optionImage={currentQuestion[`option_${option}_image`]}
                        isSelected={isSelected}
                        onSelect={handleSelectOption}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clear selection */}
            {selectedOption !== undefined && (
              <button
                onClick={() => {
                  const newAnswers = { ...answers };
                  delete newAnswers[currentQuestion.id];
                  setAnswers(newAnswers);
                }}
                className="mt-2 text-xs font-medium text-slate-500 transition-colors hover:text-rose-500 dark:text-slate-400"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-slate-200/70 bg-[var(--card)]/90 px-4 py-3 backdrop-blur-xl dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/90 sm:px-6 lg:static lg:mt-2 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-0" style={{ animationDelay: "150ms" }}>
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="min-h-11 flex-1 rounded-lg border border-slate-200 bg-[var(--card)] px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[var(--border)]/60 dark:bg-[var(--surface)]/90 dark:text-slate-200 sm:flex-none"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="min-h-11 flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              Next →
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
              currentIndex={currentIndex}
              visitedQuestionIds={visitedQuestionIds}
              mode={mode}
              onSelectQuestion={handleSelectQuestion}
            />
          </div>
        </div>
      )}
    </div>
  );
}
