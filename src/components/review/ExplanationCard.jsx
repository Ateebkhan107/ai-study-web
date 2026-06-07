"use client";

import { useState } from "react";

// ExplanationCard.jsx
// Props:
//   explanation  — string explanation text
//   questionId   — used as key for bookmark/notes state
//   onBookmark   — (questionId) => void  [connect to Supabase later]
//   isBookmarked — boolean
//
// Notes: In production, load/save notes via:
//   SELECT note FROM user_notes WHERE question_id = :id AND user_id = :userId
//   INSERT/UPDATE user_notes SET note = :note WHERE question_id = :id

export default function ExplanationCard({
  explanation,
  questionId,
  onBookmark,
  isBookmarked = false,
}) {
  const [activeTab, setActiveTab] = useState("explanation");
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const handleSaveNote = () => {
    // TODO: Supabase upsert → user_notes table
    // await supabase.from('user_notes').upsert({ question_id: questionId, note, user_id: userId })
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {[
          {
            id: "explanation",
            label: "Explanation",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            ),
          },
          {
            id: "notes",
            label: "My Notes",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
            ),
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}

        {/* Bookmark Button — right-aligned in tab bar */}
        <button
          onClick={() => onBookmark && onBookmark(questionId)}
          className={`ml-auto flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium transition-colors ${
            isBookmarked
              ? "text-amber-500"
              : "text-slate-400 dark:text-slate-500 hover:text-amber-500"
          }`}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this question"}
        >
          <svg
            className="w-4 h-4"
            fill={isBookmarked ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          <span className="hidden sm:inline">{isBookmarked ? "Saved" : "Save"}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {activeTab === "explanation" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                  Solution Explanation
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {explanation}
                </p>
              </div>
            </div>

            {/* Tip strip */}
            <div className="mt-4 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
              <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                <span className="font-semibold">Pro tip:</span> Add this to your
                formula sheet for quick revision before the exam.
              </p>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add personal notes for this question. They&apos;ll be saved to your
              profile.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your notes here… e.g. 'Remember to check friction direction when block moves UP the incline'"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {note.length} / 500 characters
              </span>
              <button
                onClick={handleSaveNote}
                disabled={!note.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {noteSaved ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Saved!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                    Save Note
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}