// app/(dashboard)/analytics/page.js

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
          Last updated: today · 48 tests analysed
        </p>
      </div>

      {/* 1. Overview cards */}
      <OverviewCards />

      {/* 2. Performance trend + Subject distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <PerformanceTrend />
        </div>
        <div className="lg:col-span-2">
          <SubjectDistribution />
        </div>
      </div>

      {/* 3. Skill radar + Topic weakness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillRadar />
        <TopicWeakness />
      </div>

      {/* 4. Study heatmap */}
      <StudyHeatmap />

      {/* 5. PYQ intelligence + Time analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PYQIntelligence />
        <TimeAnalytics />
      </div>

      {/* 6. Exam readiness */}
      <ExamReadiness />

      {/* 7. AI sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SmartPrediction />
        <AdaptiveLearning />
        <AIStudyPlanner />
      </div>

      {/* 8. AI recommendations */}
      <AIRecommendations />
    </div>
  );
}