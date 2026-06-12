"use client";

import { useState } from "react";

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const Svg = ({ children, size = 16, className = "", style = {} }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className} style={style}>
    {children}
  </svg>
);

const I = {
  BookOpen:     (p) => <Svg {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></Svg>,
  Calendar:     (p) => <Svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Svg>,
  Target:       (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Svg>,
  Star:         (p) => <Svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Svg>,
  Bookmark:     (p) => <Svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></Svg>,
  Layers:       (p) => <Svg {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></Svg>,
  BarChart3:    (p) => <Svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></Svg>,
  ChevronRight: (p) => <Svg {...p}><polyline points="9 18 15 12 9 6"/></Svg>,
  Zap:          (p) => <Svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Svg>,
  Clock:        (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>,
  Brain:        (p) => <Svg {...p}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.17Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.17Z"/></Svg>,
  BookMarked:   (p) => <Svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20l-7-4-7 4V2z"/></Svg>,
  GraduationCap:(p) => <Svg {...p}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></Svg>,
  Play:         (p) => <Svg {...p}><polygon points="5 3 19 12 5 21 5 3"/></Svg>,
  CheckCircle2: (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></Svg>,
  Trophy:       (p) => <Svg {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 19.75 7 21.31 7 22h10c0-.69-.85-2.25-2.03-3.79C14.47 17.98 14 17.55 14 17v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></Svg>,
  Award:        (p) => <Svg {...p}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></Svg>,
  TrendingUp:   (p) => <Svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Svg>,
  Flame:        (p) => <Svg {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></Svg>,
  Refresh:      (p) => <Svg {...p}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></Svg>,
  Sparkles:     (p) => <Svg {...p}><path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5z"/></Svg>,
};

// ─── Theme-aware class helpers ─────────────────────────────────────────────────
// bg — mirrors Test Center exactly: page=transparent(layout handles it), surface=#161b22, sunken=#0d1117
const BG_PAGE    = "bg-gray-50    dark:bg-transparent";   // let layout bg (#0d1117) show through
const BG_SURFACE = "bg-white      dark:bg-[#161b22]";     // same as Test Center panels
const BG_SUNKEN  = "bg-gray-100   dark:bg-[#0d1117]";     // same as Test Center inner cards

// border
const BORDER     = "border-gray-200  dark:border-[#30363d]";
const BORDER_HV  = "hover:border-gray-300 dark:hover:border-[#3d444d]";

// text
const TXT        = "text-gray-900  dark:text-[#e6edf3]";
const TXT_MUTED  = "text-gray-500  dark:text-[#7d8590]";
const TXT_DIM    = "text-gray-400  dark:text-[#7d8590]/60";

// interactive surface
const SURFACE_HV = `hover:bg-gray-100 dark:hover:bg-[#0d1117]`;

// active pill (inverted: dark bg in light mode, white bg in dark mode)
const ACTIVE_PILL      = "bg-gray-900 text-white dark:bg-white dark:text-[#0d1117]";
const ACTIVE_PILL_HV   = "hover:bg-gray-800 dark:hover:bg-[#e6edf3]";
const INACTIVE_PILL    = `border ${BORDER} ${TXT_MUTED} hover:text-gray-700 dark:hover:text-[#e6edf3] ${BORDER_HV}`;

// selected card border (white in dark, gray-900 in light)
const SELECTED_BORDER  = "border-gray-900 dark:border-white";
const SELECTED_BG      = "bg-gray-900/5 dark:bg-white/5";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { id: "physics",      label: "Physics",   emoji: "⚛️",  count: 1240 },
  { id: "chemistry",    label: "Chemistry", emoji: "🧪",  count: 980  },
  { id: "mathematics",  label: "Maths",     emoji: "∑",   count: 1560 },
  { id: "biology",      label: "Biology",   emoji: "🧬",  count: 870  },
];

const YEARS = [2024,2023,2022,2021,2020,2019,2018,2017,2016,2015];

const RECENT_ACTIVITY = [
  { subject: "Physics",     topic: "Electromagnetic Waves", year: 2023, score: 78, time: "2h ago"    },
  { subject: "Chemistry",   topic: "Organic Reactions",     year: 2022, score: 85, time: "Yesterday" },
  { subject: "Mathematics", topic: "Integral Calculus",     year: 2023, score: 62, time: "2d ago"    },
];

const SAVED_QUESTIONS = [
  { id: 1, subject: "Physics",     topic: "Optics",           year: 2023, difficulty: "Medium",
    question: "A ray of light passes from air to glass at an angle of incidence 45°. Find the angle of refraction..." },
  { id: 2, subject: "Chemistry",   topic: "Electrochemistry", year: 2022, difficulty: "Hard",
    question: "Calculate the EMF of the cell: Zn | Zn²⁺(0.1M) || Cu²⁺(0.01M) | Cu at 298K..." },
  { id: 3, subject: "Mathematics", topic: "Probability",      year: 2021, difficulty: "Easy",
    question: "A bag contains 5 red and 3 blue balls. Two balls are drawn at random. Find the probability..." },
];

const ANALYTICS_DATA = {
  bySubject: [
    { subject: "Physics",     attempted: 98,  accuracy: 74, color: "#3b82f6" },
    { subject: "Chemistry",   attempted: 86,  accuracy: 68, color: "#a855f7" },
    { subject: "Mathematics", attempted: 112, accuracy: 79, color: "#06b6d4" },
    { subject: "Biology",     attempted: 46,  accuracy: 61, color: "#10b981" },
  ],
};

const DIFFICULTY_BADGE = {
  Easy:   "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  Medium: "bg-amber-500/10   text-amber-600   dark:text-amber-400   border border-amber-500/20",
  Hard:   "bg-rose-500/10    text-rose-600    dark:text-rose-400    border border-rose-500/20",
};

const TABS = [
  { id: "explore",   label: "Explore",   Icon: I.Layers    },
  { id: "practice",  label: "Practice",  Icon: I.Target    },
  { id: "analytics", label: "Analytics", Icon: I.BarChart3 },
  { id: "saved",     label: "Saved",     Icon: I.Bookmark  },
];

// ─── Shared Components ────────────────────────────────────────────────────────

function StatCard({ Icon: IconComp, label, value, sublabel, accent }) {
  return (
    <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-5 ${BORDER_HV} transition-colors`}>
      <IconComp size={20} style={{ color: accent }} className="mb-3" />
      <p className={`text-2xl font-bold ${TXT} tracking-tight`}>{value}</p>
      <p className={`text-sm font-medium ${TXT_MUTED} mt-0.5`}>{label}</p>
      {sublabel && <p className={`text-xs ${TXT_DIM} mt-1`}>{sublabel}</p>}
    </div>
  );
}

function ToggleChip({ label, active, onClick, count }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
        active
          ? "bg-[#1f6feb] text-white border-[#1f6feb]"
          : `bg-transparent ${TXT_MUTED} ${BORDER} ${BORDER_HV} hover:text-gray-700 dark:hover:text-[#e6edf3]`
      }`}>
      {label}
      {count !== undefined && (
        <span className={`text-xs ${active ? "text-blue-200" : TXT_MUTED}`}>{count.toLocaleString()}</span>
      )}
    </button>
  );
}

// ─── Explore Tab ──────────────────────────────────────────────────────────────
function ExploreTab({ onSwitchTab }) {
  const [activeSubject, setActiveSubject] = useState(null);

  return (
    <div className="space-y-5">
      {/* Browse by Subject */}
      <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-1`}>01 — BROWSE SUBJECTS</p>
            <p className={`${TXT_MUTED} text-sm`}>Select a subject to explore questions</p>
          </div>
          <button className="text-xs text-[#1f6feb] hover:underline font-medium">View all</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <ToggleChip label="All Subjects" count={5290} active={activeSubject === null} onClick={() => setActiveSubject(null)} />
          {SUBJECTS.map(s => (
            <ToggleChip key={s.id} label={s.label} count={s.count}
              active={activeSubject === s.id}
              onClick={() => setActiveSubject(activeSubject === s.id ? null : s.id)} />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUBJECTS.filter(s => !activeSubject || s.id === activeSubject).map(s => (
            <button key={s.id}
              className={`group flex flex-col items-center gap-3 p-5 rounded-xl border ${BORDER} ${BG_SUNKEN} hover:border-[#1f6feb]/60 hover:bg-[#1f6feb]/5 transition-all text-center`}>
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <p className={`text-sm font-semibold ${TXT}`}>{s.label}</p>
                <p className={`text-xs ${TXT_MUTED} mt-0.5`}>{s.count.toLocaleString()} Qs</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Two-col: Quick Actions + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Quick Actions */}
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6`}>
          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>02 — QUICK ACTIONS</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { Icon: I.Zap,      title: "Quick Practice", desc: "10 random PYQs", tab: "practice",  accent: "#1f6feb" },
              { Icon: I.Clock,    title: "Timed Mock",     desc: "Beat the clock", tab: "practice",  accent: "#a855f7" },
              { Icon: I.Brain,    title: "Weak Areas",     desc: "AI-curated Qs",  tab: "analytics", accent: "#06b6d4" },
              { Icon: I.Bookmark, title: "Saved Set",      desc: "Your bookmarks", tab: "saved",     accent: "#10b981" },
            ].map(item => (
              <button key={item.title} onClick={() => onSwitchTab(item.tab)}
                className={`group text-left p-4 rounded-xl border ${BORDER} ${BG_SUNKEN} ${BORDER_HV} ${SURFACE_HV} transition-all`}>
                <item.Icon size={18} style={{ color: item.accent }} className="mb-2.5" />
                <p className={`text-sm font-semibold ${TXT}`}>{item.title}</p>
                <p className={`text-xs ${TXT_MUTED} mt-0.5`}>{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest`}>03 — RECENT ACTIVITY</p>
            <button className="text-xs text-[#1f6feb] hover:underline font-medium">See all</button>
          </div>
          {RECENT_ACTIVITY.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <I.GraduationCap size={28} className={`${TXT_MUTED} mb-2`} />
              <p className={`text-sm ${TXT_MUTED}`}>No activity yet</p>
              <p className={`text-xs ${TXT_DIM} mt-1`}>Start practicing to see history</p>
            </div>
          ) : (
            <div className="space-y-1">
              {RECENT_ACTIVITY.map((item, i) => {
                const scoreColor = item.score >= 80 ? "text-emerald-500 dark:text-emerald-400" : item.score >= 60 ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400";
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${SURFACE_HV} transition-colors cursor-pointer`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${TXT} truncate`}>{item.topic}</p>
                      <p className={`text-xs ${TXT_MUTED}`}>{item.subject} · JEE {item.year}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${scoreColor}`}>{item.score}%</p>
                      <p className={`text-xs ${TXT_MUTED}`}>{item.time}</p>
                    </div>
                    <I.ChevronRight size={13} className={`${TXT_MUTED} shrink-0`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Browse by Year */}
      <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6`}>
        <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>04 — BROWSE BY YEAR</p>
        <div className="flex flex-wrap gap-2">
          {YEARS.map(year => (
            <button key={year}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border ${BORDER} ${TXT_MUTED} hover:border-[#1f6feb]/60 hover:text-gray-700 dark:hover:text-[#e6edf3] hover:bg-[#1f6feb]/5 transition-all`}>
              {year}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Practice Tab ─────────────────────────────────────────────────────────────
function PracticeTab() {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedYears,    setSelectedYears]    = useState([]);
  const [difficulty,       setDifficulty]       = useState("Mixed");
  const [questionsCount,   setQuestionsCount]   = useState(20);
  const [mode,             setMode]             = useState("tutor");

  const toggleSubject = id => setSelectedSubjects(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
  const toggleYear    = yr => setSelectedYears(p => p.includes(yr) ? p.filter(y => y !== yr) : [...p, yr]);

  const summaryText = [
    selectedSubjects.length ? selectedSubjects.join(", ") : "All subjects",
    selectedYears.length    ? selectedYears.sort().join(", ") : "All years",
    `${questionsCount} questions`,
    difficulty,
  ].join(" · ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

      {/* Left: builder */}
      <div className="space-y-4">

        {/* Step 01 — Subjects */}
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6`}>
          <div className="mb-4">
            <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest`}>01 — CHOOSE SUBJECTS</p>
            <p className={`text-xs ${TXT_MUTED} mt-1`}>You can select multiple subjects</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SUBJECTS.map(s => {
              const active = selectedSubjects.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleSubject(s.id)}
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all ${
                    active
                      ? `${SELECTED_BORDER} ${SELECTED_BG} ${TXT}`
                      : `${BORDER} ${BG_SUNKEN} ${TXT_MUTED} ${BORDER_HV} hover:text-gray-700 dark:hover:text-[#e6edf3]`
                  }`}>
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-sm font-semibold">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 02 — Year */}
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest`}>02 — CHOOSE YEAR</p>
              <p className={`text-xs ${TXT_MUTED} mt-1`}>Leave blank for all years</p>
            </div>
            {selectedYears.length > 0 && (
              <button onClick={() => setSelectedYears([])}
                className={`text-xs ${TXT_MUTED} hover:text-gray-700 dark:hover:text-[#e6edf3] border ${BORDER} rounded-lg px-3 py-1.5 transition-colors`}>
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {YEARS.map(yr => (
              <button key={yr} onClick={() => toggleYear(yr)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  selectedYears.includes(yr)
                    ? `${SELECTED_BORDER} ${SELECTED_BG} ${TXT}`
                    : `${BORDER} ${TXT_MUTED} ${BORDER_HV} hover:text-gray-700 dark:hover:text-[#e6edf3]`
                }`}>
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Step 03 — Mode */}
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6`}>
          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>03 — PRACTICE MODE</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "tutor", label: "Tutor Mode",  desc: "Feedback after each Q",   Icon: I.GraduationCap },
              { id: "timed", label: "Timed Mode",  desc: "Race against the clock",  Icon: I.Clock         },
              { id: "exam",  label: "Exam Mode",   desc: "No hints, full simulate", Icon: I.Trophy        },
            ].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex flex-col gap-2 p-4 rounded-xl border text-left transition-all ${
                  mode === m.id
                    ? `${SELECTED_BORDER} ${SELECTED_BG}`
                    : `${BORDER} ${BG_SUNKEN} ${BORDER_HV}`
                }`}>
                <m.Icon size={18} className={mode === m.id ? TXT : TXT_MUTED} />
                <p className={`text-sm font-semibold ${mode === m.id ? TXT : TXT_MUTED}`}>{m.label}</p>
                <p className={`text-xs ${TXT_MUTED}`}>{m.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: config sidebar */}
      <div className="space-y-4">

        {/* Questions */}
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-5`}>
          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>QUESTIONS</p>
          <div className="flex flex-wrap gap-2">
            {[10, 20, 30, 40, 50].map(n => (
              <button key={n} onClick={() => setQuestionsCount(n)}
                className={`w-12 h-10 rounded-lg text-sm font-medium border transition-all ${
                  questionsCount === n
                    ? `${SELECTED_BORDER} ${ACTIVE_PILL} font-bold`
                    : `${BORDER} ${TXT_MUTED} ${BORDER_HV} hover:text-gray-700 dark:hover:text-[#e6edf3]`
                }`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-5`}>
          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>DIFFICULTY</p>
          <div className="space-y-2">
            {["Easy", "Medium", "Hard", "Mixed"].map((d, idx) => {
              const dots = idx === 0 ? 1 : idx === 1 ? 2 : 3;
              const active = difficulty === d;
              return (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    active
                      ? `${SELECTED_BORDER} ${SELECTED_BG} ${TXT}`
                      : `${BORDER} ${TXT_MUTED} ${BORDER_HV} hover:text-gray-700 dark:hover:text-[#e6edf3]`
                  }`}>
                  {d}
                  <span className="flex gap-0.5">
                    {Array.from({ length: d === "Mixed" ? 3 : dots }).map((_, i) => (
                      <span key={i} className={`w-2 h-2 rounded-full ${active ? "bg-gray-900 dark:bg-[#e6edf3]" : "bg-gray-300 dark:bg-[#30363d]"}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start CTA */}
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-5 space-y-3`}>
          <p className={`text-xs ${TXT_MUTED} leading-relaxed`}>{summaryText}</p>
          <button className={`w-full flex items-center justify-center gap-2 ${ACTIVE_PILL} font-bold py-3 rounded-xl ${ACTIVE_PILL_HV} transition-colors text-sm`}>
            <I.Play size={14} />
            Start Practice
          </button>
          <button className={`w-full flex items-center justify-center gap-2 border ${BORDER} ${TXT_MUTED} font-medium py-2.5 rounded-xl ${BORDER_HV} hover:text-gray-700 dark:hover:text-[#e6edf3] transition-colors text-sm`}>
            <I.Zap size={14} />
            Quick Start (random)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { Icon: I.Target,       label: "Total Attempted",  value: "342",  sublabel: "Questions",    accent: "#1f6feb" },
          { Icon: I.CheckCircle2, label: "Overall Accuracy", value: "71%",  sublabel: "Correct rate", accent: "#10b981" },
          { Icon: I.Flame,        label: "Study Streak",     value: "12d",  sublabel: "Keep it up!",  accent: "#f59e0b" },
          { Icon: I.Clock,        label: "Time Spent",       value: "48h",  sublabel: "Total",        accent: "#a855f7" },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-1`}>SUBJECT PERFORMANCE</p>
            <p className={`text-xs ${TXT_MUTED}`}>Accuracy by subject</p>
          </div>
          <button className={`flex items-center gap-1.5 text-xs ${TXT_MUTED} border ${BORDER} rounded-lg px-3 py-1.5 ${BORDER_HV} hover:text-gray-700 dark:hover:text-[#e6edf3] transition-colors`}>
            <I.Refresh size={11} /> Refresh
          </button>
        </div>
        <div className="space-y-5">
          {ANALYTICS_DATA.bySubject.map(item => (
            <div key={item.subject}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${TXT}`}>{item.subject}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${TXT_MUTED}`}>{item.attempted} attempted</span>
                  <span className={`text-sm font-bold ${TXT}`}>{item.accuracy}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-[#30363d] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.accuracy}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-5`}>
          <I.Award size={18} className="text-amber-500 dark:text-amber-400 mb-3" />
          <p className={`text-xs ${TXT_MUTED} uppercase tracking-widest font-semibold mb-1`}>Top Subject</p>
          <p className={`text-xl font-bold ${TXT}`}>Mathematics</p>
          <p className={`text-sm ${TXT_MUTED} mt-1`}>79% · 112 questions</p>
        </div>
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-5`}>
          <I.TrendingUp size={18} className="text-blue-500 dark:text-blue-400 mb-3" />
          <p className={`text-xs ${TXT_MUTED} uppercase tracking-widest font-semibold mb-1`}>Needs Work</p>
          <p className={`text-xl font-bold ${TXT}`}>Biology</p>
          <p className={`text-sm ${TXT_MUTED} mt-1`}>61% · 46 questions</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <I.Sparkles size={18} className="text-emerald-500 dark:text-emerald-400 mb-3" />
          <p className="text-xs text-emerald-600 dark:text-emerald-500/70 uppercase tracking-widest font-semibold mb-1">AI Insight</p>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Focus on Organic Chemistry to boost your overall accuracy by ~5%
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Saved Tab ────────────────────────────────────────────────────────────────
function SavedTab() {
  const [filter, setFilter] = useState("all");
  const subjects = ["all", ...new Set(SAVED_QUESTIONS.map(q => q.subject))];
  const filtered = filter === "all" ? SAVED_QUESTIONS : SAVED_QUESTIONS.filter(q => q.subject === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold ${TXT}`}>
            Saved Questions <span className="text-[#1f6feb]">({SAVED_QUESTIONS.length})</span>
          </p>
          <p className={`text-xs ${TXT_MUTED} mt-0.5`}>Bookmarked questions for focused revision</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {subjects.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border transition-all ${
                filter === s
                  ? "bg-[#1f6feb] text-white border-[#1f6feb]"
                  : `${BORDER} ${TXT_MUTED} ${BORDER_HV} hover:text-gray-700 dark:hover:text-[#e6edf3]`
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-14 flex flex-col items-center text-center`}>
          <I.BookMarked size={36} className={`${TXT_MUTED} mb-3`} />
          <p className={`font-semibold ${TXT_MUTED}`}>No saved questions yet</p>
          <p className={`text-sm ${TXT_DIM} mt-1 max-w-xs`}>Bookmark questions while practicing to build your revision set</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => (
            <div key={q.id}
              className={`group rounded-2xl border ${BORDER} ${BG_SURFACE} p-5 ${BORDER_HV} transition-all`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <span className="text-xs font-semibold text-[#1f6feb] bg-[#1f6feb]/10 px-2 py-0.5 rounded-full border border-[#1f6feb]/20">
                      {q.subject}
                    </span>
                    <span className={`text-xs ${TXT_MUTED}`}>{q.topic} · JEE {q.year}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_BADGE[q.difficulty]}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className={`text-sm text-gray-600 dark:text-[#e6edf3]/80 line-clamp-2 leading-relaxed`}>{q.question}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-[#1f6feb]/10 text-[#1f6feb]">
                    <I.Play size={14} />
                  </button>
                  <button className={`p-2 rounded-lg hover:bg-rose-500/10 ${TXT_MUTED} hover:text-rose-500 dark:hover:text-rose-400 transition-colors`}>
                    <I.Bookmark size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <button className={`w-full py-3.5 rounded-2xl border border-dashed ${BORDER} ${TXT_MUTED} font-medium text-sm ${BORDER_HV} hover:text-gray-700 dark:hover:text-[#e6edf3] transition-colors flex items-center justify-center gap-2`}>
          <I.Play size={14} />
          Practice all {filtered.length} saved questions
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PYQPage() {
  const [activeTab, setActiveTab] = useState("explore");

  const PAGE_STATS = [
    { Icon: I.BookOpen, label: "Question Bank",   value: "5,290", sublabel: "Across all subjects", accent: "#1f6feb" },
    { Icon: I.Calendar, label: "Years Covered",   value: "10",    sublabel: "2015 – 2024",          accent: "#a855f7" },
    { Icon: I.Target,   label: "Attempted",       value: "342",   sublabel: "Questions practiced",  accent: "#06b6d4" },
    { Icon: I.Star,     label: "Saved Questions", value: "3",     sublabel: "In your collection",   accent: "#f59e0b" },
  ];

  return (
    <div className={`min-h-full ${TXT}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-2`}>PREVIOUS YEAR QUESTIONS</p>
          <h1 className={`text-4xl font-extrabold ${TXT} tracking-tight`}>PYQ Practice</h1>
          <p className={`${TXT_MUTED} mt-2 text-sm max-w-xl`}>
            Practice real exam questions with AI-powered insights and performance tracking.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PAGE_STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Tab Control */}
        <div className="mb-6">
          <div className={`inline-flex items-center ${BG_SURFACE} border ${BORDER} rounded-xl p-1 gap-1`}>
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    active
                      ? ACTIVE_PILL
                      : `${TXT_MUTED} hover:text-gray-700 dark:hover:text-[#e6edf3] hover:bg-gray-100 dark:hover:bg-[#0d1117]`
                  }`}>
                  <tab.Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "explore"   && <ExploreTab onSwitchTab={setActiveTab} />}
        {activeTab === "practice"  && <PracticeTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "saved"     && <SavedTab />}

      </div>
    </div>
  );
}