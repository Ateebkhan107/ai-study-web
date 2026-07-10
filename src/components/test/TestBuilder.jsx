"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTestAttempt } from "@/lib/testAttempts";

const SUBJECTS = {
  Physics: {
    icon: "⚛",
    color: "blue",
    chapters: [
      "Kinematics", "Laws of Motion", "Work Power and Energy",
      "Rotational Motion", "Gravitation", "Thermodynamics",
      "Waves", "Electrostatics", "Current Electricity",
      "Magnetism", "Optics", "Modern Physics",
    ],
  },
  Chemistry: {
    icon: "🧪",
    color: "green",
    chapters: [
      "Atomic Structure", "Chemical Bonding", "States of Matter",
      "Thermodynamics", "Equilibrium", "Electrochemistry",
      "Organic Chemistry Basics", "Hydrocarbons", "Biomolecules",
      "Coordination Compounds", "p-Block Elements", "d-Block Elements",
    ],
  },
  Maths: {
    icon: "∑",
    color: "purple",
    chapters: [
      "Sets & Relations", "Complex Numbers", "Quadratic Equations",
      "Sequences & Series", "Permutations & Combinations", "Binomial Theorem",
      "Trigonometry", "Straight Lines", "Conic Sections",
      "Limits & Derivatives", "Integrals", "Probability",
    ],
  },
  Biology: {
    icon: "🧬",
    color: "rose",
    chapters: [
      "Cell Biology", "Genetics", "Evolution",
      "Plant Physiology", "Human Physiology", "Reproduction",
      "Ecology", "Biotechnology", "Microorganisms",
      "Animal Kingdom", "Plant Kingdom", "Biomolecules",
    ],
  },
};

const QUESTION_COUNTS = [20, 40, 60, 75, 90];
const DURATIONS = [45, 90, 120, 150, 180];

const colorMap = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800",     text: "text-blue-700 dark:text-blue-300",     chip: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700" },
  green:  { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", chip: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700" },
  purple: { bg: "bg-violet-50 dark:bg-violet-950/30",  border: "border-violet-200 dark:border-violet-800",  text: "text-violet-700 dark:text-violet-300",  chip: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700" },
  rose:   { bg: "bg-rose-50 dark:bg-rose-950/30",      border: "border-rose-200 dark:border-rose-800",      text: "text-rose-700 dark:text-rose-300",      chip: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700" },
};

// 1. Accept the track prop coming from page.js (defaults to "jee" for fallback safety)
export default function TestBuilder({ track = "jee" }) {
  const router = useRouter();

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState({});
  const [duration, setDuration] = useState(30);
  const [questionCount, setQuestionCount] = useState(20);
  const [difficulty, setDifficulty] = useState("mixed");
  const [expandedSubject, setExpandedSubject] = useState(null);

  // Normalize track data context
  const activeTrack = track?.toLowerCase() || "jee";

  // 2. Intercept and isolate target track subjects
  const filteredSubjectsEntries = Object.entries(SUBJECTS).filter(([name]) => {
    if (activeTrack === "jee" && name === "Biology") return false;
    if (activeTrack === "neet" && name === "Maths") return false;
    return true;
  });

  useEffect(() => {
    try {
      const savedSubjects = sessionStorage.getItem("tb_subjects");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage hydration must happen after mount to avoid SSR mismatch.
      if (savedSubjects) setSelectedSubjects(JSON.parse(savedSubjects));

      const savedChapters = sessionStorage.getItem("tb_chapters");
      if (savedChapters) setSelectedChapters(JSON.parse(savedChapters));

      const savedDuration = sessionStorage.getItem("tb_duration");
      if (savedDuration) setDuration(Number(savedDuration));

      const savedCount = sessionStorage.getItem("tb_count");
      if (savedCount) setQuestionCount(Number(savedCount));

      const savedDifficulty = sessionStorage.getItem("tb_difficulty");
      if (savedDifficulty) setDifficulty(savedDifficulty);
    } catch (error) {
      console.log("No saved data found, starting fresh!");
    }
  }, []);

  const saveSubjects = (val) => {
    setSelectedSubjects(val);
    sessionStorage.setItem("tb_subjects", JSON.stringify(val));
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
    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) {
        const newChapters = { ...selectedChapters };
        delete newChapters[subject];
        saveChapters(newChapters);
        if (expandedSubject === subject) setExpandedSubject(null);
        const next = prev.filter((s) => s !== subject);
        sessionStorage.setItem("tb_subjects", JSON.stringify(next));
        return next;
      } else {
        setExpandedSubject(subject);
        const next = [...prev, subject];
        sessionStorage.setItem("tb_subjects", JSON.stringify(next));
        return next;
      }
    });
  };

  const toggleChapter = (subject, chapter) => {
    const current = selectedChapters[subject] || [];
    const updated = current.includes(chapter)
      ? current.filter((c) => c !== chapter)
      : [...current, chapter];
    const next = { ...selectedChapters, [subject]: updated };
    saveChapters(next);
  };

  const selectAllChapters = (subject) => {
    const all = SUBJECTS[subject].chapters;
    const current = selectedChapters[subject] || [];
    const next = { ...selectedChapters, [subject]: current.length === all.length ? [] : [...all] };
    saveChapters(next);
  };

  const totalChapters = Object.values(selectedChapters).flat().length;
  const canStart = selectedSubjects.length > 0 && totalChapters > 0;

  const handleStart = async () => {


  const allChapters =
    Object.values(selectedChapters).flat();



  const exam =
    activeTrack === "neet"
    ?
    "NEET"
    :
    "JEE Main";



  const params = new URLSearchParams({


    exam: exam,


    subjects:
    selectedSubjects.join(","),


    chapters:
    allChapters.join(","),


    duration:
    duration.toString(),


    count:
    questionCount.toString(),


    difficulty:
    difficulty,


    mode:"custom"


  });






  sessionStorage.removeItem(
    "tb_subjects"
  );


  sessionStorage.removeItem(
    "tb_chapters"
  );


  sessionStorage.removeItem(
    "tb_duration"
  );


  sessionStorage.removeItem(
    "tb_count"
  );


  sessionStorage.removeItem(
    "tb_difficulty"
  );






  router.push(

    `/test/session?${params.toString()}`

  );



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
            {/* 3. Changed map target from "Object.entries(SUBJECTS)" to your filtered array */}
            {filteredSubjectsEntries.map(([name, data]) => {
              const c = colorMap[data.color];
              const isSelected = selectedSubjects.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => toggleSubject(name)}
                  className={`group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 font-semibold text-sm cursor-pointer
                    ${isSelected
                      ? `${c.bg} ${c.border} ${c.text}`
                      : "border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50 dark:bg-gray-800/40"
                    }`}
                >
                  <span className="text-2xl">{data.icon}</span>
                  {name}
                  {isSelected && (
                    <span className="text-[10px] font-bold opacity-70">
                      {(selectedChapters[name] || []).length > 0
                        ? `${(selectedChapters[name] || []).length} chapters`
                        : "Selected ✓"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — Chapter selector */}
        <div className={`space-y-3 transition-all duration-300 ${selectedSubjects.length === 0 ? "opacity-50 pointer-events-none" : ""}`}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
            02 — Choose Chapters
            {selectedSubjects.length === 0 && <span className="ml-2 font-normal normal-case">— select a subject first</span>}
          </p>

          {selectedSubjects.map((subject) => {
            const data = SUBJECTS[subject];
            if (!data) return null; // Defensive safety line

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
                  {selectedSubjects.map((s) => (
                    <span key={s} className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/10 text-white dark:text-black">
                      {SUBJECTS[s]?.icon} {s}
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
