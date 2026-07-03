"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

// ─── Theme CSS Token Configs ──────────────────────────────────────────────────
const BG_SURFACE = "bg-white      dark:bg-gray-900/40 backdrop-blur-md";
const BG_SUNKEN  = "bg-gray-100   dark:bg-gray-950/50";     
const BORDER     = "border-gray-200  dark:border-gray-800/60";
const BORDER_HV  = "hover:border-gray-300 dark:hover:border-gray-700";
const TXT        = "text-gray-900  dark:text-[#e6edf3]";
const TXT_MUTED  = "text-gray-500  dark:text-[#7d8590]";
const TXT_DIM    = "text-gray-400  dark:text-[#7d8590]/60";
const SURFACE_HV = "hover:bg-gray-100 dark:hover:bg-gray-950/40";
const ACTIVE_PILL = "bg-gray-900 text-white dark:bg-white dark:text-[#0d1117]";
const DIFFICULTY_BADGE = {
  Easy:   "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  Medium: "bg-amber-500/10   text-amber-600   dark:text-amber-400   border border-amber-500/20",
  Hard:   "bg-rose-500/10    text-rose-600    dark:text-rose-400    border border-rose-500/20",
};
const TABS = [
  { id: "practice",  label: "Practice",  Icon: I.Target    },
  { id: "analytics", label: "Analytics", Icon: I.BarChart3 },
];

// ─── Multi-Tenant Core Blueprints ──────────────────────────────────────────
const MASTER_SUBJECTS = [
  { id: "physics",      label: "Physics",   emoji: "⚛️",  count: 1240, tracks: ["jee", "neet"] },
  { id: "chemistry",    label: "Chemistry", emoji: "🧪",  count: 980,  tracks: ["jee", "neet"] },
  { id: "mathematics",  label: "Maths",     emoji: "∑",   count: 1560, tracks: ["jee"] },
  { id: "biology",      label: "Biology",   emoji: "🧬",  count: 1740, tracks: ["neet"] },
];

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

const MASTER_RECENT = [
  { subject: "Physics",     topic: "Electromagnetic Waves", year: 2025, score: 78, time: "2h ago", track: "jee" },
  { subject: "Biology",     topic: "Genetics & Inheritance",year: 2026, score: 92, time: "3h ago", track: "neet" },
  { subject: "Chemistry",   topic: "Organic Reactions",     year: 2024, score: 85, time: "Yesterday", track: "mixed" },
  { subject: "Mathematics", topic: "Integral Calculus",     year: 2025, score: 62, time: "2d ago", track: "jee" },
];

const MASTER_SAVED = [
  { id: 1, subject: "Physics",     topic: "Optics",           year: 2025, difficulty: "Medium", track: "mixed", question: "A ray of light passes from air to glass at an angle of incidence 45°. Find the angle of refraction..." },
  { id: 2, subject: "Chemistry",   topic: "Electrochemistry", year: 2024, difficulty: "Hard", track: "mixed", question: "Calculate the EMF of the cell: Zn | Zn²⁺(0.1M) || Cu²⁺(0.01M) | Cu at 298K..." },
  { id: 3, subject: "Mathematics", topic: "Probability",      year: 2023, difficulty: "Easy", track: "jee", question: "A bag contains 5 red and 3 blue balls. Two balls are drawn at random. Find the probability..." },
  { id: 4, subject: "Biology",     topic: "Molecular Basis",  year: 2026, difficulty: "Hard", track: "neet", question: "During DNA replication, identify the correct execution sequence of Okazaki fragments processing..." },
];

const MASTER_ANALYTICS = [
  { subject: "Physics",     attempted: 98,  accuracy: 74, color: "#3b82f6", track: "mixed" },
  { subject: "Chemistry",   attempted: 86,  accuracy: 68, color: "#a855f7", track: "mixed" },
  { subject: "Mathematics", attempted: 112, accuracy: 79, color: "#06b6d4", track: "jee" },
  { subject: "Biology",     attempted: 146, accuracy: 82, color: "#10b981", track: "neet" },
];

// ─── Shared Atomic Components ────────────────────────────────────────────────
function StatCard({ Icon: IconComp, label, value, sublabel, accent }) {
  return (
    <div className={`group relative border ${BORDER} ${BG_SURFACE} p-5 rounded-2xl ${BORDER_HV} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-3">
          <p className={`text-[10px] font-bold tracking-widest ${TXT_MUTED} uppercase`}>{label}</p>
          <div className="opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: accent }}><IconComp size={18} /></div>
        </div>
        <div>
          <p className={`text-2xl sm:text-3xl font-black tracking-tight ${TXT} mb-0.5`}>{value}</p>
          <p className={`text-[11px] font-semibold ${TXT_MUTED} truncate`}>{sublabel}</p>
        </div>
      </div>
    </div>
  );
}

function ToggleChip({ label, active, onClick, count }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
        active ? "bg-sky-500 text-white border-sky-500" : `bg-transparent ${TXT_MUTED} ${BORDER} ${BORDER_HV}`
      }`}>
      {label}
      {count !== undefined && <span className={`text-xs ${active ? "text-sky-100" : TXT_MUTED}`}>{count.toLocaleString()}</span>}
    </button>
  );
}

// ─── Tab-Specific Layout Engines ──────────────────────────────────────────────
function PracticeTab({ subjects, track }) {
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedYears,    setSelectedYears]    = useState([]);
  const [difficulty,       setDifficulty]       = useState("Mixed");
  const [questionsCount,   setQuestionsCount]   = useState(20);
  const [subjectError, setSubjectError] = useState("");

  function handleStartDeck() {

    if (selectedSubjects.length === 0) {
      setSubjectError("Please select at least one subject to start.");
      return;
    }

    setSubjectError("");

    const subjectLabels = subjects
      .filter(s => selectedSubjects.includes(s.id))
      .map(s => s.label);

    const params = new URLSearchParams();
    params.set("exam", track.toUpperCase());
    params.set("subjects", subjectLabels.join(","));

    if (selectedYears.length > 0) {
      params.set("years", selectedYears.join(","));
    }

    params.set("difficulty", difficulty);
    params.set("count", String(questionsCount));

    router.push(`/pyq/session?${params.toString()}`);

  }

  const toggleSubject = id => setSelectedSubjects(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
  const toggleYear    = yr => setSelectedYears(p => p.includes(yr) ? p.filter(y => y !== yr) : [...p, yr]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
      <div className="space-y-4">
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6`}>
          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>01 — SELECT SUBJECTS</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {subjects.map(s => {
              const active = selectedSubjects.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleSubject(s.id)} className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${active ? "border-sky-500 bg-sky-500/5 !text-gray-900 dark:!text-white" : `${BORDER} ${BG_SUNKEN} ${TXT_MUTED}`}`}>
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-sm font-semibold">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest`}>02 — SELECT YEAR BULLETINS</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {YEARS.map(yr => (
              <button key={yr} onClick={() => toggleYear(yr)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${selectedYears.includes(yr) ? "border-sky-500 bg-sky-500/5 !text-gray-900 dark:!text-white" : `${BORDER} ${TXT_MUTED}`}`}>
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-5`}>
          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>QUANTITY</p>
          <div className="flex flex-wrap gap-2">
            {[10, 20, 30, 50].map(n => (
              <button key={n} onClick={() => setQuestionsCount(n)} className={`w-12 h-10 rounded-lg text-sm font-bold border transition-all cursor-pointer ${questionsCount === n ? "bg-white text-black border-white shadow-sm" : `${BORDER} ${TXT_MUTED}`}`}>{n}</button>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-5`}>
          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>DIFFICULTY CRITERIA</p>
          <div className="space-y-2">
            {["Easy", "Medium", "Hard", "Mixed"].map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${difficulty === d ? "border-sky-500 bg-sky-500/5 !text-gray-900 dark:!text-white" : `${BORDER} ${TXT_MUTED}`}`}>{d}</button>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-5 space-y-3`}>

  <button onClick={handleStartDeck} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white dark:bg-white dark:text-[#0d1117] font-bold py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-[#e6edf3] text-sm cursor-pointer">
    <I.Play size={14} /> Start Focused Deck
  </button>

  {subjectError && (
    <p className="text-xs text-red-500 font-medium">{subjectError}</p>
  )}

        </div>
      </div>
    </div>
  );
}

function AnalyticsTab({ track, analyticsData }) {
  const isNeet = track === "neet";
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { Icon: I.Target,       label: "Attempted Run",    value: "342",  sublabel: "Questions Answered", accent: "#3b82f6" },
          { Icon: I.CheckCircle2, label: "Accuracy Target",  value: "74%",  sublabel: "Correct Response",   accent: "#10b981" },
          { Icon: I.Flame,        label: "Archive Streak",   value: "12d",  sublabel: "Daily Momentum",     accent: "#f59e0b" },
          { Icon: I.Clock,        label: "Pacing Duration",  value: "48h",  sublabel: "Total System Time",  accent: "#a855f7" },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6`}>
        <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>SYLLABUS COVERAGE RATIOS</p>
        <div className="space-y-5">
          {analyticsData.map(item => (
            <div key={item.subject}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${TXT}`}>{item.subject}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${TXT_MUTED}`}>{item.attempted} solved</span>
                  <span className="text-sm font-bold">{item.accuracy}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.accuracy}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-5`}>
          <I.Award size={18} className="text-amber-400 mb-3" />
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Top Subject Block</p>
          <p className="text-xl font-bold">{isNeet ? "Biology" : "Mathematics"}</p>
          <p className="text-sm text-gray-500 mt-1">79% accuracy rating</p>
        </div>
        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-5`}>
          <I.TrendingUp size={18} className="text-blue-400 mb-3" />
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Underperforming Segment</p>
          <p className="text-xl font-bold">Physics</p>
          <p className="text-sm text-gray-500 mt-1">Target core concepts</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <I.Sparkles size={18} className="text-emerald-400 mb-3" />
          <p className="text-xs text-emerald-500 uppercase tracking-widest font-semibold mb-1">AI Directives</p>
          <p className="text-sm font-medium text-emerald-300">
            {isNeet ? "Review Organic Chemistry pathways to unlock an incremental 15 marks." : "Solidify Vector Algebra formulas to accelerate mock tests speed parameters."}
          </p>
        </div>
      </div>
    </div>
  );
}

function SavedTab({ track, savedQuestions }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold">Saved Revision Sets ({savedQuestions.length})</h3>
        <p className="text-xs text-gray-400">Bookmarked papers filtered precisely to your active track syllabus bounds.</p>
      </div>

      <div className="space-y-3">
        {savedQuestions.map(q => (
          <div key={q.id} className={`group rounded-2xl border ${BORDER} ${BG_SURFACE} p-5 ${BORDER_HV} transition-all`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                    {q.subject}
                  </span>
                  <span className="text-xs text-gray-400">{q.topic} · {track.toUpperCase()} Archive {q.year}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_BADGE[q.difficulty]}`}>{q.difficulty}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{q.question}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Controller Page ───────────────────────────────────────────────────
export default function PYQPage() {
  const [activeTab, setActiveTab] = useState("practice");
  const [track, setTrack] = useState("jee"); // Strict fallback baseline to prevent multi-track leaking

  useEffect(() => {
    if (typeof window !== "undefined") {
      const match = document.cookie.match(new RegExp('(^| )prepzii_track=([^;]+)'));
      const val = match ? match[2].toLowerCase() : 'jee';
      setTrack(val === 'neet' ? 'neet' : 'jee');
    }
  }, []);

  // Filter content arrays strictly down to user track bounds
  const filteredSubjects = MASTER_SUBJECTS.filter(s => s.tracks.includes(track));
  const filteredRecent = MASTER_RECENT.filter(r => r.track === "mixed" || r.track === track);
  const filteredSaved = MASTER_SAVED.filter(s => s.track === "mixed" || s.track === track);
  const filteredAnalytics = MASTER_ANALYTICS.filter(a => a.track === "mixed" || a.track === track);

  const totalQuestionBankCount = filteredSubjects.reduce((sum, s) => sum + s.count, 0);

  const PAGE_STATS = [
    { Icon: I.BookOpen, label: "Question Vault", value: totalQuestionBankCount.toLocaleString(), sublabel: "Track Matched Qs", accent: "#3b82f6" },
    { Icon: I.Calendar, label: "Index Matrix",   value: "10 Years",                 sublabel: "2017 – 2026 Bulletins", accent: "#a855f7" },
    { Icon: I.Target,   label: "Solved Load",    value: "342 Sets",                  sublabel: "Practiced Units", accent: "#06b6d4" },
    { Icon: I.Star,     label: "Revision Deck",  value: filteredSaved.length.toString(), sublabel: "Saved Bookmarks", accent: "#f59e0b" },
  ];

  return (
    <div className={`min-h-full ${TXT}`}>
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Dynamic Track Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">PREVIOUS YEAR ENGINES</p>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
              track === "neet" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-purple-500/5 border-purple-500/20 text-purple-400"
            }`}>
              {track === "neet" ? "NEET UG Medical Core" : "IIT JEE Engineering Vault"}
            </span>
          </div>
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">PYQ Practice</h1>
          <p className="text-gray-400 mt-1 text-sm max-w-xl">
            Analyze real past examination parameters with automated performance indicators.
          </p>
        </div>

        {/* Dynamic Stats Row Displays */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PAGE_STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Tab Selection Navigation Bar */}
        <div className="mb-6">
          <div className="inline-flex items-center bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-xl p-1 gap-1">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    active ? ACTIVE_PILL : `${TXT_MUTED} hover:text-gray-200 hover:bg-gray-800/40`
                  }`}>
                  <tab.Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tab Screen Panel Switcher */}
        {activeTab === "practice"  && 
<PracticeTab 
subjects={filteredSubjects}
track={track}
/>}
        {activeTab === "analytics" && <AnalyticsTab track={track} analyticsData={filteredAnalytics} />}
        {activeTab === "saved"     && <SavedTab track={track} savedQuestions={filteredSaved} />}

      </div>
    </div>
  );
}