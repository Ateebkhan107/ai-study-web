"use client";

import { useSyncExternalStore } from "react";

function getProgressKey(chapterId) {
  return `prepzii:formula-cards:reviewed:${chapterId}`;
}

export function markFormulaCardReviewed(chapterId, cardId) {
  if (typeof window === "undefined" || !chapterId || !cardId) return;

  try {
    const key = getProgressKey(chapterId);
    const reviewed = new Set(JSON.parse(window.localStorage.getItem(key) || "[]"));
    reviewed.add(cardId);
    window.localStorage.setItem(key, JSON.stringify([...reviewed]));
    window.dispatchEvent(new Event("formula-card-progress"));
  } catch {
    // Progress is a convenience layer; card navigation should never fail because of it.
  }
}

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("formula-card-progress", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("formula-card-progress", callback);
  };
}

function getReviewedSnapshot(chapterId) {
  if (typeof window === "undefined") return "0";

  try {
    const reviewed = JSON.parse(window.localStorage.getItem(getProgressKey(chapterId)) || "[]");
    return String(Array.isArray(reviewed) ? reviewed.length : 0);
  } catch {
    return "0";
  }
}

export default function FormulaChapterProgress({ chapterId, cardCount }) {
  const reviewedSnapshot = useSyncExternalStore(
    subscribe,
    () => getReviewedSnapshot(chapterId),
    () => "0"
  );
  const reviewedCount = Math.min(Number(reviewedSnapshot) || 0, cardCount || 0);
  const progressPercent = cardCount > 0 ? Math.round((reviewedCount / cardCount) * 100) : 0;
  const isComplete = cardCount > 0 && reviewedCount === cardCount;

  return (
    <div className="mt-2.5 space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500 dark:text-stone-400">
        <span className="tabular-nums">
          {cardCount} {cardCount === 1 ? "card" : "cards"}
        </span>
        <span className={`tabular-nums ${isComplete ? "font-bold text-amber-700 dark:text-amber-400" : ""}`}>
          {reviewedCount}/{cardCount} reviewed
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-stone-800">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${
            isComplete
              ? "bg-emerald-500 dark:bg-emerald-400"
              : "bg-amber-500 dark:bg-amber-400"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
