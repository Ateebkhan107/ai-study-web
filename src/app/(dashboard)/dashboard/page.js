import { cookies } from "next/headers";
import { Suspense } from "react";
import Leaderboard from "@/components/analytics/Leaderboard";
import { EXAM_CONFIG } from "@/constants/examConfig";
import StatsCards from "@/components/StatsCards";
import DashboardSection from "@/components/DashboardSection";
import DailyGoals from "@/components/DailyGoals";
import DashboardHeaderQuote from "@/components/DashboardHeaderQuote";
import BattleFloatingButton from "@/components/battle/BattleFloatingButton";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Sparkles } from "lucide-react";

async function getDashboardProfile() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const { data: profile, error } = await supabaseAdmin
    .from("user_profiles")
    .select("full_name, exam, target_year")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error && Object.keys(error).length > 0) {
    console.warn("[DASHBOARD_PROFILE_FETCH_ERROR]", error);
  }

  const claimsName =
    sessionClaims?.name ||
    sessionClaims?.full_name ||
    [sessionClaims?.given_name, sessionClaims?.family_name].filter(Boolean).join(" ");

  return {
    fullName: profile?.full_name || claimsName || "Student",
    exam: String(profile?.exam || "").toUpperCase() === "NEET" ? "NEET" : "JEE",
    targetYear: profile?.target_year || null,
  };
}

function getFirstName(name) {
  return String(name || "Student").trim().split(/\s+/)[0] || "Student";
}

function DashboardHeaderFallback({ activeTrackKey }) {
  const futureLabel = activeTrackKey === "NEET" ? "Future Doctor" : "Future Engineer";

  return (
    <div className="min-w-0">
      <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 dark:border-brand/30 dark:bg-brand/10 dark:text-brand sm:text-[11px]">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        {futureLabel}
      </div>

      <h1 className="mt-2 flex flex-wrap items-center gap-1.5 break-words text-2xl font-black font-display tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-[2.6rem] lg:leading-tight">
        <span>Hey,</span>
        <span>Student</span>
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-brand" aria-hidden="true" />
      </h1>
    </div>
  );
}

async function DashboardGreeting({ activeTrackKey }) {
  const profile = await getDashboardProfile();
  const resolvedTrackKey = profile?.exam || activeTrackKey;
  const futureLabel = resolvedTrackKey === "NEET" ? "Future Doctor" : "Future Engineer";
  const examTargetLine = [resolvedTrackKey, profile?.targetYear].filter(Boolean).join(" ");

  return (
    <div className="min-w-0">
      <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 dark:border-brand/30 dark:bg-brand/10 dark:text-brand sm:text-[11px]">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        {futureLabel}
      </div>

      <h1 className="mt-2 flex flex-wrap items-center gap-1.5 break-words text-2xl font-black font-display tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-[2.6rem] lg:leading-tight">
        <span>Hey,</span>
        <span>{getFirstName(profile?.fullName)}</span>
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-brand" aria-hidden="true" />
      </h1>

      {examTargetLine && (
        <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
          {examTargetLine}
        </p>
      )}
    </div>
  );
}

function DashboardCardFallback({ className = "h-48" }) {
  return (
    <div className={`${className} rounded-2xl border border-slate-200/80 bg-[var(--card)] shadow-sm skeleton-shimmer dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]`} />
  );
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const activeTrackCookie = cookieStore.get("prepzii_track")?.value;
  const activeTrackKey =
    String(activeTrackCookie || "").toUpperCase() === "NEET" ? "NEET" : "JEE";

  const activeConfig = {
    ...EXAM_CONFIG[activeTrackKey],
    dashboardTitle: activeTrackKey === "NEET" ? "NEET Overview" : "JEE Overview",
  };

  return (
    <div className="relative min-h-screen w-full min-w-0">
      <div className="absolute inset-y-0 left-1/2 z-0 h-full w-dvw -translate-x-1/2 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#3f3f35_1px,transparent_1px)] [background-size:34px_34px] opacity-10 dark:opacity-15" />
      </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl min-w-0 space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="relative grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.82fr)_minmax(0,0.33fr)] lg:items-start">
          <Suspense fallback={<DashboardHeaderFallback activeTrackKey={activeTrackKey} />}>
            <DashboardGreeting activeTrackKey={activeTrackKey} />
          </Suspense>

          <DashboardHeaderQuote />
        </div>

        <div className="relative z-10 grid gap-4 sm:gap-5 lg:gap-6 mt-4 sm:mt-0">
          <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(280px,0.75fr)] lg:items-stretch">
            <div className="min-w-0">
              <DailyGoals compact />
            </div>
            <div className="min-w-0">
              <StatsCards compact stacked />
            </div>
          </section>

          <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
            <div className="min-w-0">
              <Suspense fallback={<DashboardCardFallback className="h-[350px]" />}>
                <DashboardSection config={activeConfig} compact />
              </Suspense>
            </div>
            <div className="min-w-0">
              <Leaderboard compact />
            </div>
          </section>
        </div>
      </div>
      <BattleFloatingButton />
    </div>
  );
}
