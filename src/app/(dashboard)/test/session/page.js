"use client";

import { memo, useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { useUser } from "@clerk/nextjs";
import { useStrictExamMode } from "@/hooks/useStrictExamMode";
import { useQuestionImagePreload } from "@/hooks/useQuestionImagePreload";
import MathText from "@/components/MathText";
import { useRegisterZiEntity } from "@/lib/zi/ZiEntityContext";

const LETTERS = ["A", "B", "C", "D"];
const REVIEW_STORAGE_PREFIX = "prepzii:test-session:marked-for-review:";

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

const BookmarkIcon = ({ filled = false }) => (
  <svg className="h-4 w-4" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.75A1.75 1.75 0 017.75 3h8.5A1.75 1.75 0 0118 4.75v16l-6-3.25L6 20.75v-16z" />
  </svg>
);

function hasAnswer(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function getReviewStorageKey(testSessionId) {
  return testSessionId ? `${REVIEW_STORAGE_PREFIX}${testSessionId}` : null;
}

function readStoredReviewState(testSessionId, questions = []) {
  const storageKey = getReviewStorageKey(testSessionId);
  if (!storageKey || typeof window === "undefined") return {};

  try {
    const stored = window.sessionStorage.getItem(storageKey);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const validQuestionIds = new Set(questions.map((question) => String(question.id)));
    return Object.entries(parsed).reduce((state, [questionId, isMarked]) => {
      if (isMarked && validQuestionIds.has(String(questionId))) {
        state[questionId] = true;
      }
      return state;
    }, {});
  } catch {
    return {};
  }
}

function writeStoredReviewState(testSessionId, markedState) {
  const storageKey = getReviewStorageKey(testSessionId);
  if (!storageKey || typeof window === "undefined") return;

  try {
    if (Object.keys(markedState).length === 0) {
      window.sessionStorage.removeItem(storageKey);
      return;
    }
    window.sessionStorage.setItem(storageKey, JSON.stringify(markedState));
  } catch {
    // Best-effort browser storage only; review marks still work in memory.
  }
}

function clearStoredReviewState(testSessionId) {
  const storageKey = getReviewStorageKey(testSessionId);
  if (!storageKey || typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // Ignore storage cleanup failures.
  }
}

const QuestionPalette = memo(function QuestionPalette({
  questions,
  answers,
  markedForReview,
  visitedQuestions,
  currentIdx,
  onSelectQuestion,
}) {
  return (
    <div className="h-fit rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-4 lg:sticky lg:top-20 animate-slideUp">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
        Question Palette
      </p>
      <div className="grid max-h-[60vh] grid-cols-5 gap-1.5 overflow-y-auto pr-1 sm:max-h-none content-start">
        {questions.map((question, index) => {
          const value = answers[question.id];
          const isAnswered = hasAnswer(value);
          const isMarked = Boolean(markedForReview[question.id]);
          const isVisited = Boolean(visitedQuestions[question.id]);
          const isActive = currentIdx === index;
          const stateClass = isActive
            ? "border-brand bg-brand text-slate-950 shadow-sm"
            : isAnswered && isMarked
              ? "border-brand/60 bg-brand/10 text-slate-900 dark:text-white"
              : isMarked
                ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-brand/10 dark:text-brand"
                : isAnswered
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : isVisited
                    ? "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-[var(--surface-elevated)] dark:text-slate-300"
                    : "border-slate-200 bg-white text-slate-400 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-500";

          return (
            <button
              key={question.id}
              onClick={() => onSelectQuestion(index)}
              className={`prepzii-interactive relative flex aspect-square items-center justify-center rounded-md border text-xs font-semibold tabular-nums hover:border-brand/50 ${stateClass}`}
              aria-label={`Question ${index + 1}${isMarked ? ", marked for review" : ""}${isAnswered ? ", answered" : ""}`}
            >
              {index + 1}
              {isMarked && !isActive && (
                <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-brand" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-1.5 border-t border-slate-200 pt-3 text-[11px] text-slate-500 dark:border-[var(--border-subtle)] dark:text-slate-400 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-slate-200 bg-white dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]" />
          Not Visited
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-brand bg-brand" />
          Current
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10" />
          Answered
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-brand/10" />
          Marked
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <span className="h-3 w-3 rounded-sm border border-brand/60 bg-brand/10" />
          Answered + Marked
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
  isMarked,
  onSelect,
  onNumericalChange,
  onClear,
  onToggleReview,
  onPrev,
  onNext,
  onMarkForReviewAndNext,
  hasPrev,
  hasNext,
}) {
  if (!activeQuestion) return null;
  const chapterLabel = activeQuestion.chapter && activeQuestion.chapter !== "Unmapped"
    ? ` · ${activeQuestion.chapter}`
    : "";

  return (
    <div className="min-w-0 flex-1 flex flex-col h-full min-h-0 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] overflow-hidden animate-slideUp">
      {/* Top Meta Bar */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5 sm:px-6 sm:py-3 dark:border-[var(--border-subtle)]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
            Question {currentIdx + 1} of {totalQuestions}
          </span>
          <p className="mt-0.5 text-xs font-normal text-slate-500 dark:text-slate-400 truncate max-w-[280px] sm:max-w-md">
            {activeQuestion.subject}{chapterLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleReview(activeQuestion.id)}
          className={`prepzii-interactive inline-flex min-h-8.5 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
            isMarked
              ? "border-brand/70 bg-brand/10 text-slate-900 dark:text-brand"
              : "border-slate-200 bg-transparent text-slate-600 hover:border-brand/50 hover:text-slate-900 dark:border-[var(--border-subtle)] dark:text-slate-300 dark:hover:text-white"
          }`}
        >
          <BookmarkIcon filled={isMarked} />
          <span>{isMarked ? "Marked for Review" : "Mark for Review"}</span>
        </button>
      </div>

      {/* Main Question + Options Body (Internal Scroll If Overflow) */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-3 sm:px-6 sm:py-4">
        <MathText className="mb-3 sm:mb-4 min-w-0 text-[15px] font-medium leading-relaxed text-slate-900 dark:text-white sm:text-base lg:text-[17px]">
          {activeQuestion.text}
        </MathText>

        {activeQuestion.question_image && (
          <div className="mb-3 sm:mb-4 inline-block overflow-hidden rounded-xl border border-slate-200 bg-white p-2 dark:border-[var(--border-subtle)] dark:bg-white">
            <img
              src={activeQuestion.question_image}
              alt="Question visual"
              className="mx-auto h-auto max-h-[140px] sm:max-h-[160px] lg:max-h-[180px] w-auto max-w-[440px] object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        {String(activeQuestion.question_type || "").toUpperCase() === "NUMERICAL" ? (
          <div className="max-w-xl">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
              Enter numerical answer
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={selectedAnswer ?? ""}
              onChange={(event) => onNumericalChange(activeQuestion.id, event.target.value)}
              className="prepzii-interactive w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base font-semibold text-slate-900 outline-none focus:border-brand dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/40 dark:text-white"
              placeholder="Enter answer"
            />
          </div>
        ) : (() => {
          const hasAnyOptionImages = Boolean(
            activeQuestion.option_images?.some(Boolean) ||
            activeQuestion.option_a_image ||
            activeQuestion.option_b_image ||
            activeQuestion.option_c_image ||
            activeQuestion.option_d_image
          );

          return (
            <div className={hasAnyOptionImages ? "grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3" : "space-y-1.5 sm:space-y-2"}>
              {activeQuestion.options.map((option, optionIndex) => {
                const isMultipleCorrect =
                  String(activeQuestion.question_type || "").toUpperCase() === "MULTIPLE_CORRECT" ||
                  String(activeQuestion.question_type || "").toUpperCase() === "MULTIPLE CORRECT";
                const isSelected = isMultipleCorrect
                  ? Array.isArray(selectedAnswer) && selectedAnswer.includes(optionIndex)
                  : selectedAnswer === optionIndex;

                const optionImage =
                  activeQuestion.option_images?.[optionIndex] ||
                  (optionIndex === 0 ? activeQuestion.option_a_image : null) ||
                  (optionIndex === 1 ? activeQuestion.option_b_image : null) ||
                  (optionIndex === 2 ? activeQuestion.option_c_image : null) ||
                  (optionIndex === 3 ? activeQuestion.option_d_image : null) ||
                  (typeof option === "object" ? option?.image || option?.url : null);

                const optionText = typeof option === "object" ? option?.text || option?.label || "" : option;
                const isRedundantLabel = optionImage && optionText && /^(option\s*)?\(?[A-D1-4]\)?$/i.test(String(optionText).trim());
                const displayOptionText = isRedundantLabel ? "" : optionText;

                return (
                  <button
                    key={`${activeQuestion.id}-${optionIndex}`}
                    onClick={() => onSelect(activeQuestion, optionIndex)}
                    className={`prepzii-interactive group flex w-full cursor-pointer items-start gap-2.5 rounded-xl border-[1.5px] px-3.5 py-2.5 text-left transition-all duration-150 sm:gap-3 sm:px-4 sm:py-3 ${isSelected ? "test-option-selected" : "shadow-[var(--snb-shadow-interactive)] hover:-translate-y-0.5 hover:shadow-[var(--snb-shadow-hover)]"}
                      ${
                        isSelected
                          ? "border-[var(--snb-border-selected)] bg-[#FEF9C3] text-slate-950 dark:bg-amber-400/15 dark:text-white"
                          : "border-[var(--snb-border-interactive)] bg-white text-slate-700 hover:border-[var(--snb-border-interactive-hover)] hover:bg-slate-50 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-300 dark:hover:bg-[var(--surface-elevated)]/45"
                      }`}
                  >
                    <span
                      className={`prepzii-interactive-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-[1.5px] text-xs font-bold
                        ${
                          isSelected
                            ? "border-[#9A7407] bg-brand text-slate-950 shadow-[1px_1px_0px_rgba(30,42,68,0.2)] dark:shadow-[1px_1px_0px_rgba(0,0,0,0.6)]"
                            : "border-slate-300 text-slate-600 group-hover:border-slate-400 dark:border-slate-600 dark:text-slate-400"
                        }`}
                    >
                      {LETTERS[optionIndex]}
                    </span>

                    <div className="min-w-0 flex-1">
                      {displayOptionText ? (
                        <MathText
                          className={`min-w-0 text-sm font-medium sm:text-[15px] pt-0.5 ${
                            isSelected
                              ? "text-slate-950 dark:text-white [&_*]:!text-slate-950 dark:[&_*]:!text-white"
                              : "text-inherit"
                          }`}
                        >
                          {displayOptionText}
                        </MathText>
                      ) : null}

                      {optionImage && (
                        <div className="mt-1.5 inline-block overflow-hidden rounded-lg border border-slate-200/80 bg-white p-2 dark:border-stone-800 dark:bg-white shadow-sm">
                          <img
                            src={optionImage}
                            alt={`Option ${LETTERS[optionIndex]} diagram`}
                            className="max-h-[140px] sm:max-h-[160px] w-auto max-w-full object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Permanently Docked Navigation Toolbar (Zero Page Scroll) */}
      <div className="shrink-0 flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-3 py-2 sm:gap-3 sm:px-6 sm:py-2.5 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30 overflow-x-hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="prepzii-interactive min-h-9 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:border-brand/50 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-200 sm:px-5"
          >
            ← Previous
          </button>
          {selectedAnswer !== undefined && (
            <button
              onClick={() => onClear(activeQuestion.id)}
              className="prepzii-interactive min-h-9 rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-500 dark:text-slate-400"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMarkForReviewAndNext}
            disabled={!hasNext}
            className="prepzii-interactive hidden min-h-9 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:border-brand/50 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-200 sm:inline-flex sm:px-5"
          >
            Mark for Review &amp; Next
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="prepzii-interactive min-h-9 rounded-lg bg-brand px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-brand-hover sm:px-5"
          >
            Save &amp; Next →
          </button>
        </div>
      </div>
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
  const [markedForReview, setMarkedForReview] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState({});
  const [timeLeft, setTimeLeft] = useState(durationParam * 60);
  const [finishing, setFinishing] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const timerRef = useRef(null);
  const submitRef = useRef(null);
  const submitInFlightRef = useRef(false);

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

        const nextSessionId = data.sessionId || null;
        const storedReviewState = readStoredReviewState(nextSessionId, data.questions);

        setExam(data.track || "JEE");
        setQuestions(data.questions);
        setTimeLeft(durationParam * 60);
        setSessionId(nextSessionId);
        setAnswers({});
        setMarkedForReview(storedReviewState);
        setVisitedQuestions(data.questions[0]?.id ? { [data.questions[0].id]: true } : {});
      } catch (err) {
        console.error(err);
        alert("Failed to load questions.");
      }
    }
    loadQuestions();
  }, [subjectParam, chapterParam, difficultyParam, mode, labelParam, sourceTypeParam, instituteSlugParam, instituteTestIdParam, countParam, durationParam, user]);

  useEffect(() => {
    writeStoredReviewState(sessionId, markedForReview);
  }, [markedForReview, sessionId]);

  const handleSubmit = useCallback(async () => {
    if (submitInFlightRef.current) return;
    submitInFlightRef.current = true;
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

      clearStoredReviewState(sessionId);
      clearInterval(timerRef.current);
      router.replace(`/test/result/${data.attemptId}`);
    } catch (err) {
      console.error("SAVE ERROR", err);
      alert(err.message);
      submitInFlightRef.current = false;
      setFinishing(false);
    }
  }, [answers, durationParam, router, sessionId, timeLeft]);

  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  // 4. Timer Logic
  useEffect(() => {
    if (questions.length === 0 || finishing) return;
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
      const qType = String(question.question_type || "").toUpperCase();
      if (qType !== "MULTIPLE_CORRECT" && qType !== "MULTIPLE CORRECT") {
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

  const markVisitedQuestion = useCallback((index) => {
    const questionId = questions[index]?.id;
    if (!questionId) return;
    setVisitedQuestions((prev) => (
      prev[questionId] ? prev : { ...prev, [questionId]: true }
    ));
  }, [questions]);

  const handleToggleReview = useCallback((qId) => {
    setMarkedForReview((prev) => {
      const next = { ...prev };
      if (next[qId]) {
        delete next[qId];
      } else {
        next[qId] = true;
      }
      return next;
    });
  }, []);

  const handleMarkForReviewAndNext = useCallback(() => {
    const activeId = questions[currentIdx]?.id;
    if (activeId) {
      setMarkedForReview((prev) => ({ ...prev, [activeId]: true }));
    }
    const nextIndex = Math.min(questions.length - 1, currentIdx + 1);
    markVisitedQuestion(nextIndex);
    setCurrentIdx(nextIndex);
  }, [currentIdx, markVisitedQuestion, questions]);

  const handleSelectQuestion = useCallback((index) => {
    markVisitedQuestion(index);
    setCurrentIdx(index);
    setPaletteOpen(false);
  }, [markVisitedQuestion]);

  const handlePrev = useCallback(() => {
    const prevIndex = Math.max(0, currentIdx - 1);
    markVisitedQuestion(prevIndex);
    setCurrentIdx(prevIndex);
  }, [currentIdx, markVisitedQuestion]);

  const handleNext = useCallback(() => {
    const nextIndex = Math.min(questions.length - 1, currentIdx + 1);
    markVisitedQuestion(nextIndex);
    setCurrentIdx(nextIndex);
  }, [currentIdx, markVisitedQuestion, questions.length]);

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
  const answeredCount = Object.values(answers).filter(hasAnswer).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  useRegisterZiEntity(
    activeQ?.id
      ? { type: "test_question", id: activeQ.id }
      : null
  );

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
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-[var(--background)]">
      {finishing ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/25 backdrop-blur-[2px] dark:bg-black/35">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
            <div className="h-5 w-5 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin dark:border-slate-700 dark:border-t-indigo-400" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Submitting...</span>
          </div>
        </div>
      ) : null}
      {/* ── Header ── */}
      <header className="shrink-0 z-50 border-b border-slate-200 bg-[#fffdf7]/95 px-3 py-2 sm:px-6 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Logo size={36} showText={true} className="hidden sm:flex" />
            <div className="hidden h-6 w-px bg-slate-200 dark:bg-[var(--border-subtle)] sm:block" />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500 sm:block">
              {mode === "quick" ? "Quick Session" : "Custom Test"}
            </span>
          </div>

          {/* Timer */}
          <div
              className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-semibold tabular-nums transition-colors duration-150 sm:gap-2 sm:px-4 sm:py-2 ${
              isTimerDanger
                ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
                : "border-slate-200 bg-white text-slate-900 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-white"
            }`}
          >
            {formatTime(timeLeft)}
          </div>

          {/* Progress + Submit */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="prepzii-interactive inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-200 sm:min-h-10 sm:gap-2 sm:px-3 lg:hidden"
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
              type="button"
              onClick={handleSubmit}
              disabled={finishing}
              aria-busy={finishing}
              className="prepzii-interactive inline-flex min-w-[92px] items-center justify-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[132px] sm:px-6"
            >
              {finishing ? (
                "Submitting..."
              ) : (
                <>
                  <span className="sm:hidden">Submit</span>
                  <span className="hidden sm:inline">Submit Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex-1 min-h-0 w-full max-w-7xl min-w-0 grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 p-2.5 sm:p-4 overflow-hidden">
        {/* ── Question Palette ── */}
        <aside className="hidden lg:col-span-1 lg:order-1 lg:block">
          <QuestionPalette
            questions={questions}
            answers={answers}
            markedForReview={markedForReview}
            visitedQuestions={visitedQuestions}
            currentIdx={currentIdx}
            onSelectQuestion={handleSelectQuestion}
          />
        </aside>

        {/* ── Question Content & Docked Action Bar ── */}
        <section className="min-w-0 lg:col-span-3 flex flex-col h-full min-h-0 order-1 lg:order-2">
          <TestQuestionPanel
            activeQuestion={activeQ}
            currentIdx={currentIdx}
            totalQuestions={questions.length}
            selectedAnswer={activeQ ? answers[activeQ.id] : undefined}
            isMarked={activeQ ? Boolean(markedForReview[activeQ.id]) : false}
            onSelect={handleSelect}
            onNumericalChange={handleNumericalChange}
            onClear={handleClearSelection}
            onToggleReview={handleToggleReview}
            onPrev={handlePrev}
            onNext={handleNext}
            onMarkForReviewAndNext={handleMarkForReviewAndNext}
            hasPrev={currentIdx > 0}
            hasNext={currentIdx < questions.length - 1}
          />
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
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-150 absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto rounded-t-xl bg-slate-50 p-4 shadow-2xl dark:bg-[var(--background)]">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
            <QuestionPalette
              questions={questions}
              answers={answers}
              markedForReview={markedForReview}
              visitedQuestions={visitedQuestions}
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
