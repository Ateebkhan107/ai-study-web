"use client";

import { useState } from "react";
import QuestionCard from "@/components/pyq/QuestionCard";
import { FILTER_OPTIONS } from "@/lib/pyqData";
import { BookOpen, Atom, FlaskConical, Calculator, Dna, Search } from "lucide-react";

// Identical typography and color maps matching the Test Center design tokens
const SUBJECT_CONFIG = {
  "All":       { icon: <BookOpen className="w-6 h-6" />, color: "slate" },
  "Physics":   { icon: <Atom className="w-6 h-6" />, color: "blue" },
  "Chemistry": { icon: <FlaskConical className="w-6 h-6" />, color: "green" },
  "Maths":     { icon: <Calculator className="w-6 h-6" />, color: "purple" },
  "Biology":   { icon: <Dna className="w-6 h-6" />, color: "rose" },
};

const colorMap = {
  slate:  { bg: "bg-slate-50 dark:bg-slate-900/30", border: "border-slate-200 dark:border-slate-800", text: "text-slate-700 dark:text-slate-300" },
  blue:   { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300" },
  green:  { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300" },
  purple: { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-300" },
  rose:   { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-300" },
};

export default function PYQExplore({ questions = [], updateQuestion }) {
  // State Management
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterExam,    setFilterExam]    = useState("All");
  const [filterYear,    setFilterYear]    = useState("All");
  const [filterDiff,    setFilterDiff]    = useState("All");
  const [search,        setSearch]        = useState("");
  const [repeatOnly,    setRepeatOnly]    = useState(false);

  // Safe Filtering Logic[cite: 18]
  const filtered = (questions || []).filter((q) => {
    if (!q) return false;
    if (filterYear    !== "All" && q.year && q.year.toString() !== filterYear) return false;
    if (filterExam    !== "All" && q.exam !== filterExam)            return false;
    if (filterSubject !== "All" && q.subject !== filterSubject)      return false;
    if (filterDiff    !== "All" && q.difficulty !== filterDiff.toLowerCase()) return false;
    if (repeatOnly && !q.repeated)                                   return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !q.text?.toLowerCase().includes(s) &&
        !q.chapter?.toLowerCase().includes(s) &&
        !q.topic?.toLowerCase().includes(s) &&
        !q.subject?.toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  const subjectsPool = FILTER_OPTIONS?.subjects || ["All", "Physics", "Chemistry", "Maths", "Biology"];
  const examsPool    = FILTER_OPTIONS?.exams    || ["All", "JEE Main", "JEE Advanced", "NEET"];
  const yearsPool    = FILTER_OPTIONS?.years    || ["All", "2023", "2022", "2021", "2020", "2019"];
  const diffsPool     = FILTER_OPTIONS?.diffs    || ["All", "Easy", "Medium", "Hard"];

  return (
    <div className="space-y-8">
      
      {/* ── TOP: Test Center Styled Configuration Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section — Reusing Translucent Canvas Panels */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* 01 - Choose Subjects Card */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              01 — Choose Subject
            </p>
            <p className="text-xs text-gray-400 mb-4">Select a subject area to isolate previous questions</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {subjectsPool.map((subj) => {
                const data = SUBJECT_CONFIG[subj] || { icon: <BookOpen className="w-6 h-6" />, color: "slate" };
                const c = colorMap[data.color] || colorMap.slate;
                const isSelected = filterSubject === subj;
                
                return (
                  <button
                    type="button"
                    key={subj}
                    onClick={() => setFilterSubject(subj)}
                    className={`group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 font-semibold text-sm
                      ${isSelected
                        ? `${c.bg} ${c.border} ${c.text}`
                        : "border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50 dark:bg-gray-800/30"
                      }`}
                  >
                    <span className="mb-1 flex items-center justify-center">{data.icon}</span>
                    {subj}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 02 - Target Scope Parameters */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              02 — Scope Parameters
            </p>
            
            <div className="space-y-5">
              {/* Exam Selection Row */}
              <div>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Target Exam</p>
                <div className="flex flex-wrap gap-2">
                  {examsPool.map((exam) => (
                    <button
                      type="button"
                      key={exam}
                      onClick={() => setFilterExam(exam)}
                      className={`px-4 h-10 rounded-lg text-sm font-bold border transition-all duration-100
                        ${filterExam === exam
                          ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                          : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                    >
                      {exam}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Selection Row */}
              <div>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Exam Year</p>
                <div className="flex flex-wrap gap-2">
                  {yearsPool.map((yr) => (
                    <button
                      type="button"
                      key={yr}
                      onClick={() => setFilterYear(yr)}
                      className={`px-4 h-10 rounded-lg text-sm font-bold border transition-all duration-100
                        ${filterYear === yr
                          ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                          : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section — Sidebar Filtration Elements */}
        <div className="space-y-5">
          
          {/* Difficulty Metric Settings */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Difficulty
            </p>
            <div className="flex flex-col gap-2">
              {diffsPool.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setFilterDiff(d)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-100
                    ${filterDiff === d
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                      : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                >
                  <span>{d}</span>
                  {d !== "All" && (
                    <span className="text-xs opacity-60">
                      {d === "Easy" ? "⬤" : d === "Medium" ? "⬤⬤" : "⬤⬤⬤"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Deep Keyword Exploration Card */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Deep Search
            </p>
            
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chapters, concepts..."
              className="w-full px-4 py-3 mb-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 text-sm text-black dark:text-white placeholder-gray-400 outline-none focus:border-indigo-500 transition-colors"
            />

            {/* Repeat Metric Trigger */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                High Yield Only
              </span>
              <button
                type="button"
                onClick={() => setRepeatOnly(!repeatOnly)}
                className={`w-11 h-6 rounded-full border-2 transition-all duration-200 relative
                  ${repeatOnly
                    ? "bg-black dark:bg-white border-black dark:border-white"
                    : "bg-gray-200 dark:bg-gray-800 border-gray-200 dark:border-gray-800"
                  }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200
                    ${repeatOnly
                      ? "left-[18px] bg-white dark:bg-black"
                      : "left-0.5 bg-white dark:bg-gray-400"
                    }`}
                />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── BOTTOM: Render Results Matrix ── */}
      <div>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <p className="text-xs font-black text-black dark:text-white uppercase tracking-widest">
            {filtered.length} {filtered.length === 1 ? "Question" : "Questions"} Isolated
          </p>
          <p className="text-xs font-semibold text-gray-400">
            Click any question panel to attempt & view AI breakdowns
          </p>
        </div>

        <div className="space-y-4 max-w-4xl">
          {filtered.length > 0 ? (
            filtered.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                updateQuestion={updateQuestion}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/20 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center">
              <Search className="w-10 h-10 mb-3 text-gray-400" />
              <p className="text-lg font-bold text-gray-900 dark:text-white">No questions isolated</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try resetting filtering criteria matrices.</p>
              <button 
                type="button"
                onClick={() => {
                  setFilterSubject("All");
                  setFilterExam("All");
                  setFilterYear("All");
                  setFilterDiff("All");
                  setSearch("");
                  setRepeatOnly(false);
                }}
                className="mt-6 px-6 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}