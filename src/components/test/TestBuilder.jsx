"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Atom, FlaskConical, Calculator, Dna } from "lucide-react";

const SUBJECTS = {
  Physics: {
    icon: <Atom className="w-6 h-6" />,
    color: "blue",
    chapters: [
      "Physical World & Units of Measurement",
      "Kinematics (Motion in a Straight Line & Plane)",
      "Laws of Motion & Friction",
      "Work, Energy & Power",
      "System of Particles & Rotational Motion",
      "Gravitation",
      "Mechanical Properties of Solids & Fluids",
      "Thermal Properties of Matter & Thermodynamics",
      "Kinetic Theory of Gases & Oscillations (SHM)",
      "Waves & Sound",
      "Electrostatics & Capacitance",
      "Current Electricity",
      "Magnetic Effects of Current & Magnetism",
      "Electromagnetic Induction & Alternating Current",
      "Electromagnetic Waves",
      "Ray Optics & Optical Instruments",
      "Wave Optics",
      "Dual Nature of Radiation & Matter",
      "Atoms & Nuclei",
      "Semiconductor Electronics & Devices",
    ],
  },
  Chemistry: {
    icon: <FlaskConical className="w-6 h-6" />,
    color: "green",
    chapters: [
      "Some Basic Concepts of Chemistry (Mole Concept)",
      "Structure of Atom",
      "Classification of Elements & Periodicity",
      "Chemical Bonding & Molecular Structure",
      "States of Matter: Gases & Liquids",
      "Chemical Thermodynamics & Energetics",
      "Chemical & Ionic Equilibrium",
      "Redox Reactions & Electrochemistry",
      "Chemical Kinetics",
      "Solutions & Colligative Properties",
      "Surface Chemistry",
      "p-Block Elements (Groups 13 to 18)",
      "d and f-Block Elements",
      "Coordination Compounds",
      "General Principles of Extraction (Metallurgy)",
      "General Organic Chemistry (GOC) & Nomenclature",
      "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)",
      "Haloalkanes & Haloarenes",
      "Alcohols, Phenols & Ethers",
      "Aldehydes, Ketones & Carboxylic Acids",
      "Amines & Organic Nitrogen Compounds",
      "Biomolecules, Polymers & Everyday Chemistry",
    ],
  },
  Maths: {
    icon: <Calculator className="w-6 h-6" />,
    color: "purple",
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
      "The Living World & Biological Classification",
      "Plant Kingdom",
      "Animal Kingdom",
      "Morphology & Anatomy of Flowering Plants",
      "Structural Organisation in Animals",
      "Cell: Structure, Function & Cell Division",
      "Biomolecules",
      "Plant Physiology (Photosynthesis & Respiration)",
      "Plant Growth & Development",
      "Human Physiology (Digestion, Respiration, Circulation)",
      "Excretion, Locomotion & Neural Control",
      "Chemical Coordination & Integration",
      "Sexual Reproduction in Flowering Plants",
      "Human Reproduction & Reproductive Health",
      "Principles of Inheritance & Variation (Genetics)",
      "Molecular Basis of Inheritance",
      "Evolution",
      "Human Health, Diseases & Microbes",
      "Biotechnology: Principles & Applications",
      "Ecology, Ecosystem & Biodiversity Conservation",
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

const colorMap = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800",     text: "text-blue-700 dark:text-blue-300",     chip: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700" },
  green:  { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", chip: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700" },
  purple: { bg: "bg-violet-50 dark:bg-violet-950/30",  border: "border-violet-200 dark:border-violet-800",  text: "text-violet-700 dark:text-violet-300",  chip: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700" },
  rose:   { bg: "bg-rose-50 dark:bg-rose-950/30",      border: "border-rose-200 dark:border-rose-800",      text: "text-rose-700 dark:text-rose-300",      chip: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700" },
};

export default function TestBuilder({ track = "jee" }) {
  const router = useRouter();

  const activeTrack = track?.toLowerCase() || "jee";

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState({});
  const [duration, setDuration] = useState(activeTrack === "neet" ? 45 : 30);
  const [questionCount, setQuestionCount] = useState(activeTrack === "neet" ? 45 : 20);
  const [difficulty, setDifficulty] = useState("mixed");
  const [expandedSubject, setExpandedSubject] = useState(null);

  const QUESTION_COUNTS = activeTrack === "neet" ? NEET_QUESTION_COUNTS : JEE_QUESTION_COUNTS;
  const DURATIONS = activeTrack === "neet" ? NEET_DURATIONS : JEE_DURATIONS;

  // Filter allowed subjects for current track
  const isSubjectAllowed = (name) => {
    if (activeTrack === "jee" && name === "Biology") return false;
    if (activeTrack === "neet" && name === "Maths") return false;
    return true;
  };

  const filteredSubjectsEntries = Object.entries(SUBJECTS).filter(([name]) => isSubjectAllowed(name));

  // Compute active valid selected subjects
  const validSelectedSubjects = selectedSubjects.filter((name) => isSubjectAllowed(name));

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
    const current = selectedChapters[subject] || [];
    const updated = current.includes(chapter)
      ? current.filter((c) => c !== chapter)
      : [...current, chapter];
    const next = { ...selectedChapters, [subject]: updated };
    saveChapters(next);
  };

  const selectAllChapters = (subject) => {
    if (!isSubjectAllowed(subject)) return;
    const all = SUBJECTS[subject]?.chapters || [];
    const current = selectedChapters[subject] || [];
    const next = { ...selectedChapters, [subject]: current.length === all.length ? [] : [...all] };
    saveChapters(next);
  };

  const totalChapters = validSelectedSubjects.flatMap((s) => selectedChapters[s] || []).length;
  const canStart = validSelectedSubjects.length > 0 && totalChapters > 0;

  const handleStart = async () => {
    const allChapters = validSelectedSubjects.flatMap((s) => selectedChapters[s] || []);
    const exam = activeTrack === "neet" ? "NEET" : "JEE Main";

    const params = new URLSearchParams({
      exam: exam,
      subjects: validSelectedSubjects.join(","),
      chapters: allChapters.join(","),
      duration: duration.toString(),
      count: questionCount.toString(),
      difficulty: difficulty,
      mode: "custom",
    });

    sessionStorage.removeItem("tb_subjects");
    sessionStorage.removeItem("tb_chapters");
    sessionStorage.removeItem("tb_duration");
    sessionStorage.removeItem("tb_count");
    sessionStorage.removeItem("tb_difficulty");

    router.push(`/test/session?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left — Subject + Chapter Picker */}
      <div className="lg:col-span-2 space-y-5">

        {/* Step 1 — Subject selector */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            01 — Choose Subjects
          </p>
          <p className="text-xs text-gray-400 mb-4">You can select multiple subjects</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                      : "border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50 dark:bg-gray-800/40"
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

            return (
              <div
                key={subject}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden"
              >
                <div
                  onClick={() => setExpandedSubject(isExpanded ? null : subject)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{data.icon}</span>
                    <span className={`text-sm font-bold ${c.text}`}>{subject}</span>
                    {chapters.length > 0 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.chip}`}>
                        {chapters.length}/{data.chapters.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isExpanded && (
                      <span
                        onClick={(e) => { e.stopPropagation(); selectAllChapters(subject); }}
                        className="text-xs font-semibold text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
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
                  <div className="px-5 pb-4 border-t border-gray-50 dark:border-gray-800 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {data.chapters.map((chapter) => {
                        const isChapterSelected = chapters.includes(chapter);
                        return (
                          <button
                            key={chapter}
                            type="button"
                            onClick={() => toggleChapter(subject, chapter)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-100 cursor-pointer
                              ${isChapterSelected
                                ? c.chip
                                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                          >
                            {isChapterSelected ? "✓ " : ""}{chapter}
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
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Questions
          </p>
          <div className="flex flex-wrap gap-2">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => saveCount(n)}
                className={`w-12 h-10 rounded-lg text-sm font-bold border transition-all duration-100 cursor-pointer
                  ${questionCount === n
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400"
                  }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
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
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400"
                  }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
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
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400"
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
          ${canStart
            ? "bg-black dark:bg-white border-black dark:border-white"
            : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}
        >
          {canStart ? (
            <>
              <div className="mb-4 space-y-2">
                <p className="text-xs font-bold text-white/50 dark:text-black/50 uppercase tracking-widest">
                  Test Summary
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {validSelectedSubjects.map((s) => (
                    <span key={s} className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/10 text-white dark:text-black flex items-center gap-1">
                      <span className="w-3 h-3 flex items-center justify-center">{SUBJECTS[s]?.icon}</span> {s}
                    </span>
                  ))}
                </div>
                <p className="text-white/70 dark:text-black/70 text-xs">
                  {totalChapters} chapters · {questionCount} questions · {duration} mins
                </p>
                <p className="text-white/70 dark:text-black/70 text-xs capitalize">
                  {difficulty} difficulty
                </p>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="w-full py-3 rounded-xl bg-white dark:bg-black text-black dark:text-white text-sm font-black hover:opacity-90 transition-opacity cursor-pointer"
              >
                Start Test →
              </button>
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
