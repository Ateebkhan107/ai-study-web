"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPYQ, savePYQAttempt } from "@/lib/pyq";

// ─── Theme CSS Token Configs (kept in sync with the PYQ setup page) ──────────
const BG_SUNKEN  = "bg-gray-100   dark:bg-gray-950/50";
const BORDER     = "border-gray-200  dark:border-gray-800/60";
const TXT        = "text-gray-900  dark:text-[#e6edf3]";
const TXT_MUTED  = "text-gray-500  dark:text-[#7d8590]";
const SURFACE_HV = "hover:bg-gray-100 dark:hover:bg-gray-950/40";

export default function PYQSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // answers[q.id] = "a" | "b" | "c" | "d"
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const exam = searchParams.get("exam") || "JEE";
  const subjectsParam = searchParams.get("subjects") || "";
  const yearsParam = searchParams.get("years") || "";
  const difficulty = searchParams.get("difficulty") || "Mixed";
  const count = parseInt(searchParams.get("count") || "20", 10);

  const subjectLabels = subjectsParam ? subjectsParam.split(",") : [];
  const years = yearsParam ? yearsParam.split(",").map(Number) : [];

  useEffect(() => {

    async function loadPYQ() {

      setLoading(true);
      setLoadError("");

      try {

        const results = await Promise.all(
          subjectLabels.map(label => getPYQ(exam, label))
        );

        let combined = results.flat();

        const seen = new Set();
        combined = combined.filter(q => {
          if (seen.has(q.id)) return false;
          seen.add(q.id);
          return true;
        });

        if (years.length > 0) {
          combined = combined.filter(q => years.includes(q.year));
        }

        if (difficulty !== "Mixed") {
          combined = combined.filter(q => q.difficulty === difficulty);
        }

        combined = combined.slice(0, count);

        setQuestions(combined);
        setCurrentIndex(0);
        setAnswers({});

      }
      catch (error) {

        console.error("Failed to load PYQ session:", error);
        setLoadError("Failed to load questions. Please try again.");

      }
      finally {

        setLoading(false);

      }

    }

    if (subjectLabels.length > 0) {
      loadPYQ();
    } else {
      setLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectsParam, yearsParam, difficulty, count, exam]);

  const currentQuestion = questions[currentIndex];
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;

  function handleSelectOption(option) {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  }

  function handleNext() {
    setCurrentIndex(i => Math.min(i + 1, questions.length - 1));
  }

  function handleBack() {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }

  async function handleFinishDeck() {

    if (questions.length === 0 || finishing) return;

    setFinishing(true);

    const answeredQuestions = questions.filter(q => answers[q.id]);

    // Save every answered attempt; don't let one failure block the others
    await Promise.allSettled(
      answeredQuestions.map(q => {

        const option = answers[q.id];
        const isCorrect = q.correct_option.toLowerCase() === option;

        return savePYQAttempt({
          question_id: q.id,
          selected_option: option.toUpperCase(),
          is_correct: isCorrect,
          chapter: q.chapter,
          subject: q.subject,
          exam: q.exam
        });

      })
    );

    let correct = 0;
    let wrong = 0;

    const reviewData = questions.map(q => {

      const selected = answers[q.id];
      const isAnswered = !!selected;
      const isCorrect = isAnswered && q.correct_option.toLowerCase() === selected;

      if (isAnswered && isCorrect) correct += 1;
      if (isAnswered && !isCorrect) wrong += 1;

      return {
        id: q.id,
        question: q.question,
        subject: q.subject,
        chapter: q.chapter,
        difficulty: q.difficulty,
        year: q.year,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        explanation: q.explanation,
        selected: selected || null
      };

    });

    const skipped = questions.length - answeredQuestions.length;
    const accuracy = questions.length > 0
      ? Math.round((correct / questions.length) * 100)
      : 0;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("pyq_session_review", JSON.stringify(reviewData));
    }

    const resultParams = new URLSearchParams();
    resultParams.set("exam", exam);
    resultParams.set("subjects", subjectLabels.join(","));
    resultParams.set("difficulty", difficulty);
    resultParams.set("total", String(questions.length));
    resultParams.set("correct", String(correct));
    resultParams.set("wrong", String(wrong));
    resultParams.set("skipped", String(skipped));
    resultParams.set("accuracy", String(accuracy));

    router.push(`/pyq/session/results?${resultParams.toString()}`);

  }

  return (
    <div className={`min-h-full ${TXT}`}>
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-6">

          <button
            onClick={() => router.push("/pyq")}
            className={`text-sm font-semibold ${TXT_MUTED} hover:text-sky-400 cursor-pointer`}
          >
            ← Back to setup
          </button>

          <button
            onClick={handleFinishDeck}
            disabled={loading || questions.length === 0 || finishing}
            className="px-5 py-2 rounded-lg text-sm font-bold bg-gray-900 text-white dark:bg-white dark:text-[#0d1117] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {finishing ? "Finishing..." : "Finish Deck"}
          </button>

        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight">Focused Deck</h1>
          <p className={`text-sm ${TXT_MUTED} mt-1`}>
            {subjectLabels.join(", ") || "No subjects selected"} · {exam}
            {years.length > 0 ? ` · ${years.join(", ")}` : ""} · {difficulty}
          </p>
        </div>

        {loading && (
          <p className={`text-sm ${TXT_MUTED}`}>Loading PYQs...</p>
        )}

        {!loading && loadError && (
          <p className="text-sm text-red-500">{loadError}</p>
        )}

        {!loading && !loadError && questions.length === 0 && (
          <p className={`text-sm ${TXT_MUTED}`}>No PYQs Found</p>
        )}

        {!loading && !loadError && currentQuestion && (
          <div className="space-y-4">

            <p className={`text-xs font-semibold ${TXT_MUTED} uppercase tracking-widest`}>
              Question {currentIndex + 1} of {questions.length}
            </p>

            <div
              key={currentQuestion.id}
              className={`border ${BORDER} ${BG_SUNKEN} rounded-xl p-4 space-y-3`}
            >

              <div className="flex justify-between">
                <span className="text-xs font-bold text-sky-400">{currentQuestion.subject}</span>
                <span className="text-xs text-gray-400">{currentQuestion.year}</span>
              </div>

              <p className={`text-sm font-semibold ${TXT}`}>{currentQuestion.question}</p>

              <div className="space-y-2">
                {["a", "b", "c", "d"].map((option) => {

                  const isSelected = selectedOption === option;

                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectOption(option)}
                      className={`
                        w-full text-left border rounded-lg px-3 py-2 cursor-pointer
                        ${isSelected ? "border-sky-500 bg-sky-500/5" : SURFACE_HV}
                      `}
                    >
                      {option.toUpperCase()}. {currentQuestion[`option_${option}`]}
                    </button>
                  );

                })}
              </div>

              <div className="flex justify-between text-xs text-gray-400">
                <span>{currentQuestion.chapter}</span>
                <span>{currentQuestion.difficulty}</span>
              </div>

            </div>

            <div className="flex items-center justify-between pt-2">

              <button
                onClick={handleBack}
                disabled={currentIndex === 0}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${BORDER} ${TXT_MUTED} disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
              >
                ← Back
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-gray-900 text-white dark:bg-white dark:text-[#0d1117] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next →
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}