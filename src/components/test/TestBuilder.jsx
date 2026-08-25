"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SubjectVisual from "@/components/SubjectVisual";
import {
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  Check,
  ChevronDown,
  Clock3,
  Play,
} from "lucide-react";

const SUBJECTS = {
  Physics: {
    icon: <Atom className="w-6 h-6" />,
    color: "blue",
    chapters: [
      "Physical World, Units and Measurements",
      "Motion in a Straight Line",
      "Motion in a Plane",
      "Laws of Motion",
      "Work, Energy and Power",
      "System of Particles and Rotational Motion",
      "Gravitation",
      "Mechanical Properties of Solids",
      "Mechanical Properties of Fluids",
      "Thermal Properties of Matter",
      "Thermodynamics",
      "Kinetic Theory",
      "Oscillations",
      "Waves",
      "Electric Charges and Fields",
      "Electrostatic Potential and Capacitance",
      "Current Electricity",
      "Moving Charges and Magnetism",
      "Magnetism and Matter",
      "Electromagnetic Induction",
      "Alternating Current",
      "Electromagnetic Waves",
      "Ray Optics and Optical Instruments",
      "Wave Optics",
      "Dual Nature of Radiation and Matter",
      "Atoms",
      "Nuclei",
      "Semiconductor Electronics: Materials, Devices and Simple Circuits",
      "Communication Systems",
    ],
  },
  Chemistry: {
    icon: <FlaskConical className="w-6 h-6" />,
    color: "green",
    chapters: [
      "Some Basic Concepts of Chemistry",
      "Structure of Atom",
      "Classification of Elements and Periodicity in Properties",
      "Chemical Bonding and Molecular Structure",
      "States of Matter",
      "Thermodynamics",
      "Equilibrium",
      "Redox Reactions",
      "Hydrogen",
      "The s-Block Elements",
      "The p-Block Elements (Group 13 and 14)",
      "Organic Chemistry - Some Basic Principles and Techniques",
      "Hydrocarbons",
      "Environmental Chemistry",
      "The Solid State",
      "Solutions",
      "Electrochemistry",
      "Chemical Kinetics",
      "Surface Chemistry",
      "General Principles and Processes of Isolation of Elements",
      "The p-Block Elements (Group 15 to 18)",
      "The d- and f-Block Elements",
      "Coordination Compounds",
      "Haloalkanes and Haloarenes",
      "Alcohols, Phenols and Ethers",
      "Aldehydes, Ketones and Carboxylic Acids",
      "Amines",
      "Biomolecules",
      "Polymers",
      "Chemistry in Everyday Life",
    ],
  },
  Maths: {
    icon: <Calculator className="w-6 h-6" />,
    color: "maths",
    chapters: [
      "Sets",
      "Relations and Functions – I",
      "Trigonometric Functions",
      "Principle of Mathematical Induction",
      "Complex Numbers and Quadratic Equations",
      "Linear Inequalities",
      "Permutations and Combinations",
      "Binomial Theorem",
      "Sequences and Series",
      "Straight Lines",
      "Conic Sections",
      "Introduction to Three Dimensional Geometry",
      "Limits and Derivatives",
      "Mathematical Reasoning",
      "Statistics",
      "Probability – I",
      "Relations and Functions – II",
      "Inverse Trigonometric Functions",
      "Matrices",
      "Determinants",
      "Continuity and Differentiability",
      "Application of Derivatives",
      "Integrals",
      "Application of Integrals",
      "Differential Equations",
      "Vector Algebra",
      "Three Dimensional Geometry",
      "Linear Programming",
      "Probability – II",
    ],
  },
  Biology: {
    icon: <Dna className="w-6 h-6" />,
    color: "rose",
    chapters: [
      "The Living World",
      "Biological Classification",
      "Plant Kingdom",
      "Animal Kingdom",
      "Morphology of Flowering Plants",
      "Anatomy of Flowering Plants",
      "Structural Organisation in Animals",
      "Cell: The Unit of Life",
      "Biomolecules",
      "Cell Cycle and Cell Division",
      "Photosynthesis in Higher Plants",
      "Respiration in Plants",
      "Plant Growth and Development",
      "Digestion and Absorption",
      "Breathing and Exchange of Gases",
      "Body Fluids and Circulation",
      "Excretory Products and their Elimination",
      "Locomotion and Movement",
      "Neural Control and Coordination",
      "Chemical Coordination and Integration",
      "Sexual Reproduction in Flowering Plants",
      "Human Reproduction",
      "Reproductive Health",
      "Principles of Inheritance and Variation",
      "Molecular Basis of Inheritance",
      "Evolution",
      "Human Health and Disease",
      "Microbes in Human Welfare",
      "Biotechnology: Principles and Processes",
      "Biotechnology and its Applications",
      "Organisms and Populations",
      "Ecosystem",
      "Biodiversity and Conservation",
    ],
  },
};

// ===============================
// JEE / NEET CONFIG
// ===============================

const JEE_QUESTION_COUNTS = [20, 40, 60, 75, 90];
const JEE_DURATIONS = [45, 90, 120, 150, 180];

const NEET_QUESTION_COUNTS = [45, 90, 135, 180];
const NEET_DURATIONS = [45, 90, 135, 180];
const NEET_BIOLOGY_PRACTICE_COUNTS = [10, 15, 20];

const colorMap = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800",     text: "text-blue-700 dark:text-blue-300",     chip: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700" },
  green:  { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", chip: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700" },
  maths: { bg: "bg-indigo-50 dark:bg-indigo-950/30",  border: "border-indigo-200 dark:border-indigo-800",  text: "text-indigo-700 dark:text-indigo-300",  chip: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700" },
  rose:   { bg: "bg-rose-50 dark:bg-rose-950/30",      border: "border-rose-200 dark:border-rose-800",      text: "text-rose-700 dark:text-rose-300",      chip: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700" },
};

export default function TestBuilder({ track = "jee", access = null }) {
  const router = useRouter();

  const activeTrack = track?.toLowerCase() || "jee";

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState({});
  const [duration, setDuration] = useState(activeTrack === "neet" ? 45 : 30);
  const [questionCount, setQuestionCount] = useState(activeTrack === "neet" ? 45 : 20);
  const [difficulty, setDifficulty] = useState("mixed");
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [biologyAvailability, setBiologyAvailability] = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(activeTrack === "neet");
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  // Filter allowed subjects for current track
  const isSubjectAllowed = (name) => {
    if (activeTrack === "jee" && name === "Biology") return false;
    if (activeTrack === "neet" && name === "Maths") return false;
    return true;
  };

  const filteredSubjectsEntries = Object.entries(SUBJECTS).filter(([name]) => isSubjectAllowed(name));

  // Compute active valid selected subjects
  const validSelectedSubjects = selectedSubjects.filter((name) => isSubjectAllowed(name));

  const isNeetBiologyPractice =
    activeTrack === "neet" &&
    validSelectedSubjects.length === 1 &&
    validSelectedSubjects[0] === "Biology";
  const selectedBiologyChapter = isNeetBiologyPractice
    ? selectedChapters.Biology?.[0] || ""
    : "";
  const selectedBiologyAvailability = selectedBiologyChapter
    ? biologyAvailability[selectedBiologyChapter]?.count || 0
    : 0;
  const questionCountOptions = isNeetBiologyPractice
    ? NEET_BIOLOGY_PRACTICE_COUNTS
    : activeTrack === "neet" ? NEET_QUESTION_COUNTS : JEE_QUESTION_COUNTS;
  const DURATIONS = activeTrack === "neet" ? NEET_DURATIONS : JEE_DURATIONS;

  useEffect(() => {
    if (activeTrack !== "neet") return;

    let ignore = false;

    fetch("/api/test/practice-availability?exam=NEET&subject=Biology")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Failed to load practice availability");
        return data;
      })
      .then((data) => {
        if (ignore) return;
        const nextAvailability = {};
        (data.chapters || []).forEach((item) => {
          nextAvailability[item.chapter] = item;
        });
        setBiologyAvailability(nextAvailability);
        setAvailabilityMessage(data.message || "");
      })
      .catch(() => {
        if (!ignore) {
          setBiologyAvailability({});
          setAvailabilityMessage("Could not load Biology practice availability.");
        }
      })
      .finally(() => {
        if (!ignore) setAvailabilityLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [activeTrack]);

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    try {
      const savedSubjects = sessionStorage.getItem("tb_subjects");
      if (savedSubjects) {
        const parsed = JSON.parse(savedSubjects);
        const sanitized = parsed.filter((s) => isSubjectAllowed(s));
        setSelectedSubjects(sanitized);
      }

      const savedChapters = sessionStorage.getItem("tb_chapters");
      if (savedChapters) {
        const parsedCh = JSON.parse(savedChapters);
        if (activeTrack === "jee") delete parsedCh.Biology;
        if (activeTrack === "neet") delete parsedCh.Maths;
        const sanitizedChapters = Object.fromEntries(
          Object.entries(parsedCh).map(([subject, selected]) => {
            const allowed = new Set(SUBJECTS[subject]?.chapters || []);
            return [subject, Array.isArray(selected) ? selected.filter((chapter) => allowed.has(chapter)) : []];
          })
        );
        setSelectedChapters(sanitizedChapters);
        sessionStorage.setItem("tb_chapters", JSON.stringify(sanitizedChapters));
      }

      const savedDuration = sessionStorage.getItem("tb_duration");
      if (savedDuration) setDuration(Number(savedDuration));

      const savedCount = sessionStorage.getItem("tb_count");
      if (savedCount) setQuestionCount(Number(savedCount));

      const savedDifficulty = sessionStorage.getItem("tb_difficulty");
      if (savedDifficulty) setDifficulty(savedDifficulty);
    } catch (error) {
//       console.log("No saved data found, starting fresh!");
    }
  }, [activeTrack]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const saveSubjects = (val) => {
    const sanitized = val.filter((s) => isSubjectAllowed(s));
    setSelectedSubjects(sanitized);
    sessionStorage.setItem("tb_subjects", JSON.stringify(sanitized));
  };
  const saveChapters = (val) => {
    setSelectedChapters(val);
    sessionStorage.setItem("tb_chapters", JSON.stringify(val));
  };
  const saveDuration = (val) => {
    setDuration(val);
    sessionStorage.setItem("tb_duration", val);
  };
  const saveCount = (val) => {
    setQuestionCount(val);
    sessionStorage.setItem("tb_count", val);
  };
  const saveDifficulty = (val) => {
    setDifficulty(val);
    sessionStorage.setItem("tb_difficulty", val);
  };

  const toggleSubject = (subject) => {
    if (!isSubjectAllowed(subject)) return;
    setSelectedSubjects((prev) => {
      let next;
      if (prev.includes(subject)) {
        const newChapters = { ...selectedChapters };
        delete newChapters[subject];
        saveChapters(newChapters);
        if (expandedSubject === subject) setExpandedSubject(null);
        next = prev.filter((s) => s !== subject);
      } else {
        setExpandedSubject(subject);
        next = [...prev, subject];
      }
      const sanitized = next.filter((s) => isSubjectAllowed(s));
      sessionStorage.setItem("tb_subjects", JSON.stringify(sanitized));
      return sanitized;
    });
  };

  const toggleChapter = (subject, chapter) => {
    if (!isSubjectAllowed(subject)) return;
    if (activeTrack === "neet" && subject === "Biology") {
      const available = biologyAvailability[chapter]?.count || 0;
      if (available <= 0) return;
      const current = selectedChapters[subject] || [];
      const updated = current.includes(chapter) ? [] : [chapter];
      saveChapters({ ...selectedChapters, [subject]: updated });
      if (!current.includes(chapter)) {
        const nextCount = Math.min(questionCount, available);
        if (nextCount !== questionCount) saveCount(nextCount);
      }
      return;
    }
    const current = selectedChapters[subject] || [];
    const updated = current.includes(chapter)
      ? current.filter((c) => c !== chapter)
      : [...current, chapter];
    const next = { ...selectedChapters, [subject]: updated };
    saveChapters(next);
  };

  const selectAllChapters = (subject) => {
    if (!isSubjectAllowed(subject)) return;
    if (activeTrack === "neet" && subject === "Biology") return;
    const all = SUBJECTS[subject]?.chapters || [];
    const current = selectedChapters[subject] || [];
    const next = { ...selectedChapters, [subject]: current.length === all.length ? [] : [...all] };
    saveChapters(next);
  };

  const totalChapters = validSelectedSubjects.flatMap((s) => selectedChapters[s] || []).length;
  const customTestFeature = access?.features?.CUSTOM_TEST;
  const customTestUsage = access?.customTestUsage || customTestFeature?.usage || null;
  const customTestBlocked = customTestFeature?.allowed === false;
  const canStart = isNeetBiologyPractice
    ? selectedBiologyAvailability > 0 && questionCount <= selectedBiologyAvailability
    : validSelectedSubjects.length > 0 && totalChapters > 0;
  const selectedChapterGroups = validSelectedSubjects
    .map((subject) => ({
      subject,
      chapters: selectedChapters[subject] || [],
    }))
    .filter((group) => group.chapters.length > 0);

  const handleStart = async () => {
    const allChapters = validSelectedSubjects.flatMap((s) => selectedChapters[s] || []);
    const exam = activeTrack === "neet" ? "NEET" : "JEE Main";

    if (customTestBlocked) return;

    const params = new URLSearchParams({
      exam: exam,
      subjects: validSelectedSubjects.join(","),
      chapters: allChapters.join(","),
      duration: duration.toString(),
      count: questionCount.toString(),
      difficulty: difficulty,
      mode: "custom",
    });

    if (isNeetBiologyPractice) {
      params.set("sourceType", "PREPZII_PRACTICE");
    }

    sessionStorage.removeItem("tb_subjects");
    sessionStorage.removeItem("tb_chapters");
    sessionStorage.removeItem("tb_duration");
    sessionStorage.removeItem("tb_count");
    sessionStorage.removeItem("tb_difficulty");

    router.push(`/test/session?${params.toString()}`);
  };

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 rounded-2xl border border-slate-200/70 bg-[var(--card)]/82 p-4 shadow-sm backdrop-blur-xl dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/82 sm:p-5">
        <div className="space-y-7">
          <section>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Subject
            </h2>
            <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3">
              {filteredSubjectsEntries.map(([name, data]) => {
                const c = colorMap[data.color];
                const isSelected = validSelectedSubjects.includes(name);
                const chapterCount = (selectedChapters[name] || []).length;

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleSubject(name)}
                    className={`relative flex min-h-[64px] min-w-0 items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer
                      ${isSelected
                        ? "border-brand bg-brand/15 text-slate-950 ring-1 ring-brand/25 dark:text-white"
                        : "border-slate-200/70 bg-slate-50/45 text-slate-600 hover:border-brand/35 dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]/25 dark:text-slate-400"
                      }`}
                  >
                    <SubjectVisual
                      subject={name}
                      className={`pointer-events-none absolute -bottom-5 -right-4 h-20 w-20 ${isSelected ? "opacity-[0.09]" : "opacity-[0.035]"} ${c.text}`}
                    />
                    <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSelected ? c.text : "text-slate-400"} [&>svg]:h-4.5 [&>svg]:w-4.5`}>
                      {data.icon}
                    </span>
                    <span className="relative z-10 min-w-0 flex-1">
                      <span className="block truncate text-sm font-black">
                        {name}
                      </span>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-500">
                        {isSelected ? `${chapterCount} chapters` : "Select"}
                      </span>
                    </span>
                    {isSelected && <Check className="relative z-10 h-4 w-4 shrink-0 text-brand" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Chapters
            </h2>
            <div className="mt-3 min-w-0 space-y-2.5">
              {validSelectedSubjects.length === 0 && (
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-500">
                  Choose a subject to see chapters.
                </p>
              )}

              {validSelectedSubjects.map((subject) => {
                const data = SUBJECTS[subject];
                if (!data) return null;

                const c = colorMap[data.color];
                const chapters = selectedChapters[subject] || [];
                const isExpanded = expandedSubject === subject;
                const allSelected = chapters.length === data.chapters.length;
                const isBiologyPracticeSubject = activeTrack === "neet" && subject === "Biology";

                return (
                  <div key={subject} className="rounded-xl bg-slate-50/55 dark:bg-[var(--surface-elevated)]/25">
                    <button
                      type="button"
                      onClick={() => setExpandedSubject(isExpanded ? null : subject)}
                      className="flex w-full min-w-0 items-center justify-between gap-3 px-3 py-2.5 text-left"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-slate-900 dark:text-white">
                          {subject}
                        </span>
                        <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-500">
                          {chapters.length ? `${chapters.length} selected` : "No chapters selected"}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        {isExpanded && !isBiologyPracticeSubject && (
                          <span
                            onClick={(e) => { e.stopPropagation(); selectAllChapters(subject); }}
                            className="text-xs font-black text-slate-500 hover:text-amber-700 dark:text-slate-400 dark:hover:text-brand"
                          >
                            {allSelected ? "Clear" : "All"}
                          </span>
                        )}
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3">
                        {isBiologyPracticeSubject && (
                          <p className="mb-3 rounded-lg bg-rose-50/80 px-3 py-2 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
                            {availabilityLoading
                              ? "Loading Biology practice counts..."
                              : availabilityMessage || "Select one Biology chapter to build a practice test from published PrepZii questions."}
                          </p>
                        )}
                        <div className="flex max-h-[260px] flex-wrap gap-2 overflow-y-auto pr-1">
                          {data.chapters.map((chapter) => {
                            const isChapterSelected = chapters.includes(chapter);
                            const availability = isBiologyPracticeSubject
                              ? biologyAvailability[chapter]?.count || 0
                              : null;
                            const isUnavailable = isBiologyPracticeSubject && availability <= 0;
                            return (
                              <button
                                key={chapter}
                                type="button"
                                onClick={() => toggleChapter(subject, chapter)}
                                disabled={isUnavailable}
                                className={`rounded-full px-3 py-1.5 text-[11px] font-bold leading-snug transition-colors sm:text-xs
                                  ${isChapterSelected
                                    ? "bg-brand text-black"
                                    : isUnavailable
                                    ? "cursor-not-allowed bg-slate-100 text-slate-300 dark:bg-[var(--surface)] dark:text-slate-600"
                                    : "bg-[var(--card)] text-slate-600 hover:bg-brand/10 dark:bg-[var(--surface)] dark:text-slate-400 dark:hover:text-slate-200"
                                  }`}
                              >
                                {isChapterSelected && <Check className="mr-1 inline h-3 w-3" strokeWidth={3} />}
                                {chapter}
                                {isBiologyPracticeSubject && (
                                  <span className={`ml-2 font-black ${isUnavailable ? "text-slate-300 dark:text-slate-600" : isChapterSelected ? "text-black/70" : "text-rose-500 dark:text-rose-300"}`}>
                                    {availability}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Questions
            </h2>
            <div className="mt-3 flex min-w-0 flex-wrap gap-2">
              {questionCountOptions.map((n) => {
                const disabled = isNeetBiologyPractice && (!selectedBiologyChapter || n > selectedBiologyAvailability);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => !disabled && saveCount(n)}
                    disabled={disabled}
                    className={`h-9 min-w-12 rounded-full px-3 text-sm font-black transition-colors
                      ${questionCount === n
                        ? "bg-brand text-black"
                        : disabled
                        ? "cursor-not-allowed bg-slate-100 text-slate-300 dark:bg-[var(--surface-elevated)] dark:text-slate-600"
                        : "cursor-pointer bg-slate-50 text-slate-600 hover:bg-brand/10 dark:bg-[var(--surface-elevated)]/55 dark:text-slate-400"
                      }`}
                  >
                    {n}
                  </button>
                );
              })}
              {isNeetBiologyPractice && selectedBiologyAvailability > 0 && (
                <button
                  type="button"
                  onClick={() => saveCount(selectedBiologyAvailability)}
                  className={`h-9 rounded-full px-3 text-sm font-black transition-colors cursor-pointer
                    ${questionCount === selectedBiologyAvailability
                      ? "bg-brand text-black"
                      : "bg-slate-50 text-slate-600 hover:bg-brand/10 dark:bg-[var(--surface-elevated)]/55 dark:text-slate-400"
                    }`}
                >
                  All {selectedBiologyAvailability}
                </button>
              )}
              {isNeetBiologyPractice && selectedBiologyChapter && selectedBiologyAvailability === 0 && (
                <p className="basis-full text-xs font-semibold text-rose-500">
                  No practice questions are available for this chapter yet.
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Duration
            </h2>
            <div className="mt-3 flex min-w-0 flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => saveDuration(d)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-black transition-colors cursor-pointer
                    ${duration === d
                      ? "bg-brand text-black"
                      : "bg-slate-50 text-slate-600 hover:bg-brand/10 dark:bg-[var(--surface-elevated)]/55 dark:text-slate-400"
                    }`}
                >
                  <Clock3 className="h-3.5 w-3.5" />
                  {d}m
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Difficulty
            </h2>
            <div className="mt-3 flex min-w-0 flex-wrap gap-2">
              {["easy", "medium", "hard", "mixed"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => saveDifficulty(d)}
                  className={`h-9 rounded-full px-3 text-sm font-black capitalize transition-colors cursor-pointer
                    ${difficulty === d
                      ? "bg-brand text-black"
                      : "bg-slate-50 text-slate-600 hover:bg-brand/10 dark:bg-[var(--surface-elevated)]/55 dark:text-slate-400"
                    }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24">
        <div className="rounded-2xl border border-slate-200/70 bg-[var(--card)]/85 p-4 shadow-sm backdrop-blur-xl dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/85">
          <h2 className="text-sm font-black text-slate-900 dark:text-white">
            Your Test
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Subjects</span>
              <span className="truncate text-right font-black text-slate-900 dark:text-white">
                {validSelectedSubjects.length ? validSelectedSubjects.join(", ") : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Chapters</span>
              <span className="font-black text-slate-900 dark:text-white">{totalChapters}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Questions</span>
              <span className="font-black text-slate-900 dark:text-white">{questionCount}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Duration</span>
              <span className="font-black text-slate-900 dark:text-white">{duration}m</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Difficulty</span>
              <span className="font-black capitalize text-slate-900 dark:text-white">{difficulty}</span>
            </div>
          </div>

          {selectedChapterGroups.length > 0 && (
            <div className="mt-4 max-h-28 space-y-1.5 overflow-y-auto text-xs font-semibold text-slate-500 dark:text-slate-500">
              {selectedChapterGroups.map(({ subject, chapters }) => (
                <p key={subject} className="line-clamp-1">
                  <span className="font-black text-slate-700 dark:text-slate-300">{subject}:</span> {chapters.join(", ")}
                </p>
              ))}
            </div>
          )}

          {customTestUsage && !access?.isPro && (
            <p className={`mt-4 text-xs font-bold ${
              customTestBlocked
                ? "text-rose-600 dark:text-rose-300"
                : "text-slate-500 dark:text-slate-400"
            }`}>
              {customTestBlocked
                ? "You've used your 2 free custom tests this month."
                : `${customTestUsage.remaining} of ${customTestUsage.limit} free custom tests left this month.`}
            </p>
          )}

          <button
            type="button"
            onClick={handleStart}
            disabled={!canStart || customTestBlocked}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition-colors ${
              !canStart || customTestBlocked
                ? "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-[var(--surface-elevated)] dark:text-slate-500"
                : "cursor-pointer bg-brand text-black hover:bg-brand-hover"
            }`}
          >
            <Play className="h-4 w-4" fill="currentColor" />
            Start Test
          </button>

          {customTestBlocked && (
            <Link
              href="/pro"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-brand/35 px-4 py-3 text-sm font-black text-amber-700 transition-colors hover:bg-brand hover:text-black dark:text-brand"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
