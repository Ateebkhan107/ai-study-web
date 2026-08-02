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
        
        {/* 1. Darker, Edge-to-Edge Dot Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_2px,transparent_2px)] dark:bg-[radial-gradient(#475569_2px,transparent_2px)] [background-size:32px_32px] opacity-70" />

        {/* 2. Ambient Color Glows */}
        <div className="absolute top-0 left-0 w-[50%] h-[50%] rounded-full bg-indigo-500/15 dark:bg-indigo-500/20 blur-[120px] mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[30%] right-0 w-[40%] h-[40%] rounded-full bg-violet-500/15 dark:bg-violet-500/20 blur-[100px] mix-blend-screen animate-[pulse_12s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-[20%] w-[40%] h-[40%] rounded-full bg-pink-500/10 dark:bg-pink-500/15 blur-[120px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]" />

        {/* 3. Twinkling Floating Stars */}
        <Star className="absolute top-[15%] left-[8%] w-6 h-6 text-amber-500/50 dark:text-amber-300/60 animate-[pulse_4s_ease-in-out_infinite] rotate-12" fill="currentColor" />
        <Sparkle className="absolute top-[25%] right-[10%] w-5 h-5 text-indigo-500/50 dark:text-indigo-300/60 animate-[pulse_3s_ease-in-out_infinite_0.5s]" fill="currentColor" />
        <Star className="absolute top-[45%] left-[5%] w-4 h-4 text-purple-500/50 dark:text-purple-300/60 animate-[pulse_5s_ease-in-out_infinite_1s] -rotate-12" fill="currentColor" />
        <Sparkle className="absolute bottom-[30%] right-[8%] w-7 h-7 text-pink-500/50 dark:text-pink-300/60 animate-[pulse_4s_ease-in-out_infinite_1.5s]" fill="currentColor" />
        <Star className="absolute bottom-[10%] left-[12%] w-5 h-5 text-emerald-500/50 dark:text-emerald-300/60 animate-[pulse_6s_ease-in-out_infinite_0.2s] rotate-45" fill="currentColor" />
        
      </div>

      {/* ── Main Content Area (z-10 forces it above the dots) ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-12">
        
        {/* Header Section */}
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-white/70 dark:bg-indigo-500/10 backdrop-blur-md shadow-sm transition-all duration-500 hover:border-indigo-500/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <p className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent uppercase tracking-widest">
              {activeTrackKey === "NEET"
                ? "Wassup, Future Doctor 🩺"
                : "Wassup, Future Engineer 🚀"}
            </p>
          </div>

          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
            <UserGreeting />
          </div>

          <div 
            className="animate-fadeInScale inline-flex items-center gap-2.5 px-3 py-1.5 mt-1 rounded-full bg-white/60 dark:bg-[#0f172a]/60 border border-indigo-100 dark:border-indigo-500/20 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-500/40"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            <div className="flex items-center justify-center p-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 pr-1">
              Keep improving every day
            </span>
          </div>
        </div>

        {/* Grid Components */}
        <div className="grid gap-12 lg:gap-14 relative z-10">
          
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