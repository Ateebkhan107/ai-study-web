"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import { ClipboardList } from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TESTS = [
  {
    id: 1,
    name: "JEE Advanced – Full Mock #14",
    category: "JEE",
    subjects: ["Physics", "Chemistry", "Maths"],
    date: "2025-06-08",
    questions: 54,
    accuracy: 74,
    timeTaken: 172,
    score: 214,
    maxScore: 300,
  },
  {
    id: 2,
    name: "JEE Main – April Shift 2",
    category: "JEE",
    subjects: ["Physics", "Chemistry", "Maths"],
    date: "2025-06-05",
    questions: 75,
    accuracy: 68,
    timeTaken: 175,
    score: 178,
    maxScore: 300,
  },
  {
    id: 3,
    name: "NEET – Full Syllabus Mock #8",
    category: "NEET",
    subjects: ["Biology", "Physics", "Chemistry"],
    date: "2025-06-03",
    questions: 180,
    accuracy: 91,
    timeTaken: 195,
    score: 680,
    maxScore: 720,
  },
  {
    id: 4,
    name: "Physics – Electrostatics & Magnetism",
    category: "Physics",
    subjects: ["Physics"],
    date: "2025-06-01",
    questions: 30,
    accuracy: 83,
    timeTaken: 42,
    score: 88,
    maxScore: 120,
  },
  {
    id: 5,
    name: "Chemistry – Organic Reactions DPP",
    category: "Chemistry",
    subjects: ["Chemistry"],
    date: "2025-05-29",
    questions: 25,
    accuracy: 48,
    timeTaken: 38,
    score: 54,
    maxScore: 100,
  },
  {
    id: 6,
    name: "Maths – Calculus & Integration",
    category: "Maths",
    subjects: ["Maths"],
    date: "2025-05-27",
    questions: 30,
    accuracy: 80,
    timeTaken: 55,
    score: 96,
    maxScore: 120,
  },
  {
    id: 7,
    name: "Biology – Human Physiology",
    category: "Biology",
    subjects: ["Biology"],
    date: "2025-05-24",
    questions: 45,
    accuracy: 89,
    timeTaken: 50,
    score: 168,
    maxScore: 180,
  },
  {
    id: 8,
    name: "NEET – Biology Grand Test",
    category: "NEET",
    subjects: ["Biology"],
    date: "2025-05-21",
    questions: 90,
    accuracy: 87,
    timeTaken: 95,
    score: 334,
    maxScore: 360,
  },
  {
    id: 9,
    name: "JEE Main – January Shift 1",
    category: "JEE",
    subjects: ["Physics", "Chemistry", "Maths"],
    date: "2025-05-18",
    questions: 75,
    accuracy: 61,
    timeTaken: 168,
    score: 156,
    maxScore: 300,
  },
  {
    id: 10,
    name: "Physics – Modern Physics & Optics",
    category: "Physics",
    subjects: ["Physics"],
    date: "2025-05-15",
    questions: 30,
    accuracy: 63,
    timeTaken: 47,
    score: 74,
    maxScore: 120,
  },
  {
    id: 11,
    name: "Chemistry – Physical Chemistry",
    category: "Chemistry",
    subjects: ["Chemistry"],
    date: "2025-05-12",
    questions: 30,
    accuracy: 87,
    timeTaken: 40,
    score: 102,
    maxScore: 120,
  },
  {
    id: 12,
    name: "Maths – Coordinate Geometry & Vectors",
    category: "Maths",
    subjects: ["Maths"],
    date: "2025-05-09",
    questions: 25,
    accuracy: 72,
    timeTaken: 44,
    score: 78,
    maxScore: 100,
  },
];

const FILTERS = ["All", "JEE", "NEET", "Physics", "Chemistry", "Maths", "Biology"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(mins) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function accuracyMeta(acc) {
  if (acc >= 80) return { color: "text-emerald-500", bg: "bg-emerald-500/10", bar: "bg-emerald-500" };
  if (acc >= 60) return { color: "text-yellow-500", bg: "bg-yellow-500/10", bar: "bg-yellow-500" };
  return { color: "text-red-500", bg: "bg-red-500/10", bar: "bg-red-500" };
}

function categoryColor(cat) {
  const map = {
    JEE: "bg-blue-500/10 text-blue-500",
    NEET: "bg-emerald-500/10 text-emerald-500",
    Physics: "bg-indigo-500/10 text-indigo-500",
    Chemistry: "bg-indigo-500/10 text-indigo-500",
    Maths: "bg-orange-500/10 text-orange-500",
    Biology: "bg-teal-500/10 text-teal-500",
  };
  return map[cat] || "bg-slate-500/10 text-slate-500";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, delay = "0ms" }) {
  return (
    <div
      className="bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-[var(--border)]/50 shadow-sm p-5 flex items-start gap-4 animate-slideUp"
      style={{ animationDelay: delay }}
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-500 dark:text-indigo-400">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-2xl font-black font-display text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function AccuracyBar({ accuracy }) {
  const meta = accuracyMeta(accuracy);
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-[var(--surface-elevated)] overflow-hidden">
        <div
          className={`h-full rounded-full ${meta.bar}`}
          style={{ width: `${accuracy}%` }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums w-8 text-right ${meta.color}`}>{accuracy}%</span>
    </div>
  );
}

// Mobile card
function TestCard({ test }) {
  const meta = accuracyMeta(test.accuracy);
  return (
    <div className="bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-[var(--border)]/50 shadow-sm p-4 flex flex-col gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className={`self-start inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${categoryColor(test.category)}`}>
            {test.category}
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{test.name}</p>
          <p className="text-xs text-slate-400">{formatDate(test.date)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-xl font-black font-display ${meta.color}`}>{test.accuracy}%</p>
          <p className="text-xs text-slate-400">accuracy</p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-[var(--border-subtle)] rounded-xl overflow-hidden text-center">
        <div className="py-2">
          <p className="text-xs text-slate-400 mb-0.5">Score</p>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {test.score}<span className="text-slate-400 font-normal">/{test.maxScore}</span>
          </p>
        </div>
        <div className="py-2">
          <p className="text-xs text-slate-400 mb-0.5">Questions</p>
          <p className="text-xs font-bold text-slate-900 dark:text-white">{test.questions}</p>
        </div>
        <div className="py-2">
          <p className="text-xs text-slate-400 mb-0.5">Time</p>
          <p className="text-xs font-bold text-slate-900 dark:text-white">{formatTime(test.timeTaken)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/test/result?id=${test.id}`}
          className="flex-1 h-8 flex items-center justify-center text-xs bg-brand text-white font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 transition-all duration-300"
        >
          View Result
        </Link>
        <Link
          href={`/test/review?id=${test.id}`}
          className="flex-1 h-8 flex items-center justify-center text-xs border border-slate-200/60 dark:border-[var(--border)]/50 bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500/30 transition-all duration-300"
        >
          Review Answers
        </Link>
      </div>
    </div>
  );
}

// Desktop table row
function TableRow({ test, isLast }) {
  return (
    <tr className={`group hover:bg-slate-50/50 dark:hover:bg-[var(--card)]/5 transition-colors ${!isLast ? "border-b border-slate-200/60 dark:border-[var(--border)]/50" : ""}`}>
      <td className="py-4 pl-6 pr-4">
        <div className="flex items-center gap-3">
          <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${categoryColor(test.category)}`}>
            {test.category}
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
            {test.name}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {formatDate(test.date)}
      </td>
      <td className="py-4 px-4 text-sm font-semibold text-slate-900 dark:text-white tabular-nums text-center">
        {test.questions}
      </td>
      <td className="py-4 px-4">
        <AccuracyBar accuracy={test.accuracy} />
      </td>
      <td className="py-4 px-4 text-sm font-semibold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
        {formatTime(test.timeTaken)}
      </td>
      <td className="py-4 px-4 text-sm font-semibold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
        {test.score}
        <span className="text-slate-400 font-normal text-xs"> /{test.maxScore}</span>
      </td>
      <td className="py-4 pl-4 pr-6">
        <div className="flex items-center gap-2">
          <Link
            href={`/test/result?id=${test.id}`}
            className="h-7 px-3 flex items-center text-xs bg-brand text-white font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 transition-all duration-300 whitespace-nowrap"
          >
            View Result
          </Link>
          <Link
            href={`/test/review?id=${test.id}`}
            className="h-7 px-3 flex items-center text-xs border border-slate-200/60 dark:border-[var(--border)]/50 bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500/30 transition-all duration-300 whitespace-nowrap"
          >
            Review Answers
          </Link>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TestHistoryPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const totalMins = MOCK_TESTS.reduce((s, t) => s + t.timeTaken, 0);
    const avgAcc = Math.round(
      MOCK_TESTS.reduce((s, t) => s + t.accuracy, 0) / MOCK_TESTS.length
    );
    const best = Math.max(...MOCK_TESTS.map((t) => t.accuracy));
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return {
      total: MOCK_TESTS.length,
      avgAcc,
      best,
      studyTime: m ? `${h}h ${m}m` : `${h}h`,
    };
  }, []);

  const filtered = useMemo(() => {
    return MOCK_TESTS.filter((t) => {
      const matchFilter = activeFilter === "All" || t.category === activeFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q));
      return matchFilter && matchSearch;
    });
  }, [activeFilter, search]);

  return (
    <PageWrapper
      title="Test History"
      subtitle="Track all your previous attempts and performance."
      badge="HISTORY"
      badgeIcon={<ClipboardList className="h-3.5 w-3.5" />}
    >

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 animate-slideUp">
        <StatCard
          label="Total Tests"
          value={stats.total}
          sub="all time"
          delay="0ms"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Avg Accuracy"
          value={`${stats.avgAcc}%`}
          sub="across all tests"
          delay="100ms"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Best Score"
          value={`${stats.best}%`}
          sub="highest accuracy"
          delay="200ms"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          }
        />
        <StatCard
          label="Study Time"
          value={stats.studyTime}
          sub="total in tests"
          delay="300ms"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search tests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-8 rounded-xl text-sm bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl border border-slate-200/60 dark:border-[var(--border)]/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Clear search"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 h-9 rounded-xl text-xs font-semibold transition-all border ${
                activeFilter === f
                  ? "bg-brand text-white dark:bg-brand dark:text-white border-transparent"
                  : "bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl border-slate-200/60 dark:border-[var(--border)]/50 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Count ── */}
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        {filtered.length} Test{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-[var(--border)]/50 shadow-sm p-16 text-center">
          <p className="text-slate-400 text-sm mb-3">No tests match your search or filter.</p>
          <button
            onClick={() => { setActiveFilter("All"); setSearch(""); }}
            className="text-xs font-semibold text-slate-900 dark:text-white underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Desktop Table ── */}
      {filtered.length > 0 && (
        <div className="hidden md:block bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-[var(--border)]/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-[var(--border)]/50 bg-slate-50/60 dark:bg-[var(--surface-elevated)]/30">
                <th className="py-3 pl-6 pr-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Test Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  Date
                </th>
                <th className="py-3 px-4 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Qs
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Accuracy
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  Time Taken
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Score
                </th>
                <th className="py-3 pl-4 pr-6 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((test, idx) => (
                <TableRow
                  key={test.id}
                  test={test}
                  isLast={idx === filtered.length - 1}
                />
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* ── Mobile Cards ── */}
      {filtered.length > 0 && (
        <div className="md:hidden grid grid-cols-1 gap-3">
          {filtered.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      )}

    </PageWrapper>
  );
}
