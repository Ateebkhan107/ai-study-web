"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── 01. CENTRALIZED SUPABASE-READY MOCK SYSTEM DATA ──────────────────────────
const AI_INSIGHT_BLUEPRINTS = {
  jee: {
    readinessScore: 78,
    insights: [
      { id: 1, type: "success", text: "Accuracy improved by 5.2% this week" },
      { id: 2, type: "success", text: "Chemistry is your strongest subject" },
      { id: 3, type: "warn", text: "Rotational Dynamics needs revision" },
      { id: 4, type: "warn", text: "You lose most marks in integer-type questions" },
      { id: 5, type: "success", text: "Mock test consistency is improving" },
    ],
    recommendations: [
      { id: 1, priority: "High", title: "Electrostatics PYQ Mastery", desc: "Solve 20 high-yield shift targets", icon: "⚡" },
      { id: 2, priority: "Medium", title: "Chemical Bonding Recall", desc: "Review 10 flash memory cards", icon: "🧪" },
      { id: 3, priority: "High", title: "Physics Mock Test #4", desc: "Benchmark speed constraints", icon: "🎯" },
      { id: 4, priority: "Low", title: "Error Analysis Review", desc: "Fix calculus layout gaps", icon: "📝" },
    ],
    weakTopics: [
      { name: "Rotational Dynamics", pct: 42, colorClass: "bg-rose-500" },
      { name: "Organic Chemistry", pct: 51, colorClass: "bg-amber-500" },
      { name: "Definite Integration", pct: 58, colorClass: "bg-yellow-400" },
    ],
    strongAreas: ["Thermodynamics", "Chemical Bonding", "Modern Physics"],
  },
  neet: {
    readinessScore: 81,
    insights: [
      { id: 1, type: "success", text: "Accuracy improved by 6.4% this week" },
      { id: 2, type: "success", text: "Biology is your strongest subject" },
      { id: 3, type: "warn", text: "Plant Physiology needs revision" },
      { id: 4, type: "warn", text: "Velocity slips detected in Zoology multi-selects" },
      { id: 5, type: "success", text: "OMR tracking consistency is improving" },
    ],
    recommendations: [
      { id: 1, priority: "High", title: "Genetics Crossing Maps", desc: "Solve 30 NCERT pattern drills", icon: "🧬" },
      { id: 2, priority: "Medium", title: "Named Organic Reactions", desc: "Review chemical conversion logs", icon: "🧪" },
      { id: 3, priority: "High", title: "Biology Speed Sprint #9", desc: "Practice 90 botany quick-fires", icon: "🎯" },
      { id: 4, priority: "Low", title: "Physics Formula Cards", desc: "Review modern mechanics sheets", icon: "⚡" },
    ],
    weakTopics: [
      { name: "Plant Physiology", pct: 45, colorClass: "bg-rose-500" },
      { name: "Ionic Equilibrium", pct: 53, colorClass: "bg-amber-500" },
      { name: "Rotational Motion", pct: 57, colorClass: "bg-yellow-400" },
    ],
    strongAreas: ["Human Physiology", "Chemical Bonding", "Genetics Core"],
  },
};

// ─── Readiness ring SVG circumference: r=30 → 2πr ≈ 188.5 ──────────────────
function ReadinessRing({ score }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  const meta =
    score >= 90
      ? { label: "Excellent", color: "#10B981" }
      : score >= 75
      ? { label: "Good", color: "#10B981" }
      : score >= 60
      ? { label: "Improving", color: "#F59E0B" }
      : { label: "Needs Attention", color: "#EF4444" };

  return (
    <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#13162a] border border-gray-100 dark:border-[#252840] rounded-xl p-4">
      {/* SVG ring */}
      <div className="relative w-[72px] h-[72px] shrink-0">
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-gray-200 dark:text-[#252840]"
          />
          {/* Fill */}
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="#4F46E5"
            strokeWidth="6"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[17px] font-black text-indigo-600 dark:text-indigo-400 leading-none">
            {score}
          </span>
          <span className="text-[9px] text-gray-400 font-semibold leading-none mt-0.5">
            /100
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
          Exam Readiness
        </p>
        <p
          className="text-[17px] font-black tracking-tight leading-none mb-2"
          style={{ color: meta.color }}
        >
          {meta.label}
        </p>
        {/* Gradient bar */}
        <div className="h-[4px] rounded-full bg-gray-200 dark:bg-[#252840] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${score}%`,
              background: "linear-gradient(90deg, #6366F1, #22D3EE)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Priority badge ───────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const map = {
    High: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    Medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  };
  return (
    <span
      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
        map[priority] ?? map.Low
      }`}
    >
      {priority}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardSection({ config }) {
  const [launchingId, setLaunchingId] = useState(null);
  const [formulaBooks, setFormulaBooks] = useState([]);

  const isNeet = config?.badge?.toLowerCase().includes("neet");
  const trackKey = isNeet ? "neet" : "jee";
  const aiData = AI_INSIGHT_BLUEPRINTS[trackKey];

  useEffect(() => {
    async function loadBooks() {
      try {
        const res = await fetch("/api/formula-books");
        const data = await res.json();
        setFormulaBooks(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadBooks();
  }, []);

  const filteredFormulas = formulaBooks.filter((book) =>
    isNeet ? book.stream === "NEET" : book.stream === "JEE"
  );

  const handleActionClick = (id) => {
    setLaunchingId(id);
    setTimeout(() => setLaunchingId(null), 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

      {/* ── LEFT: FORMULA CARDS ─────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Formula Cards
          </h2>
          <button className="text-[12px] font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            View all →
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {filteredFormulas.map((book) => (
            <Link href={`/formula-books/${book.id}`} key={book.id} className="block group">
              <div className="bg-white dark:bg-[#13162a] border border-gray-100 dark:border-[#252840] rounded-xl p-4 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-150 shadow-sm flex flex-col gap-3 min-h-[130px]">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {book.subject}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1e2238] border border-gray-100 dark:border-[#252840] px-2 py-0.5 rounded-full">
                    {book.tag}
                  </span>
                </div>

                {/* Title */}
                <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 leading-snug">
                  {book.title}
                </p>

                {/* Formula chip */}
                <div className="bg-gray-50 dark:bg-[#1e2238] border border-gray-100 dark:border-[#252840] rounded-lg px-3 py-2">
                  <p className="font-mono text-[12px] font-bold text-gray-900 dark:text-white">
                    {book.formula}
                  </p>
                  {book.sub && (
                    <p className="font-mono text-[10px] text-gray-400 mt-0.5">
                      {book.sub}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── RIGHT: AI INSIGHTS ──────────────────────────────────────────────── */}
      <div className="lg:col-span-3 space-y-4">

        {/* Section heading */}
        <div>
          <h2 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            Prepzii AI Insights
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            Personalised from your recent activity
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#13162a] border border-gray-100 dark:border-[#252840] rounded-2xl p-5 space-y-5 shadow-sm">

          {/* 1 — Readiness ring */}
          <ReadinessRing score={aiData.readinessScore} />

          {/* 2 — Diagnostic metrics */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Diagnostic Metrics
            </p>
            <div className="space-y-1.5">
              {aiData.insights.map((ins) => (
                <div
                  key={ins.id}
                  className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium border ${
                    ins.type === "warn"
                      ? "bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10 text-gray-700 dark:text-gray-300"
                      : "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="shrink-0 mt-px text-[12px]">
                    {ins.type === "warn" ? "⚠️" : "✓"}
                  </span>
                  {ins.text}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100 dark:border-[#252840]" />

          {/* 3 — Recommended next */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Recommended Next
            </p>
            <div className="space-y-2">
              {aiData.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-3 bg-gray-50 dark:bg-[#1e2238] border border-gray-100 dark:border-[#252840] hover:border-indigo-200 dark:hover:border-indigo-500/30 rounded-xl p-3 transition-all duration-150"
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#13162a] border border-gray-100 dark:border-[#252840] flex items-center justify-center text-[15px] shrink-0">
                    {rec.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[12px] font-bold text-gray-800 dark:text-gray-200 truncate">
                        {rec.title}
                      </span>
                      <PriorityBadge priority={rec.priority} />
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                      {rec.desc}
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleActionClick(rec.id)}
                    disabled={launchingId === rec.id}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      launchingId === rec.id
                        ? "bg-emerald-500 text-white scale-95"
                        : "bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-80"
                    }`}
                  >
                    {launchingId === rec.id ? "Launching…" : "Practice"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100 dark:border-[#252840]" />

          {/* 4 — Weak / Strong grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Weak topics */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Weak Topics
              </p>
              {aiData.weakTopics.map((topic) => (
                <div key={topic.name} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                    <span className="truncate max-w-[130px]">{topic.name}</span>
                    <span className="font-mono tabular-nums">{topic.pct}%</span>
                  </div>
                  <div className="h-[3px] rounded-full bg-gray-100 dark:bg-[#252840] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${topic.colorClass}`}
                      style={{ width: `${topic.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Strong areas */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Strong Areas
              </p>
              <div className="space-y-2">
                {aiData.strongAreas.map((area) => (
                  <div
                    key={area}
                    className="flex items-center gap-2 text-[12px] font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <span className="w-[18px] h-[18px] rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-[10px] shrink-0">
                      ✓
                    </span>
                    <span className="truncate">{area}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}