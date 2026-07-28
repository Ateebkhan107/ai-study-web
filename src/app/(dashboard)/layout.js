import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { getAuthContext, ONBOARDING_ROUTE } from "@/lib/auth";
import TrackWrapper from "@/components/TrackWrapper"; 
import { initUserLeaderboard } from "@/utils/leaderboard"; 

export default async function DashboardLayout({ children }) {
  const { userId, user, onboardingComplete } = await getAuthContext();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!onboardingComplete) {
    redirect(ONBOARDING_ROUTE);
  }

  // Auto-initialize user's leaderboard/XP entry if they don't have one
  if (user) {
    await initUserLeaderboard(userId, user.firstName || "Student");
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-gray-950 transition-colors duration-200">
      {/* 👈 Passed control prop to conditionally unmount the text line */}
      <Navbar hideTrackFocus={true} />
      <TrackWrapper>
        {children}
      </TrackWrapper>
    </div>
  );
}