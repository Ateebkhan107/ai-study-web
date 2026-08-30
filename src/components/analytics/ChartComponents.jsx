"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Clock, Compass, Layers, Sparkles, Target, TrendingUp } from "lucide-react";

function ActionableEmptyState({ icon: Icon, title, description, cta, href }) {
  return (
    <div className="flex flex-col items-start justify-between rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50 p-4 transition-all duration-200 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/20 sm:p-5">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {cta && href && (
        <div className="mt-4 w-full pt-3 border-t border-slate-200/60 dark:border-[var(--border-subtle)]">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-brand-hover"
          >
            <span>{cta}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function formatPercent(value) {
  return value === null || value === undefined ? "—" : `${value}%`;
}

function buildLinePoints(points, width = 640, height = 190, pad = 18) {
  if (!points || points.length < 2) return "";
  const usableWidth = width - pad * 2;
  const usableHeight = height - pad * 2;
  return points
    .map((point, index) => {
      const x = pad + (index / (points.length - 1)) * usableWidth;
      const y = pad + (1 - point.accuracy / 100) * usableHeight;
      return `${x},${y}`;
    })
    .join(" ");
}

export function PerformanceTrend({ data, detailed = false }) {
  const points = data?.points || [];
  const hasData = data?.status === "ready" && points.length >= 2;
  const chartPoints = buildLinePoints(points);

  // Ghosted preview points for when there is insufficient data
  const ghostPoints = [
    { x: 18, y: 130 },
    { x: 120, y: 110 },
    { x: 230, y: 80 },
    { x: 340, y: 95 },
    { x: 450, y: 60 },
    { x: 550, y: 45 },
    { x: 622, y: 35 },
  ];
  const ghostPolyline = ghostPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">
            Performance Trend
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {detailed ? "Accuracy over completed work" : "Recent test and PYQ accuracy"}
          </p>
        </div>

        {!hasData && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-brand">
            <Sparkles className="h-2.5 w-2.5" />
            Unlocks at 2 tests
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/20 sm:p-6">
          {/* Ghosted Preview Curve Visual */}
          <div className="relative h-44 sm:h-52 w-full opacity-35 dark:opacity-20 pointer-events-none">
            <svg className="h-full w-full" viewBox="0 0 640 190" preserveAspectRatio="none" aria-hidden="true">
              {[0, 25, 50, 75, 100].map((tick) => (
                <g key={tick}>
                  <line
                    x1="18"
                    x2="622"
                    y1={18 + (1 - tick / 100) * 154}
                    y2={18 + (1 - tick / 100) * 154}
                    stroke="currentColor"
                    className="text-slate-300 dark:text-slate-700"
                    strokeWidth="1"
                  />
                </g>
              ))}
              <polyline
                points={ghostPolyline}
                fill="none"
                stroke="#C2723F"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {ghostPoints.map((p, index) => (
                <circle key={index} cx={p.x} cy={p.y} r="3" fill="#C2723F" />
              ))}
            </svg>
          </div>

          {/* Overlaid Actionable Prompt */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-t from-white/90 via-white/70 to-transparent dark:from-[var(--surface)]/95 dark:via-[var(--surface)]/75">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand shadow-2xs mb-2.5">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
              Accuracy Curve Starts After 2 Sessions
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              Complete at least 2 mock tests or PYQ drills to chart your accuracy trend over time.
            </p>
            <div className="mt-3.5 flex items-center gap-2">
              <Link
                href="/test"
                className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-brand-hover shadow-2xs"
              >
                <span>Take a Test</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/pyq"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-50 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-slate-200 dark:hover:bg-[var(--surface-hover)]"
              >
                <span>Practice PYQs</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-w-0">
          <div className="relative h-56 overflow-hidden rounded-xl border border-slate-200 bg-[#fffdf7] py-3 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/25 sm:h-72">
            <svg className="h-full w-full" viewBox="0 0 640 190" preserveAspectRatio="none" role="img" aria-label="Accuracy trend over recent work">
              {[0, 25, 50, 75, 100].map((tick) => (
                <g key={tick}>
                  <line
                    x1="18"
                    x2="622"
                    y1={18 + (1 - tick / 100) * 154}
                    y2={18 + (1 - tick / 100) * 154}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="1"
                  />
                </g>
              ))}
              <polyline
                points={chartPoints}
                fill="none"
                stroke="#C2723F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {points.map((point, index) => {
                const x = 18 + (index / (points.length - 1)) * 604;
                const y = 18 + (1 - point.accuracy / 100) * 154;
                return <circle key={`${point.label}-${index}`} cx={x} cy={y} r="3.5" fill="#C2723F" />;
              })}
            </svg>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {points.slice(detailed ? -8 : -4).map((point, index) => (
              <span
                key={`${point.label}-${index}`}
                className="text-xs font-medium text-slate-500 dark:text-slate-400"
              >
                {point.label}: {point.accuracy}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SubjectDistribution({ data }) {
  const items = data?.items || [];
  const hasData = data?.status === "ready" && items.length > 0;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <h2 className="mb-1 text-base font-semibold tracking-normal text-slate-950 dark:text-white">
        Subject Distribution
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Attempt share by subject
      </p>

      {!hasData ? (
        <ActionableEmptyState
          icon={Layers}
          title="No subject data yet"
          description="Practice mapped questions across Physics, Chemistry, and Mathematics to see your attempt distribution."
          cta="Practice PYQs"
          href="/pyq"
        />
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-[var(--border-subtle)]">
          {items.map((subject) => (
            <div key={subject.subject} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium text-slate-900 dark:text-white">{subject.subject}</span>
                  <span className="text-sm font-semibold tabular-nums text-slate-950 dark:text-white">{subject.pct}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden bg-slate-100 dark:bg-[var(--surface-elevated)]">
                  <div className="h-full bg-brand" style={{ width: `${subject.pct}%` }} />
                </div>
              </div>
              <span className="self-center text-xs text-slate-500 dark:text-slate-500">
                {subject.attempted} attempted
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SubjectPerformance({ data }) {
  const items = data?.items || [];
  const hasData = data?.status === "ready" && items.length > 0;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <h2 className="mb-1 text-base font-semibold tracking-normal text-slate-950 dark:text-white">
        Subject Performance
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Correct answers against attempted questions
      </p>

      {!hasData ? (
        <ActionableEmptyState
          icon={Target}
          title="No subject performance yet"
          description="Answer questions to calculate accuracy rates and subject-level strengths."
          cta="Start Practice"
          href="/pyq"
        />
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-[var(--border-subtle)]">
          {items.map((subject) => (
            <div key={subject.subject} className="py-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{subject.subject}</span>
                <span className="text-sm font-semibold tabular-nums text-slate-950 dark:text-white">{formatPercent(subject.accuracy)}</span>
              </div>
              <div className="h-1 overflow-hidden bg-slate-100 dark:bg-[var(--surface-elevated)]">
                <div className="h-full bg-brand" style={{ width: `${subject.accuracy || 0}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                {subject.correct}/{subject.attempted} correct
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChapterPerformance({ data }) {
  const weakest = data?.weakest || [];
  const strongest = data?.strongest || [];
  const hasData = data?.status === "ready" && weakest.length > 0;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <h2 className="mb-1 text-base font-semibold tracking-normal text-slate-950 dark:text-white">
        Chapter Performance
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Chapter-level report from mapped attempts
      </p>

      {!hasData ? (
        <ActionableEmptyState
          icon={Compass}
          title="Not enough chapter data yet"
          description="Complete 3 or more questions in any chapter to unlock chapter-level accuracy and weakness tracking."
          cta="Choose a Chapter"
          href="/pyq"
        />
      ) : (
        <ChapterTable chapters={[...weakest, ...strongest]} />
      )}
    </div>
  );
}

function ChapterTable({ chapters }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[580px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-[var(--border-subtle)] dark:text-slate-500">
            <th className="py-2 pr-4">Chapter</th>
            <th className="py-2 pr-4">Subject</th>
            <th className="py-2 pr-4 text-right">Attempted</th>
            <th className="py-2 text-right">Accuracy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-[var(--border-subtle)]">
          {chapters.map((chapter) => (
            <tr key={`${chapter.subject}-${chapter.chapter}`} className="text-sm">
              <td className="max-w-[300px] py-3 pr-4">
                <div className="flex min-w-0 items-center gap-2">
                  {chapter.statusLabel !== "Strong" && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                  )}
                  <span className="truncate font-medium text-slate-950 dark:text-white">{chapter.chapter}</span>
                </div>
                {chapter.statusLabel !== "Strong" && (
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">Needs attention</p>
                )}
              </td>
              <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{chapter.subject}</td>
              <td className="py-3 pr-4 text-right tabular-nums text-slate-700 dark:text-slate-300">{chapter.attempted}</td>
              <td className="py-3 text-right font-semibold tabular-nums text-slate-950 dark:text-white">{chapter.accuracy}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TimeAnalytics({ data }) {
  const hasData = data?.status === "ready";

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <h2 className="mb-1 text-base font-semibold tracking-normal text-slate-950 dark:text-white">
        Speed & Time
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Timed test pace
      </p>

      {!hasData ? (
        <ActionableEmptyState
          icon={Clock}
          title="No timing data yet"
          description="Complete a timed mock test session to unlock question pacing, speed analytics, and time efficiency scoring."
          cta="Start Timed Test"
          href="/test"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 divide-x divide-slate-200 border-y border-slate-200 dark:divide-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
            <div className="py-3 pr-3">
              <p className="mb-1 text-xs text-slate-500 dark:text-slate-500">Avg time / question</p>
              <p className="text-xl font-semibold text-slate-950 dark:text-white">{data.averageSecondsPerQuestion}s</p>
            </div>
            <div className="py-3 pl-3">
              <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">Speed</p>
              <p className="text-xl font-semibold text-slate-950 dark:text-white">{data.questionsPerMinute} q/min</p>
            </div>
          </div>

          {data.recent?.length > 0 && (
            <div className="mt-4 flex h-28 items-end gap-2">
              {data.recent.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="flex h-20 w-full items-end rounded-t-md bg-slate-100 dark:bg-[var(--surface-elevated)]">
                    <div
                      className="w-full rounded-t-sm bg-brand/80"
                      style={{ height: `${Math.max(8, Math.min(100, item.questionsPerMinute * 5))}%` }}
                      title={`${item.label}: ${item.questionsPerMinute} q/min`}
                    />
                  </div>
                  <span className="max-w-full truncate text-[10px] font-bold text-slate-400 dark:text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Consolidated Charts Unlock Hub for low-data accounts
export function ChartsUnlockHub({ stats }) {
  const overview = stats?.overview || {};
  const counts = stats?.counts || {};
  const pyqAnswered = Number(counts.answeredPyqQuestions ?? overview.questionsPracticed ?? 0);
  const mockCompleted = Number(counts.completedTests ?? overview.testsCompleted ?? 0);

  const chartCards = [
    {
      title: "Subject Distribution & Attempt Share",
      description: "Visual breakdown of your question distribution across Physics, Chemistry, & Mathematics.",
      req: "Answer mapped PYQ questions",
      status: pyqAnswered > 0 ? "Ready" : `${pyqAnswered}/1 question`,
      ready: pyqAnswered > 0,
      icon: Layers,
      cta: "Practice PYQs",
      href: "/pyq",
    },
    {
      title: "Subject-Level Accuracy",
      description: "Side-by-side comparison of accuracy percentages across subjects.",
      req: "Answer questions in any subject",
      status: pyqAnswered > 0 ? "Ready" : `${pyqAnswered}/1 question`,
      ready: pyqAnswered > 0,
      icon: Target,
      cta: "Practice PYQs",
      href: "/pyq",
    },
    {
      title: "Chapter Strengths & Weaknesses",
      description: "Detailed table identifying chapters needing urgent revision.",
      req: "3+ questions in a single chapter",
      status: `${Math.min(pyqAnswered, 3)}/3 in chapter`,
      ready: false,
      icon: Compass,
      cta: "Choose Chapter",
      href: "/pyq",
    },
    {
      title: "Speed Pace & Time Efficiency",
      description: "Average seconds per question, questions per minute, and test pacing trends.",
      req: "1 completed timed test",
      status: `${mockCompleted}/1 test`,
      ready: mockCompleted >= 1,
      icon: Clock,
      cta: "Start Timed Test",
      href: "/test",
    },
  ];

  const unlockedCount = chartCards.filter((c) => c.ready).length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-5 shadow-sm dark:border-brand/30 dark:bg-gradient-to-br dark:from-brand/10 dark:via-[var(--surface)] dark:to-brand/5 dark:bg-[var(--surface)] sm:p-7">
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-brand/10 blur-3xl dark:bg-brand/15" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-slate-950 shadow-sm">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                Charts & Deep Analytics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unlock subject breakdown, chapter heatmaps, and timing analytics through practice.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-bold text-amber-900 dark:border-brand/30 dark:bg-[var(--surface-elevated)] dark:text-brand">
            <Sparkles className="h-3 w-3" />
            <span>{unlockedCount} of 4 Charts Active</span>
          </div>
        </div>

        {/* 4 Feature Unlocks Grid */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {chartCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                  card.ready
                    ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-950/15"
                    : "border-slate-200/80 bg-white/80 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/15 text-brand">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {card.req}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        card.ready
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {card.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[var(--border-subtle)]/60">
                  <Link
                    href={card.href}
                    className="inline-flex w-full items-center justify-between rounded-lg bg-slate-100/90 px-3 py-1.5 text-xs font-bold text-slate-900 transition-colors hover:bg-brand hover:text-slate-950 dark:bg-[var(--surface)] dark:text-slate-200 dark:hover:bg-brand dark:hover:text-slate-950"
                  >
                    <span>{card.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
