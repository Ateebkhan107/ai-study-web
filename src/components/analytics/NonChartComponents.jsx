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
                  className={`h-6 rounded-sm ${day.future ? 'opacity-0' : HM_COLORS[day.intensity] || HM_COLORS[0]}`}
                  title={day.future ? '' : `${formatDateLabel(day.date)} · ${day.questions} questions practiced · ${day.tests} tests submitted`}
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

  const getComponentStatus = (value, valid) => {
    if (!valid) return "Needs data";
    if (value < 40) return "Needs practice";
    if (value < 60) return "Needs work";
    if (value < 75) return "Developing";
    if (value < 90) return "Good";
    return "Excellent";
  };

  const componentsData = [
    {
      key: "pyqPerformance",
      label: "PYQs",
      valid: pyqValid,
      value: readiness?.components?.find((c) => c.key === "pyqPerformance")?.value ?? null,
      current: pyqCount,
      target: pyqTarget,
    },
    {
      key: "mockPerformance",
      label: "Mocks",
      valid: mockValid,
      value: readiness?.components?.find((c) => c.key === "mockPerformance")?.value ?? null,
      current: mockCount,
      target: mockTarget,
    },
    {
      key: "timeEfficiency",
      label: "Time Management",
      valid: timedValid,
      value: readiness?.components?.find((c) => c.key === "timeEfficiency")?.value ?? null,
      current: timedCount,
      target: timedTarget,
    },
  ];

  let nextFocus = "";
  if (!pyqValid || !mockValid || !timedValid) {
    const missing = [];
    if (!pyqValid) missing.push("more PYQs");
    if (!mockValid) missing.push("a mock test");
    if (!timedValid && mockValid && pyqValid) missing.push("a timed drill");
    nextFocus = `Complete ${missing.join(" and ")} to unlock your full score.`;
  } else {
    const weakest = [...componentsData].sort((a, b) => (a.value ?? 100) - (b.value ?? 100))[0];
    if (weakest.key === "pyqPerformance") nextFocus = "Focus on practicing more PYQs to improve your foundation.";
    else if (weakest.key === "mockPerformance") nextFocus = "Take another mock test to improve your exam-taking stamina and strategy.";
    else nextFocus = "Work on your speed by taking timed drills.";
  }

  return (
    <div className="flex h-full min-w-0 flex-col justify-between rounded-2xl border border-slate-200/80 bg-[var(--card)] p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6">
      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Exam Readiness
          </h2>
          {!isReady && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-brand">
              <Sparkles className="h-2.5 w-2.5" />
              Unlocking
            </span>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-slate-950 tabular-nums dark:text-white sm:text-5xl">
              {isReady ? `${overall}%` : "—"}
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-400">
            {isReady ? readiness.label : "Need more data"}
          </p>
        </div>

        <div className="mb-8 space-y-3.5">
          {componentsData.map((item) => (
            <div key={item.key} className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm">
              <span className="font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-black tabular-nums text-slate-900 dark:text-white">
                  {item.valid ? `${item.value}%` : `${item.current}/${item.target}`}
                </span>
                <span className="text-slate-300 dark:text-slate-600">—</span>
                <span className={`text-xs font-bold ${item.valid && item.value < 60 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {getComponentStatus(item.value, item.valid)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]">
        <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Next Focus
        </p>
        <p className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-200">
          {nextFocus}
        </p>
      </div>
    </div>
  );
}
