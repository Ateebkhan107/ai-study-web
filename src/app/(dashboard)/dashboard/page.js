import StatsCards from "@/components/StatsCards";
import DashboardSection from "@/components/DashboardSection";
import DailyGoals from "@/components/DailyGoals";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Good morning
        </p>
        <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">
          Hey, User 👋
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          You're on a 7-day streak. Keep going.
        </p>
      </div>
      <DailyGoals />
      <StatsCards />
      <DashboardSection />
    </div>
  );
}