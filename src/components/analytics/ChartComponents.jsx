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
function useChart(canvasId, buildConfig, dependencies = []) {
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

    // Re-render chart when dark mode is toggled
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "class") {
          init();
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      if (chartRef.current) chartRef.current.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies); // Hook responds immediately when track changes
}


const gridColor  = (dark) => dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
const tickColor  = (dark) => dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
const basePlugin = { legend: { display: false } };

// ─────────────────────────────────────────────────────────────────
// PerformanceTrend — Line chart
// ─────────────────────────────────────────────────────────────────
export function PerformanceTrend({ track, data = [] }) {

  const chartData =
    data.length > 0
      ? data
      : [
          { label: "No tests", score: 0 }
        ];


  useChart(
    "performance-chart",
    (isDark) => ({
      type: "line",
      data: {
        labels: chartData.map((item) => item.label),
        datasets: [
          {
            label: "Score %",
            data: chartData.map((item) => item.score),
            tension: 0.4,
            showLine: true,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderColor: "#6366F1",
            backgroundColor: isDark
              ? "rgba(99,102,241,0.15)"
              : "rgba(99,102,241,0.1)",
            pointBackgroundColor: "#6366F1",
            pointBorderColor: isDark ? "#0f172a" : "#ffffff",
            pointBorderWidth: 2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: gridColor(isDark) },
            ticks: { color: tickColor(isDark), callback: (value) => value + "%" },
          },
          x: {
            grid: { display: false },
            ticks: { color: tickColor(isDark) },
          },
        },
      },
    }),
    [track, data]
  );


  return (

    <div className="glass-card p-5">

      <div className="mb-5">

        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100">
          Performance Trend
        </h2>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          Your test score improvement
        </p>

      </div>


      <div className="h-72">

        <canvas id="performance-chart"></canvas>

      </div>


    </div>

  );

}

// ─────────────────────────────────────────────────────────────────
// SubjectDistribution — Donut + progress bars
// ─────────────────────────────────────────────────────────────────
export function SubjectDistribution({ track = "jee" }) {
  const filteredDistribution = SUBJECT_DISTRIBUTION.filter((s) => {
    const sub = s.subject.toLowerCase();
    if (track === "jee" && sub === "biology") return false;
    if (track === "neet" && (sub === "maths" || sub === "mathematics")) return false;
    return true;
  });

  // Scale remaining segments proportionally to maintain exactly 100% donut weight
  const totalPct = filteredDistribution.reduce((sum, item) => sum + item.pct, 0);
  const scaledDistribution = filteredDistribution.map((item) => ({
    ...item,
    pct: Math.round((item.pct / totalPct) * 100),
  }));

  useChart("subjectPieChart", () => ({
    type: "doughnut",
    data: {
      labels: scaledDistribution.map((s) => s.subject),
      datasets: [{
        data: scaledDistribution.map((s) => s.pct),
        backgroundColor: scaledDistribution.map((s) => s.color),
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
  }), [track]);

  return (
    <div className="glass-card p-5 h-full">
      <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-3">
        Subject Distribution
      </h2>
      <div className="relative h-36 mb-4">
        <canvas id="subjectPieChart" role="img" aria-label="Donut chart showing track distribution metrics">
          Subject distribution ratios matching focus configurations.
        </canvas>
      </div>
      <div className="space-y-2">
        {scaledDistribution.map((s) => (
          <div key={s.subject} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">{s.subject}</span>
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${s.pct}%`, background: s.color }}
              />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white w-8 text-right">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SkillRadar — Radar chart
// ─────────────────────────────────────────────────────────────────
export function SkillRadar({ track = "jee" }) {
  const filteredRadarIndices = [];
  RADAR_LABELS.forEach((label, index) => {
    if (track === "jee" && label.toLowerCase().includes("genetics")) return;
    if (track === "neet" && label.toLowerCase().includes("calculus")) return;
    filteredRadarIndices.push(index);
  });

  const filteredLabels = filteredRadarIndices.map((i) => RADAR_LABELS[i]);
  const filteredYou = filteredRadarIndices.map((i) => RADAR_YOU[i]);
  const filteredTopper = filteredRadarIndices.map((i) => RADAR_TOPPER[i]);

  useChart("skillRadarChart", (dark) => ({
    type: "radar",
    data: {
      labels: filteredLabels,
      datasets: [
        {
          label: "You",
          data: filteredYou,
          borderColor: "#378ADD",
          backgroundColor: "rgba(55,138,221,0.15)",
          pointBackgroundColor: "#378ADD",
          borderDash: [],
        },
        {
          label: "Topper avg",
          data: filteredTopper,
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
  }), [track]);

  return (
    <div className="glass-card p-5">
      <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-3">
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
        <canvas id="skillRadarChart" role="img" aria-label="Radar chart comparing skill metrics">
          Skill comparison parameters balanced per track criteria bounds.
        </canvas>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TopicWeakness — Horizontal bar + ranked list
// ─────────────────────────────────────────────────────────────────
export function TopicWeakness({ track = "jee" }) {
  const isNeet = track === "neet";

  // Translate topic matrix items to maintain row count parity cleanly
  const processedTopics = TOPIC_WEAKNESS.map((t) => {
    if (isNeet && t.topic === "Integration") {
      return { ...t, topic: "Genetics Maps" };
    }
    return t;
  });

  useChart("topicBarChart", (dark) => ({
    type: "bar",
    data: {
      labels: processedTopics.map((t) => t.topic),
      datasets: [{
        label: "Accuracy %",
        data: processedTopics.map((t) => t.accuracy),
        backgroundColor: processedTopics.map((t) =>
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
  }), [track]);

  const severityClass = {
    critical: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
    warn:     "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    good:     "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
  };
  const severityLabel = { critical: "Critical", warn: "Needs work", good: "Strong" };

  return (
    <div className="glass-card p-5">
      <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-3">
        Topic Weakness Detection
      </h2>
      <div className="relative h-48 mb-4">
        <canvas id="topicBarChart" role="img" aria-label="Horizontal bar chart showing accuracy parameters">
          Weakest topics sorted relative to active track categories.
        </canvas>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {processedTopics.filter((t) => t.severity !== "good").map((t) => (
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
export function TimeAnalytics({ track = "jee" }) {
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
  }), [track]);

  const avg = (TIME_BY_DAY.reduce((s, d) => s + d.hours, 0) / TIME_BY_DAY.length).toFixed(1);
  const peak = TIME_BY_DAY.reduce((a, b) => a.hours > b.hours ? a : b).day;

  return (
    <div className="glass-card p-5">
      <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-3">
        Time Analytics
      </h2>
      <div className="relative h-40 mb-4">
        <canvas id="timeBarChart" role="img" aria-label="Bar chart showing daily study hours. Peak on Saturday 4h, low on Sunday 1h.">
          Study peaks on Saturday, dips on Sunday.
        </canvas>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[{ label: "Daily avg", value: `${avg}h` }, { label: "Peak day", value: peak }].map((s) => (
          <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}