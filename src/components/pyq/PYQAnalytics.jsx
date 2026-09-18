"use client";

import { Target, Zap, Sparkles, BookOpen } from "lucide-react";

function heatmapBg(level) {
  if (level === "high") return "bg-indigo-600 dark:bg-indigo-500 text-white";
  if (level === "med")  return "bg-gray-500 dark:bg-gray-400 text-white dark:text-gray-950";
  return "bg-gray-100 dark:bg-[var(--surface-elevated)] text-gray-600 dark:text-gray-400";
}

export default function PYQAnalytics({ analytics }) {
  const attempted = analytics?.attempted ?? 0;
  const accuracy = analytics?.accuracy ?? 0;
  const subjects = analytics?.subjects ?? [];
  const chapters = analytics?.chapters ?? [];
  
  const totalAttempted = chapters.reduce((sum, c) => sum + c.attempted, 0);

  // Chapter Frequency Heatmap (top 6 attempted chapters)
  const heatmapData = chapters
    .slice()
    .sort((a, b) => b.attempted - a.attempted)
    .slice(0, 6)
    .map((c) => {
      let level = "low";
      if (c.attempted >= 10) level = "high";
      else if (c.attempted >= 5) level = "med";
      return { name: c.chapter, count: c.attempted, level };
    });

  // Practice Distribution by Chapter
  const weightageData = chapters
    .slice()
    .sort((a, b) => b.attempted - a.attempted)
    .slice(0, 5)
    .map((c) => ({
      chapter: c.chapter,
      pct: totalAttempted > 0 ? Math.round((c.attempted / totalAttempted) * 100) : 0,
    }));

  // AI Recommendations
  const recommendations = [];
  const weak = chapters.filter((c) => c.hasEnoughData && c.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);
  const strong = chapters.filter((c) => c.hasEnoughData && c.accuracy >= 80).sort((a, b) => b.attempted - a.attempted);

  if (weak.length > 0) {
    recommendations.push({
      icon: <Zap className="w-6 h-6 text-red-500" />,
      text: `${weak[0].chapter} — Accuracy is at ${weak[0].accuracy}%. Focus on reviewing the core concepts before practicing more.`,
      tag: "Weak Area",
      tagClass: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
    });
  } else if (chapters.length > 0 && !chapters[0].hasEnoughData) {
    recommendations.push({
      icon: <Target className="w-6 h-6 text-indigo-500" />,
      text: `Solve at least 5 questions in ${chapters[0].chapter} to unlock deeper insights.`,
      tag: "Keep Practicing",
      tagClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    });
  }

  if (weak.length > 1) {
    recommendations.push({
      icon: <Target className="w-6 h-6 text-indigo-500" />,
      text: `${weak[1].chapter} — You've missed ${weak[1].incorrect} questions here. Needs targeted practice.`,
      tag: "Must Do",
      tagClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    });
  } else if (chapters.length > 1 && !chapters[1].hasEnoughData) {
    recommendations.push({
      icon: <BookOpen className="w-6 h-6 text-blue-500" />,
      text: `Expand your practice. ${chapters[1].chapter} only has ${chapters[1].attempted} attempts so far.`,
      tag: "Broaden Scope",
      tagClass: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    });
  }

  if (strong.length > 0) {
    recommendations.push({
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      text: `${strong[0].chapter} — Great job! You have a ${strong[0].accuracy}% success rate here.`,
      tag: "Strong Area",
      tagClass: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      icon: <Target className="w-6 h-6 text-indigo-500" />,
      text: "Practice more PYQs to receive personalized, data-driven recommendations.",
      tag: "Keep Going",
      tagClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    });
  }

  return (
    <div className="space-y-6 mt-4">
      {/* ── Subject performance ── */}
      {subjects.length > 0 && (
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm animate-slideUp" style={{ animationDelay: "375ms" }}>
          <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4">
            Subject Performance
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map((s) => (
              <div key={s.subject} className="bg-gray-50 dark:bg-[var(--surface-elevated)] rounded-xl p-4">
                <p className="text-sm font-bold text-black dark:text-white mb-1">{s.subject}</p>
                <p className="text-2xl font-black font-display text-black dark:text-white mb-0.5">
                  {s.accuracy !== null ? `${s.accuracy}%` : "—"}
                </p>
                <p className="text-[11px] text-gray-400">
                  {s.attempted} attempted
                </p>
                {/* Mini bar */}
                <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${s.attempted > 0 ? (s.attempted / Math.max(...subjects.map(sub => sub.attempted))) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chapter heatmap ── */}
      {heatmapData.length > 0 && (
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm animate-slideUp" style={{ animationDelay: "450ms" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">
              Chapter Frequency Heatmap
            </p>
            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 dark:bg-indigo-500 inline-block" /> High
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-gray-500 dark:bg-gray-400 inline-block" /> Medium
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-gray-100 dark:bg-[var(--surface-elevated)] inline-block" /> Low
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {heatmapData.map((c) => (
              <div
                key={c.name}
                className={`rounded-xl p-3 text-center ${heatmapBg(c.level)}`}
              >
                <p className="text-[10px] font-semibold leading-tight mb-1 opacity-80 truncate">
                  {c.name}
                </p>
                <p className="text-xl font-black font-display">{c.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chapter weightage ── */}
      {weightageData.length > 0 && (
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm animate-slideUp" style={{ animationDelay: "525ms" }}>
          <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4">
            Practice Distribution by Chapter
          </p>
          <div className="space-y-3">
            {weightageData.map((w) => (
              <div key={w.chapter} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300 w-36 shrink-0 truncate" title={w.chapter}>
                  {w.chapter}
                </span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-[var(--surface-elevated)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
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
      )}

      {/* ── AI Recommendations ── */}
      <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm animate-slideUp" style={{ animationDelay: "600ms" }}>
        <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" /> AI Recommendations
        </p>
        <div className="space-y-3">
          {recommendations.map((r) => (
            <div
              key={r.tag}
              className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[var(--surface-elevated)]/60 rounded-xl"
            >
              <span className="text-xl shrink-0">{r.icon}</span>
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
