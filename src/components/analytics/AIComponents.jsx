"use client";

import {
  AI_PREDICTIONS,
  ADAPTIVE_STEPS,
  DAILY_TASKS,
  AI_RECOMMENDATIONS,
} from "@/lib/analyticsData";

// ─────────────────────────────────────────────────────────────────
// SmartPrediction
// ─────────────────────────────────────────────────────────────────
export function SmartPrediction() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">
          Smart Prediction
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          ✦ AI
        </span>
      </div>

      <div className="space-y-3">
        {AI_PREDICTIONS.map((p) => (
          <div
            key={p.label}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5"
          >
            <p className="text-xs text-gray-400 mb-1">{p.label}</p>
            <p className="text-xl font-black text-black dark:text-white mb-2">{p.value}</p>
            {p.pct !== null && (
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
export function AdaptiveLearning() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">
          Adaptive Learning
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          ✦ AI
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        You're weak in <span className="font-bold text-black dark:text-white">Integration</span>. Auto-adapted path:
      </p>

      <div className="flex-1 divide-y divide-gray-50 dark:divide-gray-800">
        {ADAPTIVE_STEPS.map((s) => (
          <div key={s.step} className="flex items-start gap-3 py-2.5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{ background: s.color }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{s.step}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => {
          // In production: router.push('/test/session?subject=Maths&chapter=Calculus&topic=Integration&mode=adaptive')
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
export function AIStudyPlanner() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">
          AI Study Planner
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          ✦ AI
        </span>
      </div>

      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        Today's tasks
      </p>

      <div className="flex-1 divide-y divide-gray-50 dark:divide-gray-800">
        {DAILY_TASKS.map((t) => (
          <div key={t.task} className="flex items-start gap-3 py-2.5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{ background: t.color }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.task}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="mt-4 w-full py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 transition-opacity"
        onClick={() => {
          // In production: call your AI API route to generate a weekly schedule
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

export function AIRecommendations() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">
          AI Recommendations
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          ✦ AI
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {AI_RECOMMENDATIONS.map((r) => (
          <div
            key={r.title}
            className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4"
          >
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
              {r.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              {r.body}
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${REC_CLASS[r.type]}`}>
              {r.tag}
            </span>
          </div>
        ))}
      </div>

      <button
        className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 transition-opacity"
        onClick={() => {
          // In production: call your AI API route, stream the response into a modal or new page
          alert("Opening AI study plan generator…");
        }}
      >
        Generate Full AI Study Plan →
      </button>
    </div>
  );
}