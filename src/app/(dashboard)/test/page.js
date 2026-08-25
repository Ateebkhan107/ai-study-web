"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import TestBuilder from "@/components/test/TestBuilder";
import QuickTest from "@/components/test/QuickTest";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, BarChart3, ClipboardList, Sparkles, Zap } from "lucide-react";

// ─── Test Tools Data ──────────────────────────────────────────────────────────
const TEST_TOOLS = [
  {
    href: "/test/history",
    label: "Test History",
    description: "Review all your previous attempts and scores",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    href: "/analytics",
    label: "Performance",
    description: "Analyse accuracy trends and weak areas",
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

function getCookieTrack() {
  if (typeof document === "undefined") return "jee";
  const match = document.cookie.match(new RegExp("(^| )prepzii_track=([^;]+)"));
  return match && decodeURIComponent(match[2]).toUpperCase() === "NEET" ? "neet" : "jee";
}

function TestPageShell({ mode, setMode, children }) {
  return (
    <div className="relative min-h-screen w-full min-w-0">
      <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        <section className="min-w-0">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Test Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
              Build a focused practice test or launch a preset exam session.
            </p>
          </div>

          <div className="mt-5 inline-flex max-w-full rounded-xl border border-slate-200/70 bg-[var(--card)]/80 p-1 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/80">
            <button
              type="button"
              onClick={() => setMode("build")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black transition-colors ${
                mode === "build"
                  ? "bg-brand text-black"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              Custom Test
            </button>
            <button
              type="button"
              onClick={() => setMode("quick")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black transition-colors ${
                mode === "quick"
                  ? "bg-brand text-black"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Zap className="h-4 w-4 shrink-0" />
              Quick Test
            </button>
          </div>
        </section>

        <section className="animate-slideUp" style={{ animationDelay: "100ms" }}>
          {children}
        </section>
      </div>
    </div>
  );
}

export default function TestPage() {
  const [mode, setMode] = useState("build");
  const { user } = useUser();
  const [track, setTrack] = useState(() => getCookieTrack());
  const [access, setAccess] = useState(null);
  const [, setAccessLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadTrack() {
      if (!user) return;
      const accessResponse = await fetch("/api/access", { cache: "no-store" });

      if (!accessResponse.ok) {
        if (!cancelled) setAccessLoading(false);
        return;
      }

      const accessData = await accessResponse.json();
      if (cancelled) return;

      if (accessData?.examTrack === "NEET") {
        setTrack("neet");
      } else {
        setTrack("jee");
      }

      setAccess(accessData);
      setAccessLoading(false);
    }
    loadTrack();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <TestPageShell
      mode={mode}
      setMode={setMode}
    >
      {mode === "build" ? (
        <TestBuilder track={track} access={access} />
      ) : (
        <QuickTest track={track} isPro={Boolean(access?.isPro)} />
      )}

      <section className="animate-slideUp mt-5" style={{ animationDelay: "175ms" }}>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand/30 bg-brand/10 text-brand">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Diagnostic Tools
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              Review attempts and performance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TEST_TOOLS.map((tool, index) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-[var(--card)]/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/45 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/80 animate-slideUp"
              style={{ animationDelay: `${(index * 75) + 300}ms` }}
            >
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-black">
                {tool.icon}
              </div>

              <div className="relative z-10 min-w-0 flex-1">
                <p className="text-sm font-black leading-tight text-slate-900 dark:text-white">
                  {tool.label}
                </p>
                <p className="mt-1 text-xs font-semibold leading-snug text-slate-500">
                  {tool.description}
                </p>
              </div>

              <ArrowRight className="relative z-10 mt-0.5 h-4 w-4 shrink-0 text-slate-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand" />
            </Link>
          ))}
        </div>
      </section>
    </TestPageShell>
  );
}
