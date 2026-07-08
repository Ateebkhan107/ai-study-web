import Leaderboard from "@/components/analytics/Leaderboard";
import { cookies } from "next/headers";
import { EXAM_CONFIG } from "@/lib/examConfig";
import StatsCards from "@/components/StatsCards";
import DashboardSection from "@/components/DashboardSection";
import DailyGoals from "@/components/DailyGoals";

export default async function DashboardPage() {
  // 1. Read the goal tracker cookie safely on the server side
  const cookieStore = await cookies();
  const currentTrack = cookieStore.get("prepzii_track")?.value || "jee";

  // 2. Normalize string casing to ensure it always maps perfectly to "JEE" or "NEET" keys
  const activeTrackKey = currentTrack.toUpperCase() === "NEET" ? "NEET" : "JEE";
  
  // 3. Keep the shared active config payload ready for down-stack components
  const activeConfig = {
    ...EXAM_CONFIG[activeTrackKey],
    dashboardTitle: activeTrackKey === "NEET" ? "NEET Overview" : "JEE Overview"
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      
      {/* ── PERSONALIZED GREETING HEADER ── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          {activeTrackKey === "NEET" ? "Good morning, Future Doctor 🩺" : "Good morning, Future Engineer 🚀"}
        </p>
        <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">
          Hey, Syed Ateeb 👋
        </h1>
        <p className="mt-1 text-xs text-gray-400">
          You&apos;re on a {activeTrackKey === "NEET" ? "NEET Medical" : "IIT JEE"} 7-day streak. Keep going.
        </p>
      </div>

      {/* ── CLEAN INTERACTIVE WORKSPACE SECTIONS ── */}
      <DailyGoals />
      <StatsCards />
      
      {/* 4. Formulas and your premium personalized AI Insights console panel */}
      <DashboardSection config={activeConfig} />

      {/* Leaderboard Section */}

<div className="mt-8">

  <Leaderboard />

</div>
      
    </div>
  );
}
