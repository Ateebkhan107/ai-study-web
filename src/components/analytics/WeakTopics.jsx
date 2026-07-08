"use client";

const DEFAULT_TOPICS_JEE = [
  { topic: "Integration",       subject: "Maths",     accuracy: 38, severity: "critical" },
  { topic: "Kinematics",        subject: "Physics",   accuracy: 44, severity: "critical" },
  { topic: "Organic Reactions", subject: "Chemistry", accuracy: 42, severity: "critical" },
  { topic: "Thermodynamics",    subject: "Chemistry", accuracy: 51, severity: "warn"     },
  { topic: "Optics",            subject: "Physics",   accuracy: 79, severity: "good"     },
  { topic: "Genetics",          subject: "Biology",   accuracy: 81, severity: "good"     },
];

const DEFAULT_TOPICS_NEET = [
  { topic: "Genetics Maps",     subject: "Biology",   accuracy: 38, severity: "critical" },
  { topic: "Organic Reactions", subject: "Chemistry", accuracy: 42, severity: "critical" },
  { topic: "Thermodynamics",    subject: "Chemistry", accuracy: 51, severity: "warn"     },
  { topic: "Kinematics",        subject: "Physics",   accuracy: 44, severity: "critical" },
  { topic: "Optics",            subject: "Physics",   accuracy: 79, severity: "good"     },
  { topic: "Cell Biology",      subject: "Biology",   accuracy: 83, severity: "good"     },
];

function getSeverity(raw, accuracy) {
  if (typeof raw === "string") {
    const s = raw.toLowerCase().trim();
    if (["critical", "danger", "red", "weak"].includes(s)) return "critical";
    if (["warn", "warning", "medium", "yellow", "avg", "average"].includes(s)) return "warn";
    if (["good", "strong", "green", "high"].includes(s)) return "good";
  }
  const pct = typeof accuracy === "number" ? accuracy : 50;
  if (pct < 50) return "critical";
  if (pct < 70) return "warn";
  return "good";
}

const CFG = {
  critical: {
    dot:   "bg-black dark:bg-white",
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    label: "Critical",
  },
  warn: {
    dot:   "bg-gray-400 dark:bg-gray-500",
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
    label: "Needs work",
  },
  good: {
    dot:   "bg-gray-200 dark:bg-gray-700",
    badge: "bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500",
    label: "Good",
  },
};

const SORT = { critical: 0, warn: 1, good: 2 };

export default function WeakTopics({ track = "jee", dbTopics }) {
  const raw =
    Array.isArray(dbTopics) && dbTopics.length > 0
      ? dbTopics
      : track === "neet"
      ? DEFAULT_TOPICS_NEET
      : DEFAULT_TOPICS_JEE;

  const topics = raw.map((t) => {
    const acc =
      typeof t.accuracy === "number"
        ? t.accuracy
        : typeof t.efficiency === "number"
        ? t.efficiency
        : 50;
    const sev = getSeverity(t.severity, acc);
    return {
      topic:    t.topic   ?? "Unknown",
      subject:  t.subject ?? "",
      accuracy: acc,
      severity: sev,
    };
  });

  const sorted = [...topics].sort(
    (a, b) => SORT[a.severity] - SORT[b.severity]
  );

  const critCount = sorted.filter((t) => t.severity === "critical").length;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">
            Weak Topics
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {critCount} topic{critCount !== 1 ? "s" : ""} need urgent attention
          </p>
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {sorted.length} topics
        </span>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {sorted.map((t, idx) => {
          const cfg = CFG[t.severity] ?? CFG.warn;
          return (
            <div
              key={`${t.topic}-${idx}`}
              className="flex items-center gap-4 py-3.5"
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black dark:text-white truncate">
                  {t.topic}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{t.subject}</p>
              </div>

              <div className="hidden sm:flex items-center gap-3 w-40">
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black dark:bg-white rounded-full"
                    style={{ width: `${t.accuracy}%` }}
                  />
                </div>
                <span className="text-xs font-black text-black dark:text-white w-8 text-right tabular-nums">
                  {t.accuracy}%
                </span>
              </div>

              <span className="sm:hidden text-xs font-black text-black dark:text-white tabular-nums">
                {t.accuracy}%
              </span>

              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.badge}`}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}