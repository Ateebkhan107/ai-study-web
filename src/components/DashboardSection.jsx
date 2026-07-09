"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Subject → visual identity
const SUBJECT_META = {
  Chemistry:   { emoji: "⚗️",  color: "#10B981", bg: "rgba(16,185,129,0.10)",  border: "rgba(16,185,129,0.2)"  },
  Mathematics: { emoji: "📐", color: "#6366F1", bg: "rgba(99,102,241,0.10)",  border: "rgba(99,102,241,0.2)"  },
  Physics:     { emoji: "⚡", color: "#F59E0B", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.2)"  },
  Biology:     { emoji: "🧬", color: "#EC4899", bg: "rgba(236,72,153,0.10)",  border: "rgba(236,72,153,0.2)"  },
};

function getMeta(subject) {
  return SUBJECT_META[subject] || { emoji: "📖", color: "#6366F1", bg: "rgba(99,102,241,0.10)", border: "rgba(99,102,241,0.2)" };
}

export default function DashboardSection({ config }) {
  const [formulaBooks, setFormulaBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isNeet = config?.badge?.toLowerCase().includes("neet");

  useEffect(() => {
    async function loadBooks() {
      try {
        const res = await fetch("/api/formula-books");
        const data = await res.json();
        setFormulaBooks(data);
      } catch (error) {
        console.error("Formula books loading failed:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, []);

  const filteredFormulas = formulaBooks.filter((book) =>
    isNeet ? book.stream === "NEET" : book.stream === "JEE"
  );

  return (
    <div className="space-y-4">

      {/* ── Section header ────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">
          Formula Handbook
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Quick-access formula sheets
        </p>
      </div>

      {/* ── Loading skeleton ──────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 animate-pulse h-[140px]"
            />
          ))}
        </div>
      )}

      {/* ── Formula grid ──────────────────────────────────────── */}
      {!loading && filteredFormulas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFormulas.map((book) => {
            const meta = getMeta(book.subject);
            return (
              <Link href={`/formula-books/${book.id}`} key={book.id} className="block group">
                <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4 overflow-hidden">

                  {/* Subtle subject-coloured top bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                    style={{ background: meta.color }}
                  />

                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    {/* Subject pill */}
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
                    >
                      {meta.emoji} {book.subject}
                    </span>

                    {/* Tag pill */}
                    {book.tag && (
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2 py-0.5 rounded-full">
                        {book.tag}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <p className="text-sm font-black text-black dark:text-white leading-snug">
                    {book.title}
                  </p>

                  {/* Formula preview box */}
                  {book.formula && (
                    <div
                      className="rounded-xl px-3 py-2.5 mt-auto"
                      style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
                    >
                      <p
                        className="font-mono text-sm font-bold leading-snug"
                        style={{ color: meta.color }}
                      >
                        {book.formula}
                      </p>
                      {book.sub && (
                        <p className="font-mono text-[11px] text-gray-400 mt-0.5">
                          {book.sub}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Arrow hint on hover */}
                  <span className="absolute bottom-4 right-4 text-gray-200 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors text-base select-none">
                    →
                  </span>

                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────── */}
      {!loading && filteredFormulas.length === 0 && (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-sm font-semibold text-gray-400">
            No formula handbooks available for {isNeet ? "NEET" : "JEE"} yet.
          </p>
        </div>
      )}

    </div>
  );
}