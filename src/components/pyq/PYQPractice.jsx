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
  blue:   { bg: "bg-blue-500/5", border: "border-blue-500/80", text: "text-blue-400", chip: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  green:  { bg: "bg-emerald-500/5", border: "border-emerald-500/80", text: "text-emerald-400", chip: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  purple: { bg: "bg-violet-500/5", border: "border-violet-500/80", text: "text-violet-400", chip: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  rose:   { bg: "bg-rose-500/5", border: "border-rose-500/80", text: "text-rose-400", chip: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
};

const YEARS = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"];
const QUESTION_COUNTS = [10, 20, 30, 40, 50];
const DURATIONS = [15, 30, 45, 60, 90];

export default function PYQPractice({ questions = [], updateQuestion, onSwitchTab }) {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [questionCount, setQuestionCount] = useState(20);
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState("mixed");

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [sessionQs, setSessionQs] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    try {
      const savedSubjects = sessionStorage.getItem("pq_subjects");
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
      console.log("Staging default practice query arrays.");
    }
  }, []);

  const saveSubjects = (val) => { setSelectedSubjects(val); sessionStorage.setItem("pq_subjects", JSON.stringify(val)); };
  const saveYear = (val) => { setSelectedYear(val); sessionStorage.setItem("pq_year", val); };
  const saveCount = (val) => { setQuestionCount(val); sessionStorage.setItem("pq_count", val.toString()); };
  const saveDuration = (val) => { setDuration(val); sessionStorage.setItem("pq_duration", val.toString()); };
  const saveDifficulty = (val) => { setDifficulty(val); sessionStorage.setItem("pq_difficulty", val); };

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
    const next = selectedSubjects.includes(sub) ? selectedSubjects.filter((s) => s !== sub) : [...selectedSubjects, sub];
    saveSubjects(next);
  };

  const handleStartSession = () => {
    let pool = [...questions];
    if (selectedSubjects.length > 0) pool = pool.filter((q) => selectedSubjects.includes(q.subject));
    if (selectedYear !== "All") pool = pool.filter((q) => q.year.toString() === selectedYear);
    if (difficulty !== "mixed") pool = pool.filter((q) => q.difficulty === difficulty.toLowerCase());

    if (pool.length === 0) {
      alert("No matching questions found for this configuration.");
      return;
    }

    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, questionCount);
    setSessionQs(shuffled);
    setTimeLeft(duration * 60);
    setStarted(true);
    setFinished(false);
  };

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); setFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, finished]);

  if (finished) {
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    return (
      <div className="max-w-xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden">
          <h2 className="text-2xl font-black text-black dark:text-white tracking-tight mb-6">Practice Complete</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800/60">
              <p className="text-xl font-black text-emerald-400">{correct} / {attempted}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1">Correct</p>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800/60">
              <p className="text-xl font-black text-indigo-400">{accuracy}%</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1">Accuracy</p>
            </div>
          </div>
          <button type="button" onClick={() => { setStarted(false); setFinished(false); saveSubjects([]); }} className="w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-black">Configure New Session</button>
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
            <span className="text-xs text-gray-400 font-medium">{selectedSubjects.length === 0 ? "All Subjects" : selectedSubjects.join(", ")} · {sessionQs.length} Qs</span>
          </div>
          <div className="px-4 py-2 rounded-xl font-black text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white">{formatTime(timeLeft)}</div>
          <button type="button" onClick={handleFinishSession} className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-black">End Session</button>
        </div>
        <div className="space-y-4 max-w-4xl mx-auto">
          {sessionQs.map((q) => (
            <QuestionCard key={q.id} question={questions.find((sq) => sq.id === q.id) || q} updateQuestion={updateQuestion} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">01 — Choose Subjects</p>
          <p className="text-xs text-gray-400 mb-4">Select subjects to filter your practice track</p>
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
                    ${isSelected ? `${theme.bg} ${theme.border} ${theme.text}` : "border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 hover:border-gray-200"}`}
                >
                  <span className="text-2xl mb-1">{data.icon}</span>
                  {name}
                  {isSelected && <span className="text-[10px] font-bold opacity-80">Selected ✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">02 — Choose Year</p>
          <p className="text-xs text-gray-400 mb-4">Filter by original question presentation timeline</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => saveYear("All")}
              className={`px-4 h-10 rounded-lg text-sm font-bold border transition-all duration-100
                ${selectedYear === "All" ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300"}`}
            >
              All Years
            </button>
            {YEARS.map((yr) => (
              <button
                type="button"
                key={yr}
                onClick={() => saveYear(yr)}
                className={`px-4 h-10 rounded-lg text-sm font-bold border transition-all duration-100
                  ${selectedYear === yr ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300"}`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Questions</p>
          <div className="flex flex-wrap gap-2">
            {QUESTION_COUNTS.map((cnt) => (
              <button type="button" key={cnt} onClick={() => saveCount(cnt)} className={`w-12 h-10 rounded-lg text-sm font-bold border transition-all duration-100 ${questionCount === cnt ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 border-gray-200 dark:border-gray-800 hover:border-gray-300"}`}>{cnt}</button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Duration</p>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((dur) => (
              <button type="button" key={dur} onClick={() => saveDuration(dur)} className={`px-3 h-10 rounded-lg text-sm font-bold border transition-all duration-100 ${duration === dur ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 border-gray-200 dark:border-gray-800 hover:border-gray-300"}`}>{dur}m</button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Difficulty</p>
          <div className="flex flex-col gap-2">
            {["easy", "medium", "hard", "mixed"].map((diff) => (
              <button type="button" key={diff} onClick={() => saveDifficulty(diff)} className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-100 ${difficulty === diff ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-gray-50 dark:bg-gray-800/30 text-gray-500 border-gray-200 dark:border-gray-800 hover:border-gray-300"}`}>
                <span className="capitalize">{diff}</span>
                <span className="text-xs opacity-60">{diff === "easy" ? "⬤" : diff === "medium" ? "⬤⬤" : "⬤⬤⬤"}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5 border-2 border-black dark:border-white bg-black dark:bg-white transition-all duration-200 shadow-xl">
          <p className="text-xs font-bold text-white/50 dark:text-black/50 uppercase tracking-widest mb-2">Practice Summary</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedSubjects.length === 0 ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/10 text-white dark:text-black">📚 Mixed Pool</span> : selectedSubjects.map((s) => <span key={s} className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/10 text-white dark:text-black">{SUBJECT_CONFIG[s].icon} {s}</span>)}
          </div>
          <p className="text-white/70 dark:text-black/70 text-xs mb-4">Year: <span className="font-bold">{selectedYear}</span> · {questionCount} questions · {duration} mins</p>
          <button type="button" onClick={handleStartSession} className="w-full py-3 rounded-xl bg-white dark:bg-black text-black dark:text-white text-sm font-black hover:opacity-90 transition-opacity shadow-md">Launch Practice →</button>
        </div>
      </div>
    </div>
  );
}