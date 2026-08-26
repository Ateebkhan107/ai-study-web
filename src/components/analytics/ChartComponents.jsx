"use client";

function EmptyState({ title, description }) {
  return (
    <div className="border-t border-slate-200 py-5 text-sm text-slate-500 dark:border-[var(--border-subtle)] dark:text-slate-400">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 text-xs leading-6">{description}</p>
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

  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">
          Performance Trend
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {detailed ? "Accuracy over completed work" : "Recent test and PYQ accuracy"}
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          title="Not enough trend data yet"
          description="Complete more tests or PYQ practice to see how your performance changes over time."
        />
      ) : (
        <div className="min-w-0">
          <div className="relative h-56 overflow-hidden border-t border-b border-slate-200 bg-[#fffdf7] py-3 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/25 sm:h-72">
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
              <polyline points={chartPoints} fill="none" stroke="#C2723F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
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
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <h2 className="mb-1 text-base font-semibold tracking-normal text-slate-950 dark:text-white">
        Subject Distribution
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Attempt share by subject
      </p>

      {!hasData ? (
        <EmptyState
          title="No subject data yet"
          description="Practice mapped questions to see subject distribution."
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
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <h2 className="mb-1 text-base font-semibold tracking-normal text-slate-950 dark:text-white">
        Subject Performance
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Correct answers against attempted questions
      </p>

      {!hasData ? (
        <EmptyState
          title="No subject performance yet"
          description="Answer mapped questions to calculate subject accuracy."
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
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <h2 className="mb-1 text-base font-semibold tracking-normal text-slate-950 dark:text-white">
        Chapter Performance
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Chapter-level report from mapped attempts
      </p>

      {!hasData ? (
        <EmptyState
          title="Not enough chapter data yet"
          description="Complete more mapped PYQs or tests to compare chapter performance."
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
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <h2 className="mb-1 text-base font-semibold tracking-normal text-slate-950 dark:text-white">
        Speed & Time
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Timed test pace
      </p>

      {!hasData ? (
        <EmptyState
          title="No reliable timing data yet"
          description="Complete a few timed tests to unlock timing analysis."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 divide-x divide-slate-200 border-y border-slate-200 dark:divide-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
            <div className="py-3 pr-3">
              <p className="mb-1 text-xs text-slate-500 dark:text-slate-500">Avg time / question</p>
              <p className="text-xl font-semibold text-slate-950 dark:text-white">{data.averageSecondsPerQuestion}s</p>
            </div>
            <div className="py-3 pl-3">
              <p className="mb-1 text-xs text-slate-500 dark:text-slate-500">Speed</p>
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
