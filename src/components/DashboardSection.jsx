"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── 01. CENTRALIZED SUPABASE-READY MOCK SYSTEM DATA ──────────────────────────
const FORMULA_CARDS = [
  {
    subject: "Physics",
    title: "Kinematic Equations",
    formula: "v = u + at",
    sub: "v² = u² + 2as",
    tag: "Mechanics",
  },
  {
    subject: "Chemistry",
    title: "Ideal Gas Law",
    formula: "PV = nRT",
    sub: "P = pressure, V = volume",
    tag: "Thermodynamics",
  },
  {
    subject: "Maths",
    title: "Quadratic Formula",
    formula: "x = (−b ± √(b²−4ac)) / 2a",
    sub: "For ax² + bx + c = 0",
    tag: "Algebra",
  },
  {
    subject: "Biology",
    title: "Hardy-Weinberg",
    formula: "p² + 2pq + q² = 1",
    sub: "p + q = 1",
    tag: "Genetics",
  },
];

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
      { name: "Rotational Dynamics", pct: 42, color: "bg-rose-500" },
      { name: "Organic Chemistry", pct: 51, color: "bg-amber-500" },
      { name: "Definite Integration", pct: 58, color: "bg-yellow-500" },
    ],
    strongAreas: ["Thermodynamics", "Chemical Bonding", "Modern Physics"]
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
      { name: "Plant Physiology", pct: 45, color: "bg-rose-500" },
      { name: "Ionic Equilibrium", pct: 53, color: "bg-amber-500" },
      { name: "Rotational Motion", pct: 57, color: "bg-yellow-500" },
    ],
    strongAreas: ["Human Physiology", "Chemical Bonding", "Genetics Core"]
  }
};

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

  const filteredFormulas = formulaBooks.filter((book) => {
  if (isNeet) {
    return book.stream === "NEET";
  }

  return book.stream === "JEE";
});

  const getScoreMeta = (score) => {
    if (score >= 90) return { label: "Excellent", text: "text-emerald-400", border: "border-emerald-500/30" };
    if (score >= 75) return { label: "Good", text: "text-sky-400", border: "border-sky-500/30" };
    if (score >= 60) return { label: "Improving", text: "text-amber-400", border: "border-amber-500/30" };
    return { label: "Needs Attention", text: "text-rose-400", border: "border-rose-500/30" };
  };

  const scoreMeta = getScoreMeta(aiData.readinessScore);

  const handleActionClick = (id) => {
    setLaunchingId(id);
    setTimeout(() => setLaunchingId(null), 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

      {/* ── LEFT PANE: FORMULA SECTIONS (Optimized column-span allocation to avoid ragged layout voids) ── */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Formula Cards
          </h2>
          <button className="text-xs text-gray-400 hover:text-white transition-colors font-medium cursor-pointer">
            View all →
          </button>
        </div>

        {/* 🛠️ Stacking items in a clean, high-density 1-column array perfectly pairs layout edges */}
        <div className="flex flex-col gap-3">
          {filteredFormulas.map((book) => (
            <Link
              href={`/formula-books/${book.id}`}
              key={book.id}
              className="block"
            >
              <div className="bg-white dark:bg-[#1a1d2e] border border-gray-100 dark:border-[#2a2d3e] rounded-xl p-4 hover:border-gray-200 dark:hover:border-[#363a52] transition-all duration-150 cursor-pointer shadow-sm min-h-[145px] flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {book.subject}
                  </span>
                  <span className="text-[10px] bg-gray-50 dark:bg-[#232740] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-[#2a2d3e] px-2 py-0.5 rounded-full font-medium">
                    {book.tag}
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 my-1.5">
                  {book.title}
                </p>
                <div className="bg-gray-50 dark:bg-[#232740] rounded-lg px-3 py-2 border border-gray-100 dark:border-[#2a2d3e]">
                  <p className="font-mono text-xs font-bold text-black dark:text-white">
                    {book.formula}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-1">
                  {book.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 🚀 RIGHT PANE: BRAND NEW PREPZII AI INSIGHTS WIDGET CONSOLE (Expanded horizontally for scanning clarity) ── */}
      <div className="lg:col-span-3 space-y-4">
        
        {/* Module Title Banner */}
        <div>
          <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest flex items-center gap-1.5">
            <span>🤖</span> PrepZii AI Insights
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5 leading-normal">
            Personalized recommendations generated from your recent activity.
          </p>
        </div>

        {/* Translucent Master Console Container */}
        <div className="bg-white dark:bg-[#1a1d2e] border border-gray-100 dark:border-[#2a2d3e] rounded-2xl p-5 space-y-5 shadow-lg relative overflow-hidden backdrop-blur-md">
          
          {/* Ambient Blue Background Glow Effect Layer */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 dark:sky-400/5 rounded-full filter blur-2xl pointer-events-none" />

          {/* ── ELEMENT 1: VISUAL AI READY SCORE DISPLAY MODULE ── */}
          <div className="flex items-center gap-4 bg-gray-50/50 dark:bg-[#232740]/40 border border-gray-100/80 dark:border-[#2a2d3e] p-4 rounded-xl relative z-10">
            <div className={`relative w-14 h-14 rounded-full border-4 flex items-center justify-center font-mono shrink-0 transition-all ${scoreMeta.border}`}>
              <div className="text-center">
                <span className="text-sm font-black text-black dark:text-white">{aiData.readinessScore}</span>
                <span className="text-[8px] block opacity-40 font-sans font-bold leading-none">/100</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Exam Readiness</p>
              <p className={`text-sm font-black tracking-tight mt-0.5 ${scoreMeta.text}`}>{scoreMeta.label}</p>
            </div>
          </div>

          {/* ── ELEMENT 2: MICRO INSIGHT TRACK MATRIX FEED CARDS ── */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Diagnostic Metrics</p>
            <div className="max-h-32 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-800">
              {aiData.insights.map((ins) => (
                <div 
                  key={ins.id} 
                  className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-xs border transition-colors ${
                    ins.type === "warn" 
                      ? "bg-rose-500/[0.02] dark:bg-rose-500/[0.01] border-rose-500/10 text-gray-700 dark:text-gray-300" 
                      : "bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01] border-emerald-500/10 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="mt-0.5 shrink-0 text-xs">{ins.type === "warn" ? "⚠️" : "✓"}</span>
                  <p className="font-medium leading-snug">{ins.text}</p>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100 dark:border-[#2a2d3e]" />

          {/* ── ELEMENT 3: ACTIONABLE RECOMMENDATIONS SUITE PANEL ── */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Recommended Next</p>
            <div className="space-y-2">
              {aiData.recommendations.map((rec) => (
                <div 
                  key={rec.id}
                  className="bg-gray-50 dark:bg-[#232740]/40 border border-gray-100 dark:border-[#2a2d3e] p-3 rounded-xl flex items-center justify-between gap-3 group hover:border-sky-400/40 dark:hover:border-sky-500/30 transition-all duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1d2e] flex items-center justify-center border border-gray-200/50 dark:border-[#2a2d3e] text-sm shrink-0">
                      {rec.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{rec.title}</p>
                        <span className={`text-[8px] font-black uppercase px-1 rounded-sm border ${
                          rec.priority === "High" 
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                            : rec.priority === "Medium"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{rec.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleActionClick(rec.id)}
                    disabled={launchingId === rec.id}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer shrink-0 ${
                      launchingId === rec.id
                        ? "bg-emerald-500 text-white scale-95"
                        : "bg-black text-white dark:bg-white dark:text-black hover:opacity-80"
                    }`}
                  >
                    {launchingId === rec.id ? "Launching..." : "Practice"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100 dark:border-[#2a2d3e]" />

          {/* ── ELEMENT 4: TWO-COLUMN STRENGTHS vs WEAKNESS MATRICES PANEL ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Weak Topics Side */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Weak Topics</p>
              <div className="space-y-2">
                {aiData.weakTopics.map((topic) => (
                  <div key={topic.name} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                      <span className="truncate max-w-[120px]">{topic.name}</span>
                      <span className="font-mono">{topic.pct}%</span>
                    </div>
                    <div className="w-full h-1 bg-gray-100 dark:bg-[#232740] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${topic.color}`} style={{ width: `${topic.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strong Areas Side */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Strong Areas</p>
              <div className="space-y-1.5">
                {aiData.strongAreas.map((area) => (
                  <div key={area} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    <span className="text-emerald-500 shrink-0 text-xs">✅</span>
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