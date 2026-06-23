import { cookies } from "next/headers"; // 👈 1. Import server cookie parser
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

// 2. Transformed to an async server execution context
export default async function AnalyticsPage() {
  // 3. Extract track stamp seamlessly before sending HTML to the browser
  const cookieStore = await cookies();
  const currentTrack = cookieStore.get("prepzii_track")?.value || "jee";
  const activeTrack = currentTrack.toLowerCase() === "neet" ? "neet" : "jee";

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

      {/* 4. Pass track context down to isolate cards, charts, and recommendations */}
      <OverviewCards track={activeTrack} />

      {/* 2. Performance trend + Subject distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <PerformanceTrend track={activeTrack} />
        </div>
        <div className="lg:col-span-2">
          <SubjectDistribution track={activeTrack} />
        </div>
      </div>

      {/* 3. Skill radar + Topic weakness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillRadar track={activeTrack} />
        <TopicWeakness track={activeTrack} />
      </div>

      {/* 4. Study heatmap */}
      <StudyHeatmap track={activeTrack} />

      {/* 5. PYQ intelligence + Time analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PYQIntelligence track={activeTrack} />
        <TimeAnalytics track={activeTrack} />
      </div>

      {/* 6. Exam readiness */}
      <ExamReadiness track={activeTrack} />

      {/* 7. AI sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SmartPrediction track={activeTrack} />
        <AdaptiveLearning track={activeTrack} />
        <AIStudyPlanner track={activeTrack} />
      </div>

      {/* 8. AI recommendations */}
      <AIRecommendations track={activeTrack} />
    </div>
  );
}