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
import JEEMainPredictor from "./JEEMainPredictor";
import NEETPredictor from "./NEETPredictor";

const NEET_TOTAL_CANDIDATES = 2205035; // 22,05,035 appeared candidates in NEET UG
const JEE_TOTAL_CANDIDATES = 1415110;  // 14,15,110 appeared candidates in JEE Main

// Track metadata & high-yield baseline data
const TRACK_DEFAULTS = {
  JEE: {
    maxMarks: 300,
    totalCandidates: JEE_TOTAL_CANDIDATES,
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
    totalCandidates: NEET_TOTAL_CANDIDATES,
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

// Calibrated NTA NEET UG Score vs Percentile vs AIR (22,05,035 candidates benchmark)
const NEET_CALIBRATION_TABLE = [
  { score: 720, pct: 100.0, rankMin: 1, rankMax: 1, tier: "AIIMS New Delhi (Top Rank)", tierColor: "text-emerald-700 dark:text-emerald-400 font-bold" },
  { score: 715, pct: 99.997, rankMin: 1, rankMax: 67, tier: "AIIMS New Delhi / Top Central GMCs", tierColor: "text-emerald-700 dark:text-emerald-400 font-bold" },
  { score: 710, pct: 99.991, rankMin: 68, rankMax: 195, tier: "AIIMS New Delhi / Top Central GMCs", tierColor: "text-emerald-700 dark:text-emerald-400 font-bold" },
  { score: 700, pct: 99.980, rankMin: 196, rankMax: 430, tier: "MAMC / VMMC / Top 5 Medical Colleges", tierColor: "text-emerald-700 dark:text-emerald-400 font-bold" },
  { score: 680, pct: 99.882, rankMin: 430, rankMax: 2600, tier: "Top State Govt. Medical Colleges", tierColor: "text-emerald-700 dark:text-emerald-400 font-bold" },
  { score: 655, pct: 99.450, rankMin: 2600, rankMax: 12120, tier: "Govt. Medical College (AIQ 15% Safe)", tierColor: "text-emerald-700 dark:text-emerald-400 font-bold" },
  { score: 630, pct: 98.600, rankMin: 12120, rankMax: 30870, tier: "Govt. Medical College (State 85% GMC)", tierColor: "text-emerald-700 dark:text-emerald-400 font-bold" },
  { score: 600, pct: 97.100, rankMin: 30870, rankMax: 63940, tier: "State GMC / Top Semi-Govt Seats", tierColor: "text-blue-700 dark:text-blue-400 font-bold" },
  { score: 560, pct: 94.200, rankMin: 63940, rankMax: 127890, tier: "State Quota Borderline / BDS Top", tierColor: "text-blue-700 dark:text-blue-400 font-bold" },
  { score: 510, pct: 89.000, rankMin: 127890, rankMax: 242550, tier: "Semi-Govt / Govt BDS / High-cutoff Private", tierColor: "text-amber-800 dark:text-amber-300 font-bold" },
  { score: 450, pct: 80.500, rankMin: 242550, rankMax: 429980, tier: "Private Medical College / Merit Seats", tierColor: "text-amber-800 dark:text-amber-300 font-bold" },
  { score: 390, pct: 70.000, rankMin: 429980, rankMax: 661510, tier: "BAMS / BHMS / Private BDS Seats", tierColor: "text-amber-800 dark:text-amber-300 font-bold" },
  { score: 330, pct: 57.000, rankMin: 661510, rankMax: 948160, tier: "Allied Medical / Deemed Universities", tierColor: "text-slate-800 dark:text-slate-200 font-bold" },
  { score: 260, pct: 40.000, rankMin: 948160, rankMax: 1323020, tier: "Foundation Building Needed", tierColor: "text-slate-950 dark:text-slate-100 font-black" },
  { score: 190, pct: 23.000, rankMin: 1323020, rankMax: 1697870, tier: "Foundation Building Needed", tierColor: "text-slate-950 dark:text-slate-100 font-black" },
  { score: 120, pct: 8.500, rankMin: 1697870, rankMax: 2017600, tier: "Foundation Building Needed", tierColor: "text-slate-950 dark:text-slate-100 font-black" },
  { score: 50, pct: 2.200, rankMin: 2017600, rankMax: 2156500, tier: "Foundation Building Needed", tierColor: "text-slate-950 dark:text-slate-100 font-black" },
  { score: 0, pct: 0.000, rankMin: 2156500, rankMax: NEET_TOTAL_CANDIDATES, tier: "Initial Baseline", tierColor: "text-slate-900 dark:text-slate-200 font-bold" },
];

// Calibrated NTA JEE Main Score vs Percentile vs AIR (14,15,110 candidates benchmark)
const JEE_CALIBRATION_TABLE = [
  { score: 300, pct: 100.0, rankMin: 1, rankMax: 1, tier: "Top 10 AIR / All IITs & NITs Open", tierColor: "text-emerald-700 dark:text-emerald-400 font-bold" },
  { score: 280, pct: 99.95, rankMin: 1, rankMax: 700, tier: "Top NITs (Trichy/Surathkal/Warangal CSE)", tierColor: "text-emerald-700 dark:text-emerald-400 font-bold" },
  { score: 250, pct: 99.75, rankMin: 700, rankMax: 3500, tier: "Top NITs / IIITs (CSE Priority)", tierColor: "text-emerald-700 dark:text-emerald-400 font-bold" },
  { score: 220, pct: 99.30, rankMin: 3500, rankMax: 9800, tier: "Top NITs / IIITs (CSE/ECE Priority)", tierColor: "text-emerald-700 dark:text-emerald-400 font-bold" },
  { score: 190, pct: 98.50, rankMin: 9800, rankMax: 21000, tier: "NITs Core Branches / Top IIITs", tierColor: "text-emerald-700 dark:text-emerald-400 font-bold" },
  { score: 165, pct: 97.20, rankMin: 21000, rankMax: 39000, tier: "NITs Core / State Govt. Top Engineering", tierColor: "text-blue-700 dark:text-blue-400 font-bold" },
  { score: 140, pct: 95.20, rankMin: 39000, rankMax: 67000, tier: "NITs Lower Branches / Newer IIITs", tierColor: "text-blue-700 dark:text-blue-400 font-bold" },
  { score: 120, pct: 93.20, rankMin: 67000, rankMax: 95000, tier: "JEE Advanced Qualifying Cutoff Zone", tierColor: "text-blue-700 dark:text-blue-400 font-bold" },
  { score: 100, pct: 89.50, rankMin: 95000, rankMax: 147000, tier: "State Govt. Engineering Universities", tierColor: "text-amber-800 dark:text-amber-300 font-bold" },
  { score: 80, pct: 83.50, rankMin: 147000, rankMax: 231000, tier: "State Private / Regional Engineering", tierColor: "text-amber-800 dark:text-amber-300 font-bold" },
  { score: 60, pct: 74.00, rankMin: 231000, rankMax: 364000, tier: "Foundation Building Needed", tierColor: "text-slate-950 dark:text-slate-100 font-black" },
  { score: 40, pct: 58.00, rankMin: 364000, rankMax: 588000, tier: "Foundation Building Needed", tierColor: "text-slate-950 dark:text-slate-100 font-black" },
  { score: 20, pct: 35.00, rankMin: 588000, rankMax: 910000, tier: "Foundation Building Needed", tierColor: "text-slate-950 dark:text-slate-100 font-black" },
  { score: 0, pct: 0.00, rankMin: 910000, rankMax: JEE_TOTAL_CANDIDATES, tier: "Initial Baseline", tierColor: "text-slate-900 dark:text-slate-200 font-bold" },
];

function interpolateNTA(table, score, totalCandidates = NEET_TOTAL_CANDIDATES) {
  const s = Math.max(0, Math.min(table[0].score, score));
  for (let i = 0; i < table.length - 1; i++) {
    const high = table[i];
    const low = table[i + 1];
    if (s <= high.score && s >= low.score) {
      const range = high.score - low.score;
      const ratio = range === 0 ? 0 : (s - low.score) / range;
      const pct = (low.pct + ratio * (high.pct - low.pct)).toFixed(2);
      const rawRankMin = Math.round(low.rankMin - ratio * (low.rankMin - high.rankMin));
      const rawRankMax = Math.round(low.rankMax - ratio * (low.rankMax - high.rankMax));
      
      const rankMin = Math.max(1, Math.min(totalCandidates, rawRankMin));
      const rankMax = Math.max(rankMin, Math.min(totalCandidates, rawRankMax));
      
      const tier = ratio > 0.5 ? high.tier : low.tier;
      const tierColor = ratio > 0.5 ? high.tierColor : low.tierColor;
      return { pct, rankMin, rankMax, tier, tierColor };
    }
  }
  const last = table[table.length - 1];
  return {
    pct: "0.00",
    rankMin: Math.min(totalCandidates, last.rankMin),
    rankMax: totalCandidates,
    tier: last.tier,
    tierColor: last.tierColor,
  };
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
  const totalCandidates = isNeet ? NEET_TOTAL_CANDIDATES : JEE_TOTAL_CANDIDATES;

  if (isNeet) {
    if (!hasSample) {
      if (totalQuestions > 0 && typeof accuracy === "number") {
        // Safe conservative baseline from small sample
        const safeAcc = Math.max(0, accuracy - 3);
        const simulatedAttempted = Math.round(Math.min(175, Math.max(75, 75 + (safeAcc / 100) * 85)));
        const correct = Math.round(simulatedAttempted * (safeAcc / 100));
        const incorrect = simulatedAttempted - correct;
        const rawScore = Math.max(0, Math.min(720, (correct * 4) - (incorrect * 1)));
        const { pct, rankMin, rankMax, tier, tierColor } = interpolateNTA(NEET_CALIBRATION_TABLE, rawScore, NEET_TOTAL_CANDIDATES);
        const safeRankMax = Math.min(NEET_TOTAL_CANDIDATES, rankMax);

        return {
          hasData: false,
          predictedScore: rawScore,
          maxScore: 720,
          scoreRange: `${Math.max(0, rawScore - 15)} – ${Math.min(720, rawScore + 15)}`,
          percentile: pct,
          rankEstimate: `AIR ~${rankMin.toLocaleString()} – ${safeRankMax.toLocaleString()}`,
          tierLabel: tier,
          tierColor,
          confidence: "Calibrating",
          confidencePct: Math.min(90, Math.round((totalQuestions / 10) * 100)),
          potentialGain: `+${Math.max(40, 520 - rawScore)} marks`,
          sampleSize: totalQuestions,
          summary: `Calibrating: ${totalQuestions}/10 questions completed (${accuracy}% accuracy). Solve ${10 - totalQuestions} more questions for calibrated percentile.`,
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
        summary: "Complete at least 10 PYQs or 1 mock test to calculate your personalized NTA score, percentile, and AIR (22,05,035 candidates benchmark).",
      };
    }

    // Safe & Accurate NEET Calculation for sample >= 10 questions
    // Safe adjustment: in practice questions, students perform ~3-4% above 3-hour mixed pressure
    const safeAccuracy = Math.max(0, accuracy - 3);
    const simulatedAttempted = Math.round(Math.min(175, Math.max(85, 80 + (safeAccuracy / 100) * 90)));
    const correct = Math.round(simulatedAttempted * (safeAccuracy / 100));
    const incorrect = simulatedAttempted - correct;
    const practiceScore = Math.max(0, Math.min(720, (correct * 4) - (incorrect * 1)));

    // If student has full mock test average, blend with 65% mock test weight
    let finalScore = practiceScore;
    if (typeof averageTestScore === "number" && averageTestScore > 0) {
      const mockScore = Math.round((averageTestScore / 100) * 720);
      finalScore = Math.round(practiceScore * 0.35 + mockScore * 0.65);
    }

    const { pct, rankMin, rankMax, tier, tierColor } = interpolateNTA(NEET_CALIBRATION_TABLE, finalScore, NEET_TOTAL_CANDIDATES);
    const lowRange = Math.max(0, finalScore - 18);
    const highRange = Math.min(720, finalScore + 15);
    const safeRankMax = Math.min(NEET_TOTAL_CANDIDATES, rankMax);
    const rankStr = rankMin === safeRankMax ? `AIR ${rankMin}` : `AIR ${rankMin.toLocaleString()} – ${safeRankMax.toLocaleString()}`;

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
      summary: `Based on ${totalQuestions} practice attempts across NEET with ${accuracy}% accuracy (benchmarked against 22,05,035 candidates).`,
    };
  }

  // JEE Main Calculation
  if (!hasSample) {
    if (totalQuestions > 0 && typeof accuracy === "number") {
      const safeAcc = Math.max(0, accuracy - 3);
      const simulatedAttempted = Math.round(Math.min(72, Math.max(28, 25 + (safeAcc / 100) * 42)));
      const correct = Math.round(simulatedAttempted * (safeAcc / 100));
      const incorrect = simulatedAttempted - correct;
      const rawScore = Math.max(0, Math.min(300, (correct * 4) - (incorrect * 1)));
      const { pct, rankMin, rankMax, tier, tierColor } = interpolateNTA(JEE_CALIBRATION_TABLE, rawScore, JEE_TOTAL_CANDIDATES);
      const safeRankMax = Math.min(JEE_TOTAL_CANDIDATES, rankMax);

      return {
        hasData: false,
        predictedScore: rawScore,
        maxScore: 300,
        scoreRange: `${Math.max(0, rawScore - 10)} – ${Math.min(300, rawScore + 10)}`,
        percentile: pct,
        rankEstimate: `AIR ~${rankMin.toLocaleString()} – ${safeRankMax.toLocaleString()}`,
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
      summary: "Complete at least 10 PYQs or 1 mock test to calculate your personalized JEE percentile and rank forecast (14,15,110 candidates benchmark).",
    };
  }

  // Safe & Accurate JEE Calculation for sample >= 10 questions
  const safeAccuracy = Math.max(0, accuracy - 3);
  const simulatedAttempted = Math.round(Math.min(72, Math.max(30, 28 + (safeAccuracy / 100) * 40)));
  const correct = Math.round(simulatedAttempted * (safeAccuracy / 100));
  const incorrect = simulatedAttempted - correct;
  const practiceScore = Math.max(0, Math.min(300, (correct * 4) - (incorrect * 1)));

  let finalScore = practiceScore;
  if (typeof averageTestScore === "number" && averageTestScore > 0) {
    const mockScore = Math.round((averageTestScore / 100) * 300);
    finalScore = Math.round(practiceScore * 0.35 + mockScore * 0.65);
  }

  const { pct, rankMin, rankMax, tier, tierColor } = interpolateNTA(JEE_CALIBRATION_TABLE, finalScore, JEE_TOTAL_CANDIDATES);
  const lowRange = Math.max(0, finalScore - 10);
  const highRange = Math.min(300, finalScore + 10);
  const safeRankMax = Math.min(JEE_TOTAL_CANDIDATES, rankMax);
  const rankStr = rankMin === safeRankMax ? `AIR ${rankMin}` : `AIR ${rankMin.toLocaleString()} – ${safeRankMax.toLocaleString()}`;

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
    summary: `Based on ${totalQuestions} practice attempts across JEE Main with ${accuracy}% accuracy (benchmarked against 14,15,110 candidates).`,
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
                {isNeet ? "22,05,035 Pool" : "14,15,110 Pool"}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isNeet
                ? "Calibrated for NEET UG benchmarks (22,05,035 appeared candidates pool)"
                : "Calibrated for JEE Main benchmarks (14,15,110 appeared candidates pool)"}
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
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {isNeet ? "Projected NEET Score" : "Projected JEE Score"}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            {pred.predictedScore !== null ? (
              <>
                <span className="font-display text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl tabular-nums">
                  {pred.predictedScore}
                </span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  / {pred.maxScore}
                </span>
              </>
            ) : (
              <span className="font-display text-2xl font-black tracking-tight text-slate-500 dark:text-slate-400">
                — / {pred.maxScore}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span>Range: {pred.scoreRange}</span>
            {pred.predictedScore !== null && (
              <span className="font-bold text-amber-900 dark:text-brand">
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
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {isNeet ? "Estimated Percentile" : "Projected Percentile"}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            {pred.percentile !== "—" ? (
              <>
                <span className="font-display text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl tabular-nums">
                  {pred.percentile}
                </span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  %ile
                </span>
              </>
            ) : (
              <span className="font-display text-2xl font-black tracking-tight text-slate-500 dark:text-slate-400">
                —
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] font-black text-slate-900 dark:text-slate-100 line-clamp-1">
            {pred.rankEstimate}
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">
            All India Rank band estimate
          </p>
        </div>

        {/* Metric 3: Admission Target Tier */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Target College Zone
          </p>
          <div className="mt-2">
            <span className={`text-sm font-black leading-snug line-clamp-2 ${pred.tierColor}`}>
              {pred.tierLabel}
            </span>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            {isNeet
              ? "Based on General category closing ranks"
              : "Based on JoSAA / CSAB cutoff trends"}
          </p>
        </div>

        {/* Metric 4: Potential Score Gain */}
        <div className="rounded-xl border border-emerald-300/80 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              Unlock Potential
            </p>
            <Zap className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-black tracking-tight text-emerald-950 dark:text-emerald-100 sm:text-3xl">
              {pred.potentialGain}
            </span>
          </div>
          <p className="mt-2 text-[11px] font-semibold leading-relaxed text-emerald-900 dark:text-emerald-300">
            Achievable by mastering your bottom 3 weak chapters & eliminating negative marking.
          </p>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-100/70 px-4 py-3 text-xs text-slate-700 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30 dark:text-slate-200 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-600 dark:text-brand shrink-0" />
          <span className="font-medium text-slate-800 dark:text-slate-200">{pred.summary}</span>
        </div>
        <Link
          href="/pyq"
          className="inline-flex shrink-0 items-center gap-1 font-bold text-amber-800 dark:text-brand hover:underline"
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

  const userWeak = stats?.weakChapters?.items || stats?.chapterPerformance?.weakest || [];
  const hasRealWeak = userWeak.length > 0;

  if (!hasRealWeak) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-[var(--card)] p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg">
            Weak-Spot Interceptor
          </h2>
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
            High ROI Fixes
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/20">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
            <Target className="h-5 w-5 text-brand" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Not enough data</h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Practice more questions to identify your specific weak chapters and get AI-driven high ROI fixes.
          </p>
          <Link
            href="/pyq"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-brand-hover"
          >
            <span>Start Practice</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const displayList = userWeak.slice(0, 4).map((c) => {
    const errorRate = Math.round((c.incorrect / c.attempted) * 100) || 0;
    const marksLost = c.incorrect * 5; // 4 missed + 1 negative (approx)
    
    return {
      chapter: c.chapter,
      subject: c.subject || "General",
      accuracy: c.accuracy,
      attempted: c.attempted,
      statusLabel: c.statusLabel || (c.accuracy <= 45 ? "Critical Gap" : "Needs Work"),
      weight: `${c.incorrect} Errors (Cost: ~${marksLost} Marks)`,
    };
  });

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
            Identified from your lowest accuracy chapters in {normTrack}
          </p>
        </div>

        <Link
          href="/pyq"
          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 transition-colors hover:bg-brand hover:text-slate-950 dark:bg-[var(--surface-elevated)] dark:text-slate-200 dark:hover:bg-brand dark:hover:text-slate-950"
        >
          <span>All Chapters</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {displayList.map((item, index) => {
          const pyqHref = `/pyq?mode=chapter&subject=${encodeURIComponent(item.subject)}&chapter=${encodeURIComponent(item.chapter)}`;

          return (
            <div
              key={`${item.chapter}-${index}`}
              className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100/70 dark:border-[var(--border-subtle)] dark:bg-[var(--card)] dark:hover:border-slate-700 dark:hover:bg-[var(--surface-elevated)]/60"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold text-slate-700 bg-slate-200 dark:text-slate-300 dark:bg-slate-800">
                    {item.subject}
                  </span>
                  <span className="rounded-full border border-red-200/80 bg-red-50/80 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                    {item.statusLabel}
                  </span>
                </div>

                <h3 className="text-sm font-bold leading-snug text-slate-900 dark:text-white group-hover:text-brand dark:group-hover:text-brand">
                  {item.chapter}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {item.accuracy !== null ? `${item.accuracy}% accuracy (${item.attempted} Qs)` : "Not enough data"}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-slate-800/80">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  {item.weight}
                </span>
                <Link
                  href={pyqHref}
                  className="flex items-center gap-1 text-[10px] font-bold text-brand hover:underline"
                >
                  <span>Practice targeted PYQs</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AIDailyPlanAndTips({ stats, track = "JEE" }) {
  const normTrack = String(track || "JEE").toUpperCase();
  const isNeet = normTrack === "NEET";

  const userWeak = stats?.weakChapters?.items || stats?.chapterPerformance?.weakest || [];
  const hasRealWeak = userWeak.length > 0;

  if (!hasRealWeak) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-[var(--card)] p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg">
            Daily AI Action Plan
          </h2>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Personalized
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/20">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
            <Zap className="h-5 w-5 text-brand" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Awaiting Data</h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Your personalized daily action plan will appear here once you&apos;ve completed some practice sessions.
          </p>
          <Link
            href="/pyq"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-brand-hover"
          >
            <span>Start Practice</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const focusChapter = userWeak[0]?.chapter;
  const focusSubject = userWeak[0]?.subject;

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
              Daily AI Action Plan
            </h2>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Personalized
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            3 high-impact tasks formulated for today based on your weaknesses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100/70 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30 dark:hover:border-slate-700 dark:hover:bg-[var(--surface-elevated)]/50"
          >
            <div>
              <span className={`mb-3 inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${task.tagColor}`}>
                {task.tag}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {task.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {task.detail}
              </p>
            </div>
            <Link
              href={task.href}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand dark:hover:text-brand"
            >
              <span>Execute Task</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function AIInsightsView({ stats, track = "JEE" }) {
  const normTrack = String(track || "JEE").toUpperCase();

  return (
    <div className="space-y-6 sm:space-y-8 animate-slideUp" style={{ animationDelay: "100ms" }}>
      {/* 1. Score & Rank Prediction Hero */}
      {normTrack === "JEE" ? (
        <JEEMainPredictor stats={stats} />
      ) : (
        <NEETPredictor stats={stats} />
      )}

      {/* 2. Weak-Spot Interceptor */}
      <WeakSpotInterceptor stats={stats} track={normTrack} />



      {/* 5. Daily AI Action Plan */}
      <AIDailyPlanAndTips stats={stats} track={normTrack} />
    </div>
  );
}

// Export legacy individual components for backwards compatibility
export {
  AIInsightsView,
  ScoreForecastHero as SmartPrediction,
  AIDailyPlanAndTips as AIStudyPlanner,
  WeakSpotInterceptor as AIRecommendations,
};
