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
      <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-2 shadow-none dark:border-stone-800/80 dark:bg-[#141414]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-slate-700 dark:text-stone-300 tabular-nums">
            {safeIndex + 1} <span className="text-slate-300 dark:text-stone-600">/</span> {visibleCards.length}
          </span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-stone-800 sm:w-36">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-200"
              style={{ width: `${((safeIndex + 1) / visibleCards.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleBookmark}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              isBookmarked
                ? "bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400"
                : "text-slate-500 hover:bg-slate-100 dark:text-stone-400 dark:hover:bg-stone-800/60"
            }`}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this card"}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this card"}
          >
            {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={shuffleDeck}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-stone-400 dark:hover:bg-stone-800/60"
            aria-label="Shuffle card order"
            title="Shuffle cards"
          >
            <Shuffle className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={resetOrder}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-stone-400 dark:hover:bg-stone-800/60"
            aria-label="Reset original card order"
            title="Reset card order"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <FormulaCardRenderer card={currentCard} />

      <div className="mt-3.5 flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-white/90 p-2 dark:border-stone-800/80 dark:bg-[#141414] sm:flex-row sm:items-center sm:justify-between sm:p-2.5">
        <div className="grid grid-cols-2 gap-2 sm:contents">
          <button
            type="button"
            onClick={() => goToCard(-1)}
            disabled={safeIndex === 0}
            aria-label="Previous card"
            className="inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 sm:px-4 text-xs sm:text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:border-stone-700 dark:hover:bg-stone-900"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={() => goToCard(1)}
            disabled={safeIndex === visibleCards.length - 1}
            aria-label="Next card"
            className="inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 sm:px-4 text-xs sm:text-sm font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-amber-500 sm:order-last"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-1 sm:pt-0">
          <button
            type="button"
            className="inline-flex h-7 sm:h-8 items-center gap-1.5 rounded-md border border-slate-200/60 bg-transparent px-2.5 text-[11px] font-semibold text-slate-400 opacity-60 cursor-not-allowed dark:border-stone-800/80 dark:text-stone-500"
            disabled
            title="Self-assessment (coming soon)"
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Know it</span>
          </button>
          <button
            type="button"
            className="inline-flex h-7 sm:h-8 items-center gap-1.5 rounded-md border border-slate-200/60 bg-transparent px-2.5 text-[11px] font-semibold text-slate-400 opacity-60 cursor-not-allowed dark:border-stone-800/80 dark:text-stone-500"
            disabled
            title="Revision queue (coming soon)"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Revise</span>
          </button>
          <button
            type="button"
            onClick={toggleImportantOnly}
            title={importantOnly ? "Show all cards" : "Filter important cards only"}
            className={`inline-flex h-7 sm:h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold transition-colors ${
              importantOnly
                ? "border border-amber-500/40 bg-amber-500/15 text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300"
                : "border border-slate-200/80 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-stone-800 dark:text-stone-400 dark:hover:border-stone-700 dark:hover:text-stone-200"
            }`}
          >
            <Star className={`h-3 w-3 ${importantOnly ? "fill-amber-500 text-amber-500" : ""}`} />
            <span>Important</span>
          </button>
        </div>
      </div>
    </div>
  );
}
