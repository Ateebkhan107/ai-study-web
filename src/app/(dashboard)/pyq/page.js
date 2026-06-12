"use client";

import { useState, useEffect } from "react";
import PYQExplore from "@/components/pyq/PYQExplore";
import PYQPractice from "@/components/pyq/PYQPractice";
import PYQAnalytics from "@/components/pyq/PYQAnalytics";
import PYQBookmarks from "@/components/pyq/PYQBookmarks";
import { PYQ_QUESTIONS } from "@/lib/pyqData";

const TABS = [
  { id: "explore",   label: "✦ Explore"   },
  { id: "practice",  label: "⚡ Practice"  },
  { id: "analytics", label: "◎ Analytics" },
  { id: "bookmarks", label: "⊕ Saved"     },
];

export default function PYQPage() {
  const [activeTab, setActiveTab] = useState("explore");

  const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

  // Centralised question state — shared across all tabs
  const [questions, setQuestions] = useState(
    PYQ_QUESTIONS.map((q) => ({
      ...q,
      bookmarked: false,
      attempted:  false,
      selected:   null,   // index of option selected by user
      showAnswer: false,
      aiLoading:  false,
      aiText:     "",
    }))
  );

  const bookmarkedCount = questions.filter((q) => q.bookmarked).length;
  const attemptedCount  = questions.filter((q) => q.attempted).length;
  const correctCount    = questions.filter(
    (q) => q.attempted && q.selected === q.correct
  ).length;

  const updateQuestion = (id, patch) =>
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
    );

  const sharedProps = { questions, updateQuestion };

  if (!mounted) {
  return null;
}

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* ── Page header ── */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Previous Year Questions
        </p>
        <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">
          PYQ Bank
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          AI-powered analysis · {questions.length} questions loaded · JEE &amp; NEET
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Questions", value: "1,240+", sub: "JEE + NEET combined" },
          { label: "Years Covered",   value: "2005–23", sub: "19 years of papers"  },
          { label: "Attempted",       value: attemptedCount, sub: "in this session"   },
          { label: "Bookmarked",      value: bookmarkedCount, sub: "saved for revision" },
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

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 mb-8 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150
              ${activeTab === tab.id
                ? "bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
          >
            {tab.id === "bookmarks" && bookmarkedCount > 0
              ? `⊕ Saved (${bookmarkedCount})`
              : tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === "explore"   && <PYQExplore   {...sharedProps} />}
      {activeTab === "practice"  && <PYQPractice  {...sharedProps} onSwitchTab={setActiveTab} />}
      {activeTab === "analytics" && <PYQAnalytics {...sharedProps} correctCount={correctCount} />}
      {activeTab === "bookmarks" && <PYQBookmarks {...sharedProps} />}
    </div>
  );
}