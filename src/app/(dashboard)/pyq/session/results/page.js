"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { updateGoalProgress } from "@/utils/updateGoalProgress";
import { getBookmarks, toggleBookmark } from "@/utils/bookmarks";
import { getPYQAnswers } from "@/lib/pyq";
import { canShowStructuredQuestionText, shouldShowQuestionImageFallback } from "@/lib/pyqDisplay";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Practice mode display labels
const modeLabels = {
  full: "📄 Full Paper",
  chapter: "📚 Chapter Wise",
  random: "🎲 Random PYQs",
  mistakes: "🔁 Mistake Revision"
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

export default function PYQResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const goalUpdated = useRef(false);

  const [reviewData, setReviewData] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  const exam = searchParams.get("exam") || "JEE";
  const subjectsParam = searchParams.get("subjects") || "";
  
  const mode = searchParams.get("mode") || "full";
  const examType = searchParams.get("exam_type") || "";
  const attempt = searchParams.get("attempt") || "";
  const shift = searchParams.get("shift") || "";
  const attemptLabel = searchParams.get("attempt_label") || attempt;
  const shiftLabel = searchParams.get("shift_label") || shift;

  const total = parseInt(searchParams.get("total") || "0", 10);
  const correct = parseInt(searchParams.get("correct") || "0", 10);
  const wrong = parseInt(searchParams.get("wrong") || "0", 10);
  const skipped = parseInt(searchParams.get("skipped") || "0", 10);
  const accuracy = parseInt(searchParams.get("accuracy") || "0", 10);
  const score = parseInt(searchParams.get("score") || "0", 10);
  const maxScore = parseInt(searchParams.get("maxScore") || "0", 10);

  const subjectLabels = subjectsParam ? subjectsParam.split(",") : [];

  // =============================
  // LOAD REVIEW DATA
  // =============================
  useEffect(() => {
    let cancelled = false;

    async function loadReviewData() {
      if (typeof window === "undefined") return;
      let parsed = [];
      try {
        const stored = sessionStorage.getItem("pyq_session_review");
        parsed = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(parsed) || parsed.length === 0) return;

        const currentAnswers = await getPYQAnswers(parsed.map((question) => question.id));
        const answersById = new Map(currentAnswers.map((answer) => [String(answer.id), answer]));
        const refreshed = parsed.map((question) => ({
          ...question,
          ...(answersById.get(String(question.id)) || {}),
        }));
        if (!cancelled) {
          setReviewData(refreshed);
          sessionStorage.setItem("pyq_session_review", JSON.stringify(refreshed));
        }
      } catch (error) {
        console.error("Failed to load review data:", error);
        if (!cancelled && parsed.length > 0) setReviewData(parsed);
      }
    }

    loadReviewData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    async function loadBookmarks() {
      const bms = await getBookmarks(user.id);
      setBookmarkedIds(new Set(bms));
    }

    loadBookmarks();
  }, [user]);

  // =============================
  // DAILY GOAL + XP UPDATE
  // =============================
  useEffect(() => {
    if (!user || total <= 0 || goalUpdated.current) return;

    async function updatePYQGoal() {
      try {
        goalUpdated.current = true;
        await updateGoalProgress(user.id, "PYQ", 1);
//         console.log("PYQ GOAL UPDATED 🚀", total);
      } catch (error) {
        goalUpdated.current = false;
//         console.log("PYQ goal error:", error);
      }
    }
    updatePYQGoal();
  }, [user, total]);

  let resultLabel = "Needs Improvement 📚";
  let badgeColor = "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
  if (accuracy >= 80) {
    resultLabel = "Excellent Work 🎯";
    badgeColor = "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
  } else if (accuracy >= 50) {
    resultLabel = "Good Effort 👍";
    badgeColor = "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20";
  }

  // Circle math
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 flex items-start sm:items-center justify-center relative overflow-x-hidden overflow-y-auto">
      <RemoveOrangeFilter />
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-4xl z-10 animate-slideUp py-8">
        
        {/* Main Card */}
        <div className="bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm p-6 sm:p-10 mb-8">
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            {/* SVG Score Ring */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-indigo-500 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{accuracy}%</span>
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                Deck Submitted!
              </h1>
              <p className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-3">
                Score: <span className="text-indigo-600 dark:text-indigo-400">{score}</span> / {maxScore}
              </p>
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border ${badgeColor}`}>
                {resultLabel}
              </span>
            </div>
          </div>

          {/* Session Summary */}
          <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-5 mb-8 border border-slate-200/60 dark:border-slate-800/60">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 text-center md:text-left">
              Session Summary
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Subjects: {subjectLabels.join(", ") || "—"}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Exam: {exam}{examType ? ` ${examType}` : ""}
              </span>
              {(attemptLabel || shiftLabel) && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  Paper: {[attemptLabel, shiftLabel].filter(Boolean).join(" · ")}
                </span>
              )}
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Mode: {modeLabels[mode] || modeLabels.full}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Questions: {total}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">{correct}</span>
              <span className="text-xs font-bold text-emerald-600/70 dark:text-emerald-500 uppercase tracking-widest">Correct</span>
            </div>
            
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-rose-600 dark:text-rose-400 mb-1">{wrong}</span>
              <span className="text-xs font-bold text-rose-600/70 dark:text-rose-500 uppercase tracking-widest">Wrong</span>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-700 dark:text-slate-300 mb-1">{skipped}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Skipped</span>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{accuracy}%</span>
              <span className="text-xs font-bold text-indigo-600/70 dark:text-indigo-500 uppercase tracking-widest">Accuracy</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowReview(v => !v)}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
            >
              {showReview ? "Hide Review" : "Review Answers"}
            </button>
            <button
              onClick={() => router.push("/pyq")}
              className="flex-1 border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl rounded-xl font-bold py-3.5 text-slate-700 dark:text-slate-200 hover:border-indigo-500/30 transition-all duration-300"
            >
              Back to Setup
            </button>
          </div>

        </div>

        {/* REVIEW SECTION */}
        {showReview && (
          <div className="space-y-6 pb-12 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            {reviewData.map((q, idx) => {
              const qType = q.question_type || "MCQ";
              
              return (
                <div key={q.id} className="bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/50 p-6 shadow-sm">
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">
                      Q{idx + 1} · {q.subject}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!user?.id) return;
                          const qId = String(q.id);
                          const isB = bookmarkedIds.has(qId);

                          const previous = new Set(bookmarkedIds);
                          const next = new Set(bookmarkedIds);
                          if (isB) next.delete(qId);
                          else next.add(qId);
                          setBookmarkedIds(next);

                          const saved = await toggleBookmark(user.id, qId);
                          if (saved === isB) {
                            setBookmarkedIds(previous);
                          }
                        }}
                        className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                          bookmarkedIds.has(String(q.id))
                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20"
                            : "bg-white/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 border-slate-200/60 dark:border-slate-700/50 hover:text-indigo-500"
                        }`}
                        title="Save Question"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={bookmarkedIds.has(String(q.id)) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                        </svg>
                      </button>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                        {q.year}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {shouldShowQuestionImageFallback(q) && (
                      <img 
                        src={q.question_image} 
                        alt="Question visual" 
                        className="rounded-2xl border border-slate-200/60 dark:border-slate-700/50 max-w-full"
                        style={{ filter: "url(#remove-orange)" }}
                      />
                    )}
                    {canShowStructuredQuestionText(q) && (
                      <p className="text-base font-medium text-slate-900 dark:text-slate-200 leading-relaxed">
                        {q.question}
                      </p>
                    )}
                  </div>

                  {qType === "NUMERICAL" ? (
                    <div className="space-y-3 mb-6">
                      <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-600 dark:text-slate-400">Your Answer:</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {q.selected !== null && q.selected !== undefined && q.selected !== "" ? q.selected : "None"}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">Correct Answer:</span>
                        <div className="text-right text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                          {Array.isArray(q.correct_options) && q.correct_options.length > 0
                            ? q.correct_options.join(" or ")
                            : q.numerical_answer}
                          {(q.numerical_min !== undefined && q.numerical_max !== undefined && q.numerical_min !== null && q.numerical_max !== null) && (
                            <div className="mt-1 text-xs font-medium opacity-80">
                              Range: {q.numerical_min} - {q.numerical_max}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {["a", "b", "c", "d"].map(option => {
                        const isCorrectOption = qType === "MULTIPLE_CORRECT"
                          ? (Array.isArray(q.correct_options) && q.correct_options.map(o => String(o).toLowerCase()).includes(option))
                          : (String(q.correct_option).toLowerCase() === option);

                        const selectedArr = Array.isArray(q.selected) 
                          ? q.selected.map(s => String(s).toLowerCase()) 
                          : typeof q.selected === "string" 
                            ? q.selected.toLowerCase().split(',') 
                            : [];
                        
                        const isSelected = selectedArr.includes(option);

                        let wrapperClasses = "border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30";
                        let letterClasses = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
                        
                        if (isCorrectOption) {
                          wrapperClasses = "border-emerald-300 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10";
                          letterClasses = "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400";
                        } else if (isSelected && !isCorrectOption) {
                          wrapperClasses = "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10";
                          letterClasses = "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400";
                        }

                        return (
                          <div key={option} className={`border rounded-xl p-4 flex gap-4 transition-all ${wrapperClasses}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${letterClasses}`}>
                              {option.toUpperCase()}
                            </div>
                            <div className="flex flex-col gap-3 flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1">
                                {!q[`option_${option}_image`] && (
                                  <span>{q[`option_${option}`]}</span>
                                )}
                                {isSelected && (
                                  <span className="ml-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    (Your answer)
                                  </span>
                                )}
                              </div>
                              {q[`option_${option}_image`] && (
                                <img 
                                  src={q[`option_${option}_image`]} 
                                  alt={`Option ${option.toUpperCase()} visual`} 
                                  className="rounded-xl border border-slate-200/60 dark:border-slate-700/50 max-w-full w-auto"
                                  style={{ filter: "url(#remove-orange)" }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!q.selected && (
                    <div className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold mb-4">
                      Skipped Question
                    </div>
                  )}

                  <div className="bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 mt-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-2">
                      {qType === "MULTIPLE_CORRECT" 
                        ? `Correct Answers: ${Array.isArray(q.correct_options) ? q.correct_options.join(", ").toUpperCase() : ""}`
                        : qType === "NUMERICAL" 
                          ? `Correct Answer: ${Array.isArray(q.correct_options) && q.correct_options.length > 0 ? q.correct_options.join(" or ") : q.numerical_answer}` 
                          : `Correct Answer: ${String(q.correct_option).toUpperCase()}`
                      }
                    </p>
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-p:my-2">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {q.explanation || "No explanation provided for this question."}
                      </ReactMarkdown>
                      {q.explanation_image && (
                        <img 
                          src={q.explanation_image} 
                          alt="Explanation visual" 
                          className="mt-2 rounded-xl border border-slate-200/60 dark:border-slate-700/50 max-w-full"
                          style={{ filter: "url(#remove-orange)" }}
                        />
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 py-1 rounded bg-slate-100 dark:bg-slate-800/50">
                        {q.chapter}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
