"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Target, Atom, FlaskConical, Calculator, Dna, ClipboardList, Hospital, Sun } from "lucide-react";
import SubjectVisual from "@/components/SubjectVisual";
import AuthGateModal from "@/components/auth/AuthGateModal";
import posthog from "posthog-js";

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
    tracks: ["jee", "neet"], // Cross-track compatible
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
    tracks: ["jee"], // JEE only
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
    tracks: ["neet"], // NEET only
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
    tracks: ["jee"], // JEE only
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
    tracks: ["neet"], // NEET only
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
  const { user } = useUser();
  const [launching, setLaunching] = useState(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authGateTarget, setAuthGateTarget] = useState("/test/session");
  const [authGateFeature, setAuthGateFeature] = useState(null);

  const activeTrack = track?.toLowerCase() || "jee";

  // 2. Filter options array according to active path criteria
  const filteredOptions = QUICK_OPTIONS.filter((option) =>
    option.tracks.includes(activeTrack)
  );

  const handleLaunch = (option) => {
    const targetSession = `/test/session?${new URLSearchParams({
      subject: option.subject,
      duration: option.duration.toString(),
      count: option.count.toString(),
      difficulty: option.difficulty,
      mode: "quick",
      label: option.label,
    }).toString()}`;

    if (!user) {
      setAuthGateTarget(targetSession);
      setAuthGateFeature(option.label);
      setShowAuthGate(true);
      return;
    }

    if (!isPro && !isDailyWarmup(option)) {
      posthog.capture("pro_upgrade_clicked", {
        source: "quick_test",
        test_label: option.label,
        track: activeTrack,
      });
      router.push("/pro");
      return;
    }
    posthog.capture("quick_test_launched", {
      test_label: option.label,
      subject: option.subject,
      question_count: option.count,
      duration_minutes: option.duration,
      difficulty: option.difficulty,
      track: activeTrack,
    });
    setLaunching(option.label);
    setTimeout(() => {
      router.push(targetSession);
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
            const showSubjectVisual = option.subject && option.subject !== "all";

            return (
              <button
                key={option.label}
                onClick={() => handleLaunch(option)}
                disabled={launching === option.label}
                className={`group relative flex flex-col items-start rounded-2xl border-[1.5px] p-3 text-left transition-all duration-180 cursor-pointer sm:p-5
                  ${locked
                    ? "border-dashed border-[var(--snb-border)] bg-gray-50 dark:bg-[var(--surface-elevated)]/30 opacity-75 hover:opacity-100 hover:border-slate-400"
                    : launching === option.label
                    ? "border-[#CA8A04] bg-[#FEF9C3]/70 text-slate-950 shadow-[2px_2px_0px_rgba(202,138,4,0.35)] scale-98 dark:border-brand dark:bg-brand/20 dark:shadow-[2px_2px_0px_rgba(234,179,8,0.3)]"
                    : "border-[var(--snb-border-interactive)] bg-[var(--card)] shadow-[var(--snb-shadow-interactive)] hover:border-slate-400 hover:-translate-y-0.5 hover:shadow-[var(--snb-shadow-hover)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[var(--snb-shadow-active)] dark:border-[var(--snb-border-interactive)] dark:bg-[var(--surface)] dark:hover:border-slate-400"
                  }`}
              >
                {showSubjectVisual && (
                  <SubjectVisual
                    subject={option.subject}
                    className="pointer-events-none absolute -bottom-5 -right-5 h-24 w-24 text-slate-900 opacity-[0.035] dark:text-white dark:opacity-[0.055]"
                  />
                )}
                {/* Tag */}
                {tag && (
                  <span className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wide
                    ${tag === "PRO"
                      ? "border-amber-300/80 bg-brand text-black shadow-[1px_1px_0px_rgba(30,42,68,0.15)] dark:border-brand"
                      : tag === "Popular"
                      ? "border-amber-400/80 bg-[#FEF9C3] text-amber-900 shadow-[1px_1px_0px_rgba(202,138,4,0.2)] dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-300"
                      : tag === "Hard"
                      ? "border-red-600 bg-red-500 text-white shadow-[1px_1px_0px_rgba(0,0,0,0.15)]"
                      : "border-[var(--snb-border)] bg-slate-100 text-slate-700 shadow-[1px_1px_0px_rgba(0,0,0,0.06)] dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {tag}
                  </span>
                )}

                <span className="mb-2 flex items-center [&>svg]:h-6 [&>svg]:w-6 sm:mb-3 sm:[&>svg]:h-8 sm:[&>svg]:w-8">{option.icon}</span>

                <p className={`mb-1 text-sm font-black leading-tight transition-colors
                  ${launching === option.label
                    ? "text-amber-800 dark:text-brand"
                    : "text-black dark:text-white"
                  }`}
                >
                  {option.label}
                </p>
                <p className={`text-[11px] leading-snug transition-colors sm:text-xs
                  ${launching === option.label
                    ? "text-amber-700/80 dark:text-brand/80"
                    : "text-gray-400"
                  }`}
                >
                  {activeTrack === "neet" ? option.descNeet : option.descJee}
                </p>

                {launching === option.label && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}

                {locked && (
                  <span
                    className="mt-3 rounded-lg border border-[#9A7407]/40 bg-brand px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-black shadow-[1.5px_1.5px_0px_rgba(30,42,68,0.15)] dark:border-brand"
                  >
                    Upgrade to Pro
                  </span>
                )}
              </button>
            );
          })()
        ))}
      </div>

      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        targetUrl={authGateTarget}
        featureName={authGateFeature || "Quick Test"}
        title={authGateFeature ? `Sign in to start ${authGateFeature}` : "Sign in to start test"}
        message="Create your free account to start practicing and track your progress."
      />
    </div>
  );
}
