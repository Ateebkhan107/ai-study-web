"use client";

import { useState } from "react";
import QuestionCard from "@/components/pyq/QuestionCard";
import { CHAPTER_WEIGHTAGE, FILTER_OPTIONS } from "@/lib/pyqData";

function FilterChips({ label, value, options, onChange }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border-[1.5px] transition-all duration-150
              ${value === opt
                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                : "bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PYQExplore({ questions, updateQuestion }) {
  const [filterYear,    setFilterYear]    = useState("All");
  const [filterExam,    setFilterExam]    = useState("All");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterDiff,    setFilterDiff]    = useState("All");
  const [search,        setSearch]        = useState("");
  const [repeatOnly,    setRepeatOnly]    = useState(false);

  const filtered = questions.filter((q) => {
    if (filterYear    !== "All" && q.year.toString() !== filterYear) return false;
    if (filterExam    !== "All" && q.exam !== filterExam)            return false;
    if (filterSubject !== "All" && q.subject !== filterSubject)      return false;
    if (filterDiff    !== "All" && q.difficulty !== filterDiff.toLowerCase()) return false;
    if (repeatOnly && !q.repeated)                                   return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !q.text.toLowerCase().includes(s) &&
        !q.chapter.toLowerCase().includes(s) &&
        !q.topic.toLowerCase().includes(s) &&
        !q.subject.toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

      {/* ── Sidebar ── */}
      <aside className="lg:col-span-1 space-y-4">

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4">
            Filters
          </p>

          <FilterChips label="Exam"       value={filterExam}    options={FILTER_OPTIONS.exams}    onChange={setFilterExam}    />
          <FilterChips label="Year"       value={filterYear}    options={FILTER_OPTIONS.years}    onChange={setFilterYear}    />
          <FilterChips label="Subject"    value={filterSubject} options={FILTER_OPTIONS.subjects} onChange={setFilterSubject} />
          <FilterChips label="Difficulty" value={filterDiff}    options={FILTER_OPTIONS.diffs}    onChange={setFilterDiff}    />

          {/* Repeat toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Repeated only
            </span>
            <button
              onClick={() => setRepeatOnly((v) => !v)}
              className={`w-9 h-5 rounded-full border-2 transition-all duration-200 relative
                ${repeatOnly
                  ? "bg-black dark:bg-white border-black dark:border-white"
                  : "bg-gray-200 dark:bg-gray-700 border-gray-200 dark:border-gray-700"
                }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200
                  ${repeatOnly
                    ? "left-4 bg-white dark:bg-black"
                    : "left-0.5 bg-white dark:bg-gray-400"
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Chapter Weightage */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4">
            Chapter Weightage
          </p>
          <div className="space-y-3">
            {CHAPTER_WEIGHTAGE.map((w) => (
              <div key={w.chapter} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 w-28 flex-shrink-0 truncate">
                  {w.chapter}
                </span>
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black dark:bg-white rounded-full"
                    style={{ width: `${w.pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-black dark:text-white w-8 text-right">
                  {w.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Question list ── */}
      <div className="lg:col-span-3">

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by topic, chapter, or keyword…"
          className="w-full px-4 py-2.5 mb-4 rounded-xl border-[1.5px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-black dark:text-white placeholder-gray-400 outline-none focus:border-black dark:focus:border-white transition-colors"
        />

        {/* Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">
            {filtered.length} Questions
          </p>
          <p className="text-xs text-gray-400">
            Click any card to solve &amp; get AI explanation
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                updateQuestion={updateQuestion}
              />
            ))
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-2xl mb-2">🔍</p>
              <p className="font-medium">No questions match your filters.</p>
              <p className="text-sm mt-1">Try adjusting or clearing the filters above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}