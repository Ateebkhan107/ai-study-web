"use client"; // 👈 1. Switch to a client context to run active live fetches

import { useState, useEffect } from "react";
import OverviewCards from "@/components/analytics/OverviewCards";
import {
  PerformanceTrend,
  SubjectDistribution,
  SkillRadar,
  TopicWeakness,
  TimeAnalytics,
} from "@/components/analytics/ChartComponents";
import {
  StudyHeatmap,
  ExamReadiness,
  PYQIntelligence,
} from "@/components/analytics/NonChartComponents";
import {
  SmartPrediction,
  AdaptiveLearning,
  AIStudyPlanner,
  AIRecommendations,
} from "@/components/analytics/AIComponents";

export default function AnalyticsPage() {
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState("jee");

  // 📡 Step 1: Read tracking cookie and live scores simultaneously on screen mount
  useEffect(() => {
    async function fetchLiveAnalytics() {
      try {
        // Look up client cookie fallback first
        const match = document.cookie.match(new RegExp('(^| )prepzii_track=([^;]+)'));
        const clientTrack = match ? match[2].toLowerCase() : "jee";
        setActiveTrack(clientTrack);

        // Fetch real-time data from our new API pipeline
        const response = await fetch("/api/analytics");
        if (response.ok) {
          const data = await response.json();
          setDbData(data);
          if (data.track) {
            setActiveTrack(data.track.toLowerCase());
          }
        }
      } catch (error) {
        console.error("Failed to read server analytics parameters:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveAnalytics();
  }, []);

  // Show a premium loading animation skeleton while talking to the database vault
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 text-center animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-48" />
        <div className="h-32 bg-gray-100 dark:bg-gray-900 rounded-3xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-3xl" />
          <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Fallback engine score configuration if database fields are empty
  const liveReadinessScore = dbData?.readinessScore || 60;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Analytics
        </p>
        <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">
          Your Performance Overview
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Last updated: today · Vault Source Sync Live ✅
        </p>
      </div>

      {/* Pass track context down to isolate cards, charts, and recommendations */}
      <OverviewCards track={activeTrack} readinessScore={liveReadinessScore} />

      {/* Performance trend + Subject distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <PerformanceTrend track={activeTrack} />
        </div>
        <div className="lg:col-span-2">
          <SubjectDistribution track={activeTrack} />
        </div>
      </div>

      {/* Skill radar + Topic weakness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillRadar track={activeTrack} />
        <TopicWeakness track={activeTrack} dbTopics={dbData?.topics} />
      </div>

      {/* Study heatmap */}
      <StudyHeatmap track={activeTrack} />

      {/* PYQ intelligence + Time analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PYQIntelligence track={activeTrack} />
        <TimeAnalytics track={activeTrack} />
      </div>

      {/* Exam readiness */}
      <ExamReadiness track={activeTrack} readinessScore={liveReadinessScore} />

      {/* AI sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SmartPrediction track={activeTrack} />
        <AdaptiveLearning track={activeTrack} />
        <AIStudyPlanner track={activeTrack} />
      </div>

      {/* AI recommendations */}
      <AIRecommendations track={activeTrack} />
    </div>
  );
}