"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Atom, FlaskConical, Calculator, Dna } from "lucide-react";

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
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">

      {/* Left — Subject + Chapter Picker */}
      <div className="min-w-0 space-y-5 xl:col-span-2">

        {/* Step 1 — Subject selector */}
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            01 — Choose Subjects
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {activeTrack === "neet" ? "Choose Biology for chapter-wise practice" : "You can select multiple subjects"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {filteredSubjectsEntries.map(([name, data]) => {
              const c = colorMap[data.color];
              const isSelected = validSelectedSubjects.includes(name);
              const chapterCount = (selectedChapters[name] || []).length;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleSubject(name)}
                  className={`group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 font-semibold text-sm cursor-pointer
                    ${isSelected
                      ? `${c.bg} ${c.border} ${c.text}`
                      : "border-gray-100 dark:border-[var(--border-subtle)] text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50 dark:bg-[var(--surface-elevated)]/40"
                    }`}
                >
                  <span className="mb-1 flex items-center justify-center">{data.icon}</span>
                  {name}
                  {isSelected && (
                    <span className="text-[10px] font-bold opacity-70">
                      {chapterCount > 0 ? `${chapterCount} chapters` : "Selected ✓"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — Chapter selector */}
        <div className={`space-y-3 transition-all duration-300 ${validSelectedSubjects.length === 0 ? "opacity-50 pointer-events-none" : ""}`}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
            02 — Choose Chapters
            {validSelectedSubjects.length === 0 && <span className="ml-2 font-normal normal-case">— select a subject first</span>}
          </p>

          {validSelectedSubjects.map((subject) => {
            const data = SUBJECTS[subject];
            if (!data) return null;

            const c = colorMap[data.color];
            const chapters = selectedChapters[subject] || [];
            const isExpanded = expandedSubject === subject;
            const allSelected = chapters.length === data.chapters.length;
            const isBiologyPracticeSubject = activeTrack === "neet" && subject === "Biology";

            return (
              <div
                key={subject}
                className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl overflow-hidden"
              >
                <div
                  onClick={() => setExpandedSubject(isExpanded ? null : subject)}
                className="w-full flex min-w-0 items-center justify-between gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer select-none sm:px-5"
              >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-lg">{data.icon}</span>
                    <span className={`truncate text-sm font-bold ${c.text}`}>{subject}</span>
                    {chapters.length > 0 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.chip}`}>
                        {chapters.length}/{data.chapters.length}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {isExpanded && (
                      <span
                        onClick={(e) => { e.stopPropagation(); selectAllChapters(subject); }}
                        className={`text-xs font-semibold text-gray-400 hover:text-black dark:hover:text-white transition-colors ${isBiologyPracticeSubject ? "hidden" : "cursor-pointer"}`}
                      >
                        {allSelected ? "Deselect all" : "Select all"}
                      </span>
                    )}
                    <span className={`text-gray-400 text-xs transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50 dark:border-[var(--border-subtle)] pt-3 sm:px-5">
                    {isBiologyPracticeSubject && (
                      <div className="mb-3 rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
                        {availabilityLoading
                          ? "Loading published Biology practice counts..."
                          : availabilityMessage || "Select one Biology chapter to build a practice test from published PrepZii questions."}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-100
                              ${isChapterSelected
                                ? c.chip
                                : isUnavailable
                                ? "bg-gray-50 dark:bg-[var(--surface-elevated)] text-gray-300 dark:text-gray-600 border-gray-100 dark:border-[var(--border-subtle)] cursor-not-allowed"
                                : "bg-gray-50 dark:bg-[var(--surface-elevated)] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-[var(--border)] hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                          >
                            {isChapterSelected ? "✓ " : ""}{chapter}
                            {isBiologyPracticeSubject && (
                              <span className={`ml-2 font-bold ${isUnavailable ? "text-gray-300 dark:text-gray-600" : "text-rose-500 dark:text-rose-300"}`}>
                                {availability} available
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
      </div>

      {/* Right — Config + Start */}
      <div className="space-y-4">

        {/* Question count */}
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Questions
          </p>
          <div className="flex flex-wrap gap-2">
            {questionCountOptions.map((n) => {
              const disabled = isNeetBiologyPractice && (!selectedBiologyChapter || n > selectedBiologyAvailability);
              return (
              <button
                key={n}
                type="button"
                onClick={() => !disabled && saveCount(n)}
                disabled={disabled}
                className={`w-12 h-10 rounded-lg text-sm font-bold border transition-all duration-100
                  ${questionCount === n
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60"
                    : disabled
                    ? "bg-gray-50 dark:bg-[var(--surface-elevated)] text-gray-300 dark:text-gray-600 border-gray-100 dark:border-[var(--border-subtle)] cursor-not-allowed"
                    : "bg-gray-50 dark:bg-[var(--surface-elevated)] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-[var(--border)] hover:border-gray-400"
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
                className={`px-3 h-10 rounded-lg text-sm font-bold border transition-all duration-100 cursor-pointer
                  ${questionCount === selectedBiologyAvailability
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60"
                    : "bg-gray-50 dark:bg-[var(--surface-elevated)] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-[var(--border)] hover:border-gray-400"
                  }`}
              >
                All {selectedBiologyAvailability}
              </button>
            )}
          </div>
          {isNeetBiologyPractice && selectedBiologyChapter && selectedBiologyAvailability === 0 && (
            <p className="mt-3 text-xs font-semibold text-rose-500">
              No practice questions are available for this chapter yet.
            </p>
          )}
        </div>

        {/* Duration */}
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Duration (mins)
          </p>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => saveDuration(d)}
                className={`px-3 h-10 rounded-lg text-sm font-bold border transition-all duration-100 cursor-pointer
                  ${duration === d
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60"
                    : "bg-gray-50 dark:bg-[var(--surface-elevated)] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-[var(--border)] hover:border-gray-400"
                  }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Difficulty
          </p>
          <div className="flex flex-col gap-2">
            {["easy", "medium", "hard", "mixed"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => saveDifficulty(d)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-100 cursor-pointer
                  ${difficulty === d
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60"
                    : "bg-gray-50 dark:bg-[var(--surface-elevated)] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-[var(--border)] hover:border-gray-400"
                  }`}
              >
                <span className="capitalize">{d}</span>
                <span className="text-xs opacity-60">
                  {d === "easy" ? "⬤" : d === "medium" ? "⬤⬤" : "⬤⬤⬤"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary + Start */}
        <div className={`rounded-2xl p-5 border-2 transition-all duration-200
          ${canStart && !customTestBlocked
            ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700/60"
            : "bg-gray-100 dark:bg-[var(--surface-elevated)] border-gray-200 dark:border-[var(--border)]"
          }`}
        >
          {canStart ? (
            <>
              <div className="mb-4 space-y-2">
                <p className={`text-xs font-bold uppercase tracking-widest ${customTestBlocked ? "text-gray-400 dark:text-gray-500" : "text-indigo-700/70 dark:text-indigo-300/70"}`}>
                  Test Summary
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {validSelectedSubjects.map((s) => (
                    <span key={s} className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${customTestBlocked ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300" : "bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"}`}>
                      <span className="w-3 h-3 flex items-center justify-center">{SUBJECTS[s]?.icon}</span> {s}
                    </span>
                  ))}
                </div>
                <p className={`text-xs ${customTestBlocked ? "text-gray-500 dark:text-gray-400" : "text-indigo-700/80 dark:text-indigo-300/80"}`}>
                  {totalChapters} chapters · {questionCount} questions · {duration} mins
                </p>
                <p className={`text-xs capitalize ${customTestBlocked ? "text-gray-500 dark:text-gray-400" : "text-indigo-700/80 dark:text-indigo-300/80"}`}>
                  {difficulty} difficulty
                </p>
                {customTestUsage && !access?.isPro && (
                  <p className={`text-xs font-semibold ${customTestBlocked ? "text-rose-500" : "text-indigo-700/80 dark:text-indigo-300/80"}`}>
                    {customTestBlocked
                      ? "You’ve used your 2 free custom tests this month."
                      : `${customTestUsage.remaining} of ${customTestUsage.limit} free custom tests left this month.`}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleStart}
                disabled={customTestBlocked}
                className={`w-full py-3 rounded-xl text-sm font-black transition-opacity ${
                  customTestBlocked
                    ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    : "cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:text-white"
                }`}
              >
                Start Test →
              </button>
              {customTestBlocked && (
                <Link
                  href="/pro"
                  className="mt-3 flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-black text-white"
                >
                  Upgrade to Pro
                </Link>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center font-medium">
              Select subjects and at least one chapter to begin
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
