"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPYQAnalytics, getPYQOverview } from "@/lib/pyq";

import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import PageWrapper from "@/components/PageWrapper";
import { Atom, FlaskConical, Sigma, Dna } from "lucide-react";
import { getBookmarks, removeBookmark } from "@/lib/bookmarks";

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
  BarChart3:    (p) => <Svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></Svg>,
  ChevronRight: (p) => <Svg {...p}><polyline points="9 18 15 12 9 6"/></Svg>,
  Zap:          (p) => <Svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Svg>,
  Clock:        (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>,
  Brain:        (p) => <Svg {...p}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.17Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.17Z"/></Svg>,
  CheckCircle2: (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></Svg>,
  Trophy:       (p) => <Svg {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 19.75 7 21.31 7 22h10c0-.69-.85-2.25-2.03-3.79C14.47 17.98 14 17.55 14 17v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></Svg>,
  Award:        (p) => <Svg {...p}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></Svg>,
  TrendingUp:   (p) => <Svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Svg>,
  Flame:        (p) => <Svg {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></Svg>,
  Play:         (p) => <Svg {...p}><polygon points="5 3 19 12 5 21 5 3"/></Svg>,
  Sparkles:     (p) => <Svg {...p}><path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5z"/></Svg>,
  FileText:     (p) => <Svg {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></Svg>,
  Library:      (p) => <Svg {...p}><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></Svg>,
  Shuffle:      (p) => <Svg {...p}><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.8-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.4c1.3 0 2.5.6 3.3 1.7l6.1 8.6c.8 1.1 2 1.7 3.3 1.7H22"/><path d="m18 14 4 4-4 4"/></Svg>,
  RotateCcw:    (p) => <Svg {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></Svg>,
};

// ─── Theme CSS Token Configs ──────────────────────────────────────────────────
const BG_SURFACE  = "bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl";
const BG_SUNKEN   = "bg-slate-50 dark:bg-slate-800/50";
const BORDER      = "border-slate-200/60 dark:border-slate-700/50";
const BORDER_HV   = "hover:border-indigo-500/30 dark:hover:border-indigo-500/30";
const TXT         = "text-slate-900 dark:text-slate-100";
const TXT_MUTED   = "text-slate-500 dark:text-slate-400";
const ACTIVE_PILL = "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm";
const DIFFICULTY_BADGE = {
  Easy:   "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  Medium: "bg-amber-500/10   text-amber-600   dark:text-amber-400   border border-amber-500/20",
  Hard:   "bg-rose-500/10    text-rose-600    dark:text-rose-400    border border-rose-500/20",
};

const TABS = [
  { id: "practice",  label: "Practice",  Icon: I.Target    },
  { id: "analytics", label: "Analytics", Icon: I.BarChart3 },
  { id: "saved",     label: "Saved",     Icon: I.Bookmark  },
];

// ─── Data ─────────────────────────────────────────────────────────────────────
const MASTER_SUBJECTS = [
  { id: "physics",     label: "Physics",   Icon: Atom,         count: 1240, tracks: ["jee", "neet"] },
  { id: "chemistry",   label: "Chemistry", Icon: FlaskConical, count: 980,  tracks: ["jee", "neet"] },
  { id: "mathematics", label: "Maths",     Icon: Sigma,        count: 1560, tracks: ["jee"] },
  { id: "biology",     label: "Biology",   Icon: Dna,          count: 1740, tracks: ["neet"] },
];

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

const PRACTICE_MODES = [
  { id: "full",     label: "Full Paper",   description: "Solve complete exam paper", Icon: I.FileText },
  { id: "chapter",  label: "Chapter Wise", description: "Practice selected chapters", Icon: I.Library  },
  { id: "random",   label: "Random PYQs",  description: "Mixed PYQ practice",         Icon: I.Shuffle  },
  { id: "mistakes", label: "Mistakes",     description: "Redo wrong questions",       Icon: I.RotateCcw },
];

const PRACTICE_MODE_SUMMARY_LABEL = {
  full:     "Full Paper",
  chapter:  "Chapter Wise",
  random:   "Random PYQs",
  mistakes: "Mistake Revision",
};

const MASTER_SAVED = []; // Unused, fetching dynamically now

const SUBJECT_BAR_COLORS = {
  Physics:     "#6366F1",
  Chemistry:   "#8B5CF6",
  Mathematics: "#06b6d4",
  Maths:       "#06b6d4",
  Biology:     "#10b981",
};

// ─── Shared Atomic Components ─────────────────────────────────────────────────
function StatCard({ Icon: IconComp, label, value, sublabel, accent }) {
  return (
    <div className={`premium-stat-card group cursor-default`}>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none rounded-3xl"
        style={{ background: `linear-gradient(135deg, ${accent}15, transparent)` }}
      />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-3">
          <p className={`text-[10px] font-bold tracking-widest ${TXT_MUTED} uppercase`}>{label}</p>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500"
            style={{ background: `${accent}15`, color: accent }}
          >
            <IconComp size={18} />
          </div>
        </div>
        <div>
          <p
            className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-0.5 bg-gradient-to-br bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            {value}
          </p>
          <p className={`text-[11px] font-medium ${TXT_MUTED} truncate`}>{sublabel}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Practice Tab ─────────────────────────────────────────────────────────────
function PracticeTab({ subjects, track }) {
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedYears,    setSelectedYears]    = useState([]);
  const [practiceMode,     setPracticeMode]     = useState("full");
  const [subjectError,     setSubjectError]     = useState("");

  const [papers,           setPapers]           = useState([]);
  const [selectedAttempt,  setSelectedAttempt]  = useState("");
  const [selectedShift,    setSelectedShift]    = useState("");
  const [loadingPapers,    setLoadingPapers]    = useState(false);

  const [chapters,        setChapters]        = useState([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [chapterError,    setChapterError]    = useState("");

  useEffect(() => {
    if (practiceMode !== "chapter" || selectedSubjects.length === 0) {
      setChapters([]);
      setSelectedChapter("");
      return;
    }
    let cancelled = false;
    async function loadChapters() {
      setLoadingChapters(true);
      setChapterError("");
      try {
        const subjectLabel = subjects.find((s) => s.id === selectedSubjects[0])?.label;
        if (!subjectLabel) { if (!cancelled) setChapters([]); return; }
        const params = new URLSearchParams();
        params.set("exam", track.toUpperCase());
        params.set("subject", subjectLabel);
        const res = await fetch(`/api/pyq/chapters?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load chapters");
        const data = await res.json();
        if (!cancelled) { setChapters(Array.isArray(data) ? data : []); setSelectedChapter(""); }
      } catch (error) {
        console.error("Failed to load chapters:", error);
        if (!cancelled) { setChapters([]); setChapterError("Failed to load chapters. Please try again."); }
      } finally { if (!cancelled) setLoadingChapters(false); }
    }
    loadChapters();
    return () => { cancelled = true; };
  }, [practiceMode, selectedSubjects, subjects, track]);

  useEffect(() => {
    if (!track) return;
    let cancelled = false;
    async function loadPapers() {
      setLoadingPapers(true);
      try {
        const params = new URLSearchParams();
        params.set("exam", track.toUpperCase());
        if (selectedYears.length > 0) params.set("year", selectedYears[0]);
        const res = await fetch(`/api/pyq/papers?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load papers");
        const data = await res.json();
        if (!cancelled) { 
          setPapers(Array.isArray(data) ? data : []); 
          setSelectedAttempt("");
          setSelectedShift("");
        }
      } catch (error) {
        console.error("Failed to load papers:", error);
        if (!cancelled) { setPapers([]); setSelectedAttempt(""); setSelectedShift(""); }
      } finally { if (!cancelled) setLoadingPapers(false); }
    }
    loadPapers();
    return () => { cancelled = true; };
  }, [track, selectedYears]);

  // Derived Options
  const availableAttempts = Array.from(new Set(papers.map(p => p.attempt).filter(Boolean)));
  const availableShifts = Array.from(new Set(papers.filter(p => (!selectedAttempt || p.attempt === selectedAttempt)).map(p => p.shift).filter(Boolean)));

  // Auto-select logic
  useEffect(() => {
    if (track === "jee") {
      // If we haven't selected an attempt, but there's only 1 available, auto-select it
      if (availableAttempts.length === 1 && !selectedAttempt) {
        setSelectedAttempt(availableAttempts[0]);
      }
      // If an attempt is selected (or auto-selected), and there's only 1 shift, auto-select it
      if ((selectedAttempt || availableAttempts.length === 1) && availableShifts.length === 1 && !selectedShift) {
        setSelectedShift(availableShifts[0]);
      }
    }
  }, [papers, availableAttempts, availableShifts, selectedAttempt, selectedShift, track]);

  function handleStartDeck() {
    if (selectedSubjects.length === 0) { setSubjectError("Please select at least one subject to start."); return; }
    
    if (practiceMode === "full" && track === "jee") {
      if (availableAttempts.length > 0 && !selectedAttempt) { setSubjectError("Please select an attempt"); return; }
      if (availableShifts.length > 1 && !selectedShift) { setSubjectError("Please select a shift"); return; }
    }
    
    if (practiceMode === "chapter" && !selectedChapter) { setSubjectError("Please select a chapter"); return; }
    
    setSubjectError("");
    const subjectLabels = subjects.filter((s) => selectedSubjects.includes(s.id)).map((s) => s.label);
    const params = new URLSearchParams();
    params.set("exam", track.toUpperCase());
    params.set("subjects", subjectLabels.join(","));
    if (selectedYears.length > 0) params.set("years", selectedYears.join(","));
    params.set("mode", practiceMode);
    
    if (practiceMode === "chapter" && selectedChapter) params.set("chapter", selectedChapter);
    
    if (track === "jee" && practiceMode === "full") {
      if (selectedAttempt) params.set("attempt", selectedAttempt);
      if (selectedShift) params.set("shift", selectedShift);
    }
    
    router.push(`/pyq/session?${params.toString()}`);
  }

  const toggleSubject = (id) => setSelectedSubjects((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);
  const toggleYear = (yr) => setSelectedYears((p) => p.includes(yr) ? p.filter((y) => y !== yr) : [...p, yr]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
      {/* Left — selectors */}
      <div className="space-y-4">
        {/* Subject selector */}
        <div className={`glass-card p-6 animate-slideUp`} style={{ animationDelay: "150ms" }}>
          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>01 — SELECT SUBJECTS</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {subjects.map((s) => {
              const active = selectedSubjects.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleSubject(s.id)}
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer duration-200 ${
                    active
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : `${BORDER} ${BG_SUNKEN} ${TXT_MUTED}`
                  }`}
                >
                  <s.Icon className="w-7 h-7 mb-1" />
                  <span className="text-sm font-semibold">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Year selector */}
        <div className={`glass-card p-6 animate-slideUp`} style={{ animationDelay: "225ms" }}>
          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>02 — SELECT YEAR BULLETINS</p>
          <div className="flex flex-wrap gap-2">
            {YEARS.map((yr) => (
              <button key={yr} onClick={() => toggleYear(yr)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer duration-200 ${
                  selectedYears.includes(yr)
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : `${BORDER} ${TXT_MUTED}`
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* JEE Selectors (Attempt & Shift) */}
        {track === "jee" && selectedYears.length > 0 && (
          <>
            {/* Attempt Selector */}
            {availableAttempts.length > 0 && (
              <div className={`glass-card p-6 animate-slideUp`} style={{ animationDelay: "300ms" }}>
                <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>03 — SELECT ATTEMPT (SESSION)</p>
                {loadingPapers ? (
                  <p className={`text-sm ${TXT_MUTED}`}>Loading attempts...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableAttempts.map((attempt) => {
                      const isActive = selectedAttempt === attempt;
                      return (
                        <button key={attempt} onClick={() => { setSelectedAttempt(attempt); setSelectedShift(""); }}
                          className={`flex flex-col items-start gap-1 p-4 rounded-xl border transition-all cursor-pointer text-left duration-200 ${
                            isActive
                              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                              : `${BORDER} ${BG_SUNKEN} ${TXT_MUTED}`
                          }`}
                        >
                          <span className="text-sm font-bold">{attempt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Shift Selector */}
            {selectedAttempt && availableShifts.length > 1 && (
              <div className={`glass-card p-6 animate-slideUp`} style={{ animationDelay: "350ms" }}>
                <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>04 — SELECT SHIFT</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableShifts.map((shift) => {
                    const isActive = selectedShift === shift;
                    return (
                      <button key={shift} onClick={() => setSelectedShift(shift)}
                        className={`flex flex-col items-start gap-1 p-4 rounded-xl border transition-all cursor-pointer text-left duration-200 ${
                          isActive
                            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            : `${BORDER} ${BG_SUNKEN} ${TXT_MUTED}`
                        }`}
                      >
                        <span className="text-sm font-bold">Shift {shift}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Practice mode selector */}
        <div className={`glass-card p-6 animate-slideUp`} style={{ animationDelay: "375ms" }}>
          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>
            {track === "jee" ? (availableShifts.length > 1 ? "05 — PRACTICE MODE" : (availableAttempts.length > 0 ? "04 — PRACTICE MODE" : "03 — PRACTICE MODE")) : "03 — PRACTICE MODE"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRACTICE_MODES.map((m) => {
              const active = practiceMode === m.id;
              return (
                <button key={m.id} onClick={() => setPracticeMode(m.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer text-left duration-200 ${
                    active
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : `${BORDER} ${BG_SUNKEN} ${TXT_MUTED}`
                  }`}
                >
                  <m.Icon size={20} className="shrink-0 mt-0.5" />
                  <span>
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="block text-xs mt-0.5 opacity-80">{m.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter selector */}
        {practiceMode === "chapter" && (
          <div className={`glass-card p-6 animate-slideUp`} style={{ animationDelay: "450ms" }}>
            <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>
              {track === "jee" ? (availableShifts.length > 1 ? "06 — SELECT CHAPTER" : (availableAttempts.length > 0 ? "05 — SELECT CHAPTER" : "04 — SELECT CHAPTER")) : "04 — SELECT CHAPTER"}
            </p>
            {selectedSubjects.length === 0 && <p className={`text-sm ${TXT_MUTED}`}>Select a subject first to load its chapters.</p>}
            {selectedSubjects.length > 0 && loadingChapters && <p className={`text-sm ${TXT_MUTED}`}>Loading chapters...</p>}
            {selectedSubjects.length > 0 && !loadingChapters && chapterError && <p className="text-sm text-red-500">{chapterError}</p>}
            {selectedSubjects.length > 0 && !loadingChapters && !chapterError && chapters.length === 0 && <p className={`text-sm ${TXT_MUTED}`}>No chapters found for this subject.</p>}
            {selectedSubjects.length > 0 && !loadingChapters && chapters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {chapters.map((ch) => (
                  <button key={ch} onClick={() => setSelectedChapter(ch)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer duration-200 ${
                      selectedChapter === ch
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        : `${BORDER} ${BG_SUNKEN} ${TXT_MUTED}`
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right — start button */}
      <div>
        <div className={`glass-card p-5 space-y-3 sticky top-24 animate-slideUp`} style={{ animationDelay: "150ms" }}>
          <div className="space-y-2 mb-2">
            <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest`}>SESSION SUMMARY</p>
            <p className={`text-xs ${TXT_MUTED}`}>
              {selectedSubjects.length > 0 ? `${selectedSubjects.length} subject${selectedSubjects.length > 1 ? "s" : ""} selected` : "No subjects selected"}
            </p>
            <p className={`text-xs ${TXT_MUTED}`}>
              {selectedYears.length > 0 ? `Years: ${selectedYears.sort((a, b) => b - a).join(", ")}` : "All years"}
            </p>
            <p className={`text-xs ${TXT_MUTED}`}>Mode: {PRACTICE_MODE_SUMMARY_LABEL[practiceMode]}</p>
            {track === "jee" && practiceMode === "full" && selectedAttempt && (
              <p className={`text-xs ${TXT_MUTED}`}>Attempt: {selectedAttempt}</p>
            )}
            {track === "jee" && practiceMode === "full" && selectedShift && (
              <p className={`text-xs ${TXT_MUTED}`}>Shift: {selectedShift}</p>
            )}
            {practiceMode === "chapter" && (
              <p className={`text-xs ${TXT_MUTED}`}>{selectedChapter ? `Chapter: ${selectedChapter}` : "No chapter selected"}</p>
            )}
          </div>

          <button onClick={handleStartDeck}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 text-sm cursor-pointer transition-all duration-300"
          >
            <I.Play size={14} /> Start Focused Deck
          </button>

          {subjectError && <p className="text-xs text-red-500 font-medium">{subjectError}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ track }) {
  const [analytics,  setAnalytics]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadAnalytics() {
      setLoading(true);
      setLoadError("");
      try {
        const result = await getPYQAnalytics(track);
        if (!cancelled) setAnalytics(result);
      } catch (error) {
        console.error("Failed to load PYQ analytics:", error);
        if (!cancelled) setLoadError("Failed to load analytics. Please try again.");
      } finally { if (!cancelled) setLoading(false); }
    }
    loadAnalytics();
    return () => { cancelled = true; };
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl skeleton-shimmer" />)}
    </div>
  );
  if (loadError) return <p className="text-sm text-red-500">{loadError}</p>;

  const attempted = analytics?.attempted ?? 0;
  const accuracy  = analytics?.accuracy  ?? 0;
  const streak    = analytics?.streak    ?? 0;
  const subjects  = analytics?.subjects  ?? [];

  const sortedByAccuracy = [...subjects].sort((a, b) => b.accuracy - a.accuracy);
  const topSubject     = sortedByAccuracy[0];
  const weakestSubject = sortedByAccuracy[sortedByAccuracy.length - 1];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { Icon: I.Target,       label: "Solved Questions",   value: String(attempted), sublabel: "Practiced Units", accent: "#6366F1" },
          { Icon: I.CheckCircle2, label: "Accuracy Target", value: `${accuracy}%`,    sublabel: "Correct Response",   accent: "#10b981" },
          { Icon: I.Flame,        label: "Archive Streak",  value: `${streak}d`,      sublabel: "Daily Momentum",     accent: "#f59e0b" },
        ].map((s, i) => (
          <div key={s.label} className="animate-slideUp" style={{ animationDelay: `${i * 75 + 150}ms` }}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      <div className={`glass-card p-6 animate-slideUp`} style={{ animationDelay: "375ms" }}>
        <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>SYLLABUS COVERAGE RATIOS</p>
        {subjects.length === 0 && <p className={`text-sm ${TXT_MUTED}`}>No attempts yet — solve some PYQs to see coverage.</p>}
        <div className="space-y-5">
          {subjects.map((item) => (
            <div key={item.subject}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${TXT}`}>{item.subject}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${TXT_MUTED}`}>{item.solved} solved</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{item.accuracy}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.accuracy}%`, background: SUBJECT_BAR_COLORS[item.subject] || "#6b7280" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slideUp" style={{ animationDelay: "450ms" }}>
        <div className={`glass-card p-5`}>
          <I.Award size={18} className="text-amber-500 dark:text-amber-400 mb-3" />
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold mb-1">Top Subject Block</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{topSubject ? topSubject.subject : "—"}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {topSubject ? `${topSubject.accuracy}% accuracy rating` : "No data yet"}
          </p>
        </div>
        <div className={`glass-card p-5`}>
          <I.TrendingUp size={18} className="text-indigo-500 dark:text-indigo-400 mb-3" />
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold mb-1">Underperforming Segment</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{weakestSubject ? weakestSubject.subject : "—"}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {weakestSubject ? "Target core concepts" : "No data yet"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Saved Tab ────────────────────────────────────────────────────────────────
function SavedTab({ track, savedQuestions, onUnsave }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Saved Revision Sets ({savedQuestions.length})</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Bookmarked papers filtered precisely to your active track syllabus bounds.
        </p>
      </div>

      <div className="space-y-3">
        {savedQuestions.map((q, i) => (
          <div key={q.id}
            className={`glass-card p-5 ${BORDER_HV} transition-all duration-300 hover:-translate-y-0.5 animate-slideUp`}
            style={{ animationDelay: `${i * 75 + 150}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    {q.subject}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {q.topic} · {track.toUpperCase()} Archive {q.year}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_BADGE[q.difficulty]}`}>
                    {q.difficulty}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{q.question}</p>
              </div>
              {onUnsave && (
                <button
                  onClick={() => onUnsave(q.id)}
                  className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                  title="Remove Bookmark"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PYQPage() {
  const [activeTab, setActiveTab] = useState("practice");
  const { user } = useUser();
  const [track, setTrack] = useState(null);

  useEffect(() => {
    async function loadTrack() {
      if (!user) return;
      const { data } = await supabase
        .from("user_profiles")
        .select("exam")
        .eq("clerk_user_id", user.id)
        .single();
      setTrack(data?.exam === "NEET" ? "neet" : "jee");
    }
    loadTrack();
  }, [user]);

  const filteredSubjects = MASTER_SUBJECTS.filter((s) => s.tracks.includes(track));

  const [savedQuestions, setSavedQuestions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadSavedQuestions() {
      if (!user) return;
      const bms = await getBookmarks(user.id);
      if (bms.length === 0) {
        if (!cancelled) setSavedQuestions([]);
        return;
      }
      const { data } = await supabase
        .from("pyq_questions")
        .select("*")
        .in("id", bms);
      if (!cancelled && data) {
        // filter by track if needed, or show all
        const filtered = data.filter(q => track === "jee" ? q.exam !== "NEET" : q.exam === "NEET");
        setSavedQuestions(filtered);
      }
    }
    loadSavedQuestions();
    return () => { cancelled = true; };
  }, [user, track]);

  const [overview,       setOverview]       = useState(null);
  const [attemptedTotal, setAttemptedTotal] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadPYQStats() {
      try {
        const [overviewData, analyticsData] = await Promise.all([
          getPYQOverview(track),
          getPYQAnalytics(track),
        ]);
        if (cancelled) return;
        setOverview(overviewData || null);
        setAttemptedTotal(
          analyticsData?.totalQuestions ??
          analyticsData?.totalAttempts  ??
          analyticsData?.attempted      ??
          0
        );
      } catch (error) {
        console.error("Failed loading PYQ stats:", error);
        if (!cancelled) { setOverview(null); setAttemptedTotal(0); }
      }
    }
    loadPYQStats();
    return () => { cancelled = true; };
  }, []);

  const handleUnsave = async (qId) => {
    if (!user?.id) return;
    setSavedQuestions((prev) => prev.filter((q) => q.id !== qId));
    await removeBookmark(user.id, qId);
  };

  const questionVaultValue = overview ? overview.totalQuestions.toLocaleString() : "—";
  const yearRangeValue = overview?.minYear && overview?.maxYear ? `${overview.maxYear - overview.minYear + 1} Years` : "—";
  const yearRangeSublabel = overview?.minYear && overview?.maxYear ? `${overview.minYear} – ${overview.maxYear} Bulletins` : "No data yet";
  const solvedLoadValue = attemptedTotal !== null ? `${attemptedTotal} Solved` : "—";

  if (!track) {
    return (
      <PageWrapper title="PYQ Practice" badge="Loading...">
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl skeleton-shimmer" />)}
          </div>
          <div className="h-64 rounded-2xl skeleton-shimmer" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="PYQ Practice"
      subtitle="Analyze real past examination parameters with automated performance indicators."
      badge={track === "neet" ? "NEET UG Medical Core 🩺" : "IIT JEE Engineering Vault 🚀"}
      badgeVariant={track === "neet" ? "emerald" : "purple"}
    >
      {/* Tab nav */}
      <section className="animate-slideUp" style={{ animationDelay: "150ms" }}>
        <div className="inline-flex items-center bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-xl p-1 gap-1 shadow-sm">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  active
                    ? ACTIVE_PILL
                    : `${TXT_MUTED} hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5`
                }`}
              >
                <tab.Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tab panels */}
      {activeTab === "practice"  && <PracticeTab subjects={filteredSubjects} track={track} />}
      {activeTab === "analytics" && <AnalyticsTab track={track} />}
      {activeTab === "saved"     && <SavedTab track={track} savedQuestions={savedQuestions} onUnsave={handleUnsave} />}
    </PageWrapper>
  );
}