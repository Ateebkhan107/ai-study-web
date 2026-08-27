"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPYQAnalytics, getPYQOverview } from "@/lib/pyq";

import { useUser } from "@clerk/nextjs";
import { Atom, Dna, FlaskConical, Sigma } from "lucide-react";
import { getBookmarks, removeBookmark } from "@/utils/bookmarks";

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
const BG_SURFACE  = "bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl";
const BG_SUNKEN   = "bg-slate-50 dark:bg-[var(--surface-elevated)]/50";
const BORDER      = "border-slate-200/60 dark:border-[var(--border)]/50";
const BORDER_HV   = "hover:border-indigo-500/30 dark:hover:border-indigo-500/30";
const TXT         = "text-slate-900 dark:text-slate-100";
const TXT_MUTED   = "text-slate-500 dark:text-slate-400";
const ACTIVE_PILL = "bg-indigo-50 text-indigo-700 border border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-700/60 shadow-sm";
const DIFFICULTY_BADGE = {
  Easy:   "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  Medium: "bg-amber-500/10   text-amber-600   dark:text-amber-400   border border-amber-500/20",
  Hard:   "bg-rose-500/10    text-rose-600    dark:text-rose-400    border border-rose-500/20",
};

const TABS = [
  { id: "practice",  label: "Practice",  Icon: I.Target    },
  { id: "analytics", label: "Analytics", Icon: I.BarChart3, pro: true },
  { id: "saved",     label: "Saved",     Icon: I.Bookmark  },
];

// ─── Data ─────────────────────────────────────────────────────────────────────
const MASTER_SUBJECTS = [
  { id: "physics",     label: "Physics",   Icon: Atom,         count: 1240, tracks: ["jee", "neet"] },
  { id: "chemistry",   label: "Chemistry", Icon: FlaskConical, count: 980,  tracks: ["jee", "neet"] },
  { id: "mathematics", label: "Maths",     Icon: Sigma,        count: 1560, tracks: ["jee"] },
  { id: "biology",     label: "Biology",   Icon: Dna,          count: 1740, tracks: ["neet"] },
];

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

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

const PRO_ONLY_PRACTICE_MODES = new Set(["chapter", "mistakes"]);

const MASTER_SAVED = []; // Unused, fetching dynamically now

function getCookieTrack() {
  if (typeof document === "undefined") return "jee";
  const match = document.cookie.match(new RegExp("(^| )prepzii_track=([^;]+)"));
  return match && decodeURIComponent(match[2]).toUpperCase() === "NEET" ? "neet" : "jee";
}

const SUBJECT_BAR_COLORS = {
  Physics:     "#4F6F86",
  Chemistry:   "#4F7A59",
  Mathematics: "#A95D32",
  Maths:       "#A95D32",
  Biology:     "#A05252",
};

const SAVED_PYQ_SELECT_FIELDS = [
  "id",
  "exam",
  "exam_type",
  "year",
  "attempt",
  "shift",
  "paper_code",
  "subject",
  "chapter",
  "difficulty",
  "question",
  "question_image",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "option_a_image",
  "option_b_image",
  "option_c_image",
  "option_d_image",
  "correct_option",
  "explanation",
  "explanation_image",
  "question_type",
  "correct_options",
  "numerical_answer",
  "numerical_min",
  "numerical_max",
  "marks_positive",
  "marks_negative",
].join(", ");

// ─── Shared Atomic Components ─────────────────────────────────────────────────
function StatCard({ Icon: IconComp, label, value, sublabel, accent }) {
  return (
    <div className="premium-stat-card group cursor-default">
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none rounded-3xl"
        style={{ background: `linear-gradient(135deg, ${accent}15, transparent)` }}
      />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
          <p className={`text-[10px] font-bold tracking-widest ${TXT_MUTED} uppercase`}>{label}</p>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl opacity-80 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:opacity-100 sm:h-10 sm:w-10"
            style={{ background: `${accent}15`, color: accent }}
          >
            <IconComp size={18} />
          </div>
        </div>
        <div>
          <p
            className="mb-0.5 bg-gradient-to-br bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:text-3xl"
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
function PracticeTab({ subjects, track, isPro }) {
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
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [chapterError,    setChapterError]    = useState("");
  const jeeFullMode = track === "jee" && practiceMode === "full";
  const jeeRandomMode = track === "jee" && practiceMode === "random";
  const selectedModeLocked = PRO_ONLY_PRACTICE_MODES.has(practiceMode) && !isPro;
  const shouldLoadChapters = practiceMode === "chapter" && selectedSubjects.length > 0;

  useEffect(() => {
    let cancelled = false;

    async function loadChapters() {
      if (!shouldLoadChapters) {
        if (!cancelled) {
          setChapters([]);
          setSelectedChapters([]);
          setLoadingChapters(false);
          setChapterError("");
        }
        return;
      }

      setLoadingChapters(true);
      setChapterError("");
      try {
        const subjectLabels = subjects.filter((s) => selectedSubjects.includes(s.id)).map((s) => s.label);
        if (subjectLabels.length === 0) { if (!cancelled) setChapters([]); return; }
        const params = new URLSearchParams();
        params.set("exam", track.toUpperCase());
        params.set("subject", subjectLabels.join(","));
        const res = await fetch(`/api/pyq/chapters?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load chapters");
        const data = await res.json();
        if (!cancelled) {
          const loadedChapters = Array.isArray(data) ? data : [];
          setChapters(loadedChapters);
          setSelectedChapters(prev => prev.filter(c => loadedChapters.includes(c)));
        }
      } catch (error) {
        console.error("Failed to load chapters:", error);
        if (!cancelled) { setChapters([]); setChapterError("Failed to load chapters. Please try again."); }
      } finally { if (!cancelled) setLoadingChapters(false); }
    }
    loadChapters();
    return () => { cancelled = true; };
  }, [shouldLoadChapters, selectedSubjects, subjects, track]);

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
  const availableAttempts = Array.from(new Set(papers.map((paper) => paper.attempt_label || paper.attempt).filter(Boolean)));
  const effectiveSelectedAttempt =
    selectedAttempt || (track === "jee" && availableAttempts.length === 1 ? availableAttempts[0] : "");
  const availableShiftPapers = papers.filter(
    (paper) => !effectiveSelectedAttempt || (paper.attempt_label || paper.attempt) === effectiveSelectedAttempt
  );
  const effectiveSelectedShift =
    selectedShift || (track === "jee" && availableShiftPapers.length === 1 ? availableShiftPapers[0].id : "");

  function handleStartDeck() {
    if (selectedModeLocked) {
      router.push("/pro");
      return;
    }

    const subjectLabels = selectedSubjects.length > 0
      ? subjects.filter((s) => selectedSubjects.includes(s.id)).map((s) => s.label)
      : (jeeFullMode || jeeRandomMode)
        ? subjects.filter((s) => ["Physics", "Chemistry", "Maths"].includes(s.label)).map((s) => s.label)
        : [];

    if (subjectLabels.length === 0) { setSubjectError("Please select at least one subject to start."); return; }

    if (practiceMode === "full" && track === "jee") {
      if (availableAttempts.length > 0 && !effectiveSelectedAttempt) { setSubjectError("Please select an attempt"); return; }
      if (availableShiftPapers.length > 0 && !effectiveSelectedShift) { setSubjectError("Please select a shift"); return; }
    }

    if (practiceMode === "chapter") {
      if (selectedChapters.length === 0) {
        setSubjectError("Please select at least one chapter");
        return;
      }
    }
    setSubjectError("");
    const params = new URLSearchParams();
    params.set("exam", track.toUpperCase());
    params.set("subjects", subjectLabels.join(","));
    if (selectedYears.length > 0) params.set("years", selectedYears.join(","));
    params.set("mode", practiceMode);

    if (practiceMode === "chapter" && selectedChapters.length > 0) params.set("chapter", selectedChapters.join(","));

    if (track === "jee" && practiceMode === "full") {
      const selectedPaper = papers.find((paper) => paper.id === effectiveSelectedShift);
      if (selectedPaper) {
        params.set("exam_id", selectedPaper.id);
        params.set("attempt_label", selectedPaper.attempt_label || selectedPaper.attempt);
        params.set("shift_label", selectedPaper.shift_label || selectedPaper.shift);
      }
    }

    router.push(`/pyq/session?${params.toString()}`);
  }

  const toggleSubject = (id) => setSelectedSubjects((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);
  const toggleYear = (yr) => setSelectedYears((p) => {
    if (practiceMode === "full") {
      return p.includes(yr) ? [] : [yr];
    }
    return p.includes(yr) ? p.filter((y) => y !== yr) : [...p, yr];
  });
  const toggleChapter = (ch) => setSelectedChapters((p) => p.includes(ch) ? p.filter((c) => c !== ch) : [...p, ch]);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Left — selectors */}
      <div className="rounded-2xl border border-slate-200/70 bg-[var(--card)]/80 p-4 shadow-sm animate-slideUp dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/80 sm:p-6" style={{ animationDelay: "100ms" }}>
        {/* Subject selector */}
        <div>
          <h2 className="text-base font-black text-slate-950 dark:text-white">Subject</h2>
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {subjects.map((s) => {
              const active = selectedSubjects.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleSubject(s.id)}
                  className={`group relative flex min-h-20 items-center gap-4 overflow-hidden rounded-xl border p-4 text-left transition-all cursor-pointer duration-200 ${
                    active
                      ? "border-brand bg-brand/10 text-slate-950 dark:text-white"
                      : `${BORDER} ${BG_SUNKEN} ${TXT_MUTED} hover:border-brand/45 hover:text-slate-900 dark:hover:text-white`
                  }`}
                >
                  <s.Icon className={`h-5 w-5 shrink-0 ${active ? "text-brand" : ""}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-black">{s.label}</span>
                    <span className="mt-0.5 block text-xs font-bold opacity-80">
                      {active ? "Selected" : "Select"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Year selector */}
        <div className="mt-8">
          <h2 className="text-base font-black text-slate-950 dark:text-white">Years</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {YEARS.map((yr) => (
              <button key={yr} onClick={() => toggleYear(yr)}
                className={`rounded-full border px-4 py-2 text-sm font-black transition-all cursor-pointer duration-200 ${
                  selectedYears.includes(yr)
                    ? "border-brand bg-brand text-black"
                    : `${BORDER} ${TXT_MUTED} bg-[var(--surface-secondary)]/70 hover:border-brand/45 hover:text-slate-900 dark:hover:text-white`
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* JEE Selectors (Attempt & Shift) */}
        {track === "jee" && (
          <>
            {/* Attempt Selector */}
            <div className="mt-8">
              <h2 className="text-base font-black text-slate-950 dark:text-white">Attempt</h2>
              {selectedYears.length === 0 ? (
                <p className={`mt-4 text-sm font-semibold ${TXT_MUTED}`}>Select a year first to see the available JEE papers.</p>
              ) : loadingPapers ? (
                <p className={`mt-4 text-sm font-semibold ${TXT_MUTED}`}>Loading attempts...</p>
              ) : availableAttempts.length === 0 ? (
                <p className={`mt-4 text-sm font-semibold ${TXT_MUTED}`}>No published JEE papers are available for the selected year yet.</p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                  {availableAttempts.map((attempt) => {
                    const isActive = effectiveSelectedAttempt === attempt;
                    return (
                      <button key={attempt} onClick={() => { setSelectedAttempt(attempt); setSelectedShift(""); }}
                        className={`flex min-h-14 items-center rounded-xl border px-4 py-3 text-left transition-all cursor-pointer duration-200 ${
                          isActive
                            ? "border-brand bg-brand/10 text-slate-950 dark:text-white"
                            : `${BORDER} ${BG_SUNKEN} ${TXT_MUTED} hover:border-brand/45 hover:text-slate-900 dark:hover:text-white`
                        }`}
                      >
                        <span className="text-sm font-black">{attempt}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Shift Selector */}
            <div className="mt-8">
              <h2 className="text-base font-black text-slate-950 dark:text-white">Shift</h2>
              {selectedYears.length === 0 ? (
                <p className={`mt-4 text-sm font-semibold ${TXT_MUTED}`}>Select a year first, then choose an attempt to see the available shifts.</p>
              ) : !selectedAttempt ? (
                <p className={`mt-4 text-sm font-semibold ${TXT_MUTED}`}>Choose an attempt to view the dated shift options for that paper.</p>
              ) : availableShiftPapers.length === 0 ? (
                <p className={`mt-4 text-sm font-semibold ${TXT_MUTED}`}>No shifts are available for the selected attempt.</p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                  {availableShiftPapers.map((paper) => {
                    const isActive = effectiveSelectedShift === paper.id;
                    return (
                      <button key={paper.id} onClick={() => setSelectedShift(paper.id)}
                        className={`flex min-h-14 items-center rounded-xl border px-4 py-3 text-left transition-all cursor-pointer duration-200 ${
                          isActive
                            ? "border-brand bg-brand/10 text-slate-950 dark:text-white"
                            : `${BORDER} ${BG_SUNKEN} ${TXT_MUTED} hover:border-brand/45 hover:text-slate-900 dark:hover:text-white`
                        }`}
                      >
                        <span className="text-sm font-black">{paper.shift_label || paper.shift}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Practice mode selector */}
        <div className="mt-8">
          <h2 className="text-base font-black text-slate-950 dark:text-white">Mode</h2>
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
            {PRACTICE_MODES.map((m) => {
              const active = practiceMode === m.id;
              const locked = PRO_ONLY_PRACTICE_MODES.has(m.id) && !isPro;
              return (
                <button key={m.id} onClick={() => {
                  if (locked) {
                    setPracticeMode(m.id);
                    setSubjectError("");
                    return;
                  }
                  setPracticeMode(m.id);
                  if (m.id === "full" && selectedYears.length > 1) {
                    setSelectedYears([selectedYears[0]]);
                  }
                }}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer duration-200 ${
                    active
                      ? locked
                        ? "border-brand/70 bg-brand/10 text-slate-950 dark:text-white"
                        : "border-brand bg-brand/10 text-slate-950 dark:text-white"
                      : locked
                        ? "border-dashed border-slate-200 bg-slate-50/80 text-slate-400 dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]/30 dark:text-slate-500"
                      : `${BORDER} ${BG_SUNKEN} ${TXT_MUTED} hover:border-brand/45 hover:text-slate-900 dark:hover:text-white`
                  }`}
                >
                  <m.Icon size={18} className="mt-0.5 shrink-0 sm:size-5" />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      {m.label}
                      {locked && (
                        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white dark:bg-brand dark:text-white">
                          Pro
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 hidden text-xs opacity-80 min-[390px]:block">{m.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter selector */}
        {practiceMode === "chapter" && (
          <div className="mt-8">
            <h2 className="text-base font-black text-slate-950 dark:text-white">Chapters</h2>
            {selectedSubjects.length === 0 && <p className={`mt-4 text-sm font-semibold ${TXT_MUTED}`}>Select a subject first to load its chapters.</p>}
            {selectedSubjects.length > 0 && loadingChapters && <p className={`mt-4 text-sm font-semibold ${TXT_MUTED}`}>Loading chapters...</p>}
            {selectedSubjects.length > 0 && !loadingChapters && chapterError && <p className="mt-4 text-sm font-semibold text-red-500">{chapterError}</p>}
            {selectedSubjects.length > 0 && !loadingChapters && !chapterError && chapters.length === 0 && <p className={`mt-4 text-sm font-semibold ${TXT_MUTED}`}>No chapters found for this subject.</p>}
            {selectedSubjects.length > 0 && !loadingChapters && chapters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {chapters.map((ch) => (
                  <button key={ch} onClick={() => toggleChapter(ch)}
                    className={`rounded-full border px-4 py-2 text-xs font-black transition-all cursor-pointer duration-200 sm:text-sm ${
                      selectedChapters.includes(ch)
                        ? "border-brand bg-brand text-black"
                        : `${BORDER} ${BG_SUNKEN} ${TXT_MUTED} hover:border-brand/45 hover:text-slate-900 dark:hover:text-white`
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
        <div className="rounded-2xl border border-slate-200/70 bg-[var(--card)]/80 p-5 shadow-sm animate-slideUp dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/80 xl:sticky xl:top-24" style={{ animationDelay: "100ms" }}>
          <h2 className="text-base font-black text-slate-950 dark:text-white">Your PYQ</h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-3 text-sm font-black">
              <span className={TXT_MUTED}>Subjects</span>
              <span className="max-w-[150px] truncate text-right text-slate-950 dark:text-white">
                {jeeRandomMode && selectedSubjects.length === 0
                  ? "PCM"
                  : selectedSubjects.length > 0
                    ? selectedSubjects.length
                    : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm font-black">
              <span className={TXT_MUTED}>Years</span>
              <span className="max-w-[150px] truncate text-right text-slate-950 dark:text-white">
                {selectedYears.length > 0 ? selectedYears.sort((a, b) => b - a).join(", ") : "All"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm font-black">
              <span className={TXT_MUTED}>Mode</span>
              <span className="max-w-[150px] truncate text-right text-slate-950 dark:text-white">
                {PRACTICE_MODE_SUMMARY_LABEL[practiceMode]}
              </span>
            </div>
            {practiceMode === "chapter" && (
              <div className="flex items-center justify-between gap-3 text-sm font-black">
                <span className={TXT_MUTED}>Chapters</span>
                <span className="text-slate-950 dark:text-white">{selectedChapters.length || "-"}</span>
              </div>
            )}
            {selectedModeLocked && (
              <p className="text-xs font-semibold text-brand">
                Upgrade to Pro to use this PYQ mode.
              </p>
            )}
            {track === "jee" && practiceMode === "full" && effectiveSelectedAttempt && (
              <div className="flex items-center justify-between gap-3 text-sm font-black">
                <span className={TXT_MUTED}>Attempt</span>
                <span className="max-w-[150px] truncate text-right text-slate-950 dark:text-white">{effectiveSelectedAttempt}</span>
              </div>
            )}
            {track === "jee" && practiceMode === "full" && effectiveSelectedShift && (
              <div className="flex items-center justify-between gap-3 text-sm font-black">
                <span className={TXT_MUTED}>Shift</span>
                <span className="max-w-[150px] truncate text-right text-slate-950 dark:text-white">
                  {papers.find((paper) => paper.id === effectiveSelectedShift)?.shift_label || ""}
                </span>
              </div>
            )}
          </div>

          <button onClick={handleStartDeck}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-black text-black transition-all duration-300 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <I.Play size={14} /> {selectedModeLocked ? "Upgrade to Pro" : "Start PYQ Practice"}
          </button>

          {subjectError && <p className="mt-3 text-xs font-bold text-red-500">{subjectError}</p>}
        </div>
      </div>
    </div>
  );
}

function formatPercent(value) {
  return Number.isFinite(Number(value)) ? `${Math.round(Number(value))}%` : "—";
}

function formatPracticeStreak(days) {
  const count = Number(days) || 0;
  return `${count} ${count === 1 ? "day" : "days"}`;
}

function getChapterStatusClass(status) {
  if (status === "Strong") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
  }
  if (status === "Good") {
    return "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300";
  }
  if (status === "Needs Practice") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300";
  }
  return "border-slate-300/50 bg-slate-100 text-slate-500 dark:border-[var(--border)]/70 dark:bg-[var(--surface-elevated)]/60 dark:text-slate-400";
}

function ChapterSummaryCard({ title, chapter, emptyText, actionLabel, onAction, icon: IconComp }) {
  return (
    <div className="glass-card p-5">
      {IconComp && <IconComp size={18} className="mb-3 text-indigo-500 dark:text-indigo-400" />}
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{title}</p>
      {chapter ? (
        <>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{chapter.chapter}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatPercent(chapter.accuracy)} accuracy</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{chapter.attempted} attempted</p>
          {actionLabel && onAction && (
            <button
              onClick={() => onAction(chapter)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20"
            >
              {actionLabel} <I.ChevronRight size={14} />
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>
      )}
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ analytics, loading, loadError, onRetry, onStartPractice, onPracticeChapter }) {
  if (loading) return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl skeleton-shimmer" />)}
    </div>
  );
  if (loadError) return (
    <div className="glass-card p-6">
      <p className="text-base font-bold text-slate-900 dark:text-white">Couldn&apos;t load your PYQ analytics.</p>
      <p className={`mt-1 text-sm ${TXT_MUTED}`}>{loadError}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-xl border border-indigo-500/30 px-4 py-2 text-sm font-bold text-indigo-500 transition-colors hover:bg-indigo-500/10 dark:text-indigo-300"
        >
          Retry
        </button>
      )}
    </div>
  );

  const attempted = analytics?.attempted ?? 0;
  const streak    = analytics?.streak    ?? 0;
  const subjects  = analytics?.subjects  ?? [];
  const chapters  = analytics?.chapters  ?? [];
  const strongestChapter = analytics?.strongestChapter ?? null;
  const needsPracticeChapter = analytics?.needsPracticeChapter ?? null;
  const minimumChapterAttempts = analytics?.minimumChapterAttempts ?? 5;

  if (attempted === 0) {
    return (
      <div className="glass-card p-6 sm:p-8 text-center animate-slideUp">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          <I.BarChart3 size={20} />
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">No PYQ data yet</h3>
        <p className={`mx-auto mt-2 max-w-md text-sm ${TXT_MUTED}`}>
          Solve a few PYQs and your performance insights will appear here.
        </p>
        <button
          onClick={onStartPractice}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5"
        >
          Start Practicing <I.ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { Icon: I.Target,       label: "Questions Attempted", value: String(attempted), sublabel: "answered PYQs",         accent: "#C2723F" },
          { Icon: I.CheckCircle2, label: "Accuracy",            value: formatPercent(analytics?.accuracy), sublabel: "correct / attempted", accent: "#10b981" },
          { Icon: I.Clock,        label: "Avg. Time / Question", value: analytics?.avgTimePerQuestionLabel || "—", sublabel: analytics?.timing?.available ? "tracked PYQ pace" : "Not tracked yet", accent: "#06b6d4" },
          { Icon: I.Flame,        label: "Practice Streak",     value: formatPracticeStreak(streak), sublabel: "PYQ practice days",     accent: "#f59e0b" },
        ].map((s, i) => (
          <div key={s.label} className="animate-slideUp" style={{ animationDelay: `${i * 75 + 150}ms` }}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      <div className="glass-card p-4 animate-slideUp sm:p-6" style={{ animationDelay: "375ms" }}>
        <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4`}>SUBJECT PERFORMANCE</p>
        {subjects.length === 0 && <p className={`text-sm ${TXT_MUTED}`}>No subject data found for your attempted PYQs.</p>}
        <div className="space-y-5">
          {subjects.map((item) => (
            <div key={item.subject}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${TXT}`}>{item.subject}</span>
                <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-right">
                  <span className={`text-xs ${TXT_MUTED}`}>{item.attempted} attempted</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPercent(item.accuracy)} accuracy</span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-200 dark:bg-[var(--surface-elevated)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.accuracy || 0}%`, background: SUBJECT_BAR_COLORS[item.subject] || "#6b7280" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 animate-slideUp sm:p-6" style={{ animationDelay: "450ms" }}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest`}>CHAPTER PERFORMANCE</p>
            <p className={`mt-1 text-xs ${TXT_MUTED}`}>Judgments require {minimumChapterAttempts}+ attempted questions.</p>
          </div>
          <span className={`text-xs ${TXT_MUTED}`}>{chapters.length} mapped</span>
        </div>
        {chapters.length === 0 ? (
          <p className={`text-sm ${TXT_MUTED}`}>No mapped chapter data found yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <div className="min-w-[520px] divide-y divide-slate-200/60 dark:divide-slate-800/70">
            {chapters.map((item) => (
              <div key={`${item.subject}-${item.chapter}`} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_180px_120px] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{item.chapter}</p>
                  <p className={`text-xs ${TXT_MUTED}`}>{item.subject}</p>
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className={`text-xs ${TXT_MUTED}`}>{item.attempted} attempted</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPercent(item.accuracy)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-[var(--surface-elevated)]">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${item.accuracy || 0}%` }}
                    />
                  </div>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${getChapterStatusClass(item.status)}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slideUp" style={{ animationDelay: "450ms" }}>
        <ChapterSummaryCard
          title="Strongest Chapter"
          chapter={strongestChapter}
          emptyText={`Attempt at least ${minimumChapterAttempts} questions in a chapter to identify your strongest area.`}
          icon={I.Award}
        />
        <ChapterSummaryCard
          title="Needs Practice"
          chapter={needsPracticeChapter}
          emptyText={`Attempt at least ${minimumChapterAttempts} questions in a chapter to identify what needs practice.`}
          actionLabel="Practice PYQs"
          onAction={onPracticeChapter}
          icon={I.TrendingUp}
        />
      </div>
    </div>
  );
}

function ProLockedPanel({ title, description }) {
  const router = useRouter();

  return (
    <div className="glass-card p-5 text-center animate-slideUp sm:p-8">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
        <I.Sparkles size={20} />
      </div>
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3>
      <p className={`mx-auto mt-2 max-w-md text-sm ${TXT_MUTED}`}>{description}</p>
      <button
        onClick={() => router.push("/pro")}
        className="mt-5 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5"
      >
        Upgrade to Pro
      </button>
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
  const router = useRouter();
  const [track, setTrack] = useState(() => getCookieTrack());
  const [access, setAccess] = useState(null);
  const [, setAccessLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadAccess() {
      if (!user) return;

      const response = await fetch("/api/access", {
        cache: "no-store",
      });

      if (!response.ok) {
        if (!cancelled) setAccessLoading(false);
        return;
      }

      const data = await response.json();
      if (!cancelled) {
        setAccess(data);
        setTrack(data?.examTrack === "NEET" ? "neet" : "jee");
        setAccessLoading(false);
      }
    }

    loadAccess();
    return () => { cancelled = true; };
  }, [user]);

  const isPro = Boolean(access?.isPro);
  const filteredSubjects = MASTER_SUBJECTS.filter((s) => s.tracks.includes(track));

  const [savedQuestions, setSavedQuestions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadSavedQuestions() {
      if (!user || !track || activeTab !== "saved") return;

      const response = await fetch(
        `/api/pyq-bookmarks?includeQuestions=true&track=${track}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (!cancelled) {
        setSavedQuestions(data.questions || []);
      }
    }
    loadSavedQuestions();
    return () => { cancelled = true; };
  }, [user, track, activeTab]);

  const [overview,       setOverview]       = useState(null);
  const [pyqAnalytics,   setPyqAnalytics]   = useState(null);
  const [attemptedTotal, setAttemptedTotal] = useState(null);
  const [statsLoading,   setStatsLoading]   = useState(true);
  const [statsError,     setStatsError]     = useState("");

  const applyPYQStats = (overviewData, analyticsData) => {
    setOverview(overviewData || null);
    setPyqAnalytics(analyticsData || null);
    setAttemptedTotal(
      analyticsData?.totalQuestions ??
      analyticsData?.totalAttempts  ??
      analyticsData?.attempted      ??
      0
    );
  };

  useEffect(() => {
    let cancelled = false;
    async function loadPYQStats() {
      if (!track || !access) return;
      setStatsLoading(true);
      setStatsError("");
      try {
        const [overviewData, analyticsData] = await Promise.all([
          getPYQOverview(track),
          isPro ? getPYQAnalytics(track) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        applyPYQStats(overviewData, analyticsData);
      } catch (error) {
        console.error("Failed loading PYQ stats:", error);
        if (!cancelled) {
          setOverview(null);
          setPyqAnalytics(null);
          setAttemptedTotal(0);
          setStatsError("Failed to load analytics. Please try again.");
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }
    loadPYQStats();
    return () => { cancelled = true; };
  }, [track, access, isPro]);

  const reloadPYQStats = async () => {
    if (!track || !access) return;
    setStatsLoading(true);
    setStatsError("");
    try {
      const [overviewData, analyticsData] = await Promise.all([
        getPYQOverview(track),
        isPro ? getPYQAnalytics(track) : Promise.resolve(null),
      ]);
      applyPYQStats(overviewData, analyticsData);
    } catch (error) {
      console.error("Failed loading PYQ stats:", error);
      setOverview(null);
      setPyqAnalytics(null);
      setAttemptedTotal(0);
      setStatsError("Failed to load analytics. Please try again.");
    } finally {
      setStatsLoading(false);
    }
  };

  const startPractice = () => {
    setActiveTab("practice");
  };

  const practiceChapter = (chapter) => {
    if (!chapter?.chapter || !chapter?.subject || !track) {
      setActiveTab("practice");
      return;
    }

    const params = new URLSearchParams();
    params.set("exam", track.toUpperCase());
    params.set("subjects", chapter.subject);
    params.set("mode", "chapter");
    params.set("chapter", chapter.chapter);
    router.push(`/pyq/session?${params.toString()}`);
  };

  const handleUnsave = async (qId) => {
    if (!user?.id) return;
    setSavedQuestions((prev) => prev.filter((q) => q.id !== qId));
    await removeBookmark(user.id, qId);
  };

  const questionVaultValue = overview ? overview.totalQuestions.toLocaleString() : "—";
  const yearRangeValue = overview?.minYear && overview?.maxYear ? `${overview.maxYear - overview.minYear + 1} Years` : "—";
  const yearRangeSublabel = overview?.minYear && overview?.maxYear ? `${overview.minYear} – ${overview.maxYear} Bulletins` : "No data yet";
  const solvedLoadValue = attemptedTotal !== null ? `${attemptedTotal} Solved` : "—";

  return (
    <div className="relative min-h-screen w-full min-w-0">
      <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        <section className="min-w-0">
          <div className="min-w-0">
            <h1 className="text-3xl font-black font-display tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              PYQ Practice
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
              Practice previous year questions by subject, year, paper session, and revision mode.
            </p>
          </div>

          <div className="mt-5 inline-flex max-w-full rounded-xl border border-slate-200/70 bg-[var(--card)]/80 p-1 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/80">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const locked = tab.pro && !isPro;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black transition-colors ${
                    active
                      ? "bg-brand text-black"
                      : locked
                        ? "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <tab.Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                  {locked && (
                    <span className="rounded-full bg-slate-900 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white dark:bg-brand dark:text-black">
                      Pro
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="animate-slideUp" style={{ animationDelay: "100ms" }}>
          {activeTab === "practice"  && (
            <PracticeTab subjects={filteredSubjects} track={track} isPro={isPro} />
          )}
          {activeTab === "analytics" && (
            isPro ? (
              <AnalyticsTab
                analytics={pyqAnalytics}
                loading={statsLoading}
                loadError={statsError}
                onRetry={reloadPYQStats}
                onStartPractice={startPractice}
                onPracticeChapter={practiceChapter}
              />
            ) : (
              <ProLockedPanel
                title="PYQ Analytics is Pro"
                description="Upgrade to unlock subject accuracy, solved-question trends, weak areas, and revision insights from your PYQ attempts."
              />
            )
          )}
          {activeTab === "saved" && <SavedTab track={track} savedQuestions={savedQuestions} onUnsave={handleUnsave} />}
        </section>
      </div>
    </div>
  );
}
