"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const QUICK_OPTIONS = [
  {
    label: "Full Mixed Test",
    descJee: "PCM subjects · 60 questions · 60 mins",
    descNeet: "PCB subjects · 60 questions · 60 mins",
    icon: "🎯",
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
    icon: "⚛",
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
    icon: "🧪",
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
    icon: "∑",
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
    icon: "🧬",
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
    icon: "📋",
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
    icon: "🏥",
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
    icon: "☀️",
    subject: "all",
    count: 10,
    duration: 10,
    difficulty: "easy",
    tag: "Quick",
    tracks: ["jee", "neet"],
  },
];

// 1. Accept the parent track context (defaults to "jee" for fallback safety)
export default function QuickTest({ track = "jee" }) {
  const router = useRouter();
  const [launching, setLaunching] = useState(null);

  const activeTrack = track?.toLowerCase() || "jee";

  // 2. Filter options array according to active path criteria
  const filteredOptions = QUICK_OPTIONS.filter((option) =>
    option.tracks.includes(activeTrack)
  );

  const handleLaunch = (option) => {
    if (option.isPro) return; // handle PRO gate
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
    <div className="space-y-5">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Jump straight in — questions are picked randomly from your subject pool.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 3. Map across filteredOptions instead of the global array */}
        {filteredOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => handleLaunch(option)}
            disabled={launching === option.label}
            className={`group relative flex flex-col items-start text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer
              ${option.isPro
                ? "border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 opacity-60 cursor-not-allowed"
                : launching === option.label
                ? "border-black dark:border-white bg-black dark:bg-white scale-95"
                : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5 hover:shadow-md"
              }`}
          >
            {/* Tag */}
            {option.tag && (
              <span className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide
                ${option.tag === "PRO"
                  ? "bg-[#1e3a5f] text-white"
                  : option.tag === "Popular"
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : option.tag === "Hard"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {option.tag}
              </span>
            )}

            <span className="text-3xl mb-3">{option.icon}</span>

            <p className={`text-sm font-black mb-1 transition-colors
              ${launching === option.label
                ? "text-white dark:text-black"
                : "text-black dark:text-white"
              }`}
            >
              {option.label}
            </p>
            <p className={`text-xs transition-colors
              ${launching === option.label
                ? "text-white/70 dark:text-black/70"
                : "text-gray-400"
              }`}
            >
              {activeTrack === "neet" ? option.descNeet : option.descJee}
            </p>

            {launching === option.label && (
              <div className="mt-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}

            {option.isPro && (
              <p className="mt-2 text-[10px] text-gray-400 font-medium">Upgrade to PRO to unlock</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}