"use client";

import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, Shuffle, Star } from "lucide-react";
import FormulaCardRenderer from "./FormulaCardRenderer";

function shuffleCards(cards) {
  const next = [...cards];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export default function FormulaCardDeck({ cards }) {
  const [orderedCards, setOrderedCards] = useState(cards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => new Set());
  const [importantOnly, setImportantOnly] = useState(false);

  const visibleCards = useMemo(() => {
    if (!importantOnly) return orderedCards;
    return orderedCards.filter((card) => Number(card.importance || 0) >= 5);
  }, [importantOnly, orderedCards]);

  const safeIndex = Math.min(currentIndex, Math.max(visibleCards.length - 1, 0));
  const currentCard = visibleCards[safeIndex];
  const isBookmarked = currentCard ? bookmarkedIds.has(currentCard.id) : false;

  function goToCard(offset) {
    setCurrentIndex((index) => {
      const nextIndex = index + offset;
      if (nextIndex < 0) return 0;
      if (nextIndex >= visibleCards.length) return visibleCards.length - 1;
      return nextIndex;
    });
  }

  function toggleBookmark() {
    if (!currentCard) return;
    setBookmarkedIds((previous) => {
      const next = new Set(previous);
      if (next.has(currentCard.id)) next.delete(currentCard.id);
      else next.add(currentCard.id);
      return next;
    });
  }

  function shuffleDeck() {
    setOrderedCards((previous) => shuffleCards(previous));
    setCurrentIndex(0);
  }

  function resetOrder() {
    setOrderedCards(cards || []);
    setCurrentIndex(0);
  }

  function toggleImportantOnly() {
    setImportantOnly((value) => !value);
    setCurrentIndex(0);
  }

  if (!currentCard) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-[var(--card)] p-8 text-center dark:border-stone-700 dark:bg-[var(--surface)]">
        <p className="text-sm font-bold text-slate-500 dark:text-stone-400">No cards are available for this chapter yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-950/60 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <div className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white dark:bg-white dark:text-slate-950">
            {safeIndex + 1} / {visibleCards.length}
          </div>
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-stone-800 sm:w-48 sm:flex-none">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${((safeIndex + 1) / visibleCards.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            type="button"
            onClick={toggleBookmark}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-amber-400 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-amber-500"
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark card"}
            title={isBookmarked ? "Remove bookmark" : "Bookmark card"}
          >
            {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={shuffleDeck}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-amber-400 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-amber-500"
            aria-label="Shuffle cards"
            title="Shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={resetOrder}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-amber-400 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-amber-500"
            aria-label="Reset card order"
            title="Reset order"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <FormulaCardRenderer card={currentCard} />

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <button
          type="button"
          onClick={() => goToCard(-1)}
          disabled={safeIndex === 0}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-45 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="col-span-2 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 p-2 dark:border-stone-800 dark:bg-stone-950/50 sm:col-span-1">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400 dark:border-stone-700 dark:text-stone-500"
            disabled
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Know it
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400 dark:border-stone-700 dark:text-stone-500"
            disabled
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Revise
          </button>
          <button
            type="button"
            onClick={toggleImportantOnly}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-black uppercase tracking-[0.12em] transition ${
              importantOnly
                ? "border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
                : "border-slate-200 bg-white text-slate-500 hover:border-amber-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
            }`}
          >
            <Star className="h-3.5 w-3.5" />
            Important only
          </button>
        </div>

        <button
          type="button"
          onClick={() => goToCard(1)}
          disabled={safeIndex === visibleCards.length - 1}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-black text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
