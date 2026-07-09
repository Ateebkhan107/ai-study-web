"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getQuestions } from "@/lib/questions";
import Logo from "@/components/Logo";
import { createTestSession } from "@/services/testSessions";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

const LETTERS = ["A", "B", "C", "D"];

// --- UI Helper Icons for Result Page ---
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const MinusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);
const TargetIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
  </svg>
);

function TestSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

const [exam, setExam] = useState(null);

  const [sessionId, setSessionId] = useState(null);

  // 1. Extract URL Parameters
  const durationParam = Number(searchParams.get("duration")) || 30; // mins
  const countParam = Number(searchParams.get("count")) || 20;
  const mode = searchParams.get("mode") || "custom";
  const subjectParam = searchParams.get("subjects") || searchParams.get("subject") || "Mixed Subjects";
  const chapterParam = searchParams.get("chapters") || searchParams.get("chapter") || "All Chapters";
  const difficultyParam = searchParams.get("difficulty") || "Mixed";
  
  // 2. State Management
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
  const [timeLeft, setTimeLeft] = useState(durationParam * 60);

  const [attemptId, setAttemptId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
  async function loadExam() {
    if (!user) return;

    const { data } = await supabase
      .from("user_profiles")
      .select("exam")
      .eq("clerk_user_id", user.id)
      .single();

    setExam(data?.exam || "JEE");
  }

  loadExam();
}, [user]);



  // 3. Initialize the Test Pool
  useEffect(() => {
    async function loadQuestions() {
      if (!exam) return;
      try {
        const fetched = await getQuestions({
          exam: exam === "NEET" ? "NEET" : "JEE Main",
          subject: subjectParam,
          chapter: chapterParam,
          difficulty: difficultyParam,
          limit: countParam,
        });

        if (!fetched.length) {
          alert("No questions found.");
          return;
        }

        // Randomize every test
        const shuffled = [...fetched].sort(() => Math.random() - 0.5);

        setQuestions(shuffled);
        setTimeLeft(durationParam * 60);
        
        if (user) {
          const session = await createTestSession({
            userId: user.id,
            exam: exam === "NEET" ? "NEET" : "JEE Main",
            subjects: [subjectParam],
            chapters: [chapterParam],
            difficulty: difficultyParam,
            questions: shuffled,
            duration: durationParam,
          });
          setSessionId(session.id);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load questions.");
      }
    }

    loadQuestions();
  }, [
  subjectParam,
  difficultyParam,
  countParam,
  durationParam,
  user,
  exam
]);

  async function handleSubmit() {
    try {
      let correct = 0;

      questions.forEach(q => {
        if (answers[q.id] === q.correct) {
          correct++;
        }
      });

      const attempted = Object.keys(answers).length;
      const wrong = attempted - correct;

      // JEE MARKING
      const score = (correct * 4) - wrong;
      const totalMarks = questions.length * 4;

      const { data: attempt, error } = await supabase
        .from("test_attempts")
        .insert({
          user_id: user.id,
          session_id: sessionId || crypto.randomUUID(), // Fixed: Uses actual session ID if available
          score: score,
          total_marks: totalMarks,
          correct_answers: correct,
          wrong_answers: wrong,
          attempted,
          total_questions: questions.length,
          duration_minutes: Number(searchParams.get("duration")) || 15,
          time_taken_seconds: (durationParam * 60) - timeLeft
        })
        .select()
        .single();

      if (error) throw error;
      setAttemptId(attempt.id);

      const answerRows = questions.map(q => ({
        attempt_id: attempt.id,
        question_id: q.id,
        selected_option: answers[q.id] !== undefined ? ["A", "B", "C", "D"][answers[q.id]] : null,
        is_correct: answers[q.id] === q.correct
      }));

      const { error: answerError } = await supabase
        .from("user_answers")
        .insert(answerRows);

      if (answerError) throw answerError;

      // ===============================
      // UPDATE XP AFTER TEST SUBMISSION
      // ===============================
      const xpResponse = await fetch("/api/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source: "test",
          correctAnswers: correct,
          totalQuestions: questions.length
        })
      });

      const xpData = await xpResponse.json();
      console.log("TEST XP UPDATED 👉", xpData);

      // FINISH TEST
     router.replace(`/test/result/${attempt.id}`);

clearInterval(timerRef.current);

    } catch (err) {
      console.error("SAVE ERROR 👉", err);
      alert(err.message);
    }
  }
  
  // 4. Timer Logic
  useEffect(() => {
    if (questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [questions.length]);

  // 5. Handlers
  const handleSelect = (qId, optIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  // 6. Formatting & Derived State
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const isTimerDanger = timeLeft < 300; 
  const activeQ = questions[currentIdx];
  
if (!exam) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}
  // ─────────────────────────────────────────────────────────────────
  // Loading State
  // ─────────────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] dark:bg-gray-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-black dark:border-t-white animate-spin mb-4" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Generating Test...</p>
        </div>
      </div>
    );
  }

  

  // ─────────────────────────────────────────────────────────────────
  // Active Test UI
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9] dark:bg-gray-950">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo size={28} />
          <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700" />
          <span className="hidden sm:block text-xs font-bold text-gray-400 uppercase tracking-widest">
            {mode === "quick" ? "Quick Session" : "Custom Test"}
          </span>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black tabular-nums transition-colors ${isTimerDanger ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800" : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"}`}>
          {isTimerDanger && <span className="animate-pulse">⏳</span>}
          {formatTime(timeLeft)}
        </div>
        <button onClick={handleSubmit} className="px-6 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 transition-opacity">
          Submit Test
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 h-fit lg:sticky lg:top-24 order-2 lg:order-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Question Palette</p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isActive = currentIdx === idx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`aspect-square rounded-lg text-sm font-bold flex items-center justify-center transition-all duration-150
                    ${isActive ? "ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-gray-900" : ""}
                    ${isAnswered ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}
                  `}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-800" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700" /> Unvisited
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3 flex flex-col order-1 lg:order-2">
          <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
                {activeQ.subject}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {activeQ.chapter}
              </span>
            </div>
            <p className="text-lg sm:text-xl font-medium text-black dark:text-white leading-relaxed mb-8">
              {activeQ.text}
            </p>
            <div className="space-y-3">
              {activeQ.options.map((opt, idx) => {
                const isSelected = answers[activeQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(activeQ.id, idx)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all duration-150
                      ${isSelected ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-900 dark:text-indigo-200" : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"}`}
                  >
                    <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-black border-2
                      ${isSelected ? "border-indigo-500 bg-indigo-500 text-white" : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"}`}
                    >
                      {LETTERS[idx]}
                    </span>
                    <span className="text-base font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>
            {answers[activeQ.id] !== undefined && (
               <button 
                  onClick={() => {
                    const newAnswers = {...answers};
                    delete newAnswers[activeQ.id];
                    setAnswers(newAnswers);
                  }}
                  className="mt-4 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                >
                 Clear Selection
               </button>
            )}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIdx === questions.length - 1}
              className="px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Save & Next →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function TestSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f9f9f9] dark:bg-gray-950 flex flex-col items-center justify-center">
         <div className="w-8 h-8 rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-black dark:border-t-white animate-spin" />
      </div>
    }>
      <TestSessionContent />
    </Suspense>
  );
}