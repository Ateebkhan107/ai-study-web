"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Brain, TrendingUp, Trophy } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import OverviewCards from "@/components/analytics/OverviewCards";
import {
  ChapterPerformance,
  PerformanceTrend,
  SubjectDistribution,
  SubjectPerformance,
  TimeAnalytics,
} from "@/components/analytics/ChartComponents";
import { ExamReadiness, StudyHeatmap } from "@/components/analytics/NonChartComponents";
import WhatToDoNext from "@/components/analytics/WhatToDoNext";
import Leaderboard from "@/components/analytics/Leaderboard";
import PageWrapper from "@/components/PageWrapper";
import { getUserAnalytics } from "@/services/analytics";

const TABS = [
  { id: "overview", label: "Overview", Icon: BarChart3 },
  { id: "charts", label: "Charts", Icon: TrendingUp },
  { id: "ai-insights", label: "AI Insights", Icon: Brain },
  { id: "leaderboard", label: "Leaderboard", Icon: Trophy },
];

function getCookieTrack() {
  if (typeof document === "undefined") return "JEE";
  const match = document.cookie.match(new RegExp("(^| )prepzii_track=([^;]+)"));
  return match ? decodeURIComponent(match[2]).toUpperCase() : "JEE";
}

function LoadingState() {
  return (
    <PageWrapper title="Your Performance" subtitle="Loading your analytics" badge="Analytics Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-28 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
        <div className="h-72 rounded-2xl skeleton-shimmer" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="h-48 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

function ProLock() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-slideUp" style={{ animationDelay: "150ms" }}>
      <div className="glass-card max-w-md p-8 text-center">
        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-indigo-500 opacity-70" />
        <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">Advanced Analytics is Pro</h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Leaderboard stays free. Upgrade to unlock deep trends, weak chapters, study heatmaps, and performance analytics.
        </p>
        <Link
          href="/pro"
          className="inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-black text-white"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}

function AIComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-slideUp" style={{ animationDelay: "150ms" }}>
      <div className="glass-card w-full max-w-xl p-8 text-center sm:p-10">
        <Brain className="mx-auto mb-4 h-12 w-12 text-blue-500 opacity-60" />
        <h2 className="mb-2 text-2xl font-bold text-slate-800 dark:text-slate-100">AI Insights</h2>
        <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-slate-400">
          Personalized study intelligence is coming to PrepZii, including performance summaries, weak-area explanations, study-plan suggestions, and recommendations.
        </p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState(() => getCookieTrack());
  const [activeTab, setActiveTab] = useState("overview");
  const [advancedAnalyticsAllowed, setAdvancedAnalyticsAllowed] = useState(false);

  useEffect(() => {
    async function syncTrackFromCookie() {
      await Promise.resolve();
      setActiveTrack(getCookieTrack());
    }

    syncTrackFromCookie();
  }, []);

  useEffect(() => {
    async function loadAnalytics() {
      if (!isLoaded) return;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserAnalytics(user.id, activeTrack);
        setStats(data);
        setAdvancedAnalyticsAllowed(true);
        if (data?.track) setActiveTrack(data.track);
      } catch (error) {
        if (error?.status !== 403) {
          console.error("Failed to load user stats:", error);
        }
        setAdvancedAnalyticsAllowed(false);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [isLoaded, user, activeTrack]);

  if (loading) return <LoadingState />;

  const showAnalyticsLock = !advancedAnalyticsAllowed && activeTab !== "leaderboard";

  return (
    <PageWrapper
      title="Your Performance"
      subtitle={`Updated today · ${activeTrack} track`}
      badge="Analytics Dashboard"
    >
      <section className="animate-slideUp" style={{ animationDelay: "75ms" }}>
        <div className="w-full rounded-xl border border-slate-200/60 bg-[var(--card)]/70 p-1 shadow-sm backdrop-blur-xl dark:border-[var(--border)]/50 dark:bg-[var(--surface)]/60 sm:inline-flex sm:w-auto sm:max-w-full sm:overflow-x-auto">
          <div className="grid w-full grid-cols-4 items-center gap-0.5 sm:flex sm:min-w-max sm:gap-1">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-[10.5px] font-semibold transition-all duration-200 sm:shrink-0 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
                    active
                      ? "bg-slate-900 text-white shadow-sm dark:bg-indigo-500 dark:text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-[var(--card)]/5 dark:hover:text-slate-200"
                  }`}
                >
                  <tab.Icon className="hidden h-3.5 w-3.5 shrink-0 sm:inline" size={14} />
                  <span className="min-w-0 truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {showAnalyticsLock && <ProLock />}

      {activeTab === "overview" && !showAnalyticsLock && (
        <div className="space-y-6 sm:space-y-8">
          <section className="animate-slideUp" style={{ animationDelay: "150ms" }}>
            <OverviewCards stats={stats} />
          </section>

          <section className="animate-slideUp" style={{ animationDelay: "225ms" }}>
            <PerformanceTrend data={stats?.performanceTrend} />
          </section>

          <section className="grid grid-cols-1 gap-4 animate-slideUp lg:grid-cols-2 lg:gap-6" style={{ animationDelay: "300ms" }}>
            <StudyHeatmap heatmap={stats?.heatmap} />
            <ExamReadiness readiness={stats?.examReadiness} />
          </section>

          <section className="animate-slideUp" style={{ animationDelay: "375ms" }}>
            <WhatToDoNext action={stats?.nextAction} />
          </section>
        </div>
      )}

      {activeTab === "charts" && !showAnalyticsLock && (
        <div className="space-y-6 sm:space-y-8">
          <section className="grid grid-cols-1 gap-4 animate-slideUp lg:grid-cols-2 lg:gap-6" style={{ animationDelay: "150ms" }}>
            <SubjectDistribution data={stats?.subjectDistribution} />
            <SubjectPerformance data={stats?.subjectPerformance} />
          </section>

          <section className="grid grid-cols-1 gap-4 animate-slideUp lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)] lg:gap-6" style={{ animationDelay: "225ms" }}>
            <ChapterPerformance data={stats?.chapterPerformance} />
            <TimeAnalytics data={stats?.timeAnalytics} />
          </section>
        </div>
      )}

      {activeTab === "ai-insights" && !showAnalyticsLock && <AIComingSoon />}

      {activeTab === "leaderboard" && (
        <section className="animate-slideUp" style={{ animationDelay: "150ms" }}>
          <Leaderboard />
        </section>
      )}
    </PageWrapper>
  );
}
