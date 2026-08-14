import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { ACCOUNT_TYPES, getAuthContext, ONBOARDING_ROUTE } from "@/lib/auth";
import { getActiveInstituteMemberships } from "@/lib/accessControl";
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

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const [memberships] = await Promise.all([
    getActiveInstituteMemberships(userId, email),
    initUserLeaderboard(userId, user?.firstName || "Student"),
  ]);
  const hasCoachingAdminMembership = memberships.some((membership) => membership.role === "COACHING_ADMIN");

  if (user?.publicMetadata?.accountType === ACCOUNT_TYPES.INSTITUTE_ADMIN || hasCoachingAdminMembership) {
    redirect("/institute");
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
