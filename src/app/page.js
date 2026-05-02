import Navbar from "@/components/Navbar";
import StatsCards from "@/components/StatsCards";
import DashboardSection from "@/components/DashboardSection";
import DailyGoals from "@/components/DailyGoals";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-slate-950 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Daily Goals */}
        <DailyGoals />

        {/* Welcome */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Good morning
          </p>
          <h1 className="text-4xl font-black text-black tracking-tight">
            Hey, User 👋
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            You're on a 7-day streak. Keep going.
          </p>
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Formula Cards + Leaderboard */}
        <DashboardSection />
      </main>
    </div>
  );
}