"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { updateGoalProgress } from "@/utils/updateGoalProgress";
import { getBookmarks, toggleBookmark } from "@/utils/bookmarks";
import { getPYQAnswers } from "@/lib/pyq";
import { hasStructuredQuestionText } from "@/lib/pyqDisplay";
import MathText from "@/components/MathText";
import QuestionDiagram from "@/components/pyq/QuestionDiagram";
import { hasNativeQuestionDiagram } from "@/lib/questionDiagrams";
import { Lightbulb } from "lucide-react";

// Practice mode display labels
const modeLabels = {
  full: "Full Paper",
  chapter: "Chapter Wise",
  random: "Random PYQs",
  mistakes: "Mistake Revision",
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

  // Animation states
  const [showAnim, setShowAnim] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

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
      } catch (error) {
        goalUpdated.current = false;
      }
    }
    updatePYQGoal();
  }, [user, total]);

  // =============================
  // ANIMATIONS
  // =============================
  useEffect(() => {
    const t1 = setTimeout(() => setShowAnim(true), 150);
    
    let startTime;
    const duration = 1500;
    const animateNumber = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedScore(easeProgress * score);
      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        setAnimatedScore(score);
      }
    };
    const t2 = setTimeout(() => requestAnimationFrame(animateNumber), 150);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [score]);

  const tiers = {
    excellent: {
      label: "Excellent Work",
      ring: "stroke-emerald-500",
      badge: "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    good: {
      label: "Good Effort",
      ring: "stroke-amber-500",
      badge: "border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300",
    },
    needsImprovement: {
      label: "Needs Improvement",
      ring: "stroke-rose-500",
      badge: "border-rose-300 text-rose-700 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300",
    }
  };

  const tier = accuracy >= 80 ? tiers.excellent : accuracy >= 50 ? tiers.good : tiers.needsImprovement;
  const percentage = maxScore > 0 ? Math.max(0, Math.min(100, Math.round((score / maxScore) * 100))) : 0;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = showAnim ? circumference - (percentage / 100) * circumference : circumference;

  const modeMeta = modeLabels[mode] || modeLabels.full;
  const attempted = Math.max(0, total - skipped);
  const completion = total > 0 ? Math.round((attempted / total) * 100) : 0;
  const paperLabel = [attemptLabel, shiftLabel].filter(Boolean).join(" · ");
  const headlineMeta = [exam, modeMeta, `${total} Questions`].filter(Boolean).join(" · ");
  const sessionDetails = [
    subjectLabels.join(" · ") || "—",
    examType ? `${exam} ${examType}` : exam,
    paperLabel,
    modeMeta,
  ].filter(Boolean);

  let takeaway = "Review the attempt carefully and use the mistakes to plan your next practice session.";
  if (total > 0 && attempted <= Math.max(1, Math.floor(total * 0.1))) {
    takeaway = `You attempted only ${attempted} ${attempted === 1 ? "question" : "questions"}. Try a shorter focused deck before another full paper.`;
  } else if (accuracy >= 80 && completion >= 80) {
    takeaway = "Strong attempt. Review the few mistakes before your next test.";
  } else if (accuracy >= 70) {
    takeaway = "Accuracy looks solid. Next, work on increasing attempts.";
  } else if (attempted > 0 && accuracy < 50) {
    takeaway = "Focus on accuracy before increasing speed.";
  }

  const correctWidth = total > 0 ? (correct / total) * 100 : 0;
  const wrongWidth = total > 0 ? (wrong / total) * 100 : 0;
  const skippedWidth = total > 0 ? (skipped / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--background)] text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 flex items-start justify-center relative overflow-x-hidden overflow-y-auto">
      <RemoveOrangeFilter />
      <div className="w-full max-w-4xl z-10 animate-slideUp py-6 sm:py-10">
        
        {/* Main Report */}
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] rounded-3xl border border-slate-200/80 dark:border-[var(--border)]/70 shadow-sm p-6 sm:p-8 lg:p-10 mb-8 relative">
          
          {/* HEADER / TITLE */}
          <div className="text-center mb-10">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Test Result
            </p>
            <h1 className="mt-3 text-3xl font-black font-display tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Deck Submitted
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {headlineMeta}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 mb-12">
            {/* SCORE RING */}
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <svg className="w-48 h-48 sm:w-56 sm:h-56 transform -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r={radius} fill="none" strokeWidth="12" className="stroke-slate-100 dark:stroke-[var(--surface-elevated)]" />
                  <circle 
                    cx="100" 
                    cy="100" 
                    r={radius} 
                    fill="none" 
                    strokeWidth="12" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset} 
                    strokeLinecap="round" 
                    className={`transition-all duration-1000 ease-out ${tier.ring}`} 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-5xl sm:text-6xl font-black font-display text-slate-950 dark:text-white tabular-nums tracking-tighter">
                    {Math.round(animatedScore)}
                  </span>
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    / {maxScore}
                  </span>
                </div>
              </div>
              <span className={`mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-wider ${tier.badge}`}>
                {tier.label}
              </span>
            </div>

            {/* BREAKDOWN & STATS */}
            <div className="flex-1 w-full max-w-sm sm:max-w-md">
              {/* Correct/Wrong/Skipped Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-baseline mb-3 text-sm font-bold text-slate-900 dark:text-white">
                  <span>Question Split</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{total} Total</span>
                </div>
                <div className="flex w-full h-3.5 sm:h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-[var(--surface-elevated)] shadow-inner">
                  <div className="bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${showAnim ? correctWidth : 0}%` }} />
                  <div className="bg-rose-500 transition-all duration-1000 ease-out" style={{ width: `${showAnim ? wrongWidth : 0}%` }} />
                  <div className="bg-slate-200 dark:bg-slate-600 transition-all duration-1000 ease-out" style={{ width: `${showAnim ? skippedWidth : 0}%` }} />
                </div>
                <div className="flex justify-between items-center mt-3.5 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/>{correct} Correct</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"/>{wrong} Wrong</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"/>{skipped} Skipped</div>
                </div>
              </div>

              {/* Grid for Accuracy & Attempted */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                 <div className="bg-slate-50 dark:bg-[var(--surface-elevated)]/50 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-[var(--border-subtle)]/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1.5">Accuracy</p>
                    <p className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">{accuracy}%</p>
                 </div>
                 <div className="bg-slate-50 dark:bg-[var(--surface-elevated)]/50 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-[var(--border-subtle)]/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1.5">Attempted</p>
                    <p className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
                      {attempted}<span className="text-base sm:text-lg text-slate-400 dark:text-slate-500 ml-1">/ {total}</span>
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* TAKEAWAY CARD */}
          <div className="mb-10">
            <div className="p-5 sm:p-6 bg-brand/5 dark:bg-brand/10 border border-brand/20 dark:border-brand/30 rounded-2xl flex gap-4 sm:gap-5 items-start relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand" />
              <div className="p-2 sm:p-2.5 rounded-full bg-brand/10 dark:bg-brand/20 text-brand-pressed dark:text-brand shrink-0 ml-1">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              </div>
              <div className="pt-0.5">
                <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-brand-pressed dark:text-brand/80 mb-1.5">Today's Takeaway</h3>
                <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">{takeaway}</p>
              </div>
            </div>
          </div>

          {/* SESSION DETAILS FOOTER */}
          <div className="border-t border-slate-200/80 dark:border-[var(--border)]/70 pt-6">
             <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3">Session Details</h2>
             <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                {sessionDetails.map((item, index) => (
                  <span key={`${item}-${index}`} className="inline-flex items-center gap-3">
                    {index > 0 && <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />}
                    <span>{item}</span>
                  </span>
                ))}
             </div>
          </div>

          {/* CTA BUTTONS */}
          <div className="flex flex-col gap-3 border-t border-slate-200/80 mt-8 pt-7 dark:border-[var(--border)]/70 sm:flex-row">
            <button
              onClick={() => setShowReview(v => !v)}
              className="flex-1 rounded-xl bg-brand px-5 py-4 text-sm font-black text-black transition-colors duration-200 hover:bg-brand-hover shadow-sm"
            >
              {showReview ? "Hide Review" : "Review Answers"}
            </button>
            <button
              onClick={() => router.push("/pyq")}
              className="flex-1 rounded-xl border border-slate-200/80 bg-[var(--card)] px-5 py-4 text-sm font-black text-slate-700 transition-colors duration-200 hover:border-brand/50 dark:border-[var(--border)]/70 dark:bg-[var(--surface)] dark:text-slate-200 shadow-sm"
            >
              Back to Setup
            </button>
          </div>
        </div>

        {showReview && reviewData.length === 0 && (
          <div className="mb-8 rounded-2xl border border-slate-200/80 bg-[var(--card)] p-6 text-center text-sm font-semibold text-slate-500 shadow-sm dark:border-[var(--border)]/70 dark:bg-[var(--surface)] dark:text-slate-400">
            Review data is not available for this session.
          </div>
        )}

        {/* REVIEW SECTION */}
        {showReview && reviewData.length > 0 && (
          <div className="space-y-6 pb-12 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            {reviewData.map((q, idx) => {
              const qType = q.question_type || "MCQ";
              const correctOptionKey = String(q.correct_option || "").toLowerCase();
              const correctOptionText = /^[a-d]$/.test(correctOptionKey)
                ? q[`option_${correctOptionKey}`]
                : "";
              const correctOptionImage = /^[a-d]$/.test(correctOptionKey)
                ? q[`option_${correctOptionKey}_image`]
                : null;
              
              return (
                <div key={q.id} className="bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-[var(--border)]/50 p-6 shadow-sm">
                  
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
                            : "bg-[var(--card)]/50 dark:bg-[var(--surface-elevated)]/30 text-slate-400 dark:text-slate-500 border-slate-200/60 dark:border-[var(--border)]/50 hover:text-indigo-500"
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
                    {q.question_image && !hasNativeQuestionDiagram(q) && !hasStructuredQuestionText(q.question) && (
                      <img 
                        src={q.question_image} 
                        alt="Question visual" 
                        className="rounded-2xl border border-slate-200/60 dark:border-[var(--border)]/50 max-w-full"
                        style={{ filter: "url(#remove-orange)" }}
                      />
                    )}
                    {hasStructuredQuestionText(q.question) && (
                      <MathText className="text-base font-medium text-slate-900 dark:text-slate-200 leading-relaxed">
                        {q.question}
                      </MathText>
                    )}
                    <QuestionDiagram question={q} />
                    {q.question_image && !hasNativeQuestionDiagram(q) && hasStructuredQuestionText(q.question) && (
                      <img
                        src={q.question_image}
                        alt="Question visual"
                        className="mt-3 max-h-[420px] w-auto max-w-full rounded-2xl border border-slate-200/60 object-contain dark:border-[var(--border)]/50"
                        loading="lazy"
                        decoding="async"
                        style={{ filter: "url(#remove-orange)" }}
                      />
                    )}
                  </div>

                  {qType === "NUMERICAL" ? (
                    <div className="space-y-3 mb-6">
                      <div className="p-4 rounded-xl border border-slate-200/60 dark:border-[var(--border)]/50 bg-slate-50/50 dark:bg-[var(--surface-elevated)]/50 flex items-center justify-between">
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

                        let wrapperClasses = "border-slate-200/60 dark:border-[var(--border)]/50 bg-[var(--card)]/50 dark:bg-[var(--surface-elevated)]/30";
                        let letterClasses = "bg-slate-100 dark:bg-[var(--surface-elevated)] text-slate-600 dark:text-slate-400";
                        
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
                                  <MathText className="text-inherit">{q[`option_${option}`]}</MathText>
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
                                  className="rounded-xl border border-slate-200/60 dark:border-[var(--border)]/50 max-w-full w-auto"
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
                    <div className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)] text-slate-500 dark:text-slate-400 text-xs font-bold mb-4">
                      Skipped Question
                    </div>
                  )}

                  <div className="bg-slate-50/80 dark:bg-[var(--surface)]/40 rounded-2xl p-5 border border-slate-100 dark:border-[var(--border-subtle)]/80 mt-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-2">
                      {qType === "MULTIPLE_CORRECT" 
                        ? `Correct Answers: ${Array.isArray(q.correct_options) ? q.correct_options.join(", ").toUpperCase() : ""}`
                        : String(q.correct_option).toLowerCase() === "none"
                          ? "Dropped question: no listed option is correct"
                        : qType === "NUMERICAL" 
                          ? `Correct Answer: ${Array.isArray(q.correct_options) && q.correct_options.length > 0 ? q.correct_options.join(" or ") : q.numerical_answer}` 
                          : `Correct Answer: ${String(q.correct_option).toUpperCase()}`
                      }
                    </p>
                    {qType === "MCQ" && /^[a-d]$/.test(correctOptionKey) && (
                      <div className="mb-4 rounded-xl border border-emerald-200/70 bg-emerald-50/80 p-4 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                        <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                          Option {correctOptionKey.toUpperCase()}
                        </div>
                        {correctOptionImage ? (
                          <div>
                            {correctOptionText && correctOptionText !== "Diagram shown." && (
                              <MathText className="mb-3 text-sm text-inherit">{correctOptionText}</MathText>
                            )}
                            <img
                              src={correctOptionImage}
                              alt={`Correct option ${correctOptionKey.toUpperCase()}`}
                              className="max-h-[360px] w-auto max-w-full rounded-xl border border-emerald-200/70 object-contain dark:border-emerald-500/30"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        ) : (
                          <MathText className="text-sm font-semibold text-inherit">{correctOptionText}</MathText>
                        )}
                      </div>
                    )}
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-p:my-2">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Solution
                      </p>
                      <MathText className="text-inherit">
                        {q.explanation || "No explanation provided for this question."}
                      </MathText>
                      {q.explanation_image && (
                        <img 
                          src={q.explanation_image} 
                          alt="Explanation visual" 
                          className="mt-2 rounded-xl border border-slate-200/60 dark:border-[var(--border)]/50 max-w-full"
                          style={{ filter: "url(#remove-orange)" }}
                        />
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200/60 dark:border-[var(--border-subtle)]">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 py-1 rounded bg-slate-100 dark:bg-[var(--surface-elevated)]/50">
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
