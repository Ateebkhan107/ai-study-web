"use client";

import { useState, useMemo } from "react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_TESTS = [
  {
    id: 1,
    name: "JEE Advanced – Full Mock #12",
    subject: "Mixed",
    date: "2025-06-08",
    score: 214,
    maxScore: 300,
    accuracy: 72,
    duration: 180,
    status: "completed",
    topics: ["Physics", "Chemistry", "Mathematics"],
  },
  {
    id: 2,
    name: "Physics – Electrostatics & Magnetism",
    subject: "Physics",
    date: "2025-06-06",
    score: 88,
    maxScore: 120,
    accuracy: 85,
    duration: 90,
    status: "completed",
    topics: ["Electrostatics", "Magnetism"],
  },
  {
    id: 3,
    name: "NEET – Biology Full Syllabus",
    subject: "Biology",
    date: "2025-06-04",
    score: 310,
    maxScore: 360,
    accuracy: 91,
    duration: 200,
    status: "completed",
    topics: ["Botany", "Zoology"],
  },
  {
    id: 4,
    name: "Chemistry – Organic Reactions",
    subject: "Chemistry",
    date: "2025-06-01",
    score: 54,
    maxScore: 120,
    accuracy: 45,
    duration: 75,
    status: "completed",
    topics: ["GOC", "Named Reactions"],
  },
  {
    id: 5,
    name: "Mathematics – Calculus Sprint",
    subject: "Mathematics",
    date: "2025-05-29",
    score: 96,
    maxScore: 120,
    accuracy: 80,
    duration: 60,
    status: "completed",
    topics: ["Limits", "Integrals", "Differential Equations"],
  },
  {
    id: 6,
    name: "JEE Main – Jan Shift 1 Mock",
    subject: "Mixed",
    date: "2025-05-25",
    score: 178,
    maxScore: 300,
    accuracy: 63,
    duration: 180,
    status: "abandoned",
    topics: ["Physics", "Chemistry", "Mathematics"],
  },
  {
    id: 7,
    name: "Physics – Modern Physics & Optics",
    subject: "Physics",
    date: "2025-05-22",
    score: 74,
    maxScore: 120,
    accuracy: 62,
    duration: 90,
    status: "completed",
    topics: ["Modern Physics", "Optics"],
  },
  {
    id: 8,
    name: "Chemistry – Physical Chemistry",
    subject: "Chemistry",
    date: "2025-05-18",
    score: 102,
    maxScore: 120,
    accuracy: 85,
    duration: 80,
    status: "completed",
    topics: ["Thermodynamics", "Equilibrium", "Electrochemistry"],
  },
];

const TREND_DATA = [
  { label: "May 18", accuracy: 85 },
  { label: "May 22", accuracy: 62 },
  { label: "May 25", accuracy: 63 },
  { label: "May 29", accuracy: 80 },
  { label: "Jun 1", accuracy: 45 },
  { label: "Jun 4", accuracy: 91 },
  { label: "Jun 6", accuracy: 85 },
  { label: "Jun 8", accuracy: 72 },
];

const SUBJECTS = ["All", "Physics", "Chemistry", "Mathematics", "Biology", "Mixed"];
const DATE_RANGES = ["All Time", "Last 7 Days", "Last 30 Days", "Last 3 Months"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(mins) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getAccuracyColor(acc) {
  if (acc >= 80) return "text-emerald-500";
  if (acc >= 60) return "text-yellow-500";
  return "text-red-500";
}

function getAccuracyBg(acc) {
  if (acc >= 80) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (acc >= 60) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  return "bg-red-500/10 text-red-500 border-red-500/20";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function TrendChart({ data }) {
  const max = 100;
  const min = 0;
  const H = 120;
  const W = 600;
  const padX = 32;
  const padY = 16;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * chartW;
    const y = padY + chartH - ((d.accuracy - min) / (max - min)) * chartH;
    return { x, y, ...d };
  });

  const pathD =
    points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");

  const areaD =
    `${pathD} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H + 32}`}
        className="w-full"
        style={{ minWidth: 320 }}
        aria-label="Accuracy trend chart"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padY + chartH - ((v - min) / (max - min)) * chartH;
          return (
            <g key={v}>
              <line
                x1={padX}
                x2={W - padX}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.07"
                strokeWidth="1"
              />
              <text
                x={padX - 6}
                y={y + 4}
                textAnchor="end"
                fontSize="9"
                fill="currentColor"
                opacity="0.35"
              >
                {v}%
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="areaGradDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGrad)" className="dark:fill-[url(#areaGradDark)]" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-gray-900 dark:text-white"
        />

        {/* Points + labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="currentColor" className="text-gray-900 dark:text-white" />
            <circle cx={p.x} cy={p.y} r="6" fill="currentColor" opacity="0.12" className="text-gray-900 dark:text-white" />
            <text
              x={p.x}
              y={H + 20}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity="0.4"
            >
              {p.label}
            </text>
            {/* Tooltip value */}
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity="0.6"
              fontWeight="600"
            >
              {p.accuracy}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "abandoned") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Abandoned
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 inline-block" />
      Completed
    </span>
  );
}

function SubjectChip({ subject }) {
  const map = {
    Physics: "bg-blue-500/10 text-blue-500",
    Chemistry: "bg-purple-500/10 text-purple-500",
    Mathematics: "bg-orange-500/10 text-orange-500",
    Biology: "bg-emerald-500/10 text-emerald-500",
    Mixed: "bg-gray-500/10 text-gray-500 dark:text-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${map[subject] || map.Mixed}`}
    >
      {subject}
    </span>
  );
}

function TestRow({ test }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <SubjectChip subject={test.subject} />
            <StatusBadge status={test.status} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
            {test.name}
          </h3>
          <p className="text-xs text-gray-400">{formatDate(test.date)}</p>
        </div>

        {/* Score ring */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className={`text-xl font-bold ${getAccuracyColor(test.accuracy)}`}
          >
            {test.accuracy}%
          </div>
          <div className="text-xs text-gray-400 font-medium">accuracy</div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden text-center">
        <div className="py-2 px-3">
          <p className="text-xs text-gray-400 font-medium mb-0.5">Score</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {test.score}
            <span className="text-gray-400 font-normal text-xs">/{test.maxScore}</span>
          </p>
        </div>
        <div className="py-2 px-3">
          <p className="text-xs text-gray-400 font-medium mb-0.5">Duration</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {formatDuration(test.duration)}
          </p>
        </div>
        <div className="py-2 px-3">
          <p className="text-xs text-gray-400 font-medium mb-0.5">Topics</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {test.topics.length}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-0.5">
        <button className="flex-1 h-8 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Review Answers
        </button>
        <button className="flex-1 h-8 text-xs font-semibold rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors">
          View Analytics
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TestHistoryPage() {
  const [subject, setSubject] = useState("All");
  const [dateRange, setDateRange] = useState("All Time");

  // Compute aggregate stats
  const stats = useMemo(() => {
    const completed = MOCK_TESTS.filter((t) => t.status === "completed");
    const avgAcc = Math.round(
      completed.reduce((s, t) => s + t.accuracy, 0) / (completed.length || 1)
    );
    const bestScore = Math.max(...completed.map((t) => t.accuracy));
    const totalMins = MOCK_TESTS.reduce((s, t) => s + t.duration, 0);
    const hours = Math.floor(totalMins / 60);
    return {
      attempted: MOCK_TESTS.length,
      avgAcc,
      bestScore,
      studyTime: `${hours}h`,
    };
  }, []);

  // Filter tests
  const now = new Date();
  const filtered = useMemo(() => {
    return MOCK_TESTS.filter((t) => {
      const matchSubject = subject === "All" || t.subject === subject;
      let matchDate = true;
      const d = new Date(t.date);
      if (dateRange === "Last 7 Days")
        matchDate = (now - d) / 86400000 <= 7;
      else if (dateRange === "Last 30 Days")
        matchDate = (now - d) / 86400000 <= 30;
      else if (dateRange === "Last 3 Months")
        matchDate = (now - d) / 86400000 <= 90;
      return matchSubject && matchDate;
    });
  }, [subject, dateRange]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            PrepZii
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Test History
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track all your previous attempts and performance
          </p>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Tests Attempted"
            value={stats.attempted}
            sub="all time"
            accent="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            }
          />
          <StatCard
            label="Avg Accuracy"
            value={`${stats.avgAcc}%`}
            sub="across completed tests"
            accent="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
          />
          <StatCard
            label="Best Score"
            value={`${stats.bestScore}%`}
            sub="highest accuracy"
            accent="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            }
          />
          <StatCard
            label="Study Time"
            value={stats.studyTime}
            sub="total test duration"
            accent="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>

        {/* ── Performance Trend ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                Performance Trend
              </p>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Accuracy over recent tests
              </h2>
            </div>
          </div>
          <TrendChart data={TREND_DATA} />
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Subject filter */}
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Subject
            </p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`px-3 h-8 rounded-xl text-xs font-semibold transition-all border ${
                    subject === s
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Date range filter */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Date Range
            </p>
            <div className="flex flex-wrap gap-2">
              {DATE_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 h-8 rounded-xl text-xs font-semibold transition-all border ${
                    dateRange === r
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Test List ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {filtered.length} Test{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center">
              <p className="text-gray-400 text-sm">No tests match the selected filters.</p>
              <button
                onClick={() => { setSubject("All"); setDateRange("All Time"); }}
                className="mt-3 text-xs font-semibold text-gray-900 dark:text-white underline underline-offset-2"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((test) => (
                <TestRow key={test.id} test={test} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}