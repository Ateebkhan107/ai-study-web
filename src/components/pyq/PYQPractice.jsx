"use client";

import { useState, useEffect, useRef } from "react";
import QuestionCard from "@/components/pyq/QuestionCard";

const SUBJECTS  = ["All", "Physics", "Chemistry", "Maths", "Biology"];
const DURATIONS = [10, 20, 30, 45, 60]; // minutes

export default function PYQPractice({ questions, updateQuestion, onSwitchTab }) {
  const [subject,   setSubject]   = useState("All");
  const [duration,  setDuration]  = useState(20);
  const [started,   setStarted]   = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [finished,  setFinished]  = useState(false);
  const [sessionQs, setSessionQs] = useState([]);
  const timerRef = useRef(null);

  // Derived stats (only for session questions)
  const attempted = sessionQs.filter((q) => questions.find((sq) => sq.id === q.id)?.attempted).length;
  const correct   = sessionQs.filter((q) => {
    const live = questions.find((sq) => sq.id === q.id);
    return live?.attempted && live?.selected === live?.correct;
  }).length;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleStart = () => {
    const pool =
      subject === "All"
        ? questions
        : questions.filter((q) => q.subject === subject);

    // Shuffle + cap at sensible number
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 15);
    setSessionQs(shuffled);
    setTimeLeft(duration * 60);
    setStarted(true);
    setFinished(false);
  };

  const handleFinish = () => {
    clearInterval(timerRef.current);
    setFinished(true);
  };

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); setFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  const timerDanger = timeLeft < 300 && timeLeft > 0;

  // ── Finished screen ──
  if (finished) {
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const timeTaken = duration * 60 - timeLeft;
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-10 text-center shadow-sm">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-3xl font-black text-black dark:text-white tracking-tight mb-1">
            Session Complete
          </h2>
          <p className="text-sm text-gray-400 mb-8">Here's how you did</p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: "Correct",   value: `${correct}/${attempted}` },
              { label: "Accuracy",  value: `${accuracy}%`           },
              { label: "Attempted", value: `${attempted}/${sessionQs.length}` },
              { label: "Time",      value: formatTime(timeTaken)    },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                <p className="text-2xl font-black text-black dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setStarted(false); setFinished(false); }}
              className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 transition-opacity"
            >
              New Session
            </button>
            <button
              onClick={() => onSwitchTab("analytics")}
              className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              View Analytics →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active session ──
  if (started) {
    return (
      <div>
        {/* Session top bar */}
        <div className="sticky top-16 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 -mx-6 px-6 py-3 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              PYQ Practice
            </span>
            <span className="text-xs text-gray-400">
              {subject === "All" ? "All subjects" : subject} · {sessionQs.length} questions
            </span>
          </div>

          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-sm tabular-nums
            ${timerDanger
              ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
              : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
            }`}
          >
            {timerDanger && <span className="animate-pulse">⚠</span>}
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{attempted}/{sessionQs.length} answered</span>
            <button
              onClick={handleFinish}
              className="px-4 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-black hover:opacity-90 transition-opacity"
            >
              Submit
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {sessionQs.map((q) => {
            const live = questions.find((sq) => sq.id === q.id);
            return (
              <QuestionCard
                key={q.id}
                question={live}
                updateQuestion={updateQuestion}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // ── Setup screen ──
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚡</div>
          <h2 className="text-2xl font-black text-black dark:text-white tracking-tight mb-1">
            Timed Practice
          </h2>
          <p className="text-sm text-gray-400">
            Solve PYQs under timed conditions with AI-powered explanations.
          </p>
        </div>

        {/* Subject */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Subject
          </p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150
                  ${subject === s
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Duration (minutes)
          </p>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-150
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

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Questions", value: `Up to 15`, sub: "from your pool" },
            { label: "Time Limit", value: `${duration} min`, sub: "auto-submit on end" },
            { label: "Mode",      value: "Adaptive", sub: "based on history" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-base font-black text-black dark:text-white">{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 transition-opacity"
        >
          Start Session →
        </button>
      </div>
    </div>
  );
}