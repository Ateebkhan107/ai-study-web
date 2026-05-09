"use client";

import { TREND_YEARS } from "@/lib/pyqData";

const LETTERS = ["A", "B", "C", "D"];

function diffClasses(difficulty) {
  if (difficulty === "easy")
    return "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800";
  if (difficulty === "hard")
    return "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800";
  return "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800";
}

async function callAI(question) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system:
        "You are an expert JEE/NEET tutor. Give a concise 3–4 sentence explanation for why the given answer is correct. Include the key concept, formula if applicable, and one common mistake to avoid. Be direct and educational.",
      messages: [
        {
          role: "user",
          content: `Question: ${question.text}
Correct Answer: Option ${LETTERS[question.correct]}: ${question.options[question.correct]}
Subject: ${question.subject}, Chapter: ${question.chapter}
Explain why this is correct and what concept it tests.`,
        },
      ],
    }),
  });
  const data = await res.json();
  return (
    data.content?.map((b) => b.text || "").join("") || question.explanation
  );
}

export default function QuestionCard({ question, updateQuestion, showExpanded = false }) {
  const q = question;

  const handleToggleExpand = async () => {
    if (q.showAnswer) {
      updateQuestion(q.id, { showAnswer: false });
      return;
    }
    // Show panel immediately, then load AI text
    updateQuestion(q.id, { showAnswer: true });
    if (q.aiText) return; // already loaded
    updateQuestion(q.id, { aiLoading: true });
    try {
      const text = await callAI(q);
      updateQuestion(q.id, { aiText: text, aiLoading: false });
    } catch {
      updateQuestion(q.id, { aiText: q.explanation, aiLoading: false });
    }
  };

  const handleSelectOption = (e, idx) => {
    e.stopPropagation();
    if (q.selected !== null) return; // locked after first pick
    updateQuestion(q.id, { selected: idx, attempted: true });
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    updateQuestion(q.id, { bookmarked: !q.bookmarked });
  };

  const optionClass = (idx) => {
    const base =
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-all duration-100";
    if (q.selected === null) {
      return `${base} bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 cursor-pointer`;
    }
    if (idx === q.correct) {
      return `${base} bg-green-50 dark:bg-green-950/30 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300 cursor-default`;
    }
    if (idx === q.selected) {
      return `${base} bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300 cursor-default`;
    }
    return `${base} bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-default`;
  };

  return (
    <div
      onClick={handleToggleExpand}
      className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
        ${q.showAnswer
          ? "border-black dark:border-white"
          : "border-gray-100 dark:border-gray-800"
        }`}
    >
      {/* ── Meta badges ── */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          {q.year}
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black">
          {q.subject}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${diffClasses(q.difficulty)}`}>
          {q.difficulty}
        </span>
        {q.repeated && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
            🔁 Repeated
          </span>
        )}
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          {q.exam}
        </span>
        {q.attempted && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
            ${q.selected === q.correct
              ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
            }`}
          >
            {q.selected === q.correct ? "✓ Correct" : "✗ Wrong"}
          </span>
        )}
      </div>

      {/* ── Question text ── */}
      <p className="text-sm font-medium text-black dark:text-white leading-relaxed mb-4">
        {q.text}
      </p>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <span className="text-[11px] text-gray-400">
            Chapter: <span className="font-semibold text-gray-600 dark:text-gray-300">{q.chapter}</span>
          </span>
          <span className="text-[11px] text-gray-400">
            Success: <span className="font-semibold text-gray-600 dark:text-gray-300">{q.successRate}%</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs transition-all duration-150
              ${q.bookmarked
                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                : "border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
          >
            ⊕
          </button>
          {/* Expand toggle */}
          <button
            onClick={handleToggleExpand}
            className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs text-gray-400 hover:border-gray-400 transition-all"
          >
            {q.showAnswer ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {q.showAnswer && (
        <div
          className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                className={optionClass(idx)}
                onClick={(e) => handleSelectOption(e, idx)}
                disabled={q.selected !== null}
              >
                <span
                  className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-[10px] font-black
                    ${q.selected === null
                      ? "border-gray-300 dark:border-gray-600 text-gray-500"
                      : idx === q.correct
                      ? "border-green-500 text-green-700 dark:text-green-400"
                      : idx === q.selected
                      ? "border-red-500 text-red-700 dark:text-red-400"
                      : "border-gray-200 dark:border-gray-700 text-gray-400"
                    }`}
                >
                  {LETTERS[idx]}
                </span>
                {opt}
              </button>
            ))}
          </div>

          {/* AI Explanation */}
          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black tracking-widest uppercase">
                ✦ AI Explain
              </span>
            </div>
            {q.aiLoading ? (
              <div className="flex items-center gap-1.5 py-2">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {q.aiText || q.explanation}
              </p>
            )}
          </div>

          {/* Appearance trend */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Exam Appearances (2016–2023)
            </p>
            <div className="flex items-end gap-1 h-8">
              {q.appearances.map((appeared, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm transition-all ${
                    appeared
                      ? "bg-black dark:bg-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                  style={{ height: appeared ? "100%" : "30%" }}
                />
              ))}
            </div>
            <div className="flex gap-1 mt-1">
              {TREND_YEARS.map((yr) => (
                <div key={yr} className="flex-1 text-center text-[9px] text-gray-400">
                  {yr.slice(2)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}