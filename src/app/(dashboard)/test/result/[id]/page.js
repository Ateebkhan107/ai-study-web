"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Inbox } from "lucide-react";

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
  const accuracy =
    attempted > 0
      ? Math.round((correct / attempted) * 100)
      : 0;
  const scorePct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  // Time formatting
  const timeTaken = attempt.time_taken_seconds || 0;
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;
  const timeStr = `${mins}m ${secs}s`;

  let resultLabel = "Needs Improvement";
  let badgeColor = "text-amber-700 dark:text-amber-300 border-amber-300/70 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10";
  if (accuracy >= 80) {
    resultLabel = "Excellent Work";
    badgeColor = "text-emerald-700 dark:text-emerald-300 border-emerald-300/70 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10";
  } else if (accuracy >= 50) {
    resultLabel = "Good Effort";
    badgeColor = "text-indigo-700 dark:text-indigo-300 border-indigo-300/70 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10";
  }

  const completion = total > 0 ? Math.round((attempted / total) * 100) : 0;
  const headlineMeta = ["Mock Test", `${total} Questions`, `${scorePct}% Score`]
    .filter(Boolean)
    .join(" · ");

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

  const metrics = [
    { label: "Accuracy", value: `${accuracy}%` },
    { label: "Correct", value: correct },
    { label: "Wrong", value: wrong },
    { label: "Skipped", value: skipped },
  ];

  const snapshot = [
    { label: "Attempted", value: `${attempted} / ${total}` },
    { label: "Accuracy", value: `${accuracy}%` },
    { label: "Net Score", value: score },
    { label: "Completion", value: `${completion}%` },
  ];

  const sessionDetails = [
    `${total} Questions`,
    `${attempted} Attempted`,
    `${timeStr} Time Taken`,
    `${scorePct}% Score`,
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--background)] text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 flex items-start justify-center relative overflow-x-hidden overflow-y-auto">
      <div className="w-full max-w-5xl z-10 animate-slideUp py-6 sm:py-10">
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] rounded-2xl border border-slate-200/80 dark:border-[var(--border)]/70 shadow-sm p-6 sm:p-8 lg:p-10 mb-8">
          <div className="border-b border-slate-200/80 pb-8 text-center dark:border-[var(--border)]/70">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Test Result
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Test Submitted
            </h1>
            <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400 sm:text-base">
              {headlineMeta}
            </p>

            <div className="mt-8">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Score
              </p>
              <div className="mt-2 flex items-end justify-center gap-3">
                <span className="text-6xl font-black leading-none tracking-tight text-slate-950 dark:text-white sm:text-7xl">
                  {score}
                </span>
                <span className="pb-2 text-2xl font-black text-slate-400 dark:text-slate-500 sm:text-3xl">
                  / {totalMarks}
                </span>
              </div>
              <span className={`mt-5 inline-flex rounded-full border px-4 py-1.5 text-sm font-black ${badgeColor}`}>
                {resultLabel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-slate-200/80 py-7 dark:border-[var(--border)]/70 sm:grid-cols-4">
            {metrics.map((item) => (
              <div key={item.label} className="px-3 py-3 text-center sm:border-l sm:first:border-l-0 sm:border-slate-200/80 sm:dark:border-[var(--border)]/70">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-8 py-8 lg:grid-cols-[1fr_0.9fr]">
            <section>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Performance Snapshot
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
                {snapshot.map((item) => (
                  <div key={item.label} className="border-t border-slate-200/80 pt-4 dark:border-[var(--border)]/70">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-7">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Session Details
                </h2>
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  {sessionDetails.map((item, index) => (
                    <span key={`${item}-${index}`} className="inline-flex items-center gap-3">
                      {index > 0 && <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />}
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-l-4 border-brand bg-slate-50 px-5 py-4 dark:bg-[var(--surface-elevated)]/50">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Today&apos;s Takeaway
                </h2>
                <p className="mt-3 text-base font-semibold leading-7 text-slate-800 dark:text-slate-100">
                  {takeaway}
                </p>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-7 dark:border-[var(--border)]/70 sm:flex-row">
          <button
            onClick={() => router.push(`/test/review/${id}`)}
            className="flex-1 rounded-xl bg-brand px-5 py-3.5 text-sm font-black text-black transition-colors duration-200 hover:bg-brand-hover"
          >
            Review Answers
          </button>

          <button
            onClick={() => router.push("/test/history")}
            className="flex-1 rounded-xl border border-slate-200/80 bg-[var(--card)] px-5 py-3.5 text-sm font-black text-slate-700 transition-colors duration-200 hover:border-brand/50 dark:border-[var(--border)]/70 dark:bg-[var(--surface)] dark:text-slate-200"
          >
            View Test History
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 rounded-xl border border-slate-200/80 bg-[var(--card)] px-5 py-3.5 text-sm font-black text-slate-700 transition-colors duration-200 hover:border-brand/50 dark:border-[var(--border)]/70 dark:bg-[var(--surface)] dark:text-slate-200"
          >
            Back To Dashboard
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
