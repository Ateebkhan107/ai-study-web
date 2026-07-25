"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getPYQ, savePYQAttempt } from "@/lib/pyq";
import { getBookmarks, toggleBookmark } from "@/lib/bookmarks";
import Logo from "@/components/Logo";

const LETTERS = ["A", "B", "C", "D"];

const modeLabels = {
  full: "📄 Full Paper",
  chapter: "📚 Chapter Wise",
  random: "🎲 Random PYQs",
  mistakes: "🔁 Mistake Revision",
};

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

  const exam = searchParams.get("exam") || "JEE";
  const subjectsParam = searchParams.get("subjects") || "";
  const yearsParam = searchParams.get("years") || "";
  const mode = searchParams.get("mode") || "full";
  const chapter = searchParams.get("chapter") || "";
  const examType = searchParams.get("exam_type") || "";
  const attempt = searchParams.get("attempt") || "";
  const shift = searchParams.get("shift") || "";

  const subjectLabels = subjectsParam ? subjectsParam.split(",") : [];
  const years = yearsParam ? yearsParam.split(",").map(Number) : [];

  useEffect(() => {
    async function loadPYQ() {
      setLoading(true);
      setLoadError("");
      try {
        const results = await Promise.all(
          subjectLabels.map((label) =>
            getPYQ(exam, label, {
              mode,
              chapter,
              userId: user?.id,
              examType,
              attempt,
              shift,
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
        }

        setQuestions(combined);
        
        if (user?.id) {
          const bms = await getBookmarks(user.id);
          setBookmarkedIds(new Set(bms));
        }

        setCurrentIndex(0);
        setAnswers({});
      } catch (error) {
        console.error("Failed to load PYQ session:", error);
        setLoadError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (subjectLabels.length > 0) {
      loadPYQ();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectsParam, yearsParam, mode, chapter, exam, user?.id, examType, attempt, shift]);

  const currentQuestion = questions[currentIndex];
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;
  const qType = currentQuestion?.question_type || "MCQ";
  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  function handleSelectOption(option) {
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
  }

  function handleNumericalChange(val) {
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
  }

  function handleNext() {
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  }

  function handleBack() {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  function checkAnswer(question, selected) {
    if (!selected) return false;
    const type = question.question_type || "MCQ";
    if (type === "MCQ") {
      return String(question.correct_option).toLowerCase() === String(selected).toLowerCase();
    }
    if (type === "MULTIPLE_CORRECT") {
      if (!Array.isArray(selected) || !Array.isArray(question.correct_options)) return false;
      const selectedSorted = [...selected].map((s) => String(s).toLowerCase()).sort().join(",");
      const correctSorted = [...question.correct_options].map((s) => String(s).toLowerCase()).sort().join(",");
      return selectedSorted === correctSorted;
    }
    if (type === "NUMERICAL") {
      const numVal = Number(selected);
      if (isNaN(numVal)) return false;
      if (question.numerical_min !== undefined && question.numerical_min !== null &&
          question.numerical_max !== undefined && question.numerical_max !== null) {
        return numVal >= Number(question.numerical_min) && numVal <= Number(question.numerical_max);
      }
      return numVal === Number(question.numerical_answer);
    }
    return false;
  }

  async function handleFinishDeck() {
    if (questions.length === 0 || finishing) return;
    setFinishing(true);

    const answeredQuestions = questions.filter((q) => answers[q.id]);

    await Promise.allSettled(
      answeredQuestions.map((q) => {
        const rawOption = answers[q.id];
        const isCorrect = checkAnswer(q, rawOption);
        const type = q.question_type || "MCQ";
        let formattedOption = "";
        if (type === "MULTIPLE_CORRECT" && Array.isArray(rawOption)) {
          formattedOption = rawOption.sort().join(",").toUpperCase();
        } else if (type === "NUMERICAL") {
          formattedOption = String(rawOption);
        } else {
          formattedOption = String(rawOption).toUpperCase();
        }
        return savePYQAttempt({
          question_id: q.id,
          selected_option: formattedOption,
          is_correct: isCorrect,
          chapter: q.chapter,
          subject: q.subject,
          exam: q.exam,
        });
      })
    );

    let correct = 0;
    let wrong = 0;

    const reviewData = questions.map((q) => {
      const selected = answers[q.id];
      const isAnswered = selected !== undefined && selected !== null && selected !== "";
      const isCorrect = isAnswered && checkAnswer(q, selected);
      if (isAnswered && isCorrect) correct += 1;
      if (isAnswered && !isCorrect) wrong += 1;
      return {
        id: q.id,
        question: q.question,
        subject: q.subject,
        chapter: q.chapter,
        difficulty: q.difficulty,
        year: q.year,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        explanation: q.explanation,
        selected: selected || null,
        question_type: q.question_type || "MCQ",
        numerical_answer: q.numerical_answer,
        correct_options: q.correct_options,
        numerical_min: q.numerical_min,
        numerical_max: q.numerical_max,
      };
    });

    const skipped = questions.length - answeredQuestions.length;
    const accuracy = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

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
    if (examType) resultParams.set("exam_type", examType);
    if (attempt) resultParams.set("attempt", attempt);
    if (shift) resultParams.set("shift", shift);

    router.push(`/pyq/session/results?${resultParams.toString()}`);
  }

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="flex flex-col items-center gap-4 animate-slideUp">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500 animate-spin" />
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="text-center animate-slideUp">
          <div className="text-5xl mb-4">{loadError ? "⚠️" : "📭"}</div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {loadError || "No PYQs Found"}
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Try different filters or subjects.</p>
          <button
            onClick={() => router.push("/pyq")}
            className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
          >
            Back to PYQ Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/50 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo size={28} />
            <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700" />
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {modeLabels[mode] || modeLabels.full}
              </span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {subjectLabels.join(", ")} · {exam}
                {years.length > 0 ? ` · ${years[0]}${years.length > 1 ? `–${years[years.length - 1]}` : ""}` : ""}
              </p>
            </div>
          </div>

          {/* Progress + Finish */}
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
              onClick={handleFinishDeck}
              disabled={questions.length === 0 || finishing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {finishing ? "Finishing..." : "Finish Deck"}
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
                const isActive = currentIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`aspect-square rounded-xl text-sm font-bold flex items-center justify-center transition-all duration-200 cursor-pointer
                      ${isActive ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#0f172a] scale-110" : ""}
                      ${
                        isAnswered
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                          : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/50 hover:border-indigo-500/30"
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
          <div
            className="flex-1 bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/50 p-6 sm:p-8 shadow-sm animate-slideUp"
            style={{ animationDelay: "75ms" }}
          >
            {/* Question meta */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                {qType !== "MCQ" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                    {qType === "MULTIPLE_CORRECT" ? "Multi-Select" : "Numerical"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
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
                  className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                    bookmarkedIds.has(String(currentQuestion.id))
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20"
                      : "bg-white/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 border-slate-200/60 dark:border-slate-700/50 hover:text-indigo-500"
                  }`}
                  title="Save Question"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={bookmarkedIds.has(String(currentQuestion.id)) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                </button>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{currentQuestion.year}</span>
              </div>
            </div>

            {/* Subject + Chapter tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                {currentQuestion.subject}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {currentQuestion.chapter}
              </span>
              {currentQuestion.difficulty && (
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  currentQuestion.difficulty === "Hard"
                    ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20"
                    : currentQuestion.difficulty === "Medium"
                    ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20"
                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
                }`}>
                  {currentQuestion.difficulty}
                </span>
              )}
            </div>

            {/* Question text */}
            <p className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white leading-relaxed mb-2">
              {currentQuestion.question}
            </p>

            {/* Question image */}
            {currentQuestion.question_image && (
              <img
                src={currentQuestion.question_image}
                alt="Question visual"
                className="rounded-2xl max-w-full mb-4 border border-slate-200/60 dark:border-slate-700/50"
              />
            )}

            {/* Options */}
            <div className="mt-6">
              {qType === "NUMERICAL" ? (
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
                    Enter your answer
                  </label>
                  <input
                    type="number"
                    placeholder="Enter numerical answer"
                    value={selectedOption || ""}
                    onChange={(e) => handleNumericalChange(e.target.value)}
                    className="w-full max-w-sm border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30 rounded-2xl px-5 py-4 text-lg font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {["a", "b", "c", "d"].map((option, idx) => {
                    const isSelected =
                      qType === "MULTIPLE_CORRECT"
                        ? Array.isArray(selectedOption) && selectedOption.includes(option)
                        : selectedOption === option;

                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectOption(option)}
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
                        <div className="flex flex-col gap-2 flex-1">
                          <span className="text-base font-medium">
                            {currentQuestion[`option_${option}`]}
                          </span>
                          {currentQuestion[`option_${option}_image`] && (
                            <img
                              src={currentQuestion[`option_${option}_image`]}
                              alt={`Option ${option.toUpperCase()} visual`}
                              className="rounded-xl max-w-full"
                            />
                          )}
                        </div>
                      </button>
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
                className="mt-4 text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between animate-slideUp" style={{ animationDelay: "150ms" }}>
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="px-6 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl font-bold text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
            >
              Next →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}