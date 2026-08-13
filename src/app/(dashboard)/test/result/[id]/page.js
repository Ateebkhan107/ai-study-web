"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResultPage() {
  const { id } = useParams();
  const router = useRouter();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="flex flex-col items-center gap-3 animate-slideUp">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500 animate-spin" />
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="text-center animate-slideUp">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Result not found</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">This test result may have been removed.</p>
          <button
            onClick={() => router.push("/test")}
            className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
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
  const skipped = attempt.total_questions - attempt.attempted;
  const accuracy =
    attempt.attempted > 0
      ? Math.round((correct / attempt.attempted) * 100)
      : 0;
  const scorePct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  // Feedback
  let feedbackMessage = "Needs Improvement 📚";
  let feedbackClasses = "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10";

  if (accuracy >= 90) {
    feedbackMessage = "Excellent Work 🎉";
    feedbackClasses = "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10";
  } else if (accuracy >= 70) {
    feedbackMessage = "Good Attempt 🚀";
    feedbackClasses = "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10";
  }

  // Time formatting
  const timeTaken = attempt.time_taken_seconds || 0;
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;
  const timeStr = `${mins}m ${secs}s`;

  // Score ring
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(scorePct, 100) / 100) * circ;
  const ringColor = accuracy >= 90 ? "#10B981" : accuracy >= 70 ? "#6366F1" : "#F59E0B";

  // Stat cards
  const stats = [
    { label: "Score", value: `${score}/${totalMarks}`, icon: "🎯", color: "indigo" },
    { label: "Correct", value: correct, icon: "✓", color: "emerald" },
    { label: "Wrong", value: wrong, icon: "✗", color: "rose" },
    { label: "Skipped", value: skipped, icon: "−", color: "slate" },
    { label: "Accuracy", value: `${accuracy}%`, icon: "🎯", color: "indigo" },
    { label: "Time Taken", value: timeStr, icon: "⏱", color: "slate" },
  ];

  const colorMap = {
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    rose: "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400",
    slate: "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400",
    indigo: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-4 sm:p-6">
      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-500/8 dark:bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-[10%] w-[35%] h-[35%] rounded-full bg-violet-500/8 dark:bg-violet-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/50 p-8 sm:p-10 shadow-sm text-center animate-slideUp">

        {/* ── Score Ring ── */}
        <div className="relative w-36 h-36 mx-auto mb-6">
          <svg width="144" height="144" viewBox="0 0 144 144" className="transform -rotate-90">
            <circle
              cx="72" cy="72" r={r}
              fill="none" strokeWidth="8"
              className="stroke-slate-100 dark:stroke-slate-800"
            />
            <circle
              cx="72" cy="72" r={r}
              fill="none" strokeWidth="8"
              stroke={ringColor}
              strokeDasharray={`${filled} ${circ - filled}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{scorePct}%</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">score</span>
          </div>
        </div>

        {/* ── Title ── */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          Test Submitted!
        </h1>

        {/* ── Feedback Badge ── */}
        <div className={`inline-flex px-5 py-2 rounded-full border text-sm font-bold mb-8 ${feedbackClasses}`}>
          {feedbackMessage}
        </div>

        {/* ── Session Summary ── */}
        <div className="mb-8 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Session Summary
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="px-4 py-2 bg-white/80 dark:bg-slate-800/50 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
              📝 {attempt.total_questions} Questions
            </span>
            <span className="px-4 py-2 bg-white/80 dark:bg-slate-800/50 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
              ✍️ {attempt.attempted} Attempted
            </span>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {stats.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl border text-center transition-all duration-300 hover:-translate-y-0.5 ${colorMap[item.color]}`}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="text-lg mb-1">{item.icon}</div>
              <p className="text-2xl font-black">{item.value}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest mt-0.5 opacity-70">{item.label}</p>
            </div>
          ))}
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push(`/test/review/${id}`)}
            className="py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
          >
            Review Answers →
          </button>

          <button
            onClick={() => router.push("/test/history")}
            className="py-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30 font-bold text-sm text-slate-700 dark:text-slate-300 hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            View Test History
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="py-3 text-slate-400 dark:text-slate-500 font-semibold text-sm hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Back To Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
