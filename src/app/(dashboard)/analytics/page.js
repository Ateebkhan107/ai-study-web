"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, TrendingUp, Brain, Trophy } from "lucide-react";

import OverviewCards from "@/components/analytics/OverviewCards";
import { PerformanceTrend, SubjectDistribution, SkillRadar, TopicWeakness, TimeAnalytics } from "@/components/analytics/ChartComponents";
import { StudyHeatmap, ExamReadiness, PYQIntelligence } from "@/components/analytics/NonChartComponents";
import WeakTopics from "@/components/analytics/WeakTopics";
import WhatToDoNext from "@/components/analytics/WhatToDoNext";
import { SmartPrediction, AdaptiveLearning, AIStudyPlanner, AIRecommendations } from "@/components/analytics/AIComponents";
import Leaderboard from "@/components/analytics/Leaderboard";

import { getUserAnalytics } from "@/services/analytics";
import { useUser } from "@clerk/nextjs";
import PageWrapper from "@/components/PageWrapper";

const TABS = [
  { id: "overview",    label: "Overview",     Icon: BarChart3 },
  { id: "charts",      label: "Charts",       Icon: TrendingUp },
  { id: "ai-insights", label: "AI Insights",  Icon: Brain },
  { id: "leaderboard", label: "Leaderboard",  Icon: Trophy },
];

export default function AnalyticsPage() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState("jee");
  const [activeTab, setActiveTab] = useState("overview");
  const [access, setAccess] = useState(null);

  useEffect(() => {
    async function loadAccess() {
      try {
        const response = await fetch("/api/access", { cache: "no-store" });
        if (response.ok) {
          setAccess(await response.json());
        }
      } catch (error) {
        console.error("Failed to load access context:", error);
      }
    }

    if (user) loadAccess();
  }, [user]);

  useEffect(() => {
    async function loadUserStats(trackToLoad) {
      if (!access) return;
      if (!access.isPro) {
        setStats(null);
        return;
      }
      try {
        const data = await getUserAnalytics(user.id, trackToLoad);
        setStats(data);
      } catch (err) {
        console.error("Failed to load user stats:", err);
        // Fallback or ignore; components will use mock data if stats is null
      }
    }

    if (user && activeTrack) {
      loadUserStats(activeTrack);
    }
  }, [user, activeTrack, access]);
  useEffect(() => {
    const match = document.cookie.match(
      new RegExp("(^| )prepzii_track=([^;]+)")
    );
    const clientTrack = match ? match[2].toLowerCase() : "jee";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTrack(clientTrack);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <PageWrapper title="Your Performance" badge="Analytics Dashboard 📊">
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
          <div className="h-72 rounded-2xl skeleton-shimmer" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  const advancedAnalyticsAllowed = Boolean(access?.isPro);
  const showAnalyticsLock = !advancedAnalyticsAllowed && activeTab !== "leaderboard";

  return (
    <PageWrapper
      title="Your Performance"
      subtitle={`Updated today · ${activeTrack.toUpperCase()} track`}
      badge="Analytics Dashboard 📊"
    >
      {/* ── Tab Navigation ── */}
      <section className="animate-slideUp" style={{ animationDelay: "75ms" }}>
        <div className="flex max-w-full items-center overflow-x-auto bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-xl p-1 gap-1 shadow-sm sm:inline-flex sm:flex-wrap">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <tab.Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Overview Tab ── */}
      {showAnalyticsLock && (
        <div className="flex flex-col items-center justify-center py-16 animate-slideUp" style={{ animationDelay: "150ms" }}>
          <div className="glass-card max-w-md p-8 text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-indigo-500 opacity-70" />
            <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">Advanced Analytics is Pro</h2>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Leaderboard stays free. Upgrade to unlock deep trends, weak chapters, study heatmaps, and advanced performance insights.
            </p>
            <Link
              href="/pro"
              className="inline-flex rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-black text-white"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}

      {activeTab === "overview" && !showAnalyticsLock && (
        <div className="space-y-8">
          <section className="animate-slideUp" style={{ animationDelay: "150ms" }}>
            <OverviewCards track={activeTrack} stats={stats} />
          </section>

          <section className="animate-slideUp" style={{ animationDelay: "225ms" }}>
            <PerformanceTrend track={activeTrack} data={stats?.performanceTrend || []} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slideUp" style={{ animationDelay: "300ms" }}>
            <StudyHeatmap heatmapData={stats?.heatmapValues} />
            <ExamReadiness
              overall={stats?.overallReadiness}
              breakdown={stats?.readinessBreakdown}
            />
          </section>

          <section className="animate-slideUp" style={{ animationDelay: "375ms" }}>
            <WeakTopics track={activeTrack} dbTopics={stats?.weakTopics} />
          </section>

          <section className="animate-slideUp" style={{ animationDelay: "450ms" }}>
            <WhatToDoNext track={activeTrack} weakTopics={stats?.weakTopics} />
          </section>
        </div>
      )}

      {/* ── Charts Tab ── */}
      {activeTab === "charts" && !showAnalyticsLock && (
        <div className="space-y-8">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slideUp" style={{ animationDelay: "150ms" }}>
            <SubjectDistribution track={activeTrack} liveData={stats?.subjectDistribution} />
            <SkillRadar track={activeTrack} liveLabels={stats?.radarLabels} liveYou={stats?.radarYou} liveTopper={stats?.radarTopper} />
          </section>

          <section className="animate-slideUp" style={{ animationDelay: "225ms" }}>
            <TopicWeakness track={activeTrack} liveData={stats?.topicWeakness} />
          </section>

          <section className="animate-slideUp" style={{ animationDelay: "300ms" }}>
            <TimeAnalytics track={activeTrack} liveData={stats?.timeByDay} />
          </section>
        </div>
      )}

      {/* ── AI Insights Tab ── */}
      {activeTab === "ai-insights" && !showAnalyticsLock && (
        <div className="flex flex-col items-center justify-center py-20 animate-slideUp" style={{ animationDelay: "150ms" }}>
          <div className="glass-card p-10 max-w-md w-full text-center">
            <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">AI Insights</h2>
            <p className="text-slate-500 dark:text-slate-400">Coming soon. Stay updated!</p>
          </div>
        </div>
      )}

      {/* ── Leaderboard Tab ── */}
      {activeTab === "leaderboard" && (
        <section className="animate-slideUp" style={{ animationDelay: "150ms" }}>
          <Leaderboard />
        </section>
      )}
    </PageWrapper>
  );
}
