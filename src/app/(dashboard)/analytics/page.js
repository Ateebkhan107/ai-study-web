"use client";

import { useState, useEffect } from "react";
import OverviewCards from "@/components/analytics/OverviewCards";
import { PerformanceTrend } from "@/components/analytics/ChartComponents";
import WeakTopics from "@/components/analytics/WeakTopics";
import WhatToDoNext from "@/components/analytics/WhatToDoNext";

export default function AnalyticsPage() {
  const [dbData, setDbData]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTrack, setActiveTrack] = useState("jee");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const match = document.cookie.match(new RegExp("(^| )prepzii_track=([^;]+)"));
        const clientTrack = match ? match[2].toLowerCase() : "jee";
        setActiveTrack(clientTrack);

        const response = await fetch("/api/analytics");
        if (response.ok) {
          const data = await response.json();
          setDbData(data);
          if (data.track) setActiveTrack(data.track.toLowerCase());
        }
      } catch (err) {
        console.error("Analytics fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-56" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-56 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          <div className="h-56 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Analytics
        </p>
        <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">
          Your Performance
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Updated today · {activeTrack.toUpperCase()} track
        </p>
      </div>

      {/* Section 1 — 4 stat cards */}
      <OverviewCards track={activeTrack} />

      {/* Section 2 — Performance trend (the one useful chart) */}
      <PerformanceTrend track={activeTrack} />

      {/* Section 3 — Weak topics (clean list, no bar chart) */}
      <WeakTopics track={activeTrack} dbTopics={dbData?.topics} />

      {/* Section 4 — What to do next (replaces all AI boxes) */}
      <WhatToDoNext track={activeTrack} />

    </div>
  );
}