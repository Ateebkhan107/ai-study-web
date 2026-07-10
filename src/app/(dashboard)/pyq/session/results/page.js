"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { updateGoalProgress } from "@/lib/goals";

// ─── Theme CSS Token Configs (kept in sync with the PYQ setup page) ──────────
const BG_SURFACE = "bg-white      dark:bg-gray-900/40 backdrop-blur-md";
const BG_SUNKEN  = "bg-gray-100   dark:bg-gray-950/50";
const BORDER     = "border-gray-200  dark:border-gray-800/60";
const TXT        = "text-gray-900  dark:text-[#e6edf3]";
const TXT_MUTED  = "text-gray-500  dark:text-[#7d8590]";

// Practice mode display labels (kept in sync with the PYQ setup + session pages).
const modeLabels = {
  full: "📄 Full Paper",
  chapter: "📚 Chapter Wise",
  random: "🎲 Random PYQs",
  mistakes: "🔁 Mistake Revision"
};

export default function PYQResultsPage() {

  const router = useRouter();
  const searchParams = useSearchParams();

  const { user } = useUser();

  const goalUpdated = useRef(false);

  const [reviewData, setReviewData] = useState([]);
  const [showReview, setShowReview] = useState(false);


  const exam = searchParams.get("exam") || "JEE";
  const subjectsParam = searchParams.get("subjects") || "";
  
  const mode = searchParams.get("mode") || "full";
  const examType = searchParams.get("exam_type") || "";
  const attempt = searchParams.get("attempt") || "";
  const shift = searchParams.get("shift") || "";

  const total = parseInt(
    searchParams.get("total") || "0",
    10
  );

  const correct = parseInt(
    searchParams.get("correct") || "0",
    10
  );

  const wrong = parseInt(
    searchParams.get("wrong") || "0",
    10
  );

  const skipped = parseInt(
    searchParams.get("skipped") || "0",
    10
  );

  const accuracy = parseInt(
    searchParams.get("accuracy") || "0",
    10
  );

  const subjectLabels = subjectsParam
    ? subjectsParam.split(",")
    : [];


  // =============================
  // LOAD REVIEW DATA
  // =============================

  useEffect(() => {

    if (typeof window === "undefined") return;

    try {

      const stored = sessionStorage.getItem(
        "pyq_session_review"
      );

      if (stored) {

        setReviewData(
          JSON.parse(stored)
        );

      }

    }

    catch (error) {

      console.error(
        "Failed to load review data:",
        error
      );

    }

  }, []);


  // =============================
  // DAILY GOAL + XP UPDATE
  // =============================

  useEffect(() => {

    if (
      !user ||
      total <= 0 ||
      goalUpdated.current
    ) return;


    async function updatePYQGoal() {

      try {

        goalUpdated.current = true;

        await updateGoalProgress(
          user.id,
          "PYQ",
          total
        );

        console.log(
          "PYQ GOAL UPDATED 🚀",
          total
        );

      }

      catch (error) {

        goalUpdated.current = false;

        console.log(
          "PYQ goal error:",
          error
        );

      }

    }

    updatePYQGoal();

  }, [user, total]);


  const resultLabel =
    accuracy >= 80
      ? "Excellent Work 🎯"
      : accuracy >= 50
        ? "Good Effort 👍"
        : "Needs Improvement 📚";


  return (

    <div className={`min-h-full ${TXT}`}>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* HEADER */}

        <div className="text-center mb-8">

          <h1 className="text-3xl font-black tracking-tight">
            Deck Submitted!
          </h1>

          <span className="
            inline-block
            mt-3
            px-4
            py-1.5
            rounded-full
            text-sm
            font-semibold
            bg-amber-500/10
            text-amber-600
            dark:text-amber-400
            border
            border-amber-500/20
          ">
            {resultLabel}
          </span>

        </div>


        {/* SUMMARY */}

        <div className={`rounded-2xl border ${BORDER} ${BG_SURFACE} p-6 mb-6`}>

          <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mb-4 text-center`}>
            Session Summary
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">

            <span className={`px-3 py-1.5 rounded-lg border ${BORDER}`}>
              Subjects: <b>{subjectLabels.join(", ") || "—"}</b>
            </span>

            <span className={`px-3 py-1.5 rounded-lg border ${BORDER}`}>
              Exam: <b>{exam}{examType ? ` ${examType}` : ""}</b>
            </span>

            {(attempt || shift) && (
              <span className={`px-3 py-1.5 rounded-lg border ${BORDER}`}>
                Paper: <b>{[attempt, shift].filter(Boolean).join(" ")}</b>
              </span>
            )}

            <span className={`px-3 py-1.5 rounded-lg border ${BORDER}`}>
              Mode: <b>{modeLabels[mode] || modeLabels.full}</b>
            </span>

            <span className={`px-3 py-1.5 rounded-lg border ${BORDER}`}>
              Questions: <b>{total}</b>
            </span>

          </div>

        </div>


        {/* STATS */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
            <p className="text-3xl font-black text-emerald-500">
              {correct}
            </p>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mt-1">
              Correct
            </p>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 text-center">
            <p className="text-3xl font-black text-rose-500">
              {wrong}
            </p>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-widest mt-1">
              Wrong
            </p>
          </div>

          <div className={`rounded-2xl border ${BORDER} ${BG_SUNKEN} p-5 text-center`}>
            <p className={`text-3xl font-black ${TXT}`}>
              {skipped}
            </p>
            <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest mt-1`}>
              Skipped
            </p>
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 text-center">
            <p className="text-3xl font-black text-sky-500">
              {accuracy}%
            </p>
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mt-1">
              Accuracy
            </p>
          </div>

        </div>


        <div className="flex flex-col gap-3 mb-8">

          <button
            onClick={() => setShowReview(v => !v)}
            className="
              w-full
              py-3
              rounded-xl
              text-sm
              font-bold
              bg-gray-900
              text-white
              dark:bg-white
              dark:text-[#0d1117]
            "
          >
            {showReview ? "Hide Review" : "Review Answers"}
          </button>

          <button
            onClick={() => router.push("/pyq")}
            className={`w-full py-3 rounded-xl text-sm font-semibold border ${BORDER} ${TXT_MUTED}`}
          >
            Back to Setup
          </button>

        </div>


        {/* REVIEW */}

        {showReview && (

          <div className="space-y-4">

            {reviewData.map((q, idx) => {
              
              const qType = q.question_type || "MCQ";

              return (
                <div
                  key={q.id}
                  className={`border ${BORDER} ${BG_SUNKEN} rounded-xl p-4 space-y-3`}
                >

                  <div className="flex justify-between">

                    <span className="text-xs font-bold text-sky-400">
                      Q{idx + 1} · {q.subject}
                    </span>

                    <span className="text-xs text-gray-400">
                      {q.year}
                    </span>

                  </div>

                  <div className="space-y-3">
                    <p className={`text-sm font-semibold ${TXT}`}>
                      {q.question}
                    </p>
                    {q.question_image && (
                      <img 
                        src={q.question_image} 
                        alt="Question visual" 
                        className="rounded-xl max-w-full"
                      />
                    )}
                  </div>

                  {qType === "NUMERICAL" ? (
                    
                    <div className="space-y-2 py-2">
                      <div className={`p-3 rounded-lg border ${BORDER} bg-white dark:bg-gray-900/50`}>
                        <span className="font-bold text-sm">Your Answer:</span>{" "}
                        <span className="text-sm">{q.selected !== null && q.selected !== undefined && q.selected !== "" ? q.selected : "None"}</span>
                      </div>
                      <div className="p-3 rounded-lg border border-green-500 bg-green-500/10 text-green-700 dark:text-green-400">
                        <span className="font-bold text-sm">Correct Answer:</span>{" "}
                        <span className="text-sm">{q.numerical_answer}</span>
                        {(q.numerical_min !== undefined && q.numerical_max !== undefined && q.numerical_min !== null && q.numerical_max !== null) && (
                          <div className="mt-1 text-xs">
                            <span className="font-semibold">Correct Range:</span> {q.numerical_min} - {q.numerical_max}
                          </div>
                        )}
                      </div>
                    </div>

                  ) : (
                    
                    <div className="space-y-2">

                      {["a", "b", "c", "d"].map(option => {

                        const isCorrectOption = qType === "MULTIPLE_CORRECT"
                          ? (Array.isArray(q.correct_options) && q.correct_options.map(o => String(o).toLowerCase()).includes(option))
                          : (String(q.correct_option).toLowerCase() === option);

                        const selectedArr = Array.isArray(q.selected) 
                          ? q.selected.map(s => String(s).toLowerCase()) 
                          : typeof q.selected === "string" 
                            ? q.selected.toLowerCase().split(',') 
                            : [];
                        
                        const isSelected = selectedArr.includes(option);

                        let style = "";

                        if (isCorrectOption)
                          style = "bg-green-200 border-green-500 dark:text-black";
                        else if (isSelected && !isCorrectOption)
                          style = "bg-red-200 border-red-500 dark:text-black";

                        return (

                          <div
                            key={option}
                            className={`border rounded-lg px-3 py-2 ${style}`}
                          >

                            <div className="flex flex-col gap-2 text-sm">
                              <div>
                                {option.toUpperCase()}. {q[`option_${option}`]}
                                {isSelected &&
                                  <span className="ml-2 text-xs font-semibold">
                                    (Your answer)
                                  </span>
                                }
                              </div>
                              {q[`option_${option}_image`] && (
                                <img 
                                  src={q[`option_${option}_image`]} 
                                  alt={`Option ${option.toUpperCase()} visual`} 
                                  className="rounded-xl max-w-full"
                                />
                              )}
                            </div>

                          </div>

                        );

                      })}

                    </div>
                  )}

                  {!q.selected &&
                    <p className="text-xs font-semibold text-amber-500">
                      Skipped
                    </p>
                  }

                  <div className="text-sm">

                    <p className="font-bold">
                      {qType === "MULTIPLE_CORRECT" 
                        ? `Correct Answers: ${Array.isArray(q.correct_options) ? q.correct_options.join(", ").toUpperCase() : ""}`
                        : qType === "NUMERICAL" 
                          ? `Correct Answer: ${q.numerical_answer}` 
                          : `Correct Answer: ${String(q.correct_option).toUpperCase()}`
                      }
                    </p>

                    <p className="text-gray-500 mt-2">
                      {q.explanation}
                    </p>

                  </div>

                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{q.chapter}</span>
                    <span>{q.difficulty}</span>
                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>

  );

}