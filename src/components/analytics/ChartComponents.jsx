"use client";

import { useEffect, useRef } from "react";
import {
  PERFORMANCE_WEEKS,
  PERFORMANCE_SERIES,
  SUBJECT_DISTRIBUTION,
  RADAR_LABELS,
  RADAR_YOU,
  RADAR_TOPPER,
  TOPIC_WEAKNESS,
  TIME_BY_DAY,
} from "@/lib/analyticsData";

// ── shared Chart.js loader ──────────────────────────────────────
function useChart(canvasId, buildConfig) {
  const chartRef = useRef(null);
  useEffect(() => {
    let chart;
    const init = () => {
      const canvas = document.getElementById(canvasId);
      if (!canvas || !window.Chart) return;
      if (chartRef.current) chartRef.current.destroy();
      const isDark = document.documentElement.classList.contains("dark");
      chart = new window.Chart(canvas, buildConfig(isDark));
      chartRef.current = chart;
    };

    if (window.Chart) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
      script.onload = init;
      document.head.appendChild(script);
    }
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

const gridColor  = (dark) => dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
const tickColor  = (dark) => dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
const basePlugin = { legend: { display: false } };

// ─────────────────────────────────────────────────────────────────
// PerformanceTrend — Line chart
// ─────────────────────────────────────────────────────────────────
export function PerformanceTrend() {
  useChart("perfTrendChart", (dark) => ({
    type: "line",
    data: {
      labels: PERFORMANCE_WEEKS,
      datasets: PERFORMANCE_SERIES.map((s) => ({
        label:           s.subject,
        data:            s.data,
        borderColor:     s.color,
        backgroundColor: "transparent",
        borderDash:      s.dash,
        tension:         0.4,
        pointRadius:     3,
        pointBackgroundColor: s.color,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: basePlugin,
      scales: {
        x: { grid: { color: gridColor(dark) }, ticks: { color: tickColor(dark), font: { size: 11 } } },
        y: {
          min: 50, max: 90,
          grid: { color: gridColor(dark) },
          ticks: { color: tickColor(dark), font: { size: 11 }, callback: (v) => v + "%" },
        },
      },
    },
  }));

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm h-full">
      <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-3">
        Performance Trend
      </h2>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3">
        {PERFORMANCE_SERIES.map((s) => (
          <span key={s.subject} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            {s.subject}
          </span>
        ))}
      </div>
      <div className="relative h-56">
        <canvas id="perfTrendChart" role="img" aria-label="Line chart showing weekly accuracy trends across Physics, Chemistry, Maths and Biology over 8 weeks">
          Performance trending upward across all subjects over 8 weeks.
        </canvas>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SubjectDistribution — Donut + progress bars
// ─────────────────────────────────────────────────────────────────
export function SubjectDistribution() {
  useChart("subjectPieChart", () => ({
    type: "doughnut",
    data: {
      labels: SUBJECT_DISTRIBUTION.map((s) => s.subject),
      datasets: [{
        data: SUBJECT_DISTRIBUTION.map((s) => s.pct),
        backgroundColor: SUBJECT_DISTRIBUTION.map((s) => s.color),
        borderWidth: 0,
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: basePlugin,
      cutout: "68%",
    },
  }));

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm h-full">
      <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-3">
        Subject Distribution
      </h2>
      <div className="relative h-36 mb-4">
        <canvas id="subjectPieChart" role="img" aria-label="Donut chart: Physics 32%, Chemistry 28%, Maths 24%, Biology 16%">
          Physics 32%, Chemistry 28%, Maths 24%, Biology 16%.
        </canvas>
      </div>
      <div className="space-y-2">
        {SUBJECT_DISTRIBUTION.map((s) => (
          <div key={s.subject} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">{s.subject}</span>
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${s.pct}%`, background: s.color }}
              />
            </div>
            <span className="text-xs font-bold text-black dark:text-white w-8 text-right">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SkillRadar — Radar chart
// ─────────────────────────────────────────────────────────────────
export function SkillRadar() {
  useChart("skillRadarChart", (dark) => ({
    type: "radar",
    data: {
      labels: RADAR_LABELS,
      datasets: [
        {
          label: "You",
          data: RADAR_YOU,
          borderColor: "#378ADD",
          backgroundColor: "rgba(55,138,221,0.15)",
          pointBackgroundColor: "#378ADD",
          borderDash: [],
        },
        {
          label: "Topper avg",
          data: RADAR_TOPPER,
          borderColor: "#D4537E",
          backgroundColor: "rgba(212,83,126,0.08)",
          pointBackgroundColor: "#D4537E",
          borderDash: [4, 4],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: basePlugin,
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { display: false },
          grid: { color: gridColor(dark) },
          pointLabels: { color: tickColor(dark), font: { size: 11 } },
        },
      },
    },
  }));

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-3">
        Skill Comparison
      </h2>
      <div className="flex gap-4 mb-3">
        {[{ label: "You", color: "#378ADD" }, { label: "Topper avg", color: "#D4537E" }].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
      <div className="relative h-60">
        <canvas id="skillRadarChart" role="img" aria-label="Radar chart comparing skill levels across Mechanics, Organic Chem, Calculus, Genetics and Thermodynamics. You score lower in Calculus and Organic Chemistry compared to toppers.">
          You score lower in Calculus and Organic Chemistry compared to toppers.
        </canvas>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TopicWeakness — Horizontal bar + ranked list
// ─────────────────────────────────────────────────────────────────
export function TopicWeakness() {
  useChart("topicBarChart", (dark) => ({
    type: "bar",
    data: {
      labels: TOPIC_WEAKNESS.map((t) => t.topic),
      datasets: [{
        label: "Accuracy %",
        data: TOPIC_WEAKNESS.map((t) => t.accuracy),
        backgroundColor: TOPIC_WEAKNESS.map((t) =>
          t.severity === "good" ? "#1D9E75" : t.severity === "warn" ? "#BA7517" : "#E24B4A"
        ),
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: basePlugin,
      scales: {
        x: {
          min: 0, max: 100,
          grid: { color: gridColor(dark) },
          ticks: { color: tickColor(dark), font: { size: 11 }, callback: (v) => v + "%" },
        },
        y: { grid: { display: false }, ticks: { color: tickColor(dark), font: { size: 11 } } },
      },
    },
  }));

  const severityClass = {
    critical: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
    warn:     "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    good:     "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
  };
  const severityLabel = { critical: "Critical", warn: "Needs work", good: "Strong" };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-3">
        Topic Weakness Detection
      </h2>
      <div className="relative h-48 mb-4">
        <canvas id="topicBarChart" role="img" aria-label="Horizontal bar chart showing accuracy by topic. Weakest: Integration 38%, Organic Reactions 42%.">
          Weakest topics are Integration, Organic Reactions and Kinematics.
        </canvas>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {TOPIC_WEAKNESS.filter((t) => t.severity !== "good").map((t) => (
          <div key={t.topic} className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">{t.topic}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${severityClass[t.severity]}`}>
              {t.accuracy}% — {severityLabel[t.severity]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TimeAnalytics — Bar chart + summary stats
// ─────────────────────────────────────────────────────────────────
export function TimeAnalytics() {
  useChart("timeBarChart", (dark) => ({
    type: "bar",
    data: {
      labels: TIME_BY_DAY.map((d) => d.day),
      datasets: [{
        label: "Hours",
        data: TIME_BY_DAY.map((d) => d.hours),
        backgroundColor: dark ? "rgba(55,138,221,0.7)" : "#378ADD",
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: basePlugin,
      scales: {
        x: { grid: { display: false }, ticks: { color: tickColor(dark), font: { size: 11 } } },
        y: { max: 5, grid: { color: gridColor(dark) }, ticks: { color: tickColor(dark), font: { size: 11 }, stepSize: 1 } },
      },
    },
  }));

  const avg = (TIME_BY_DAY.reduce((s, d) => s + d.hours, 0) / TIME_BY_DAY.length).toFixed(1);
  const peak = TIME_BY_DAY.reduce((a, b) => a.hours > b.hours ? a : b).day;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-3">
        Time Analytics
      </h2>
      <div className="relative h-40 mb-4">
        <canvas id="timeBarChart" role="img" aria-label="Bar chart showing daily study hours. Peak on Saturday 4h, low on Sunday 1h.">
          Study peaks on Saturday, dips on Sunday.
        </canvas>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[{ label: "Daily avg", value: `${avg}h` }, { label: "Peak day", value: peak }].map((s) => (
          <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-xl font-black text-black dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}