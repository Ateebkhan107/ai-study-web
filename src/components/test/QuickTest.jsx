"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Atom, FlaskConical, Calculator, Dna, ClipboardList, Hospital, Sun } from "lucide-react";

const QUICK_OPTIONS = [
  {
    label: "Full Mixed Test",
    descJee: "PCM subjects · 60 questions · 60 mins",
    descNeet: "PCB subjects · 60 questions · 60 mins",
    icon: <Target className="w-8 h-8" />,
    subject: "all",
    count: 60,
    duration: 60,
    difficulty: "mixed",
    tag: "Popular",
    tracks: ["jee", "neet"], // 👈 Cross-track compatible
  },
  {
    label: "Physics Blitz",
    descJee: "Physics only · 30 questions · 30 mins",
    descNeet: "Physics only · 30 questions · 30 mins",
    icon: <Atom className="w-8 h-8" />,
    subject: "Physics",
    count: 30,
    duration: 30,
    difficulty: "mixed",
    tag: null,
    tracks: ["jee", "neet"],
  },
  {
    label: "Chemistry Sprint",
    descJee: "Chemistry only · 30 questions · 30 mins",
    descNeet: "Chemistry only · 30 questions · 30 mins",
    icon: <FlaskConical className="w-8 h-8" />,
    subject: "Chemistry",
    count: 30,
    duration: 30,
    difficulty: "mixed",
    tag: null,
    tracks: ["jee", "neet"],
  },
  {
    label: "Maths Challenge",
    descJee: "Maths only · 30 questions · 45 mins",
    icon: <Calculator className="w-8 h-8" />,
    subject: "Maths",
    count: 30,
    duration: 45,
    difficulty: "hard",
    tag: "Hard",
    tracks: ["jee"], // 👈 JEE Only
  },
  {
    label: "Biology Quick",
    descNeet: "Biology only · 30 questions · 25 mins",
    icon: <Dna className="w-8 h-8" />,
    subject: "Biology",
    count: 30,
    duration: 25,
    difficulty: "mixed",
    tag: null,
    tracks: ["neet"], // 👈 NEET Only
  },
  {
    label: "JEE Mock",
    descJee: "JEE pattern · 90 questions · 180 mins",
    icon: <ClipboardList className="w-8 h-8" />,
    subject: "all",
    count: 90,
    duration: 180,
    difficulty: "mixed",
    tag: "PRO",
    isPro: true,
    tracks: ["jee"], // 👈 JEE Only
  },
  {
    label: "NEET Mock",
    descNeet: "NEET pattern · 180 questions · 200 mins",
    icon: <Hospital className="w-8 h-8" />,
    subject: "all",
    count: 180,
    duration: 200,
    difficulty: "mixed",
    tag: "PRO",
    isPro: true,
    tracks: ["neet"], // 👈 NEET Only
  },
  {
    label: "Daily Warmup",
    descJee: "PCM subjects · 10 questions · 10 mins",
    descNeet: "PCB subjects · 10 questions · 10 mins",
    icon: <Sun className="w-8 h-8" />,
    subject: "all",
    count: 10,
    duration: 10,
    difficulty: "easy",
    tag: "Quick",
    tracks: ["jee", "neet"],
  },
];

function isDailyWarmup(option) {
  return option.label === "Daily Warmup";
}

// 1. Accept the parent track context (defaults to "jee" for fallback safety)
export default function QuickTest({ track = "jee", isPro = false }) {
  const router = useRouter();
  const [launching, setLaunching] = useState(null);

  const activeTrack = track?.toLowerCase() || "jee";

  // 2. Filter options array according to active path criteria
  const filteredOptions = QUICK_OPTIONS.filter((option) =>
    option.tracks.includes(activeTrack)
  );

  const handleLaunch = (option) => {
    if (!isPro && !isDailyWarmup(option)) {
      router.push("/pro");
      return;
    }
    setLaunching(option.label);
    setTimeout(() => {
      const params = new URLSearchParams({
        subject: option.subject,
        duration: option.duration.toString(),
        count: option.count.toString(),
        difficulty: option.difficulty,
        mode: "quick",
        label: option.label,
      });
      router.push(`/test/session?${params.toString()}`);
    }, 400);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Jump straight in — questions are picked randomly from your subject pool.
      </p>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {/* 3. Map across filteredOptions instead of the global array */}
        {filteredOptions.map((option) => (
          (() => {
            const locked = !isPro && !isDailyWarmup(option);
            const tag = locked ? "PRO" : option.tag;

            return (
              <button
                key={option.label}
                onClick={() => handleLaunch(option)}
                disabled={launching === option.label}
                className={`group relative flex flex-col items-start rounded-2xl border-2 p-3 text-left transition-all duration-200 cursor-pointer sm:p-5
                  ${locked
                    ? "border-dashed border-gray-200 dark:border-[var(--border)] bg-gray-50 dark:bg-[var(--surface-elevated)]/30 opacity-75 hover:opacity-100 hover:border-indigo-300 dark:hover:border-indigo-500/50"
                    : launching === option.label
                    ? "border-indigo-300 dark:border-indigo-700/60 bg-indigo-50 dark:bg-indigo-950/40 scale-95"
                    : "border-gray-100 dark:border-[var(--border-subtle)] bg-[var(--card)] dark:bg-[var(--surface)] hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5 hover:shadow-md"
                  }`}
              >
                {/* Tag */}
                {tag && (
                  <span className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide
                    ${tag === "PRO"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      : tag === "Popular"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : tag === "Hard"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {tag}
                  </span>
                )}

                <span className="mb-2 flex items-center [&>svg]:h-6 [&>svg]:w-6 sm:mb-3 sm:[&>svg]:h-8 sm:[&>svg]:w-8">{option.icon}</span>

                <p className={`mb-1 text-sm font-black leading-tight transition-colors
                  ${launching === option.label
                    ? "text-indigo-700 dark:text-indigo-300"
                    : "text-black dark:text-white"
                  }`}
                >
                  {option.label}
                </p>
                <p className={`text-[11px] leading-snug transition-colors sm:text-xs
                  ${launching === option.label
                    ? "text-indigo-700/70 dark:text-indigo-300/70"
                    : "text-gray-400"
                  }`}
                >
                  {activeTrack === "neet" ? option.descNeet : option.descJee}
                </p>

                {launching === option.label && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}

                {locked && (
                  <span
                    className="mt-3 rounded-lg bg-amber-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  >
                    Upgrade to Pro
                  </span>
                )}
              </button>
            );
          })()
        ))}
      </div>
    </div>
  );
}
