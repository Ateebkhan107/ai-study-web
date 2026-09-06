import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { ACCOUNT_TYPES, getAuthContext, ONBOARDING_ROUTE } from "@/lib/auth";
import { getActiveInstituteMemberships } from "@/lib/accessControl";
import TrackWrapper from "@/components/TrackWrapper"; 
import { initUserLeaderboard } from "@/utils/leaderboard"; 
import ProductTourManager from "@/components/tour/ProductTourManager"; 
import ZiLauncher from "@/components/zi/ZiLauncher";

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
  const accountType = user?.publicMetadata?.accountType === ACCOUNT_TYPES.INSTITUTE_ADMIN || hasCoachingAdminMembership
    ? ACCOUNT_TYPES.INSTITUTE_ADMIN
    : ACCOUNT_TYPES.STUDENT;

  if (accountType === ACCOUNT_TYPES.INSTITUTE_ADMIN) {
    redirect("/institute");
  }

  const activeInstitutes = memberships.map((membership) => ({
    name: membership.institute?.name || "Institute",
    role: membership.role,
    member_status: membership.status,
  }));

  return (
    <div className="relative min-h-screen bg-[var(--background)] transition-colors duration-200">
      <div className="absolute inset-y-0 left-1/2 z-0 h-full w-dvw -translate-x-1/2 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#3f3f35_1px,transparent_1px)] [background-size:34px_34px] opacity-10 dark:opacity-15" />
      </div>

      <div className="relative z-10">
        {/* Passed control prop to conditionally unmount the text line */}
        <Navbar
          accountType={accountType}
          institutes={activeInstitutes}
        />
        <TrackWrapper>
          {children}
        </TrackWrapper>
        <Suspense fallback={null}>
          <ProductTourManager />
        </Suspense>
        <ZiLauncher />
      </div>
    </div>
  );
}
