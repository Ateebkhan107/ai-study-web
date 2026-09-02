"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Compass,
  Scroll,
  Sparkles,
  Swords,
  Target,
  Users,
  X,
} from "lucide-react";

export const TOUR_STEPS = [
  {
    id: "dashboard",
    targetSelector: '[data-tour="tour-dashboard"]',
    fallbackSelector: "header, nav, main",
    title: "Your study command center",
    text: "Your goals, streak, progress and important study actions start here.",
    icon: Compass,
    badge: "Step 1",
  },
  {
    id: "tests",
    targetSelector: '[data-tour="tour-tests"]',
    fallbackSelector: "nav",
    title: "Practice like the real exam",
    text: "Take mock tests or build a custom test whenever you want focused practice.",
    icon: Target,
    badge: "Step 2",
  },
  {
    id: "pyqs",
    targetSelector: '[data-tour="tour-pyqs"]',
    fallbackSelector: "nav",
    title: "Practice what actually gets asked",
    text: "Open previous-year questions and practice them chapter by chapter.",
    icon: Scroll,
    badge: "Step 3",
  },
  {
    id: "revision-cards",
    targetSelector: '[data-tour="tour-revision-cards"]',
    fallbackSelector: "main",
    title: "Revise without opening another PDF",
    text: "Use interactive formula and revision cards for fast chapter-wise revision.",
    icon: BookOpen,
    badge: "Step 4",
  },
  {
    id: "analytics",
    targetSelector: '[data-tour="tour-analytics"]',
    fallbackSelector: "nav",
    title: "Know where you are losing marks",
    text: "Your performance data turns into strengths, weaknesses and useful study insights here.",
    icon: BarChart3,
    badge: "Step 5",
  },
  {
    id: "community",
    targetSelector: '[data-tour="tour-community"]',
    fallbackSelector: "nav",
    title: "Study together",
    text: "Join study groups, chat in realtime and stay connected with other students.",
    icon: Users,
    badge: "Step 6",
  },
  {
    id: "battle-arena",
    targetSelector: '[data-tour="tour-battle"]',
    fallbackSelector: "body",
    title: "Turn practice into competition",
    text: "Challenge another student in realtime question battles and climb the Arena rankings.",
    icon: Swords,
    badge: "Step 7",
  },
];

function getElementRect(selector, fallbackSelector) {
  if (typeof window === "undefined" || !selector) return null;
  let el = document.querySelector(selector);
  if (!el && fallbackSelector) {
    el = document.querySelector(fallbackSelector);
  }
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    bottom: rect.bottom,
    right: rect.right,
  };
}

export function ProductTour({
  initialPhase = "welcome", // "welcome" | "tour" | "final"
  onComplete,
  onDismiss,
}) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(initialPhase);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const cardRef = useRef(null);

  const totalSteps = TOUR_STEPS.length;
  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const StepIcon = currentStep.icon;

  // Window resize observer
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update target rect on step change
  const updateTargetPosition = useCallback(() => {
    if (phase !== "tour") return;

    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    const rect = getElementRect(step.targetSelector, step.fallbackSelector);
    if (rect) {
      setTargetRect(rect);
      // Gentle scroll if off-screen
      const el = document.querySelector(step.targetSelector) || document.querySelector(step.fallbackSelector);
      if (el && typeof el.scrollIntoView === "function") {
        const isOutOfView =
          rect.top < 70 || rect.bottom > window.innerHeight - 70;
        if (isOutOfView) {
          el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
          // Recalculate after scroll
          setTimeout(() => {
            const updated = getElementRect(step.targetSelector, step.fallbackSelector);
            if (updated) setTargetRect(updated);
          }, 300);
        }
      }
    } else {
      // Fallback: center in viewport
      setTargetRect(null);
    }
  }, [currentStepIndex, phase, prefersReducedMotion]);

  const handleStartTour = useCallback(() => {
    setPhase("tour");
    setCurrentStepIndex(0);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setPhase("final");
    }
  }, [currentStepIndex, totalSteps]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(() => {
    if (onDismiss) onDismiss();
  }, [onDismiss]);

  const handleFinishAndNavigate = useCallback((route) => {
    if (onComplete) onComplete();
    if (route) router.push(route);
  }, [onComplete, router]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (phase === "tour") {
      updateTargetPosition();
      const interval = setInterval(updateTargetPosition, 400);
      return () => clearInterval(interval);
    }
  }, [phase, currentStepIndex, updateTargetPosition]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        if (phase === "welcome") {
          handleStartTour();
        } else if (phase === "tour") {
          handleNext();
        }
      } else if (e.key === "ArrowLeft") {
        if (phase === "tour" && currentStepIndex > 0) {
          handleBack();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, currentStepIndex, handleSkip, handleStartTour, handleNext, handleBack]);

  // Calculate Card Coordinates relative to viewport & target
  const getCardStyle = () => {
    const defaultWidth = 340;
    const cardPadding = 16;
    const maxWidth = Math.min(defaultWidth, windowSize.width - cardPadding * 2);

    if (!targetRect || windowSize.width === 0) {
      // Center modal
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: `${maxWidth}px`,
        zIndex: 60,
      };
    }

    const padding = 12;
    const spaceBelow = windowSize.height - targetRect.bottom;
    const placeAbove = spaceBelow < 220 && targetRect.top > 220;

    let top = placeAbove
      ? Math.max(cardPadding, targetRect.top - 200 - padding)
      : Math.min(windowSize.height - 220, targetRect.bottom + padding);

    // Ensure within vertical bounds
    top = Math.max(cardPadding + 60, Math.min(top, windowSize.height - 230));

    // Center horizontally on target but clamp inside window bounds
    const targetCenterX = targetRect.left + targetRect.width / 2;
    let left = targetCenterX - maxWidth / 2;
    left = Math.max(cardPadding, Math.min(left, windowSize.width - maxWidth - cardPadding));

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${maxWidth}px`,
      zIndex: 60,
    };
  };

  const transitionConfig = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.22, ease: [0.16, 1, 0.3, 1] };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* ── 1. SPOTLIGHT OVERLAY ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transitionConfig}
        className="fixed inset-0 z-40 bg-slate-950/65 dark:bg-black/75 backdrop-blur-[2px] pointer-events-auto"
        onClick={(e) => {
          // Clicking backdrop advances or dismisses safely
          e.stopPropagation();
        }}
      />

      {/* Dynamic Cutout Spotlight Box (when target is active) */}
      {phase === "tour" && targetRect && (
        <motion.div
          key="spotlight-box"
          layout={!prefersReducedMotion}
          initial={{
            opacity: 0,
            x: targetRect.left - 6,
            y: targetRect.top - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
          animate={{
            opacity: 1,
            x: targetRect.left - 6,
            y: targetRect.top - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
          transition={transitionConfig}
          className="fixed z-45 pointer-events-none rounded-2xl border-2 border-brand ring-4 ring-brand/20 shadow-[0_0_25px_rgba(234,179,8,0.35)]"
        />
      )}

      {/* ── 2. MODAL & TOOLTIP CARDS ── */}
      <AnimatePresence mode="wait">
        {/* PHASE A: WELCOME SCREEN */}
        {phase === "welcome" && (
          <motion.div
            key="welcome-card"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={transitionConfig}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl dark:border-white/10 dark:bg-[#151515]">
              {/* Subtle top accent bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/40 bg-brand/10 text-brand">
                  <Sparkles className="h-6 w-6 text-brand" />
                </div>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white transition"
                  aria-label="Skip tour"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">
                  PrepZii Tour
                </span>
                <h2 className="mt-1 text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Welcome to PrepZii
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your study space is ready. Let’s show you around in under a minute.
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleStartTour}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md shadow-brand/20 hover:bg-brand-hover active:scale-[0.98] transition"
                >
                  <span>Start Tour</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white transition"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE B: 7-STEP TOUR TOOLTIP */}
        {phase === "tour" && (
          <motion.div
            key={`tour-step-${currentStep.id}`}
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.98, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={transitionConfig}
            style={getCardStyle()}
            className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md dark:border-white/15 dark:bg-[#181818]/95"
          >
            {/* Step header & close */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <StepIcon className="h-4 w-4 text-brand" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-brand">
                  {currentStep.badge}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white transition"
                aria-label="Skip tour"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Step content */}
            <div className="mt-3">
              <h3 className="text-base font-black font-display tracking-tight text-slate-900 dark:text-white">
                {currentStep.title}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentStep.text}
              </p>
            </div>

            {/* Segmented Progress Bar */}
            <div className="mt-4 flex items-center gap-1.5">
              {TOUR_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={step.id}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? "bg-brand ring-2 ring-brand/30"
                        : isPassed
                        ? "bg-amber-400 dark:bg-amber-500"
                        : "bg-slate-200 dark:bg-white/10"
                    }`}
                  />
                );
              })}
            </div>

            {/* Controls Bar */}
            <div className="mt-4 flex items-center justify-between gap-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400">
                {currentStepIndex + 1} of {totalSteps}
              </span>

              <div className="flex items-center gap-1.5">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 transition"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-sm hover:bg-brand-hover active:scale-[0.98] transition"
                >
                  <span>{currentStepIndex === totalSteps - 1 ? "Finish" : "Next"}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE C: FINAL COMPLETION SCREEN */}
        {phase === "final" && (
          <motion.div
            key="final-card"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={transitionConfig}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl dark:border-white/10 dark:bg-[#151515]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-6 w-6 text-emerald-500" />
                </div>
                <button
                  type="button"
                  onClick={() => handleFinishAndNavigate(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white transition"
                  aria-label="Close tour"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                  Tour Complete
                </span>
                <h2 className="mt-1 text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  You’re ready
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  Pick what you want to do first.
                </p>
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleFinishAndNavigate("/test")}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50 p-3 text-left transition hover:border-brand/50 hover:bg-brand/10 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-brand">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">Take a Test</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Chapter tests & full mock exams</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand" />
                </button>

                <button
                  type="button"
                  onClick={() => handleFinishAndNavigate("/pyq")}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50 p-3 text-left transition hover:border-brand/50 hover:bg-brand/10 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-brand">
                      <Scroll className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">Practice PYQs</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Previous-year questions with analytics</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand" />
                </button>

                <button
                  type="button"
                  onClick={() => handleFinishAndNavigate("/formula-cards/physics")}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50 p-3 text-left transition hover:border-brand/50 hover:bg-brand/10 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-brand">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">Start Revising</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Interactive formula and revision decks</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand" />
                </button>
              </div>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => handleFinishAndNavigate(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductTour;
