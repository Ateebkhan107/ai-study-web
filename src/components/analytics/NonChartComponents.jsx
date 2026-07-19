"use client";

// ─────────────────────────────────────────────────────────────────
// StudyHeatmap — 8-week activity grid (uses live data when available)
// ─────────────────────────────────────────────────────────────────
const HM_COLORS = [
  "bg-slate-100 dark:bg-slate-800",
  "bg-teal-100 dark:bg-teal-900/50",
  "bg-teal-400 dark:bg-teal-600",
  "bg-teal-700 dark:bg-teal-400",
];

const DEFAULT_HEATMAP = [
  0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,
];

export function StudyHeatmap({ heatmapData }) {
  const values = heatmapData && heatmapData.length > 0 ? heatmapData : DEFAULT_HEATMAP;
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  return (
    <div className="glass-card p-5">
      <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4">
        Study Activity Heatmap — Last 8 Weeks
      </h2>

      {/* Week labels */}
      <div className="flex gap-1 mb-1 ml-[52px]">
        {["W1","W2","W3","W4","W5","W6","W7","W8"].map((w) => (
          <div key={w} className="flex-1 text-center text-[10px] text-slate-400 dark:text-slate-500">{w}</div>
        ))}
      </div>

      {/* Grid — 7 rows (days) × 8 cols (weeks) */}
      <div className="flex gap-2">
        <div className="flex flex-col justify-between">
          {days.map((d) => (
            <div key={d} className="text-[10px] text-slate-400 dark:text-slate-500 h-6 flex items-center">{d}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-rows-7 grid-flow-col gap-1"
          style={{ gridTemplateRows: "repeat(7, 1fr)" }}
        >
          {values.map((v, i) => (
            <div key={i} className={`h-6 rounded-sm ${HM_COLORS[v] || HM_COLORS[0]}`} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 dark:text-slate-500">
        <span>Less</span>
        {HM_COLORS.map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ExamReadiness — Donut + breakdown bars (uses live data)
// ─────────────────────────────────────────────────────────────────
const DEFAULT_BREAKDOWN = [
  { label: "Concept coverage", pct: 0, color: "#1D9E75" },
  { label: "PYQ accuracy",     pct: 0, color: "#378ADD" },
  { label: "Speed (q/min)",    pct: 0, color: "#BA7517" },
  { label: "Mock test score",  pct: 0, color: "#D4537E" },
];

export function ExamReadiness({ overall, breakdown }) {
  const OVERALL = overall ?? 0;
  const BREAKDOWN = breakdown && breakdown.length > 0 ? breakdown : DEFAULT_BREAKDOWN;

  const r = 46;
  const circ = 2 * Math.PI * r;
  const filled = (OVERALL / 100) * circ;

  return (
    <div className="glass-card p-5">
      <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4">
        Exam Readiness Score
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-6">

        {/* SVG donut */}
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10"
              className="stroke-slate-100 dark:stroke-slate-800" />
            <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10"
              stroke="#1D9E75"
              strokeDasharray={`${filled} ${circ - filled}`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{OVERALL}%</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">ready</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 w-full space-y-2.5">
          {BREAKDOWN.map((r) => (
            <div key={r.label} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 w-36 flex-shrink-0">
                {r.label}
              </span>
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${r.pct}%`, background: r.color }}
                />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white w-8 text-right">
                {r.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PYQIntelligence — topic-level PYQ insight list (uses live data)
// ─────────────────────────────────────────────────────────────────
const STATUS_CLASS = {
  weak:   "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
  avg:    "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
  strong: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
};
const STATUS_LABEL = { weak: "Weak", avg: "Avg", strong: "Strong" };

const DEFAULT_PYQ_INSIGHTS = [
  { topic: "No data yet", note: "Complete PYQs to see insights", accuracy: 0, status: "avg" },
];

export function PYQIntelligence({ liveData }) {
  const insights = liveData && liveData.length > 0 ? liveData : DEFAULT_PYQ_INSIGHTS;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
          PYQ Intelligence
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          ✦ AI Insights
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {insights.map((item) => (
          <div key={item.topic} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.topic}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.note}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-3 flex-shrink-0 ${STATUS_CLASS[item.status] || STATUS_CLASS.avg}`}>
              {STATUS_LABEL[item.status] || "—"} · {item.accuracy}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}