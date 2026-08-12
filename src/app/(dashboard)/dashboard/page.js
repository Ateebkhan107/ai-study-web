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
import { TrendingUp } from "lucide-react";

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
    <div className="relative min-h-screen w-full min-w-0">
      
      {/* ── Full Bleed Background Layer ── 
          Using left-[calc(50%-50vw)] and w-screen forces it to break out of any max-w parent container 
      */}
      <div className="absolute inset-y-0 left-1/2 z-0 h-full w-dvw -translate-x-1/2 pointer-events-none overflow-hidden" aria-hidden="true">
        
        {/* 1. Subtle, Edge-to-Edge Dot Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_2px,transparent_2px)] dark:bg-[radial-gradient(#475569_2px,transparent_2px)] [background-size:32px_32px] opacity-20 dark:opacity-30" />

        {/* 2. Soft Ambient Color Glows (no aggressive pulsing) */}
        <div className="absolute top-0 left-0 w-[50%] h-[50%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[150px]" />
        <div className="absolute top-[30%] right-0 w-[40%] h-[40%] rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-[150px]" />
        <div className="absolute bottom-0 left-[20%] w-[40%] h-[40%] rounded-full bg-pink-500/5 dark:bg-pink-500/10 blur-[150px]" />
        
      </div>

      {/* ── Main Content Area (z-10 forces it above the dots) ── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl min-w-0 space-y-4 px-4 py-5 sm:space-y-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        
        {/* Header Section */}
        <div className="relative space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-3 py-1 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
              {activeTrackKey === "NEET"
                ? "Future Doctor 🩺"
                : "Future Engineer 🚀"}
            </p>
          </div>

          <div className="break-words pb-1 text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm dark:text-white sm:text-4xl lg:text-5xl">
            <UserGreeting />
          </div>

          <div className="mt-1 inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium">
              Keep improving every day
            </span>
          </div>
        </div>

        {/* Grid Components */}
        <div className="relative z-10 grid gap-5 sm:gap-6 lg:gap-7">
          
          <section className="transform transition-all duration-700 ease-out hover:-translate-y-1">
            <DailyGoals />
          </section>

          <section className="transform transition-all duration-700 ease-out delay-75 hover:-translate-y-1">
            <StatsCards />
          </section>

          <section className="relative transform transition-all duration-700 ease-out delay-150">
            <DashboardSection config={activeConfig} />
          </section>

          <section className="relative pt-4 transform transition-all duration-700 ease-out delay-200">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 dark:via-indigo-400/30 to-transparent" />
            <div className="mt-5">
              <Leaderboard />
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}
