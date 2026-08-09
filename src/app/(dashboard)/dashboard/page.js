import { redirect } from "next/navigation";
import { isUserPro } from "@/lib/subscription";
import Leaderboard from "@/components/analytics/Leaderboard";
import { EXAM_CONFIG } from "@/constants/examConfig";
import StatsCards from "@/components/StatsCards";
import DashboardSection from "@/components/DashboardSection";
import DailyGoals from "@/components/DailyGoals";
import UserGreeting from "@/components/UserGreeting";
import { currentUser } from "@clerk/nextjs/server";
import { getUserProfile } from "@/utils/userProfile";
import { Sparkle, Star, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const profile = await getUserProfile(user.id);

  const activeTrackKey = profile?.exam === "NEET" ? "NEET" : "JEE";

  const activeConfig = {
    ...EXAM_CONFIG[activeTrackKey],
    dashboardTitle: activeTrackKey === "NEET" ? "NEET Overview" : "JEE Overview",
  };

  return (
    <div className="relative min-h-screen w-full">
      
      {/* ── Full Bleed Background Layer ── 
          Using left-[calc(50%-50vw)] and w-screen forces it to break out of any max-w parent container 
      */}
      <div className="absolute top-0 left-[calc(50%-50vw)] w-screen h-full z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        
        {/* 1. Subtle, Edge-to-Edge Dot Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_2px,transparent_2px)] dark:bg-[radial-gradient(#475569_2px,transparent_2px)] [background-size:32px_32px] opacity-20 dark:opacity-30" />

        {/* 2. Soft Ambient Color Glows (no aggressive pulsing) */}
        <div className="absolute top-0 left-0 w-[50%] h-[50%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[150px]" />
        <div className="absolute top-[30%] right-0 w-[40%] h-[40%] rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-[150px]" />
        <div className="absolute bottom-0 left-[20%] w-[40%] h-[40%] rounded-full bg-pink-500/5 dark:bg-pink-500/10 blur-[150px]" />
        
      </div>

      {/* ── Main Content Area (z-10 forces it above the dots) ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 lg:py-12 space-y-8">
        
        {/* Header Section */}
        <div className="relative space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
              {activeTrackKey === "NEET"
                ? "Future Doctor 🩺"
                : "Future Engineer 🚀"}
            </p>
          </div>

          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm pb-2">
            <UserGreeting />
          </div>

          <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium">
              Keep improving every day
            </span>
          </div>
        </div>

        {/* Grid Components */}
        <div className="grid gap-8 lg:gap-10 relative z-10">
          
          <section className="transform transition-all duration-700 ease-out hover:-translate-y-1">
            <DailyGoals />
          </section>

          <section className="transform transition-all duration-700 ease-out delay-75 hover:-translate-y-1">
            <StatsCards />
          </section>

          <section className="relative transform transition-all duration-700 ease-out delay-150">
            <DashboardSection config={activeConfig} />
          </section>

          <section className="relative pt-8 transform transition-all duration-700 ease-out delay-200">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 dark:via-indigo-400/30 to-transparent" />
            <div className="mt-8">
              <Leaderboard />
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}