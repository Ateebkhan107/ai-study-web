"use client";

import { useState } from "react";
import TestBuilder from "@/components/test/TestBuilder";
import QuickTest from "@/components/test/QuickTest";

export default function TestPage() {
  const [mode, setMode] = useState("build");

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Practice
        </p>
        <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">
          Test Center
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Build a custom test or jump into a random one.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl w-fit">
        <button
          onClick={() => setMode("build")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150
            ${mode === "build"
              ? "bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
        >
          ✦ Custom Test
        </button>
        <button
          onClick={() => setMode("quick")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150
            ${mode === "quick"
              ? "bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
        >
          ⚡ Quick Test
        </button>
      </div>

      {mode === "build" ? <TestBuilder /> : <QuickTest />}
    </div>
  );
}