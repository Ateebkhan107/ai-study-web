"use client";

import QuestionCard from "@/components/pyq/QuestionCard";

export default function PYQBookmarks({ questions, updateQuestion }) {
  const bookmarked = questions.filter((q) => q.bookmarked);

  if (bookmarked.length === 0) {
    return (
      <div className="text-center py-24 text-gray-400">
        <p className="text-4xl mb-4">⊕</p>
        <p className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-1">
          No bookmarks yet
        </p>
        <p className="text-sm">
          Click ⊕ on any question card to save it here for quick revision.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">
          {bookmarked.length} Saved Question{bookmarked.length !== 1 ? "s" : ""}
        </p>
        <p className="text-xs text-gray-400">
          Click ⊕ again on a card to remove it
        </p>
      </div>

      <div className="space-y-3">
        {bookmarked.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            updateQuestion={updateQuestion}
          />
        ))}
      </div>
    </div>
  );
}