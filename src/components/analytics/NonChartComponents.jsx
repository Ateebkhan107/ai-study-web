"use client";

const HM_COLORS = [
  "bg-slate-100 dark:bg-slate-800",
  "bg-teal-100 dark:bg-teal-900/50",
  "bg-teal-400 dark:bg-teal-600",
  "bg-teal-700 dark:bg-teal-400",
];

function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/45 p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400">
      <p className="font-bold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 text-xs leading-relaxed">{description}</p>
    </div>
  );
}

function formatDateLabel(date) {
  if (!date) return "No date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));
}

export function StudyHeatmap({ heatmap }) {
  const days = heatmap?.days || [];
  const hasData = heatmap?.status === "ready" && days.some((day) => day.total > 0);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="glass-card min-w-0 p-5">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100">
        Study Activity Heatmap — Last 8 Weeks
      </h2>

      {!hasData ? (
        <EmptyState
          title="No activity yet"
          description="Answer questions or submit tests to build your activity map."
        />
      ) : (
        <>
          <div className="mb-1 ml-[44px] grid grid-cols-8 gap-1">
            {["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"].map((week) => (
              <div key={week} className="text-center text-[10px] text-slate-400 dark:text-slate-500">
                {week}
              </div>
            ))}
          </div>

          <div className="flex min-w-0 gap-2">
            <div className="flex shrink-0 flex-col justify-between">
              {labels.map((day) => (
                <div key={day} className="flex h-6 items-center text-[10px] text-slate-400 dark:text-slate-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid min-w-0 flex-1 grid-flow-col grid-rows-7 gap-1" style={{ gridTemplateRows: "repeat(7, 1fr)" }}>
              {days.map((day) => (
                <div
                  key={day.date}
                  className={`h-6 rounded-sm ${HM_COLORS[day.intensity] || HM_COLORS[0]}`}
                  title={`${formatDateLabel(day.date)} · ${day.questions} questions practiced · ${day.tests} tests submitted`}
                />
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span>Less</span>
            {HM_COLORS.map((cls, index) => (
              <div key={index} className={`h-3 w-3 rounded-sm ${cls}`} />
            ))}
            <span>More</span>
          </div>
        </>
      )}
    </div>
  );
}

export function ExamReadiness({ readiness }) {
  const hasData = readiness?.status === "ready" && readiness?.overall !== null;
  const overall = hasData ? readiness.overall : 0;
  const breakdown = readiness?.components || [];
  const r = 46;
  const circ = 2 * Math.PI * r;
  const filled = (overall / 100) * circ;

  return (
    <div className="glass-card min-w-0 p-5">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100">
        Exam Readiness Score
      </h2>

      {!hasData ? (
        <EmptyState
          title="Not enough data"
          description="Complete more practice to calculate readiness."
        />
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative shrink-0">
            <svg width="120" height="120" viewBox="0 0 120 120" aria-label={`${overall}% ready`}>
              <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-slate-100 dark:stroke-slate-800" />
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="none"
                strokeWidth="10"
                stroke="#1D9E75"
                strokeDasharray={`${filled} ${circ - filled}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{overall}%</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">ready</span>
            </div>
          </div>

          <div className="w-full flex-1 space-y-2.5">
            {breakdown.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-xs text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  {item.value !== null && (
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.value}%`, background: item.color }}
                    />
                  )}
                </div>
                <span className="w-9 text-right text-xs font-bold text-slate-900 dark:text-white">
                  {item.value === null ? "—" : `${item.value}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
