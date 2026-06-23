"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import TestBuilder from "@/components/test/TestBuilder";
import QuickTest from "@/components/test/QuickTest";

// ─── Test Tools Data ──────────────────────────────────────────────────────────
const TEST_TOOLS = [
  {
    href: "/history",
    label: "Test History",
    description: "Review all your previous attempts and scores",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/test/review",
    label: "Review Answers",
    description: "Go through solutions and explanations",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/analytics",
    label: "Performance",
    description: "Analyse accuracy trends and weak areas",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
];

export default function TestPage() {
  const [mode, setMode] = useState("build");
  const [track, setTrack] = useState("jee");

  // Read cookie tracking engine state safely on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const match = document.cookie.match(new RegExp('(^| )prepzii_track=([^;]+)'));
      if (match && match[2]) {
        setTrack(match[2].toLowerCase());
      }
    }
  }, []);

  const isNeet = track === "neet";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* ── Personalized Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Practice
          </p>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
            isNeet 
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
              : "bg-purple-500/5 border-purple-500/20 text-purple-400"
          }`}>
            {isNeet ? "NEET Simulation Center 🩺" : "JEE Test Arena 🚀"}
          </span>
        </div>
        <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">
          Test Center
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {isNeet 
            ? "Build a custom PCB drill or jump directly into a full-length 720 mark mock exam simulation." 
            : "Build a custom test or jump into a randomized PCM shift-run archive parameters."}
        </p>
      </div>

      {/* ── Mode Toggle ── */}
      <div className="flex items-center gap-2 mb-8 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl w-fit">
        <button
          onClick={() => setMode("build")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150
            ${mode === "build"
              ? "bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
        >
          ✦ Custom Test Builder
        </button>
        <button
          onClick={() => setMode("quick")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150
            ${mode === "quick"
              ? "bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
        >
          ⚡ Quick Test Launch
        </button>
      </div>

      {/* ── Test Builder / Quick Test (Passing track to filter builders dynamically) ── */}
      {mode === "build" ? <TestBuilder track={track} /> : <QuickTest track={track} />}

      {/* ── Test Tools ── */}
      <div className="mt-12">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Diagnostic Tools
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEST_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-start gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                {tool.icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-black dark:text-white leading-tight">
                  {tool.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                  {tool.description}
                </p>
              </div>

              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 shrink-0 mt-0.5 transition-colors"
              >
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}