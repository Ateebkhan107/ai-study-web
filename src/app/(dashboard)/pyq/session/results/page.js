"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ─── Theme CSS Token Configs (kept in sync with the PYQ setup page) ──────────
const BG_SURFACE = "bg-white      dark:bg-gray-900/40 backdrop-blur-md";
const BG_SUNKEN  = "bg-gray-100   dark:bg-gray-950/50";
const BORDER     = "border-gray-200  dark:border-gray-800/60";
const TXT        = "text-gray-900  dark:text-[#e6edf3]";
const TXT_MUTED  = "text-gray-500  dark:text-[#7d8590]";

export default function PYQResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reviewData, setReviewData] = useState([]);
  const [showReview, setShowReview] = useState(false);

  const exam = searchParams.get("exam") || "JEE";
  const subjectsParam = searchParams.get("subjects") || "";
  const difficulty = searchParams.get("difficulty") || "Mixed";
  const total = parseInt(searchParams.get("total") || "0", 10);
  const correct = parseInt(searchParams.get("correct") || "0", 10);
  const wrong = parseInt(searchParams.get("wrong") || "0", 10);
  const skipped = parseInt(searchParams.get("skipped") || "0", 10);
  const accuracy = parseInt(searchParams.get("accuracy") || "0", 10);

  const subjectLabels = subjectsParam ? subjectsParam.split(",") : [];

  useEffect(() => {

    if (typeof window === "undefined") return;

    try {
      const stored = sessionStorage.getItem("pyq_session_review");
      if (stored) {
        setReviewData(JSON.parse(stored));
      }
    }
    catch (error) {
      console.error("Failed to load review data:", error);
    }

  }, []);

  const resultLabel =
    accuracy >= 80 ? "Excellent Work 🎯" :
    accuracy >= 50 ? "Good Effort 👍" :
    "Needs Improvement 📚";

  return (
    <div className={`min-h-full ${TXT}`}>
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight">Deck Submitted!</h1>
          <span className="inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {resultLabel}
          </span>
        </div>

        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6 mb-6`}>
          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4 text-center`}>
            Session Summary
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className={`px-3 py-1.5 rounded-lg border ${BORDER}`}>Subjects: <b>{subjectLabels.join(", ") || "—"}</b></span>
            <span className={`px-3 py-1.5 rounded-lg border ${BORDER}`}>Exam: <b>{exam}</b></span>
            <span className={`px-3 py-1.5 rounded-lg border ${BORDER}`}>Difficulty: <b>{difficulty}</b></span>
            <span className={`px-3 py-1.5 rounded-lg border ${BORDER}`}>Questions: <b>{total}</b></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
            <p className="text-3xl font-black text-emerald-500">{correct}</p>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">Correct</p>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 text-center">
            <p className="text-3xl font-black text-rose-500">{wrong}</p>
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-widest mt-1">Wrong</p>
          </div>

          <div className={`rounded-2xl border ${BORDER} ${BG_SUNKEN} p-5 text-center`}>
            <p className={`text-3xl font-black ${TXT}`}>{skipped}</p>
            <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mt-1`}>Skipped</p>
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 text-center">
            <p className="text-3xl font-black text-sky-500">{accuracy}%</p>
            <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-widest mt-1">Accuracy</p>
          </div>

        </div>

        <div className="flex flex-col gap-3 mb-8">

          <button
            onClick={() => setShowReview(v => !v)}
            className="w-full py-3 rounded-xl text-sm font-bold bg-gray-900 text-white dark:bg-white dark:text-[#0d1117] cursor-pointer"
          >
            {showReview ? "Hide Review" : "Review Answers"}
          </button>

          <button
            onClick={() => router.push("/pyq")}
            className={`w-full py-3 rounded-xl text-sm font-semibold border ${BORDER} ${TXT_MUTED} cursor-pointer`}
          >
            Back to Setup
          </button>

        </div>

        {showReview && (
          <div className="space-y-4">
            {reviewData.map((q, idx) => (

              <div
                key={q.id}
                className={`border ${BORDER} ${BG_SUNKEN} rounded-xl p-4 space-y-3`}
              >

                <div className="flex justify-between">
                  <span className="text-xs font-bold text-sky-400">
                    Q{idx + 1} · {q.subject}
                  </span>
                  <span className="text-xs text-gray-400">{q.year}</span>
                </div>

                <p className={`text-sm font-semibold ${TXT}`}>{q.question}</p>

                <div className="space-y-2">
                  {["a", "b", "c", "d"].map((option) => {

                    const isCorrectOption = q.correct_option.toLowerCase() === option;
                    const isSelected = q.selected === option;

                    let style = "";
                    if (isCorrectOption) style = "bg-green-200 border-green-500";
                    else if (isSelected && !isCorrectOption) style = "bg-red-200 border-red-500";

                    return (
                      <div
                        key={option}
                        className={`w-full text-left border rounded-lg px-3 py-2 ${style}`}
                      >
                        {option.toUpperCase()}. {q[`option_${option}`]}
                        {isSelected && <span className="ml-2 text-xs font-semibold">(Your answer)</span>}
                      </div>
                    );

                  })}
                </div>

                {!q.selected && (
                  <p className="text-xs font-semibold text-amber-500">Skipped</p>
                )}

                <div className="text-sm">
                  <p className="font-bold">Correct Answer: {q.correct_option}</p>
                  <p className="text-gray-500 mt-2">{q.explanation}</p>
                </div>

                <div className="flex justify-between text-xs text-gray-400">
                  <span>{q.chapter}</span>
                  <span>{q.difficulty}</span>
                </div>

              </div>

            ))}
          </div>
        )}

      </div>
    </div>
  );
}