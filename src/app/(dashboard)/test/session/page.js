"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

// Placeholder questions — replace with real DB fetch later
const PLACEHOLDER_QUESTIONS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  question_text: `This is sample question ${i + 1}. Once your database is connected, real questions will load here based on your selected subjects and chapters.`,
  option_a: "Option A — first choice",
  option_b: "Option B — second choice",
  option_c: "Option C — third choice",
  option_d: "Option D — fourth choice",
  correct_option: "A",
}));

export default function TestSessionPage() {
  const router = useRouter();
  const params = useSearchParams();

  const subjects = params.get("subjects")?.split(",") || [];
  const chapters = params.get("chapters")?.split(",") || [];
  const duration = Number(params.get("duration") || 30);
  const count = Number(params.get("count") || 20);
  const difficulty = params.get("difficulty") || "mixed";
  const mode = params.get("mode") || "custom";

  const questions = PLACEHOLDER_QUESTIONS.slice(0, count);
  const totalSeconds = duration * 60;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [submitted, setSubmitted] = useState(false);
  const [flagged, setFlagged] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const selectAnswer = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const toggleFlag = (qId) => {
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    setSubmitted(true);
  };

  const attempted = Object.keys(answers).length;
  const timerDanger = timeLeft < 300; // last 5 mins

  if (submitted) {
    const correct = questions.filter((q) => answers[q.id] === q.correct_option).length;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    return (
      <div className="min-h-screen bg-[#f9f9f9] dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-3xl font-black text-black dark:text-white mb-1">Test Complete</h1>
          <p className="text-gray-400 text-sm mb-8">Here's how you did</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <p className="text-2xl font-black text-black dark:text-white">{correct}/{attempted}</p>
              <p className="text-xs text-gray-400 mt-1">Correct</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <p className="text-2xl font-black text-black dark:text-white">{accuracy}%</p>
              <p className="text-xs text-gray-400 mt-1">Accuracy</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <p className="text-2xl font-black text-black dark:text-white">{attempted}/{questions.length}</p>
              <p className="text-xs text-gray-400 mt-1">Attempted</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <p className="text-2xl font-black text-black dark:text-white">
                {formatTime(totalSeconds - timeLeft)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Time taken</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/test")}
              className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 transition-opacity"
            >
              Back to Test Center
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-gray-950">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/test")}
            className="text-xs font-semibold text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            ← Exit
          </button>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {subjects.join(", ")} · {difficulty} · {mode}
          </p>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-sm tabular-nums
          ${timerDanger
            ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
            : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
          }`}
        >
          {timerDanger && <span className="animate-pulse">⚠</span>}
          {formatTime(timeLeft)}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{attempted}/{questions.length} answered</span>
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-black hover:opacity-90 transition-opacity"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Question panel */}
        <div className="lg:col-span-3 space-y-5">
          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white rounded-full transition-all duration-300"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Question {current + 1} of {questions.length}
              </span>
              <button
                onClick={() => toggleFlag(q.id)}
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all
                  ${flagged[q.id]
                    ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-400"
                  }`}
              >
                {flagged[q.id] ? "🚩 Flagged" : "Flag"}
              </button>
            </div>

            <p className="text-base font-medium text-black dark:text-white leading-relaxed mb-6">
              {q.question_text}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {["A", "B", "C", "D"].map((opt) => {
                const text = q[`option_${opt.toLowerCase()}`];
                const isSelected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => selectAnswer(q.id, opt)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all duration-100
                      ${isSelected
                        ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                  >
                    <span className={`w-7 h-7 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-black
                      ${isSelected
                        ? "border-white dark:border-black text-white dark:text-black"
                        : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {opt}
                    </span>
                    {text}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-400 font-medium">
              {current + 1} / {questions.length}
            </span>
            <button
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              disabled={current === questions.length - 1}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Question grid navigator */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 sticky top-24">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Questions
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((qItem, idx) => (
                <button
                  key={qItem.id}
                  onClick={() => setCurrent(idx)}
                  className={`h-8 w-full rounded-lg text-xs font-bold transition-all
                    ${idx === current
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : answers[qItem.id]
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      : flagged[qItem.id]
                      ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-3 rounded bg-black dark:bg-white" /> Current
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600" /> Answered
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-3 rounded bg-yellow-200 dark:bg-yellow-900/50 border border-yellow-300" /> Flagged
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-3 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" /> Not visited
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}