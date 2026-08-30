"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Target, FileText, Clock } from "lucide-react";

const HM_COLORS = [
  "bg-slate-100 dark:bg-[var(--surface-elevated)]",
  "bg-brand/15",
  "bg-brand/45",
  "bg-brand",
];

function EmptyState({ title, description }) {
  return (
    <div className="border-t border-slate-200 py-5 text-sm text-slate-500 dark:border-[var(--border-subtle)] dark:text-slate-400">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 text-xs leading-6">{description}</p>
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
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <h2 className="mb-1 text-base font-semibold tracking-normal text-slate-950 dark:text-white">
        Study Activity
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Last 8 weeks</p>

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
  const isReady = readiness?.status === "ready" && readiness?.overall !== null;
  const overall = isReady ? readiness.overall : 0;
  const counts = readiness?.counts || {};
  const requirements = readiness?.requirements || {
    minimumPyqQuestions: 20,
    minimumMockTests: 1,
    minimumTimedQuestions: 20,
  };

  const pyqCount = counts.pyqAnswered || 0;
  const mockCount = counts.mockTestsCompleted || 0;
  const timedCount = counts.timedAnswered || 0;

  const pyqTarget = requirements.minimumPyqQuestions || 20;
  const mockTarget = requirements.minimumMockTests || 1;
  const timedTarget = requirements.minimumTimedQuestions || 20;

  const pyqValid = pyqCount >= pyqTarget;
  const mockValid = mockCount >= mockTarget;
  const timedValid = timedCount >= timedTarget;

  // Multi-segment Ring Calculations
  const r = 46;
  const circ = 2 * Math.PI * r; // ~289.03

  // Segments: PYQ (45%), Mock (45%), Time (10%)
  // We leave a 3-unit gap between segments
  const gap = 3;
  const pyqLength = circ * 0.45 - gap;
  const mockLength = circ * 0.45 - gap;
  const timeLength = circ * 0.10 - gap;

  // Segment partial fill ratios
  const pyqFillRatio = pyqValid
    ? ((readiness?.components?.[0]?.value ?? 100) / 100)
    : Math.min(pyqCount / pyqTarget, 1);
  const mockFillRatio = mockValid
    ? ((readiness?.components?.[1]?.value ?? 100) / 100)
    : Math.min(mockCount / mockTarget, 1);
  const timeFillRatio = timedValid
    ? ((readiness?.components?.[2]?.value ?? 100) / 100)
    : Math.min(timedCount / timedTarget, 1);

  const pyqFilled = pyqFillRatio * pyqLength;
  const mockFilled = mockFillRatio * mockLength;
  const timeFilled = timeFillRatio * timeLength;

  // Rotations for 3 arcs starting at top (-90 deg)
  const pyqOffset = 0;
  const mockOffset = circ * 0.45;
  const timeOffset = circ * 0.90;

  const componentsData = [
    {
      key: "pyqPerformance",
      label: "PYQ Performance",
      weight: "45%",
      current: pyqCount,
      target: pyqTarget,
      unit: "questions",
      valid: pyqValid,
      value: readiness?.components?.find((c) => c.key === "pyqPerformance")?.value ?? null,
      color: "#378ADD",
      bgBar: "bg-blue-500",
      cta: "Practice PYQs",
      href: "/pyq",
      icon: Target,
    },
    {
      key: "mockPerformance",
      label: "Mock Performance",
      weight: "45%",
      current: mockCount,
      target: mockTarget,
      unit: "test",
      valid: mockValid,
      value: readiness?.components?.find((c) => c.key === "mockPerformance")?.value ?? null,
      color: "#D4537E",
      bgBar: "bg-rose-500",
      cta: "Start Test",
      href: "/test",
      icon: FileText,
    },
    {
      key: "timeEfficiency",
      label: "Time Efficiency",
      weight: "10%",
      current: timedCount,
      target: timedTarget,
      unit: "timed Qs",
      valid: timedValid,
      value: readiness?.components?.find((c) => c.key === "timeEfficiency")?.value ?? null,
      color: "#BA7517",
      bgBar: "bg-amber-500",
      cta: "Timed Drill",
      href: "/test",
      icon: Clock,
    },
  ];

  const unlockedComponentsCount = [pyqValid, mockValid, timedValid].filter(Boolean).length;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">
          Exam Readiness Score
        </h2>
        {!isReady && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-brand">
            <Sparkles className="h-2.5 w-2.5" />
            Unlocking
          </span>
        )}
      </div>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Composite preparation signal</p>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* Multi-Segment Alive SVG Ring */}
        <div className="relative shrink-0 self-center sm:self-auto">
          <svg width="128" height="128" viewBox="0 0 128 128" aria-label={isReady ? `${overall}% ${readiness.label}` : "Exam readiness unlocking"}>
            {/* Background Base Ring */}
            <circle
              cx="64"
              cy="64"
              r={r}
              fill="none"
              strokeWidth="8"
              className="stroke-slate-100 dark:stroke-slate-800"
            />

            {/* Ghosted Arc 1: PYQ (45%) */}
            <circle
              cx="64"
              cy="64"
              r={r}
              fill="none"
              strokeWidth="8"
              stroke="#378ADD"
              strokeOpacity="0.2"
              strokeDasharray={`${pyqLength} ${circ - pyqLength}`}
              strokeDashoffset={-pyqOffset}
              transform="rotate(-90 64 64)"
            />
            {/* Live Fill Arc 1 */}
            {pyqFilled > 0 && (
              <circle
                cx="64"
                cy="64"
                r={r}
                fill="none"
                strokeWidth="8"
                stroke="#378ADD"
                strokeDasharray={`${pyqFilled} ${circ - pyqFilled}`}
                strokeDashoffset={-pyqOffset}
                strokeLinecap="round"
                transform="rotate(-90 64 64)"
                className="transition-all duration-700"
              />
            )}

            {/* Ghosted Arc 2: Mock (45%) */}
            <circle
              cx="64"
              cy="64"
              r={r}
              fill="none"
              strokeWidth="8"
              stroke="#D4537E"
              strokeOpacity="0.2"
              strokeDasharray={`${mockLength} ${circ - mockLength}`}
              strokeDashoffset={-mockOffset}
              transform="rotate(-90 64 64)"
            />
            {/* Live Fill Arc 2 */}
            {mockFilled > 0 && (
              <circle
                cx="64"
                cy="64"
                r={r}
                fill="none"
                strokeWidth="8"
                stroke="#D4537E"
                strokeDasharray={`${mockFilled} ${circ - mockFilled}`}
                strokeDashoffset={-mockOffset}
                strokeLinecap="round"
                transform="rotate(-90 64 64)"
                className="transition-all duration-700"
              />
            )}

            {/* Ghosted Arc 3: Time (10%) */}
            <circle
              cx="64"
              cy="64"
              r={r}
              fill="none"
              strokeWidth="8"
              stroke="#BA7517"
              strokeOpacity="0.2"
              strokeDasharray={`${timeLength} ${circ - timeLength}`}
              strokeDashoffset={-timeOffset}
              transform="rotate(-90 64 64)"
            />
            {/* Live Fill Arc 3 */}
            {timeFilled > 0 && (
              <circle
                cx="64"
                cy="64"
                r={r}
                fill="none"
                strokeWidth="8"
                stroke="#BA7517"
                strokeDasharray={`${timeFilled} ${circ - timeFilled}`}
                strokeDashoffset={-timeOffset}
                strokeLinecap="round"
                transform="rotate(-90 64 64)"
                className="transition-all duration-700"
              />
            )}
          </svg>

          {/* Center Text inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center pointer-events-none">
            {isReady ? (
              <>
                <span className="font-display text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  {overall}%
                </span>
                <span className="max-w-[70px] truncate text-[9.5px] font-bold text-slate-500 dark:text-slate-400">
                  {readiness.label}
                </span>
              </>
            ) : (
              <>
                <span className="font-display text-lg font-black tracking-tight text-slate-950 dark:text-white sm:text-xl">
                  {unlockedComponentsCount}/3
                </span>
                <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-700 dark:text-brand">
                  Ready
                </span>
              </>
            )}
          </div>
        </div>

        {/* Breakdown Component Rows with Progress & Inline CTAs */}
        <div className="w-full flex-1 space-y-3">
          {componentsData.map((item) => {
            const progressPct = item.valid
              ? item.value ?? 100
              : Math.min(100, Math.round((item.current / item.target) * 100));

            return (
              <div key={item.key} className="group min-w-0">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      ({item.weight})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.valid ? (
                      <span className="font-bold tabular-nums text-slate-950 dark:text-white">
                        {item.value !== null ? `${item.value}%` : "—"}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                        {item.current}/{item.target}
                      </span>
                    )}

                    {!item.valid && (
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 transition-colors hover:bg-brand hover:text-slate-950 dark:bg-[var(--surface-elevated)] dark:text-slate-300 dark:hover:bg-brand dark:hover:text-slate-950"
                      >
                        <span>{item.cta.split(" ")[0]}</span>
                        <ArrowRight className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.valid ? item.bgBar : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    style={{
                      width: `${Math.max(4, progressPct)}%`,
                      backgroundColor: item.valid ? item.color : undefined,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Bottom Helper / Summary */}
          <div className="pt-1">
            {isReady ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Based on {counts.pyqAnswered || 0} questions and {counts.mockTestsCompleted || 0} tests
              </p>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pyqCount < pyqTarget
                    ? `Need ${pyqTarget - pyqCount} more PYQs & ${mockCount < mockTarget ? 1 : 0} test to unlock readiness`
                    : "Need 1 mock test to unlock full composite score"}
                </p>
                <Link
                  href={pyqCount < pyqTarget ? "/pyq" : "/test"}
                  className="shrink-0 text-xs font-bold text-brand hover:underline inline-flex items-center gap-1"
                >
                  <span>{pyqCount < pyqTarget ? "Practice PYQs" : "Start Test"}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
