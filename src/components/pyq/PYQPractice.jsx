"use client";

import { useState, useEffect, useRef } from "react";
import QuestionCard from "@/components/pyq/QuestionCard";

const SUBJECT_CONFIG = {
  Physics:   { icon: "⚛", color: "blue" },
  Chemistry: { icon: "🧪", color: "green" },
  Maths:     { icon: "∑", color: "purple" },
  Biology:   { icon: "🧬", color: "rose" },
};

const colorMap = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800",     text: "text-blue-700 dark:text-blue-300",     chip: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700" },
  green:  { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", chip: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700" },
  purple: { bg: "bg-violet-50 dark:bg-violet-950/30",  border: "border-violet-200 dark:border-violet-800",  text: "text-violet-700 dark:text-violet-300",  chip: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700" },
  rose:   { bg: "bg-rose-50 dark:bg-rose-950/30",      border: "border-rose-200 dark:border-rose-800",      text: "text-rose-700 dark:text-rose-300",      chip: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700" },
};

const YEARS = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"];
const QUESTION_COUNTS = [10, 20, 30, 40, 50];
const DURATIONS = [15, 30, 45, 60, 90];

export default function PYQPractice({ questions = [], updateQuestion, onSwitchTab }) {
  // ── Setup Configuration State ──
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [questionCount, setQuestionCount] = useState(20);
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState("mixed");

  // ── Engine State ──
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [sessionQs, setSessionQs] = useState([]);
  const timerRef = useRef(null);

  // ── Hydrate safely from sessionStorage on mount ──
  useEffect(() => {
    try {
      const savedSubjects = sessionStorage.getItem("pq_subjects");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage hydration must happen after mount to avoid SSR mismatch.
      if (savedSubjects) setSelectedSubjects(JSON.parse(savedSubjects));

      const savedYear = sessionStorage.getItem("pq_year");
      if (savedYear) setSelectedYear(savedYear);

      const savedCount = sessionStorage.getItem("pq_count");
      if (savedCount) setQuestionCount(Number(savedCount));

      const savedDuration = sessionStorage.getItem("pq_duration");
      if (savedDuration) setDuration(Number(savedDuration));

      const savedDifficulty = sessionStorage.getItem("pq_difficulty");
      if (savedDifficulty) setDifficulty(savedDifficulty);
    } catch (error) {
      console.log("Starting fresh practice session configuration state.");
    }
  }, []);

  const saveSubjects = (val) => {
    setSelectedSubjects(val);
    sessionStorage.setItem("pq_subjects", JSON.stringify(val));
  };
  const saveYear = (val) => {
    setSelectedYear(val);
    sessionStorage.setItem("pq_year", val);
  };
  const saveCount = (val) => {
    setQuestionCount(val);
    sessionStorage.setItem("pq_count", val.toString());
  };
  const saveDuration = (val) => {
    setDuration(val);
    sessionStorage.setItem("pq_duration", val.toString());
  };
  const saveDifficulty = (val) => {
    setDifficulty(val);
    sessionStorage.setItem("pq_difficulty", val);
  };

  // ── Derived Session Analytics ──
  const attempted = sessionQs.filter((q) => questions.find((sq) => sq.id === q.id)?.attempted).length;
  const correct = sessionQs.filter((q) => {
    const live = questions.find((sq) => sq.id === q.id);
    return live?.attempted && live?.selected === live?.correct;
  }).length;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleToggleSubject = (sub) => {
    const next = selectedSubjects.includes(sub)
      ? selectedSubjects.filter((s) => s !== sub)
      : [...selectedSubjects, sub];
    saveSubjects(next);
  };

  const handleStartSession = () => {
    let pool = [...questions];

    if (selectedSubjects.length > 0) {
      pool = pool.filter((q) => selectedSubjects.includes(q.subject));
    }
    if (selectedYear !== "All") {
      pool = pool.filter((q) => q.year.toString() === selectedYear);
    }
    if (difficulty !== "mixed") {
      pool = pool.filter((q) => q.difficulty === difficulty.toLowerCase());
    }

    if (pool.length === 0) {
      alert("No matching questions found for this pool query. Try loosening your parameters!");
      return;
    }

    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, questionCount);
    setSessionQs(shuffled);
    setTimeLeft(duration * 60);
    setStarted(true);
    setFinished(false);
  };

  const handleFinishSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFinished(true);
  };

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, finished]);

  const timerDanger = timeLeft < 300 && timeLeft > 0;
  const canStart = true;

  if (finished) {
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const timeTaken = duration * 60 - timeLeft;

    return (
      <div className="max-w-xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-[2rem] p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
          
          <div className="text-4xl mb-4">🏁</div>
          <h2 className="text-3xl font-black text-black dark:text-white tracking-tight mb-2">
            Practice Complete
          </h2>
          <p className="text-sm text-gray-400 mb-8">Performance metrics recorded successfully.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "Correct Answers", value: `${correct} / ${attempted}`, cls: "text-emerald-500" },
              { label: "Accuracy Rate", value: `${accuracy}%`, cls: "text-indigo-500" },
              { label: "Questions Attempted", value: `${attempted} / ${sessionQs.length}`, cls: "text-slate-500" },
              { label: "Time Expended", value: formatTime(timeTaken), cls: "text-amber-500" },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5">
                <p className={`text-2xl font-black ${s.cls}`}>{s.value}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => {
                setStarted(false);
                setFinished(false);
                saveSubjects([]);
              }}
              className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-black hover:opacity-90 transition-all"
            >
              Configure New Session
            </button>
            <button
              type="button"
              onClick={() => onSwitchTab("analytics")}
              className="w-full py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Analyze Trends →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (started) {
    return (
      <div className="space-y-6">
        <div className="sticky top-16 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 -mx-6 px-6 py-4 flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest block mb-0.5">Live Practice</span>
            <span className="text-xs text-gray-400 font-medium">
              {selectedSubjects.length === 0 ? "All Subjects" : selectedSubjects.join(", ")} · {sessionQs.length} Qs
            </span>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm tabular-nums border transition-all
            ${timerDanger
              ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse"
              : "bg-gray-100 dark:bg-gray-800 border-transparent text-black dark:text-white"
            }`}
          >
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs font-bold text-gray-400">{attempted} / {sessionQs.length} Completed</span>
            <button
              type="button"
              onClick={handleFinishSession}
              className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-black hover:opacity-90 transition-opacity"
            >
              End & Submit
            </button>
          </div>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {sessionQs.map((q) => {
            const liveQuestion = questions.find((sq) => sq.id === q.id) || q;
            return (
              <QuestionCard
                key={q.id}
                question={liveQuestion}
                updateQuestion={updateQuestion}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        
        {/* 01 - Choose Subjects */}
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            01 — Choose Subjects
          </p>
          <p className="text-xs text-gray-400 mb-4">Select multiple subjects or leave empty for mixed session</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(SUBJECT_CONFIG).map(([name, data]) => {
              const isSelected = selectedSubjects.includes(name);
              const theme = colorMap[data.color];
              
              return (
                <button
                  type="button"
                  key={name}
                  onClick={() => handleToggleSubject(name)}
                  className={`group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 font-semibold text-sm
                    ${isSelected
                      ? `${theme.bg} ${theme.border} ${theme.text}`
                      : "border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50 dark:bg-gray-800/30"
                    }`}
                >
                  <span className="text-2xl mb-1">{data.icon}</span>
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 02 - Choose Year */}
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            02 — Choose Year
          </p>
          <p className="text-xs text-gray-400 mb-4">Select a specific target paper year filter</p>
          
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => saveYear("All")}
              className={`px-4 h-10 rounded-lg text-sm font-bold border transition-all duration-100
                ${selectedYear === "All"
                  ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                  : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
            >
              All Years
            </button>
            {YEARS.map((yr) => (
              <button
                type="button"
                key={yr}
                onClick={() => saveYear(yr)}
                className={`px-4 h-10 rounded-lg text-sm font-bold border transition-all duration-100
                  ${selectedYear === yr
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Total Questions Counter */}
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Questions</p>
          <div className="flex flex-wrap gap-2">
            {QUESTION_COUNTS.map((cnt) => (
              <button
                type="button"
                key={cnt}
                onClick={() => saveCount(cnt)}
                className={`w-12 h-10 rounded-lg text-sm font-bold border transition-all duration-100
                  ${questionCount === cnt
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>

        {/* Durations Pool */}
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Duration</p>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((dur) => (
              <button
                type="button"
                key={dur}
                onClick={() => saveDuration(dur)}
                className={`px-3 h-10 rounded-lg text-sm font-bold border transition-all duration-100
                  ${duration === dur
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                {dur}m
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Select Block */}
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Difficulty</p>
          <div className="flex flex-col gap-2">
            {["easy", "medium", "hard", "mixed"].map((diff) => (
              <button
                type="button"
                key={diff}
                onClick={() => saveDifficulty(diff)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-100
                  ${difficulty === diff
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                <span className="capitalize">{diff}</span>
                <span className="text-xs opacity-60">
                  {diff === "easy" ? "⬤" : diff === "medium" ? "⬤⬤" : "⬤⬤⬤"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Summary Card & Trigger Action */}
        <div className={`rounded-2xl p-5 border-2 transition-all duration-200
          ${canStart
            ? "bg-black dark:bg-white border-black dark:border-white"
            : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="mb-4 space-y-2">
            <p className="text-xs font-bold text-white/50 dark:text-black/50 uppercase tracking-widest">
              Practice Summary
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedSubjects.length === 0 ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/10 text-white dark:text-black">
                  📚 Mixed Pool
                </span>
              ) : (
                selectedSubjects.map((s) => (
                  <span key={s} className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/10 text-white dark:text-black">
                    {SUBJECT_CONFIG[s].icon} {s}
                  </span>
                ))
              )}
            </div>
            <p className="text-white/70 dark:text-black/70 text-xs">
              Year Range: <span className="font-bold">{selectedYear}</span> · {questionCount} questions · {duration} mins
            </p>
            <p className="text-white/70 dark:text-black/70 text-xs capitalize">
              {difficulty} difficulty
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartSession}
            className="w-full py-3 rounded-xl bg-white dark:bg-black text-black dark:text-white text-sm font-black transition-opacity hover:opacity-90 shadow-md"
          >
            Launch Practice →
          </button>
        </div>
      </div>
      
    </div>
  );
}
