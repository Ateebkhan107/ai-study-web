"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Inbox, Lightbulb } from "lucide-react";

export default function ResultPage() {
  const { id } = useParams();
  const router = useRouter();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Animation states
  const [showAnim, setShowAnim] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch(`/api/test-attempts/${id}`, {
          cache: "no-store",
        });

        if (res.status === 404) {
          setAttempt(null);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to load result");
        }

        const data = await res.json();
        setAttempt(data);
      } catch (err) {
//         console.log(err);
      }
      setLoading(false);
    }

    loadResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── ANIMATIONS ──
  useEffect(() => {
    if (!attempt) return;
    
    const t1 = setTimeout(() => setShowAnim(true), 150);
    
    let startTime;
    const duration = 1500;
    const animateNumber = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedScore(easeProgress * attempt.score);
      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        setAnimatedScore(attempt.score);
      }
    };
    const t2 = setTimeout(() => requestAnimationFrame(animateNumber), 150);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [attempt]);

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3 animate-slideUp">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-[var(--border-subtle)] border-t-indigo-500 animate-spin" />
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Loading Result...
          </p>
        </div>
      </div>
    );
  }

  // ── Not Found ──
  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[var(--background)]">
        <div className="text-center animate-slideUp">
          <div className="mb-4 flex justify-center text-slate-400 dark:text-slate-500">
            <Inbox className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Result not found</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">This test result may have been removed.</p>
          <button
            onClick={() => router.push("/test")}
            className="mt-6 px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 transition-all duration-300"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  // ── Derived Data ──
  const score = attempt.score;
  const totalMarks = attempt.total_marks;
  const correct = attempt.correct_answers;
  const wrong = attempt.wrong_answers;
  const total = attempt.total_questions;
  const attempted = attempt.attempted;
  const skipped = total - attempted;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const scorePct = totalMarks > 0 ? Math.max(0, Math.min(100, Math.round((score / totalMarks) * 100))) : 0;

  // Time formatting
  const timeTaken = attempt.time_taken_seconds || 0;
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;
  const timeStr = `${mins}m ${secs}s`;

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

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = showAnim ? circumference - (scorePct / 100) * circumference : circumference;

  const completion = total > 0 ? Math.round((attempted / total) * 100) : 0;
  const headlineMeta = ["Mock Test", `${total} Questions`].filter(Boolean).join(" · ");

  let takeaway = "Review every wrong or skipped question before starting another test.";
  if (total > 0 && attempted <= Math.max(1, Math.floor(total * 0.1))) {
    takeaway = `You attempted only ${attempted} ${attempted === 1 ? "question" : "questions"}. Try a shorter focused test before the next mock.`;
  } else if (accuracy >= 80 && completion >= 80) {
    takeaway = "Strong attempt. Review the few misses and keep the rhythm going.";
  } else if (accuracy >= 70) {
    takeaway = "Accuracy looks solid. Next, work on increasing attempts without rushing.";
  } else if (attempted > 0 && accuracy < 50) {
    takeaway = "Focus on accuracy first. Review concepts behind wrong answers before speed practice.";
  }

  const sessionDetails = [
    `${total} Questions`,
    `${attempted} Attempted`,
    `${timeStr} Time Taken`,
    `${scorePct}% Score`,
  ];

  const correctWidth = total > 0 ? (correct / total) * 100 : 0;
  const wrongWidth = total > 0 ? (wrong / total) * 100 : 0;
  const skippedWidth = total > 0 ? (skipped / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--background)] text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 flex items-start justify-center relative overflow-x-hidden overflow-y-auto">
      <div className="w-full max-w-4xl z-10 animate-slideUp py-6 sm:py-10">
        
        {/* Main Report */}
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] rounded-3xl border border-slate-200/80 dark:border-[var(--border)]/70 shadow-sm p-6 sm:p-8 lg:p-10 mb-8 relative">
          
          {/* HEADER / TITLE */}
          <div className="text-center mb-10">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Test Result
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Test Submitted
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
                  <span className="text-5xl sm:text-6xl font-black text-slate-950 dark:text-white tabular-nums tracking-tighter">
                    {Math.round(animatedScore)}
                  </span>
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    / {totalMarks}
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
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{accuracy}%</p>
                 </div>
                 <div className="bg-slate-50 dark:bg-[var(--surface-elevated)]/50 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-[var(--border-subtle)]/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1.5">Attempted</p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
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
              onClick={() => router.push(`/test/review/${id}`)}
              className="flex-1 rounded-xl bg-brand px-5 py-4 text-sm font-black text-black transition-colors duration-200 hover:bg-brand-hover shadow-sm"
            >
              Review Answers
            </button>

            <button
              onClick={() => router.push("/test/history")}
              className="flex-1 rounded-xl border border-slate-200/80 bg-[var(--card)] px-5 py-4 text-sm font-black text-slate-700 transition-colors duration-200 hover:border-brand/50 dark:border-[var(--border)]/70 dark:bg-[var(--surface)] dark:text-slate-200 shadow-sm"
            >
              View Test History
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 rounded-xl border border-slate-200/80 bg-[var(--card)] px-5 py-4 text-sm font-black text-slate-700 transition-colors duration-200 hover:border-brand/50 dark:border-[var(--border)]/70 dark:bg-[var(--surface)] dark:text-slate-200 shadow-sm"
            >
              Back To Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
