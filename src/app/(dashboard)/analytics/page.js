"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { BarChart3, Brain, TrendingUp, Trophy } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import Leaderboard from "@/components/analytics/Leaderboard";
import PageWrapper from "@/components/PageWrapper";
import { getUserAnalytics } from "@/services/analytics";

const OverviewCards = dynamic(() => import("@/components/analytics/OverviewCards"), {
  loading: () => <ContentBlockSkeleton className="h-28" />,
});
const AnalyticsUnlockBanner = dynamic(() => import("@/components/analytics/AnalyticsUnlockBanner"), {
  loading: () => <ContentBlockSkeleton className="h-32" />,
});
const PerformanceTrend = dynamic(() => import("@/components/analytics/ChartComponents").then((mod) => mod.PerformanceTrend), {
  loading: () => <ContentBlockSkeleton className="h-72" />,
});
const SubjectDistribution = dynamic(() => import("@/components/analytics/ChartComponents").then((mod) => mod.SubjectDistribution), {
  loading: () => <ContentBlockSkeleton className="h-72" />,
});
const SubjectPerformance = dynamic(() => import("@/components/analytics/ChartComponents").then((mod) => mod.SubjectPerformance), {
  loading: () => <ContentBlockSkeleton className="h-72" />,
});
const ChapterPerformance = dynamic(() => import("@/components/analytics/ChartComponents").then((mod) => mod.ChapterPerformance), {
  loading: () => <ContentBlockSkeleton className="h-72" />,
});
const TimeAnalytics = dynamic(() => import("@/components/analytics/ChartComponents").then((mod) => mod.TimeAnalytics), {
  loading: () => <ContentBlockSkeleton className="h-72" />,
});
const ChartsUnlockHub = dynamic(() => import("@/components/analytics/ChartComponents").then((mod) => mod.ChartsUnlockHub), {
  loading: () => <ContentBlockSkeleton className="h-72" />,
});
const StudyHeatmap = dynamic(() => import("@/components/analytics/NonChartComponents").then((mod) => mod.StudyHeatmap), {
  loading: () => <ContentBlockSkeleton className="h-48" />,
});
const ExamReadiness = dynamic(() => import("@/components/analytics/NonChartComponents").then((mod) => mod.ExamReadiness), {
  loading: () => <ContentBlockSkeleton className="h-48" />,
});
const WhatToDoNext = dynamic(() => import("@/components/analytics/WhatToDoNext"), {
  loading: () => <ContentBlockSkeleton className="h-40" />,
});

const TABS = [
  { id: "overview", label: "Overview", Icon: BarChart3 },
  { id: "charts", label: "Charts", Icon: TrendingUp },
  { id: "ai-insights", label: "Insights", Icon: Brain },
  { id: "leaderboard", label: "Leaderboard", Icon: Trophy },
];

function getCookieTrack() {
  if (typeof document === "undefined") return "JEE";
  const match = document.cookie.match(new RegExp("(^| )prepzii_track=([^;]+)"));
  return match ? decodeURIComponent(match[2]).toUpperCase() : "JEE";
}

function ContentBlockSkeleton({ className = "h-48" }) {
  return <div className={`rounded-2xl skeleton-shimmer ${className}`} />;
}

function AnalyticsContentLoading() {
  return (
    <div className="space-y-6">
      <ContentBlockSkeleton className="h-28" />
      <ContentBlockSkeleton className="h-72" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[...Array(2)].map((_, index) => (
          <ContentBlockSkeleton key={index} className="h-48" />
        ))}
      </div>
    </div>
  );
}

function ProLock() {
  return (
    <div className="flex flex-col items-center justify-center py-8 animate-slideUp sm:py-16" style={{ animationDelay: "150ms" }}>
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-8">
        <BarChart3 className="mx-auto mb-4 h-10 w-10 text-slate-500 dark:text-slate-400" />
        <h2 className="mb-2 text-xl font-semibold text-slate-950 dark:text-white sm:text-2xl">Advanced Analytics is Pro</h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Leaderboard stays free. Upgrade to unlock deep trends, weak chapters, study heatmaps, and performance analytics.
        </p>
        <Link
          href="/pro"
          className="inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-slate-950"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}

function AIComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center py-8 animate-slideUp sm:py-16" style={{ animationDelay: "150ms" }}>
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-10">
        <Brain className="mx-auto mb-4 h-10 w-10 text-slate-500 dark:text-slate-400" />
        <h2 className="mb-2 text-xl font-semibold text-slate-950 dark:text-white sm:text-2xl">Insights</h2>
        <p className="mx-auto max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          Focused study recommendations are coming to PrepZii, including performance summaries, weak-area explanations, and revision planning.
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
    async function syncTabFromHash() {
      await Promise.resolve();
      if (window.location.hash === "#leaderboard") {
        setActiveTab("leaderboard");
      }
    }

    syncTabFromHash();
  }, []);

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

  const showAnalyticsLock = !loading && !advancedAnalyticsAllowed && activeTab !== "leaderboard";

  // Check if charts tab should show consolidated unlock hub vs full 4-panel grid
  const hasAnyChartData = Boolean(
    stats?.subjectDistribution?.status === "ready" ||
    stats?.subjectPerformance?.status === "ready" ||
    stats?.chapterPerformance?.status === "ready" ||
    stats?.timeAnalytics?.status === "ready"
  );

  return (
    <PageWrapper
      title="Performance Report"
      subtitle={`Updated today · ${activeTrack} track`}
      badge="Exam Analysis"
    >
      <section className="animate-slideUp" style={{ animationDelay: "75ms" }}>
        <div className="w-full border-b border-slate-200 dark:border-[var(--border-subtle)] sm:max-w-full sm:overflow-x-auto">
          <div className="grid w-full grid-cols-4 items-end gap-0 sm:flex sm:min-w-max sm:gap-6">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-w-0 items-center justify-center gap-1 border-b-2 px-1.5 py-3 text-[11px] font-medium transition-colors duration-150 sm:shrink-0 sm:gap-2 sm:px-0 sm:text-sm ${
                    active
                      ? "border-brand text-slate-950 dark:text-white"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <tab.Icon className="hidden h-3.5 w-3.5 shrink-0 sm:inline" size={14} aria-hidden="true" />
                  <span className="min-w-0 truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {loading && activeTab !== "leaderboard" && <AnalyticsContentLoading />}

      {showAnalyticsLock && <ProLock />}

      {activeTab === "overview" && !loading && !showAnalyticsLock && (
        <div className="space-y-6 sm:space-y-8">
          {/* Consolidated Getting Started / Unlock Full Analytics Banner */}
          <section className="animate-slideUp" style={{ animationDelay: "100ms" }}>
            <AnalyticsUnlockBanner stats={stats} />
          </section>

          {/* Elevated Stat Cards */}
          <section className="animate-slideUp" style={{ animationDelay: "175ms" }}>
            <OverviewCards stats={stats} />
          </section>

          {/* Performance Trend with preview curve */}
          <section className="animate-slideUp" style={{ animationDelay: "250ms" }}>
            <PerformanceTrend data={stats?.performanceTrend} />
          </section>

          {/* Heatmap (preserved exactly) & Alive Multi-Segment Exam Readiness */}
          <section className="grid grid-cols-1 gap-4 animate-slideUp lg:grid-cols-2 lg:gap-6" style={{ animationDelay: "325ms" }}>
            <StudyHeatmap heatmap={stats?.heatmap} />
            <ExamReadiness readiness={stats?.examReadiness} />
          </section>

          {/* Next Action */}
          <section className="animate-slideUp" style={{ animationDelay: "400ms" }}>
            <WhatToDoNext action={stats?.nextAction} />
          </section>
        </div>
      )}

      {activeTab === "charts" && !loading && !showAnalyticsLock && (
        <div className="space-y-6 sm:space-y-8">
          {!hasAnyChartData ? (
            <section className="animate-slideUp" style={{ animationDelay: "150ms" }}>
              <ChartsUnlockHub stats={stats} />
            </section>
          ) : (
            <>
              <section className="animate-slideUp" style={{ animationDelay: "100ms" }}>
                <AnalyticsUnlockBanner stats={stats} />
              </section>

              <section className="grid grid-cols-1 gap-4 animate-slideUp lg:grid-cols-2 lg:gap-6" style={{ animationDelay: "175ms" }}>
                <SubjectDistribution data={stats?.subjectDistribution} />
                <SubjectPerformance data={stats?.subjectPerformance} />
              </section>

              <section className="grid grid-cols-1 gap-4 animate-slideUp lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)] lg:gap-6" style={{ animationDelay: "250ms" }}>
                <ChapterPerformance data={stats?.chapterPerformance} />
                <TimeAnalytics data={stats?.timeAnalytics} />
              </section>
            </>
          )}
        </div>
      )}

      {activeTab === "ai-insights" && !loading && !showAnalyticsLock && <AIComingSoon />}

      {activeTab === "leaderboard" && (
        <section className="animate-slideUp" style={{ animationDelay: "150ms" }}>
          <Leaderboard />
        </section>
      )}
    </PageWrapper>
  );
}
