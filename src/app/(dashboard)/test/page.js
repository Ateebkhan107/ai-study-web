"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import TestBuilder from "@/components/test/TestBuilder";
import QuickTest from "@/components/test/QuickTest";
import { useUser } from "@clerk/nextjs";
import PageWrapper from "@/components/PageWrapper";

// ─── Test Tools Data ──────────────────────────────────────────────────────────
const TEST_TOOLS = [
  {
    href: "/test/history",
    label: "Test History",
    description: "Review all your previous attempts and scores",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
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
  const { user } = useUser();
  const [track, setTrack] = useState(null);

  useEffect(() => {
    async function loadTrack() {
      if (!user) return;
      const response = await fetch("/api/profile", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data?.exam === "NEET") {
        setTrack("neet");
      } else {
        setTrack("jee");
      }
    }
    loadTrack();
  }, [user]);

  if (!track) {
    return (
      <PageWrapper title="Test Center" badge="Loading...">
        <div className="space-y-6">
          <div className="h-12 w-48 rounded-xl skeleton-shimmer" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  const isNeet = track === "neet";

  return (
    <PageWrapper
      title="Test Center"
      subtitle={
        isNeet
          ? "Build a custom PCB drill or jump directly into a full-length 720 mark mock exam simulation."
          : "Build a custom test or jump into a randomized PCM shift-run archive parameters."
      }
      badge={isNeet ? "NEET Simulation Center 🩺" : "JEE Test Arena 🚀"}
      badgeVariant={isNeet ? "emerald" : "purple"}
    >
      {/* ── Mode Toggle ── */}
      <section
        className="animate-slideUp"
        style={{ animationDelay: "75ms" }}
      >
        <div className="inline-flex items-center bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-xl p-1 gap-1 shadow-sm">
          <button
            onClick={() => setMode("build")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === "build"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            ✦ Custom Test Builder
          </button>
          <button
            onClick={() => setMode("quick")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === "quick"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            ⚡ Quick Test Launch
          </button>
        </div>
      </section>

      {/* ── Test Builder / Quick Test ── */}
      <section
        className="animate-slideUp"
        style={{ animationDelay: "150ms" }}
      >
        {mode === "build" ? (
          <TestBuilder track={track} />
        ) : (
          <QuickTest track={track} />
        )}
      </section>

      {/* ── Diagnostic Tools ── */}
      <section
        className="animate-slideUp mt-4"
        style={{ animationDelay: "225ms" }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-500 dark:text-indigo-400">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
              Diagnostic Tools
            </h2>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              Track history and analyse performance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEST_TOOLS.map((tool, index) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative overflow-hidden bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)] dark:hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] hover:border-indigo-500/30 animate-slideUp flex items-start gap-4"
              style={{ animationDelay: `${(index * 75) + 300}ms` }}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-violet-500/0 group-hover:from-indigo-500/5 group-hover:via-transparent group-hover:to-violet-500/5 transition-all duration-700 pointer-events-none rounded-2xl" />

              <div className="relative z-10 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                {tool.icon}
              </div>

              <div className="relative z-10 min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                  {tool.label}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">
                  {tool.description}
                </p>
              </div>

              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="relative z-10 w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-1 shrink-0 mt-0.5 transition-all duration-300"
              >
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}
