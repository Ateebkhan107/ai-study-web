"use client";

import { CHAPTER_HEATMAP, CHAPTER_WEIGHTAGE } from "@/lib/pyqData";

const RECOMMENDATIONS = [
  {
    icon: "🎯",
    text: "Kinematics — 18 questions, top JEE priority. Focus on projectile motion and relative velocity.",
    tag: "Must Do",
    tagClass: "bg-black dark:bg-white text-white dark:text-black",
  },
  {
    icon: "⚡",
    text: "Thermodynamics — Gibbs energy & entropy appear every 2 years. Your success rate here is below average.",
    tag: "Weak Area",
    tagClass: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
  },
  {
    icon: "🔁",
    text: "Integration (Calculus) — 8 out of 11 previous questions were repeated with minor variations.",
    tag: "High Repeat",
    tagClass: "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800",
  },
];

function heatmapBg(level) {
  if (level === "high") return "bg-gray-950 dark:bg-white text-white dark:text-black";
  if (level === "med")  return "bg-gray-500 dark:bg-gray-400 text-white dark:text-black";
  return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
}

export default function PYQAnalytics({ questions, correctCount }) {
  const attempted  = questions.filter((q) => q.attempted).length;
  const bookmarked = questions.filter((q) => q.bookmarked).length;
  const accuracy   = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

  // Per-subject breakdown
  const subjects = ["Physics", "Chemistry", "Maths", "Biology"];
  const subjectStats = subjects.map((s) => {
    const pool    = questions.filter((q) => q.subject === s);
    const done    = pool.filter((q) => q.attempted);
    const correct = done.filter((q) => q.selected === q.correct);
    return {
      subject:  s,
      total:    pool.length,
      done:     done.length,
      accuracy: done.length > 0 ? Math.round((correct.length / done.length) * 100) : null,
    };
  });

  return (
    <div className="space-y-6">

      {/* ── Top stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Attempted",   value: attempted,   sub: `of ${questions.length} total`         },
          { label: "Correct",     value: correctCount, sub: `${accuracy}% accuracy`               },
          { label: "Bookmarked",  value: bookmarked,  sub: "saved for revision"                    },
          { label: "High Priority Chapters", value: 3, sub: "need your attention"                 },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm"
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              {s.label}
            </p>
            <p className="text-3xl font-black text-black dark:text-white tracking-tight mb-0.5">
              {s.value}
            </p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Subject performance ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4">
          Subject Performance
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectStats.map((s) => (
            <div key={s.subject} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm font-bold text-black dark:text-white mb-1">{s.subject}</p>
              <p className="text-2xl font-black text-black dark:text-white mb-0.5">
                {s.accuracy !== null ? `${s.accuracy}%` : "—"}
              </p>
              <p className="text-[11px] text-gray-400">
                {s.done}/{s.total} attempted
              </p>
              {/* Mini bar */}
              <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black dark:bg-white rounded-full transition-all"
                  style={{ width: `${s.total > 0 ? (s.done / s.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chapter heatmap ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">
            Chapter Frequency Heatmap
          </p>
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-gray-950 dark:bg-white inline-block" /> High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-gray-500 dark:bg-gray-400 inline-block" /> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-gray-100 dark:bg-gray-800 inline-block" /> Low
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CHAPTER_HEATMAP.map((c) => (
            <div
              key={c.name}
              className={`rounded-xl p-3 text-center ${heatmapBg(c.level)}`}
            >
              <p className="text-[10px] font-semibold leading-tight mb-1 opacity-80">
                {c.name}
              </p>
              <p className="text-xl font-black">{c.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chapter weightage ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4">
          Exam Weightage by Chapter
        </p>
        <div className="space-y-3">
          {CHAPTER_WEIGHTAGE.map((w) => (
            <div key={w.chapter} className="flex items-center gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300 w-36 flex-shrink-0">
                {w.chapter}
              </span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black dark:bg-white rounded-full transition-all duration-500"
                  style={{ width: `${w.pct}%` }}
                />
              </div>
              <span className="text-sm font-black text-black dark:text-white w-10 text-right">
                {w.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Recommendations ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4">
          ✦ AI Recommendations
        </p>
        <div className="space-y-3">
          {RECOMMENDATIONS.map((r) => (
            <div
              key={r.tag}
              className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl"
            >
              <span className="text-xl flex-shrink-0">{r.icon}</span>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  {r.text}
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.tagClass}`}>
                  {r.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}