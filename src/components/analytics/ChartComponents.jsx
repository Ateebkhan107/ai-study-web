"use client";

function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200/70 bg-[var(--card)]/45 p-5 text-sm text-slate-500 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/30 dark:text-slate-400">
      <p className="font-bold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 text-xs leading-relaxed">{description}</p>
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
    <div className="glass-card min-w-0 p-5">
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100">
          Performance Trend
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {detailed ? "Performance over time from completed work" : "Your test and PYQ accuracy improvement"}
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          title="Not enough trend data yet"
          description="Complete more tests or PYQ practice to see how your performance changes over time."
        />
      ) : (
        <div className="min-w-0">
          <div className="relative h-56 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/40 p-3 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/30 sm:h-72">
            <svg className="h-full w-full" viewBox="0 0 640 190" preserveAspectRatio="none" role="img" aria-label="Accuracy trend over recent work">
              {[0, 25, 50, 75, 100].map((tick) => (
                <g key={tick}>
                  <line
                    x1="18"
                    x2="622"
                    y1={18 + (1 - tick / 100) * 154}
                    y2={18 + (1 - tick / 100) * 154}
                    stroke="currentColor"
                    className="text-slate-200/80 dark:text-slate-800"
                    strokeWidth="1"
                  />
                </g>
              ))}
              <polyline points={chartPoints} fill="none" stroke="#C2723F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              {points.map((point, index) => {
                const x = 18 + (index / (points.length - 1)) * 604;
                const y = 18 + (1 - point.accuracy / 100) * 154;
                return <circle key={`${point.label}-${index}`} cx={x} cy={y} r="5" fill="#C2723F" />;
              })}
            </svg>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {points.slice(detailed ? -8 : -4).map((point, index) => (
              <span
                key={`${point.label}-${index}`}
                className="rounded-full border border-slate-200 bg-[var(--card)]/70 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/60 dark:text-slate-300"
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
  const segments = items.reduce((acc, item) => {
    const previousOffset = acc.length > 0 ? acc[acc.length - 1].nextOffset : 0;
    return [
      ...acc,
      {
        ...item,
        dash: `${item.pct} ${100 - item.pct}`,
        offset: previousOffset,
        nextOffset: previousOffset - item.pct,
      },
    ];
  }, []);

  return (
    <div className="glass-card min-w-0 p-5">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100">
        Subject Distribution
      </h2>

      {!hasData ? (
        <EmptyState
          title="No subject data yet"
          description="Practice mapped questions to see subject distribution."
        />
      ) : (
        <>
          <div className="relative mx-auto mb-4 h-36 w-36">
            <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="currentColor" strokeWidth="5" className="text-slate-100 dark:text-slate-800" />
              {segments.map((segment) => (
                <circle
                  key={segment.subject}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth="5"
                  strokeDasharray={segment.dash}
                  strokeDashoffset={segment.offset}
                />
              ))}
            </svg>
          </div>

          <div className="space-y-2">
            {items.map((subject) => (
              <div key={subject.subject} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-xs text-slate-500 dark:text-slate-400">{subject.subject}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)]">
                  <div className="h-full rounded-full" style={{ width: `${subject.pct}%`, background: subject.color }} />
                </div>
                <span className="w-8 text-right text-xs font-bold text-slate-900 dark:text-white">{subject.pct}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function SubjectPerformance({ data }) {
  const items = data?.items || [];
  const hasData = data?.status === "ready" && items.length > 0;

  return (
    <div className="glass-card min-w-0 p-5">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100">
        Subject Performance
      </h2>

      {!hasData ? (
        <EmptyState
          title="No subject performance yet"
          description="Answer mapped questions to calculate subject accuracy."
        />
      ) : (
        <div className="space-y-3">
          {items.map((subject) => (
            <div key={subject.subject}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{subject.subject}</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{formatPercent(subject.accuracy)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)]">
                <div className="h-full rounded-full" style={{ width: `${subject.accuracy || 0}%`, background: subject.color }} />
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
    <div className="glass-card min-w-0 p-5">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100">
        Chapter Performance
      </h2>

      {!hasData ? (
        <EmptyState
          title="Not enough chapter data yet"
          description="Complete more mapped PYQs or tests to compare chapter performance."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Needs Attention
            </p>
            <ChapterList chapters={weakest} />
          </div>
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Strongest
            </p>
            {strongest.length > 0 ? <ChapterList chapters={strongest} /> : <EmptyState title="No strong chapters yet" description="Keep practicing to establish strengths." />}
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterList({ chapters }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {chapters.map((chapter) => (
        <div key={`${chapter.subject}-${chapter.chapter}`} className="py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{chapter.chapter}</p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{chapter.subject}</p>
            </div>
            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${chapter.statusClassName}`}>
              {chapter.statusLabel}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)]">
              <div className="h-full rounded-full bg-brand dark:bg-brand" style={{ width: `${chapter.accuracy}%` }} />
            </div>
            <span className="w-10 text-right text-xs font-black text-slate-900 dark:text-white">{chapter.accuracy}%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{chapter.attempted} attempted</p>
        </div>
      ))}
    </div>
  );
}

export function TimeAnalytics({ data }) {
  const hasData = data?.status === "ready";

  return (
    <div className="glass-card min-w-0 p-5">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100">
        Speed & Time
      </h2>

      {!hasData ? (
        <EmptyState
          title="No reliable timing data yet"
          description="Submit timed tests to calculate speed and average time per question."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-[var(--surface-elevated)]/50">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Avg Time / Question</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{data.averageSecondsPerQuestion}s</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-[var(--surface-elevated)]/50">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Speed</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{data.questionsPerMinute} q/min</p>
            </div>
          </div>

          {data.recent?.length > 0 && (
            <div className="mt-4 flex h-28 items-end gap-2">
              {data.recent.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="flex h-20 w-full items-end rounded-t-md bg-slate-100 dark:bg-[var(--surface-elevated)]">
                    <div
                      className="w-full rounded-t-md bg-indigo-500/80"
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
