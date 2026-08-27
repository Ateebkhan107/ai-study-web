"use client";

import {
  AI_PREDICTIONS,
  ADAPTIVE_STEPS,
  DAILY_TASKS,
  AI_RECOMMENDATIONS,
} from "@/constants/analyticsData";
import { Sparkles } from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// SmartPrediction
// ─────────────────────────────────────────────────────────────────
export function SmartPrediction({ track = "jee" }) {
  // Isolate metrics by tracking criteria
  const filteredPredictions = AI_PREDICTIONS.filter((p) => {
    if (track === "jee" && p.label.toLowerCase().includes("neet")) return false;
    if (track === "neet" && p.label.toLowerCase().includes("jee")) return false;
    return true;
  });

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
          Smart Prediction
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-3 h-3 inline-block mr-0.5 -mt-0.5" /> AI
        </span>
      </div>

      <div className="space-y-3">
        {filteredPredictions.map((p) => (
          <div
            key={p.label}
            className="bg-slate-50 dark:bg-[var(--surface-elevated)]/50 rounded-xl p-3.5"
          >
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{p.label}</p>
            <p className="text-xl font-black font-display text-slate-900 dark:text-white mb-2">{p.value}</p>
            {p.pct !== null && (
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${p.pct}%`, background: p.color }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AdaptiveLearning
// ─────────────────────────────────────────────────────────────────
export function AdaptiveLearning({ track = "jee" }) {
  const isNeet = track === "neet";
  const weakSubject = isNeet ? "Genetics" : "Integration";

  // Translate learning path nodes for context compliance
  const filteredSteps = ADAPTIVE_STEPS.map((s) => {
    if (!isNeet) return s;
    let stepName = s.step;
    let detailText = s.detail;

    if (stepName.includes("Integration") || detailText.includes("integral")) {
      stepName = stepName.replace("Integration", "Genetics");
      detailText = "Mendelian cross principles · Easy · 10 Qs";
    }
    if (detailText.includes("IBP method")) {
      detailText = "Linkage & recombination drills · Medium · 15 Qs";
    }
    if (detailText.includes("JEE")) {
      detailText = detailText.replace("JEE", "NEET");
    }
    return { ...s, step: stepName, detail: detailText };
  });

  return (
    <div className="glass-card p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
          Adaptive Learning
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-3 h-3 inline-block mr-0.5 -mt-0.5" /> AI
        </span>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
        You&apos;re weak in <span className="font-bold text-slate-900 dark:text-white">{weakSubject}</span>. Auto-adapted path:
      </p>

      <div className="flex-1 divide-y divide-slate-50 dark:divide-slate-800">
        {filteredSteps.map((s) => (
          <div key={s.step} className="flex items-start gap-3 py-2.5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{ background: s.color }}
            />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{s.step}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 dark:border-[var(--border)] text-sm font-bold text-slate-900 dark:text-white hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all duration-300 cursor-pointer"
        onClick={() => {
          alert("Redirecting to adaptive practice session…");
        }}
      >
        Start Adaptive Session →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AIStudyPlanner
// ─────────────────────────────────────────────────────────────────
export function AIStudyPlanner({ track = "jee" }) {
  const isNeet = track === "neet";

  // Filter daily objectives without row drift
  const filteredTasks = DAILY_TASKS.map((t) => {
    if (!isNeet) return t;
    let taskName = t.task;
    if (taskName.toLowerCase().includes("integration")) {
      taskName = "Revise Genetics linkage charts";
    }
    if (taskName.toLowerCase().includes("physics mini")) {
      taskName = "Biology structural mock test";
    }
    return { ...t, task: taskName };
  });

  return (
    <div className="glass-card p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
          AI Study Planner
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-3 h-3 inline-block mr-0.5 -mt-0.5" /> AI
        </span>
      </div>

      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
        Today&apos;s tasks
      </p>

      <div className="flex-1 divide-y divide-slate-50 dark:divide-slate-800">
        {filteredTasks.map((t) => (
          <div key={t.task} className="flex items-start gap-3 py-2.5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{ background: t.color }}
            />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.task}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="mt-4 w-full py-2.5 rounded-xl bg-brand text-white text-sm font-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 transition-all duration-300 cursor-pointer"
        onClick={() => {
          alert("Generating your full weekly schedule with AI…");
        }}
      >
        Generate Full Schedule →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AIRecommendations
// ─────────────────────────────────────────────────────────────────
const REC_CLASS = {
  danger:  "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
  success: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
  warn:    "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
  info:    "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
};

export function AIRecommendations({ track = "jee" }) {
  // Isolate insight blocks cleanly to their respective tracks
  const filteredRecs = AI_RECOMMENDATIONS.filter((r) => {
    if (track === "jee" && (r.title.toLowerCase().includes("genetics") || r.body.toLowerCase().includes("neet"))) return false;
    if (track === "neet" && (r.title.toLowerCase().includes("integration") || r.body.toLowerCase().includes("jee"))) return false;
    return true;
  });

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
          AI Recommendations
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-3 h-3 inline-block mr-0.5 -mt-0.5" /> AI
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {filteredRecs.map((r) => (
          <div
            key={r.title}
            className="bg-slate-50 dark:bg-[var(--surface-elevated)]/50 rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5"
          >
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              {r.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              {r.body}
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${REC_CLASS[r.type]}`}>
              {r.tag}
            </span>
          </div>
        ))}
      </div>

      <button
        className="w-full py-3 rounded-xl bg-brand text-white text-sm font-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 transition-all duration-300 cursor-pointer"
        onClick={() => {
          alert("Opening AI study plan generator…");
        }}
      >
        Generate Full AI Study Plan →
      </button>
    </div>
  );
}
