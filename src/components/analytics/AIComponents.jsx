"use client";

import Link from "next/link";
import {
  Brain,
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  Clock,
  Flame,
  ChevronRight,
} from "lucide-react";

// Track metadata & high-yield baseline data
const TRACK_DEFAULTS = {
  JEE: {
    maxMarks: 300,
    idealDistribution: [
      { subject: "Physics", idealPct: 33.3, color: "#6366F1" },
      { subject: "Chemistry", idealPct: 33.3, color: "#10B981" },
      { subject: "Mathematics", idealPct: 33.4, color: "#F59E0B" },
    ],
    highYieldChapters: [
      { chapter: "Definite Integration & Calculus", subject: "Mathematics", weight: "20-24 Marks", priority: "Critical Gap" },
      { chapter: "Thermodynamics & Heat", subject: "Physics", weight: "12-16 Marks", priority: "High Yield" },
      { chapter: "Organic Reactions & Mechanisms", subject: "Chemistry", weight: "16-20 Marks", priority: "Critical Gap" },
      { chapter: "Rotational Motion & Dynamics", subject: "Physics", weight: "12-16 Marks", priority: "High Yield" },
    ],
  },
  NEET: {
    maxMarks: 720,
    idealDistribution: [
      { subject: "Biology", idealPct: 50.0, color: "#EC4899" },
      { subject: "Chemistry", idealPct: 25.0, color: "#10B981" },
      { subject: "Physics", idealPct: 25.0, color: "#6366F1" },
    ],
    highYieldChapters: [
      { chapter: "Genetics and Evolution", subject: "Biology", weight: "40-48 Marks (10-12 Qs)", priority: "Top Priority" },
      { chapter: "Human Physiology", subject: "Biology", weight: "48-56 Marks (12-14 Qs)", priority: "High Yield" },
      { chapter: "Chemical Bonding & Molecular Structure", subject: "Chemistry", weight: "16-20 Marks (4-5 Qs)", priority: "Critical Gap" },
      { chapter: "Optics & Ray Optics", subject: "Physics", weight: "16-20 Marks (4-5 Qs)", priority: "High Yield" },
    ],
  },
};

const SUBJECT_COLORS = {
  biology: "#EC4899",
  physics: "#6366F1",
  chemistry: "#10B981",
  mathematics: "#F59E0B",
  maths: "#F59E0B",
  general: "#8B5CF6",
};

// Calibrated NTA NEET UG Score vs Percentile vs AIR (2.4M test-takers benchmark)
const NEET_CALIBRATION_TABLE = [
  { score: 720, pct: 100.0, rankMin: 1, rankMax: 1, tier: "AIIMS New Delhi (Top Rank)", tierColor: "text-emerald-500" },
  { score: 710, pct: 99.997, rankMin: 1, rankMax: 70, tier: "AIIMS New Delhi / Top Central GMCs", tierColor: "text-emerald-500" },
  { score: 700, pct: 99.985, rankMin: 70, rankMax: 350, tier: "MAMC / VMMC / Top 5 Medical Colleges", tierColor: "text-emerald-500" },
  { score: 680, pct: 99.90, rankMin: 350, rankMax: 2200, tier: "Top State Govt. Medical Colleges", tierColor: "text-emerald-500" },
  { score: 655, pct: 99.60, rankMin: 2200, rankMax: 9500, tier: "Govt. Medical College (AIQ 15% Safe)", tierColor: "text-emerald-500" },
  { score: 630, pct: 98.90, rankMin: 9500, rankMax: 26000, tier: "Govt. Medical College (State 85% GMC)", tierColor: "text-emerald-500" },
  { score: 605, pct: 97.60, rankMin: 26000, rankMax: 56000, tier: "State GMC / Top Semi-Govt Seats", tierColor: "text-blue-500" },
  { score: 570, pct: 95.00, rankMin: 56000, rankMax: 115000, tier: "State Quota Borderline / BDS Top", tierColor: "text-blue-500" },
  { score: 520, pct: 90.00, rankMin: 115000, rankMax: 230000, tier: "Semi-Govt / Govt BDS / High-cutoff Private", tierColor: "text-amber-500" },
  { score: 460, pct: 83.00, rankMin: 230000, rankMax: 400000, tier: "Private Medical College / Merit Seats", tierColor: "text-amber-500" },
  { score: 400, pct: 73.00, rankMin: 400000, rankMax: 650000, tier: "BAMS / BHMS / Private BDS Seats", tierColor: "text-amber-500" },
  { score: 340, pct: 60.00, rankMin: 650000, rankMax: 950000, tier: "Allied Medical / Deemed Universities", tierColor: "text-slate-400" },
  { score: 260, pct: 42.00, rankMin: 950000, rankMax: 1400000, tier: "Foundation Building Needed", tierColor: "text-slate-400" },
  { score: 180, pct: 24.00, rankMin: 1400000, rankMax: 1850000, tier: "Foundation Building Needed", tierColor: "text-slate-400" },
  { score: 100, pct: 8.00, rankMin: 1850000, rankMax: 2200000, tier: "Foundation Building Needed", tierColor: "text-slate-400" },
  { score: 0, pct: 0.00, rankMin: 2400000, rankMax: 2400000, tier: "Initial Baseline", tierColor: "text-slate-400" },
];

// Calibrated NTA JEE Main Score vs Percentile vs AIR (1.4M test-takers benchmark)
const JEE_CALIBRATION_TABLE = [
  { score: 300, pct: 100.0, rankMin: 1, rankMax: 1, tier: "Top 10 AIR / All IITs & NITs Open", tierColor: "text-emerald-500" },
  { score: 280, pct: 99.95, rankMin: 1, rankMax: 700, tier: "Top NITs (Trichy/Surathkal/Warangal CSE)", tierColor: "text-emerald-500" },
  { score: 250, pct: 99.75, rankMin: 700, rankMax: 3500, tier: "Top NITs / IIITs (CSE Priority)", tierColor: "text-emerald-500" },
  { score: 220, pct: 99.30, rankMin: 3500, rankMax: 9800, tier: "Top NITs / IIITs (CSE/ECE Priority)", tierColor: "text-emerald-500" },
  { score: 190, pct: 98.50, rankMin: 9800, rankMax: 21000, tier: "NITs Core Branches / Top IIITs", tierColor: "text-emerald-500" },
  { score: 165, pct: 97.20, rankMin: 21000, rankMax: 39000, tier: "NITs Core / State Govt. Top Engineering", tierColor: "text-blue-500" },
  { score: 140, pct: 95.20, rankMin: 39000, rankMax: 67000, tier: "NITs Lower Branches / Newer IIITs", tierColor: "text-blue-500" },
  { score: 120, pct: 93.20, rankMin: 67000, rankMax: 95000, tier: "JEE Advanced Qualifying Cutoff Zone", tierColor: "text-blue-500" },
  { score: 100, pct: 89.50, rankMin: 95000, rankMax: 147000, tier: "State Govt. Engineering Universities", tierColor: "text-amber-500" },
  { score: 80, pct: 83.50, rankMin: 147000, rankMax: 231000, tier: "State Private / Regional Engineering", tierColor: "text-amber-500" },
  { score: 60, pct: 74.00, rankMin: 231000, rankMax: 364000, tier: "Foundation Building Needed", tierColor: "text-slate-400" },
  { score: 40, pct: 58.00, rankMin: 364000, rankMax: 588000, tier: "Foundation Building Needed", tierColor: "text-slate-400" },
  { score: 20, pct: 35.00, rankMin: 588000, rankMax: 910000, tier: "Foundation Building Needed", tierColor: "text-slate-400" },
  { score: 0, pct: 0.00, rankMin: 1400000, rankMax: 1400000, tier: "Initial Baseline", tierColor: "text-slate-400" },
];

function interpolateNTA(table, score) {
  const s = Math.max(0, Math.min(table[0].score, score));
  for (let i = 0; i < table.length - 1; i++) {
    const high = table[i];
    const low = table[i + 1];
    if (s <= high.score && s >= low.score) {
      const range = high.score - low.score;
      const ratio = range === 0 ? 0 : (s - low.score) / range;
      const pct = (low.pct + ratio * (high.pct - low.pct)).toFixed(2);
      const rankMin = Math.round(low.rankMin - ratio * (low.rankMin - high.rankMin));
      const rankMax = Math.round(low.rankMax - ratio * (low.rankMax - high.rankMax));
      const tier = ratio > 0.5 ? high.tier : low.tier;
      const tierColor = ratio > 0.5 ? high.tierColor : low.tierColor;
      return { pct, rankMin, rankMax, tier, tierColor };
    }
  }
  const last = table[table.length - 1];
  return { pct: "0.00", rankMin: last.rankMin, rankMax: last.rankMax, tier: last.tier, tierColor: last.tierColor };
}

function getSubjectColor(subject) {
  return SUBJECT_COLORS[String(subject || "").toLowerCase()] || "#8B5CF6";
}

function calculatePredictions(stats, track) {
  const normTrack = String(track || "").toUpperCase();
  const isNeet = normTrack === "NEET";
  const accuracy = stats?.overview?.overallAccuracy;
  const totalQuestions = stats?.counts?.answeredQuestions || stats?.overview?.questionsPracticed || 0;
  const averageTestScore = stats?.overview?.averageScore; // completed test % score if available
  const hasSample = typeof accuracy === "number" && totalQuestions >= 10;

  if (isNeet) {
    if (!hasSample) {
      if (totalQuestions > 0 && typeof accuracy === "number") {
        // Compute realistic diagnostic baseline from whatever small sample exists
        const simulatedAttempted = Math.round(Math.min(180, Math.max(80, 80 + (accuracy / 100) * 80)));
        const correct = Math.round(simulatedAttempted * (accuracy / 100));
        const incorrect = simulatedAttempted - correct;
        const rawScore = Math.max(0, Math.min(720, (correct * 4) - (incorrect * 1)));
        const { pct, rankMin, rankMax, tier, tierColor } = interpolateNTA(NEET_CALIBRATION_TABLE, rawScore);

        return {
          hasData: false,
          predictedScore: rawScore,
          maxScore: 720,
          scoreRange: `${Math.max(0, rawScore - 25)} – ${Math.min(720, rawScore + 25)}`,
          percentile: pct,
          rankEstimate: `AIR ~${rankMin.toLocaleString()}`,
          tierLabel: tier,
          tierColor,
          confidence: "Calibrating",
          confidencePct: Math.min(90, Math.round((totalQuestions / 10) * 100)),
          potentialGain: `+${Math.max(40, 500 - rawScore)} marks`,
          sampleSize: totalQuestions,
          summary: `Calibrating: ${totalQuestions}/10 questions completed (${accuracy}% accuracy). Solve ${10 - totalQuestions} more questions for high-confidence percentile.`,
        };
      }

      return {
        hasData: false,
        predictedScore: null,
        maxScore: 720,
        scoreRange: "—",
        percentile: "—",
        rankEstimate: "Solve 10 Qs to Unlock",
        tierLabel: "Awaiting Diagnostic Practice",
        tierColor: "text-slate-400 dark:text-slate-500",
        confidence: "Calibrating",
        confidencePct: 0,
        potentialGain: "+120+ marks",
        sampleSize: 0,
        summary: "Complete at least 10 PYQs or 1 mock test to calculate your personalized NTA score, percentile, and AIR.",
      };
    }

    // Dynamic NEET Calculation for sample >= 10 questions
    // In NEET, higher accuracy allows candidates to attempt more questions safely.
    const simulatedAttempted = Math.round(Math.min(180, Math.max(100, 90 + (accuracy / 100) * 85)));
    const correct = Math.round(simulatedAttempted * (accuracy / 100));
    const incorrect = simulatedAttempted - correct;
    const practiceScore = Math.max(0, Math.min(720, (correct * 4) - (incorrect * 1)));

    // If student has full mock test average, blend with 60% mock test weight
    let finalScore = practiceScore;
    if (typeof averageTestScore === "number" && averageTestScore > 0) {
      const mockScore = Math.round((averageTestScore / 100) * 720);
      finalScore = Math.round(practiceScore * 0.4 + mockScore * 0.6);
    }

    const { pct, rankMin, rankMax, tier, tierColor } = interpolateNTA(NEET_CALIBRATION_TABLE, finalScore);
    const lowRange = Math.max(0, finalScore - 20);
    const highRange = Math.min(720, finalScore + 20);
    const rankStr = rankMin === rankMax ? `AIR ${rankMin}` : `AIR ${rankMin.toLocaleString()} – ${rankMax.toLocaleString()}`;

    // Target potential score with 85%+ accuracy
    const targetAttempted = 170;
    const targetAcc = Math.max(85, accuracy + 12);
    const targetCorrect = Math.round(targetAttempted * (targetAcc / 100));
    const targetScore = Math.min(710, (targetCorrect * 4) - (targetAttempted - targetCorrect));
    const potentialGain = `+${Math.max(25, targetScore - finalScore)} marks`;

    return {
      hasData: true,
      predictedScore: finalScore,
      maxScore: 720,
      scoreRange: `${lowRange} – ${highRange}`,
      percentile: pct,
      rankEstimate: rankStr,
      tierLabel: tier,
      tierColor,
      confidence: totalQuestions > 80 ? "High Confidence" : "Moderate Confidence",
      confidencePct: Math.min(100, Math.round((totalQuestions / 100) * 100)),
      potentialGain,
      sampleSize: totalQuestions,
      summary: `Based on ${totalQuestions} practice attempts across NEET with ${accuracy}% accuracy.`,
    };
  }

  // JEE Main Calculation
  if (!hasSample) {
    if (totalQuestions > 0 && typeof accuracy === "number") {
      const simulatedAttempted = Math.round(Math.min(75, Math.max(30, 25 + (accuracy / 100) * 45)));
      const correct = Math.round(simulatedAttempted * (accuracy / 100));
      const incorrect = simulatedAttempted - correct;
      const rawScore = Math.max(0, Math.min(300, (correct * 4) - (incorrect * 1)));
      const { pct, rankMin, rankMax, tier, tierColor } = interpolateNTA(JEE_CALIBRATION_TABLE, rawScore);

      return {
        hasData: false,
        predictedScore: rawScore,
        maxScore: 300,
        scoreRange: `${Math.max(0, rawScore - 12)} – ${Math.min(300, rawScore + 12)}`,
        percentile: pct,
        rankEstimate: `AIR ~${rankMin.toLocaleString()}`,
        tierLabel: tier,
        tierColor,
        confidence: "Calibrating",
        confidencePct: Math.min(90, Math.round((totalQuestions / 10) * 100)),
        potentialGain: `+${Math.max(25, 180 - rawScore)} marks`,
        sampleSize: totalQuestions,
        summary: `Calibrating: ${totalQuestions}/10 questions completed (${accuracy}% accuracy). Solve ${10 - totalQuestions} more questions for calibrated percentile.`,
      };
    }

    return {
      hasData: false,
      predictedScore: null,
      maxScore: 300,
      scoreRange: "—",
      percentile: "—",
      rankEstimate: "Solve 10 Qs to Unlock",
      tierLabel: "Awaiting Diagnostic Practice",
      tierColor: "text-slate-400 dark:text-slate-500",
      confidence: "Calibrating",
      confidencePct: 0,
      potentialGain: "+45+ marks",
      sampleSize: 0,
      summary: "Complete at least 10 PYQs or 1 mock test to calculate your personalized JEE percentile and rank forecast.",
    };
  }

  // Dynamic JEE Calculation for sample >= 10 questions
  const simulatedAttempted = Math.round(Math.min(75, Math.max(35, 30 + (accuracy / 100) * 42)));
  const correct = Math.round(simulatedAttempted * (accuracy / 100));
  const incorrect = simulatedAttempted - correct;
  const practiceScore = Math.max(0, Math.min(300, (correct * 4) - (incorrect * 1)));

  let finalScore = practiceScore;
  if (typeof averageTestScore === "number" && averageTestScore > 0) {
    const mockScore = Math.round((averageTestScore / 100) * 300);
    finalScore = Math.round(practiceScore * 0.4 + mockScore * 0.6);
  }

  const { pct, rankMin, rankMax, tier, tierColor } = interpolateNTA(JEE_CALIBRATION_TABLE, finalScore);
  const lowRange = Math.max(0, finalScore - 12);
  const highRange = Math.min(300, finalScore + 12);
  const rankStr = rankMin === rankMax ? `AIR ${rankMin}` : `AIR ${rankMin.toLocaleString()} – ${rankMax.toLocaleString()}`;

  const targetAttempted = 65;
  const targetAcc = Math.max(82, accuracy + 12);
  const targetCorrect = Math.round(targetAttempted * (targetAcc / 100));
  const targetScore = Math.min(290, (targetCorrect * 4) - (targetAttempted - targetCorrect));
  const potentialGain = `+${Math.max(20, targetScore - finalScore)} marks`;

  return {
    hasData: true,
    predictedScore: finalScore,
    maxScore: 300,
    scoreRange: `${lowRange} – ${highRange}`,
    percentile: pct,
    rankEstimate: rankStr,
    tierLabel: tier,
    tierColor,
    confidence: totalQuestions > 80 ? "High Confidence" : "Moderate Confidence",
    confidencePct: Math.min(100, Math.round((totalQuestions / 100) * 100)),
    potentialGain,
    sampleSize: totalQuestions,
    summary: `Based on ${totalQuestions} practice attempts across JEE Main with ${accuracy}% accuracy.`,
  };
}

function getPacingPersona(stats) {
  const time = stats?.timeAnalytics;
  const avgSec = time?.averageSecondsPerQuestion;
  const accuracy = stats?.overview?.overallAccuracy ?? 70;

  if (!avgSec || time?.status !== "ready") {
    return {
      persona: "Pacing Calibration",
      description: "Take a timed test session to diagnose your speed vs accuracy balance.",
      speedScore: 75,
      tag: "Need Timed Data",
      tagColor: "bg-slate-100 dark:bg-[var(--surface-elevated)] text-slate-700 dark:text-slate-300",
      recommendation: "Target 60-80s per question in Biology/Chemistry and 120-150s in Physics/Maths.",
    };
  }

  if (avgSec < 45 && accuracy < 65) {
    return {
      persona: "Rapid Guesser (High Slip Risk)",
      description: `Averaging ${Math.round(avgSec)}s/question with ${accuracy}% accuracy. Speed is causing avoidable negative marking.`,
      speedScore: 45,
      tag: "Risk: Negative Marking",
      tagColor: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60",
      recommendation: "Slow down by 15-20 seconds per question. Read all 4 options before answering.",
    };
  }

  if (avgSec > 130 && accuracy >= 75) {
    return {
      persona: "Precision First (Time Bottleneck)",
      description: `High accuracy of ${accuracy}%, but taking ${Math.round(avgSec)}s/question. You risk leaving questions unattempted.`,
      speedScore: 68,
      tag: "Speed Bottleneck",
      tagColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60",
      recommendation: "Practice 2-minute timed speed sprints on easy to moderate PYQs to build intuitive speed.",
    };
  }

  if (avgSec >= 50 && avgSec <= 110 && accuracy >= 70) {
    return {
      persona: "Optimal Exam Flow",
      description: `Solid rhythm of ${Math.round(avgSec)}s/question combined with strong ${accuracy}% accuracy.`,
      speedScore: 92,
      tag: "Exam Ready Rhythm",
      tagColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60",
      recommendation: "Maintain this pacing rhythm during full-length 3-hour mock tests.",
    };
  }

  return {
    persona: "Steady Pace",
    description: `Averaging ${Math.round(avgSec)}s per question. Consistent time management.`,
    speedScore: 78,
    tag: "Balanced",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60",
    recommendation: "Focus on eliminating calculation slips in multi-step questions.",
  };
}

// ─────────────────────────────────────────────────────────────────
// 1. AI PREDICTION HERO CARD
// ─────────────────────────────────────────────────────────────────
export function ScoreForecastHero({ stats, track = "JEE" }) {
  const normTrack = String(track || "JEE").toUpperCase();
  const isNeet = normTrack === "NEET";
  const pred = calculatePredictions(stats, normTrack);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-[var(--card)] p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-7">
      {/* Background Subtle Gradient Glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl dark:bg-brand/5" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5" />

      {/* Header Row */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/15 text-brand dark:bg-brand/20">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg">
                AI Score & Rank Forecaster
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-brand">
                <Sparkles className="h-3 w-3" />
                NTA Calibrated
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calibrated for {normTrack} 2025/2026 examination benchmarks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-slate-300">
            <span className={`h-2 w-2 rounded-full ${pred.confidence === "High Confidence" ? "bg-emerald-500" : "bg-amber-500"}`} />
            {pred.confidence} ({pred.sampleSize} Qs)
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="relative mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Projected Score */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {isNeet ? "Projected NEET Score" : "Projected JEE Score"}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            {pred.predictedScore !== null ? (
              <>
                <span className="font-display text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl tabular-nums">
                  {pred.predictedScore}
                </span>
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                  / {pred.maxScore}
                </span>
              </>
            ) : (
              <span className="font-display text-2xl font-black tracking-tight text-slate-400 dark:text-slate-500">
                — / {pred.maxScore}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Range: {pred.scoreRange}</span>
            {pred.predictedScore !== null && (
              <span className="font-bold text-brand">
                {Math.round((pred.predictedScore / pred.maxScore) * 100)}%
              </span>
            )}
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-brand transition-all duration-700"
              style={{
                width: `${pred.predictedScore !== null ? Math.min(100, Math.max(4, (pred.predictedScore / pred.maxScore) * 100)) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Metric 2: Projected Percentile / AIR */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {isNeet ? "Estimated Percentile" : "Projected Percentile"}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            {pred.percentile !== "—" ? (
              <>
                <span className="font-display text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl tabular-nums">
                  {pred.percentile}
                </span>
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                  %ile
                </span>
              </>
            ) : (
              <span className="font-display text-2xl font-black tracking-tight text-slate-400 dark:text-slate-500">
                —
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 line-clamp-1">
            {pred.rankEstimate}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
            All India Rank band estimate
          </p>
        </div>

        {/* Metric 3: Admission Target Tier */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Target College Zone
          </p>
          <div className="mt-2">
            <span className={`text-sm font-black leading-snug line-clamp-2 ${pred.tierColor}`}>
              {pred.tierLabel}
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {isNeet
              ? "Based on General category closing ranks"
              : "Based on JoSAA / CSAB cutoff trends"}
          </p>
        </div>

        {/* Metric 4: Potential Score Gain */}
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Unlock Potential
            </p>
            <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-black tracking-tight text-emerald-900 dark:text-emerald-200 sm:text-3xl">
              {pred.potentialGain}
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-300">
            Achievable by mastering your bottom 3 weak chapters & eliminating negative marking.
          </p>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-slate-200/60 bg-slate-100/50 px-4 py-3 text-xs text-slate-600 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30 dark:text-slate-300 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand shrink-0" />
          <span>{pred.summary}</span>
        </div>
        <Link
          href="/pyq"
          className="inline-flex shrink-0 items-center gap-1 font-bold text-brand hover:underline"
        >
          <span>Practice High-Yield Questions</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 2. WEAK-SPOT INTERCEPTOR & REMEDIATION CENTER
// ─────────────────────────────────────────────────────────────────
export function WeakSpotInterceptor({ stats, track = "JEE" }) {
  const normTrack = String(track || "JEE").toUpperCase();
  const isNeet = normTrack === "NEET";
  const defaults = TRACK_DEFAULTS[normTrack] || TRACK_DEFAULTS.JEE;

  // Real user weak chapters
  const userWeak = stats?.weakChapters?.items || stats?.chapterPerformance?.weakest || [];
  const hasRealWeak = userWeak.length > 0;

  const displayList = hasRealWeak
    ? userWeak.slice(0, 4).map((c) => ({
        chapter: c.chapter,
        subject: c.subject || "General",
        accuracy: c.accuracy,
        attempted: c.attempted,
        statusLabel: c.statusLabel || (c.accuracy <= 45 ? "Critical Gap" : "Needs Work"),
        weight: isNeet ? "High NEET Weightage" : "High JEE Frequency",
        isRealData: true,
      }))
    : defaults.highYieldChapters.map((h) => ({
        chapter: h.chapter,
        subject: h.subject,
        accuracy: null,
        attempted: 0,
        statusLabel: h.priority,
        weight: h.weight,
        isRealData: false,
      }));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-[var(--card)] p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg">
              Weak-Spot Interceptor
            </h2>
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
              High ROI Fixes
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {hasRealWeak
              ? `Identified from your lowest accuracy chapters in ${normTrack}`
              : `Key high-yield chapters that decide ${normTrack} ranking`}
          </p>
        </div>

        <Link
          href="/pyq"
          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 transition-colors hover:bg-brand hover:text-slate-950 dark:bg-[var(--surface-elevated)] dark:text-slate-200 dark:hover:bg-brand dark:hover:text-slate-950"
        >
          <span>All Chapters</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {displayList.map((item, index) => {
          const subjectColor = getSubjectColor(item.subject);
          const pyqHref = `/pyq?mode=chapter&subject=${encodeURIComponent(item.subject)}&chapter=${encodeURIComponent(item.chapter)}`;

          return (
            <div
              key={`${item.chapter}-${index}`}
              className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100/70 dark:border-[var(--border-subtle)] dark:bg-[var(--card)] dark:hover:border-slate-700 dark:hover:bg-[var(--surface-elevated)]/60"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: subjectColor }}
                  >
                    {item.subject}
                  </span>

                  <span className="rounded-full border border-red-200/80 bg-red-50/80 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                    {item.statusLabel}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {item.chapter}
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.weight}
                </p>

                {item.isRealData ? (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{ width: `${Math.max(6, item.accuracy || 0)}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-red-600 dark:text-red-400 tabular-nums">
                      {item.accuracy}% Acc ({item.attempted} Qs)
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    Priority diagnostic topic · 0 Qs completed
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-200/60 dark:border-[var(--border-subtle)]">
                <Link
                  href={pyqHref}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-brand-hover shadow-xs"
                >
                  <span>Practice PYQs</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>

                <Link
                  href="/test"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300/80 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-100 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-slate-200 dark:hover:bg-[var(--border-subtle)] dark:hover:text-white shadow-xs"
                >
                  <span>10-Q Test</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 3. AI ADAPTIVE 4-STEP LEARNING ROADMAP
// ─────────────────────────────────────────────────────────────────
export function AdaptiveLearningJourney({ stats, track = "JEE" }) {
  const normTrack = String(track || "JEE").toUpperCase();
  const isNeet = normTrack === "NEET";

  // Pick top weak chapter or fall back to high-yield
  const userWeak = stats?.weakChapters?.items || stats?.chapterPerformance?.weakest || [];
  const focusChapter = userWeak[0]?.chapter || (isNeet ? "Genetics and Evolution" : "Definite Integration & Calculus");
  const focusSubject = userWeak[0]?.subject || (isNeet ? "Biology" : "Mathematics");

  const steps = [
    {
      step: 1,
      title: "Core NCERT & Formula Mastery",
      detail: `Review high-frequency formulas & memory hooks for ${focusChapter}.`,
      duration: "15 min",
      type: "Concept Review",
      color: "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      status: "In Progress",
    },
    {
      step: 2,
      title: "Foundational Accuracy Drills",
      detail: "10 moderate conceptual questions to lock in formula recall and eliminate silly errors.",
      duration: "20 min · 10 Qs",
      type: "Practice Drill",
      color: "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      status: "Up Next",
    },
    {
      step: 3,
      title: "5-Year PYQ Exam Blitz",
      detail: `Solve official 2020-2024 ${normTrack} previous year questions under exact exam marking.`,
      duration: "30 min · 15 Qs",
      type: "Exam PYQ",
      color: "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      status: "Locked",
    },
    {
      step: 4,
      title: "Timed Speed & Negative Marking Mock",
      detail: "20-minute timed sprint with +4/-1 scoring to test retention under strict time pressure.",
      duration: "20 min · Timed",
      type: "Simulation",
      color: "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      status: "Milestone",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-[var(--card)] p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg">
              AI Adaptive Recovery Plan
            </h2>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Personalized
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Automated 4-stage progression engineered to raise accuracy in{" "}
            <span className="font-bold text-slate-900 dark:text-white">{focusChapter}</span> ({focusSubject}) to 80%+
          </p>
        </div>
      </div>

      <div className="relative mt-5 space-y-3">
        {steps.map((s) => (
          <div
            key={s.step}
            className="flex items-start gap-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition-all dark:border-[var(--border-subtle)] dark:bg-[var(--card)] dark:hover:bg-[var(--surface-elevated)]/50"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand font-display text-xs font-black text-slate-950 shadow-xs">
              {s.step}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {s.title}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  {s.duration}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {s.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link
          href={`/pyq?mode=chapter&subject=${encodeURIComponent(focusSubject)}&chapter=${encodeURIComponent(focusChapter)}`}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand py-2.5 px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-brand-hover shadow-sm"
        >
          <Flame className="h-4 w-4" />
          <span>Launch Adaptive Recovery Session →</span>
        </Link>
        <Link
          href="/test"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300/80 bg-white py-2.5 px-4 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-100 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-slate-200 dark:hover:bg-[var(--border-subtle)]"
        >
          Custom Test Builder
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 4. STRATEGY & BEHAVIORAL DIAGNOSTICS (SPEED & EFFORT BALANCE)
// ─────────────────────────────────────────────────────────────────
export function StrategyAndBalanceDiagnostic({ stats, track = "JEE" }) {
  const normTrack = String(track || "JEE").toUpperCase();
  const isNeet = normTrack === "NEET";
  const defaults = TRACK_DEFAULTS[normTrack] || TRACK_DEFAULTS.JEE;
  const pacing = getPacingPersona(stats);

  // Calculate actual subject distribution
  const subjectDist = stats?.subjectDistribution?.items || [];
  const totalAttempted = subjectDist.reduce((acc, curr) => acc + (curr.attempted || 0), 0);

  const distributionComparison = defaults.idealDistribution.map((ideal) => {
    const actual = subjectDist.find((s) => String(s.subject).toLowerCase() === ideal.subject.toLowerCase());
    const actualPct = actual?.pct ?? (totalAttempted > 0 ? Math.round(((actual?.attempted || 0) / totalAttempted) * 100) : null);
    return {
      subject: ideal.subject,
      idealPct: ideal.idealPct,
      actualPct: actualPct !== null ? actualPct : 0,
      hasData: actualPct !== null && totalAttempted > 0,
      color: ideal.color,
    };
  });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Box 1: Subject Time & Effort Balance */}
      <div className="rounded-2xl border border-slate-200/80 bg-[var(--card)] p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              Subject Effort Balance
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)] text-slate-600 dark:text-slate-400">
              Exam Target vs Your Split
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            {isNeet
              ? "NEET weightage requires 50% Biology (360 marks), 25% Chemistry (180), 25% Physics (180)."
              : "JEE Main marks are distributed equally (33.3% each) across Physics, Chemistry, Maths."}
          </p>

          <div className="space-y-4">
            {distributionComparison.map((item) => (
              <div key={item.subject} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-800 dark:text-slate-200">{item.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] tabular-nums">
                    <span className="text-slate-400 dark:text-slate-500">
                      Target: {Math.round(item.idealPct)}%
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">
                      You: {item.hasData ? `${item.actualPct}%` : "—"}
                    </span>
                  </div>
                </div>

                {/* Progress bar comparing actual vs ideal */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, item.hasData ? item.actualPct : item.idealPct)}%`,
                      backgroundColor: item.color,
                      opacity: item.hasData ? 1 : 0.4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200/60 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30 dark:text-slate-400">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-brand shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isNeet
                ? "Biology offers the highest ROI per hour spent. Ensure 1 in every 2 questions practiced is Biology."
                : "Balanced preparation across all 3 subjects ensures you clear subject-wise cutoffs and maximize total score."}
            </p>
          </div>
        </div>
      </div>

      {/* Box 2: Speed vs Accuracy Persona */}
      <div className="rounded-2xl border border-slate-200/80 bg-[var(--card)] p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              Speed & Pacing Persona
            </h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pacing.tagColor}`}>
              {pacing.tag}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Diagnostic of time spent per question vs accuracy tradeoffs
          </p>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--card)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-slate-950 dark:text-brand">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-950 dark:text-white">
                  {pacing.persona}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {pacing.description}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-500 dark:text-slate-400">Time Efficiency Score</span>
                <span className="font-black text-slate-900 dark:text-white">{pacing.speedScore}/100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${pacing.speedScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              {pacing.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 5. DAILY AI STUDY PLAN & RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────────
export function AIDailyPlanAndTips({ stats, track = "JEE" }) {
  const normTrack = String(track || "JEE").toUpperCase();
  const isNeet = normTrack === "NEET";

  const userWeak = stats?.weakChapters?.items || stats?.chapterPerformance?.weakest || [];
  const focusChapter = userWeak[0]?.chapter || (isNeet ? "Genetics and Evolution" : "Integration & Calculus");
  const focusSubject = userWeak[0]?.subject || (isNeet ? "Biology" : "Mathematics");

  const tasks = [
    {
      id: "task-1",
      title: `Fix Gap: ${focusChapter}`,
      detail: `Solve 15 targeted PYQs in ${focusChapter} (${focusSubject}). Target >75% accuracy.`,
      tag: "Priority Fix",
      tagColor: "bg-red-500/10 text-red-600 dark:text-red-400",
      href: `/pyq?mode=chapter&subject=${encodeURIComponent(focusSubject)}&chapter=${encodeURIComponent(focusChapter)}`,
    },
    {
      id: "task-2",
      title: "Daily 20-Q Speed Sprint",
      detail: isNeet
        ? "Complete a 20-question mixed Chemistry & Physics drill to maintain exam pacing."
        : "Complete a 20-question mixed Physics & Chemistry drill to improve velocity.",
      tag: "Pacing",
      tagColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      href: "/test",
    },
    {
      id: "task-3",
      title: "Mistake Journal Review",
      detail: "Re-attempt questions you missed in your recent tests before taking new mocks.",
      tag: "Retention",
      tagColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      href: "/analytics",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-[var(--card)] p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg">
              Today&apos;s AI High-Impact Tasks
            </h2>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Daily Missions
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            3 high-yield actions prioritized by our AI engine to optimize today&apos;s study session
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tasks.map((task, idx) => (
          <div
            key={task.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100/70 dark:border-[var(--border-subtle)] dark:bg-[var(--card)] dark:hover:border-slate-700 dark:hover:bg-[var(--surface-elevated)]/60"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] font-black text-slate-950">
                  {idx + 1}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.tagColor}`}>
                  {task.tag}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {task.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {task.detail}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-[var(--border-subtle)]">
              <Link
                href={task.href}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
              >
                <span>Start Task</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPOSITE VIEW: AIInsightsView
// ─────────────────────────────────────────────────────────────────
export default function AIInsightsView({ stats, track = "JEE" }) {
  const normTrack = String(track || "JEE").toUpperCase();

  return (
    <div className="space-y-6 sm:space-y-8 animate-slideUp" style={{ animationDelay: "100ms" }}>
      {/* 1. Score & Rank Prediction Hero */}
      <ScoreForecastHero stats={stats} track={normTrack} />

      {/* 2. Weak-Spot Interceptor */}
      <WeakSpotInterceptor stats={stats} track={normTrack} />

      {/* 3. Adaptive 4-Step Learning Roadmap */}
      <AdaptiveLearningJourney stats={stats} track={normTrack} />

      {/* 4. Strategy & Pacing Diagnostics */}
      <StrategyAndBalanceDiagnostic stats={stats} track={normTrack} />

      {/* 5. Daily AI Action Plan */}
      <AIDailyPlanAndTips stats={stats} track={normTrack} />
    </div>
  );
}

// Export legacy individual components for backwards compatibility
export {
  AIInsightsView,
  ScoreForecastHero as SmartPrediction,
  AdaptiveLearningJourney as AdaptiveLearning,
  AIDailyPlanAndTips as AIStudyPlanner,
  WeakSpotInterceptor as AIRecommendations,
};
