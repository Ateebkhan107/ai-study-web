"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";
import { Lightbulb } from "lucide-react";

export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadReview() {
    try {
      const { data, error } = await supabase
        .from("user_answers")
        .select(`
          id,
          selected_option,
          correct_option,
          is_correct,
          questions:question_id(
            id,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            explanation,
            subject,
            chapter
          )
        `)
        .eq("attempt_id", id);
        
      if (error) throw error;
      console.log("FULL REVIEW DATA 👉", data);
      setAnswers(data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (id) {
      loadReview();
    }
  }, [id]);

  if (loading) {
    return (
      <PageWrapper title="Review Answers" subtitle="Test Analysis" badge="REVIEW">
        <div className="p-10 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="h-10 w-10 border-4 border-slate-200/60 dark:border-slate-700/50 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <span className="text-slate-400 dark:text-slate-500 font-bold skeleton-shimmer">Loading review...</span>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Review Answers" subtitle="Test Analysis" badge="REVIEW">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex justify-end mb-8">
          <button
            onClick={() => {
              router.push(`/test/result/${id}`);
            }}
            className="px-5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500/30 transition-all duration-300 shadow-sm"
          >
            ← Back to Result
          </button>
        </div>

        <div className="space-y-6">
          {answers.map((item, index) => {
            const q = item.questions;
            const options = [
              { key: "A", text: q.option_a },
              { key: "B", text: q.option_b },
              { key: "C", text: q.option_c },
              { key: "D", text: q.option_d },
            ];

            const delay = `${index * 0.1}s`;

            return (
              <div
                key={item.id}
                className="glass-card bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm animate-slideUp"
                style={{ animationDelay: delay, animationFillMode: "both" }}
              >
                <div className="flex justify-between items-center mb-6">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Question {index + 1}
                  </p>

                  {q.chapter && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {q.chapter}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                  {q.question_text}
                </h2>

                <div className="space-y-3">
                  {options.map((opt) => {
                    const isCorrect = opt.key === item.correct_option;
                    const selected = opt.key === item.selected_option;

                    return (
                      <div
                        key={opt.key}
                        className={`flex items-center p-4 rounded-xl border transition-all duration-300 ${
                          isCorrect
                            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                            : selected
                            ? "bg-rose-50 dark:bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400"
                            : "border-slate-200/60 dark:border-slate-700/50 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold mr-4 flex-shrink-0 transition-colors ${
                            isCorrect
                              ? "bg-emerald-500 text-white"
                              : selected
                              ? "bg-rose-500 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {opt.key}
                        </div>
                        <span className="font-medium">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:gap-6 gap-3 text-sm border-t border-slate-200/60 dark:border-slate-700/50 pt-5">
                  <p className="text-slate-500 dark:text-slate-400">
                    Your Answer:
                    <span
                      className={
                        item.is_correct
                          ? "text-emerald-600 dark:text-emerald-400 font-bold ml-2"
                          : "text-rose-600 dark:text-rose-400 font-bold ml-2"
                      }
                    >
                      {item.selected_option || "Not Attempted"}
                    </span>
                  </p>

                  <p className="text-slate-500 dark:text-slate-400">
                    Correct Answer:
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-2">
                      {item.correct_option}
                    </span>
                  </p>
                </div>

                {q.explanation && (
                  <div className="mt-5 p-5 rounded-2xl bg-white/50 dark:bg-[#020617]/50 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/50 text-sm">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-indigo-500" /> Explanation
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}