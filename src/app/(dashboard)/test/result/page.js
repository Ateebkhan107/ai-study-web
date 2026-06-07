"use client";

// src/app/(dashboard)/test/result/page.js
//
// This is a STANDALONE DEMO of what the result page should look like.
// If you already have a result page, extract the "Review Answers" button
// section and add it where needed.
//
// Supabase migration: pass sessionId via searchParams → /test/result?session=abc123
// Then link to → /test/review?session=abc123

import Link from "next/link";

const mockResult = {
  testName: "JEE Advanced Full Mock #4",
  date: "June 8, 2026",
  score: 62,
  maxScore: 120,
  correct: 6,
  wrong: 3,
  unattempted: 1,
  total: 10,
  accuracy: 67,
  timeTaken: "2h 14m",
  rank: 142,
  percentile: 91.4,
};

function StatPill({ value, label, color }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-5">

        {/* Score Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 mb-4">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
            </svg>
          </div>

          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {mockResult.testName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {mockResult.date} · {mockResult.timeTaken}
          </p>

          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-5xl font-bold text-slate-900 dark:text-white">
              {mockResult.score}
            </span>
            <span className="text-xl text-slate-400 dark:text-slate-500">
              /{mockResult.maxScore}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mockResult.accuracy}% accuracy · Rank #{mockResult.rank} ·{" "}
            {mockResult.percentile}th percentile
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <StatPill
            value={mockResult.correct}
            label="Correct"
            color="text-emerald-600 dark:text-emerald-400"
          />
          <StatPill
            value={mockResult.wrong}
            label="Wrong"
            color="text-rose-600 dark:text-rose-400"
          />
          <StatPill
            value={mockResult.unattempted}
            label="Skipped"
            color="text-amber-600 dark:text-amber-400"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          {/* Review Answers — full-width primary CTA */}
          <Link
            href="/test/review"
            // Supabase version: href={`/test/review?session=${sessionId}`}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-base transition-colors shadow-lg shadow-indigo-600/25"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Review Answers
          </Link>

          {/* Secondary actions — side by side */}
          <div className="flex gap-3">
            <Link
              href="/test"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Test
            </Link>

            <Link
              href="/test"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Test Center
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Detailed analytics available in your{" "}
          <Link href="/analytics" className="text-indigo-500 hover:underline">
            Analytics Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}