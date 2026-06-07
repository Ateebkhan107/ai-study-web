"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";

import QuestionCard from "@/components/review/QuestionCard";
import ExplanationCard from "@/components/review/ExplanationCard";
import ReviewSidebar from "@/components/review/ReviewSidebar";
import { mockQuestions, mockSessionMeta, computeStats } from "@/components/review/mockData";

// src/app/(dashboard)/test/review/page.js
//
// Supabase migration path:
//   1. Convert to async Server Component (remove "use client")
//   2. Replace mockQuestions with:
//      const { data } = await supabase
//        .from('questions')
//        .select('*, user_responses!inner(*)')
//        .eq('user_responses.session_id', sessionId)
//   3. Pass data as props to a Client Component wrapper
//   4. sessionId comes from searchParams: /test/review?session=abc123

export default function ReviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState("all");
  const [bookmarks, setBookmarks] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = useMemo(() => computeStats(mockQuestions), []);

  // Compute which question indices are visible under the current filter
  const visibleIndices = useMemo(() => {
    return mockQuestions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => {
        if (filter === "wrong")
          return q.userAnswer !== null && q.userAnswer !== q.correctAnswer;
        if (filter === "unattempted") return q.userAnswer === null;
        return true;
      })
      .map(({ idx }) => idx);
  }, [filter]);

  const currentQuestion = mockQuestions[currentIndex];

  const handlePrev = useCallback(() => {
    const pos = visibleIndices.indexOf(currentIndex);
    if (pos > 0) setCurrentIndex(visibleIndices[pos - 1]);
  }, [currentIndex, visibleIndices]);

  const handleNext = useCallback(() => {
    const pos = visibleIndices.indexOf(currentIndex);
    if (pos < visibleIndices.length - 1)
      setCurrentIndex(visibleIndices[pos + 1]);
  }, [currentIndex, visibleIndices]);

  const handleSelect = useCallback((idx) => {
    setCurrentIndex(idx);
    setSidebarOpen(false);
  }, []);

  const handleFilterChange = useCallback(
    (newFilter) => {
      setFilter(newFilter);
      // Jump to first visible question in new filter
      const newVisible = mockQuestions
        .map((q, idx) => ({ q, idx }))
        .filter(({ q }) => {
          if (newFilter === "wrong")
            return q.userAnswer !== null && q.userAnswer !== q.correctAnswer;
          if (newFilter === "unattempted") return q.userAnswer === null;
          return true;
        })
        .map(({ idx }) => idx);
      if (newVisible.length > 0) setCurrentIndex(newVisible[0]);
    },
    []
  );

  const handleBookmark = useCallback((qId) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
    // TODO: await supabase.from('bookmarks').upsert({ question_id: qId, user_id: userId })
  }, []);

  const currentPos = visibleIndices.indexOf(currentIndex);
  const hasPrev = currentPos > 0;
  const hasNext = currentPos < visibleIndices.length - 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Back */}
          <Link
            href="/test"
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden sm:inline">Back to Tests</span>
          </Link>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              Review: {mockSessionMeta.testName}
            </h1>
          </div>

          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Q{currentIndex + 1} of {mockQuestions.length}
            </span>
            <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / mockQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            Stats
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">
          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0 space-y-4">
            {/* Question Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-6">
              <QuestionCard
                question={currentQuestion}
                index={currentIndex}
              />
            </div>

            {/* Explanation + Notes */}
            <ExplanationCard
              explanation={currentQuestion.explanation}
              questionId={currentQuestion.id}
              onBookmark={handleBookmark}
              isBookmarked={bookmarks.has(currentQuestion.id)}
            />

            {/* Navigation Footer */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Previous
              </button>

              {/* Question counter pill */}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">
                {currentPos + 1} / {visibleIndices.length}
                {filter !== "all" && (
                  <span className="ml-1 text-indigo-500 dark:text-indigo-400">
                    ({filter})
                  </span>
                )}
              </span>

              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </main>

          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-20">
            <ReviewSidebar
              stats={stats}
              sessionMeta={mockSessionMeta}
              questions={mockQuestions}
              currentIndex={currentIndex}
              onSelect={handleSelect}
              filter={filter}
              onFilterChange={handleFilterChange}
              visibleIndices={visibleIndices}
            />
          </aside>
        </div>
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="lg:hidden fixed right-0 top-0 bottom-0 z-50 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Stats & Navigator
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ReviewSidebar
              stats={stats}
              sessionMeta={mockSessionMeta}
              questions={mockQuestions}
              currentIndex={currentIndex}
              onSelect={handleSelect}
              filter={filter}
              onFilterChange={handleFilterChange}
              visibleIndices={visibleIndices}
            />
          </div>
        </>
      )}
    </div>
  );
}