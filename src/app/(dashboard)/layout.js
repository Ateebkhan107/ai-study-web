import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { getAuthContext, ONBOARDING_ROUTE } from "@/lib/auth";
import { getUserAccessContext } from "@/lib/accessControl";
import TrackWrapper from "@/components/TrackWrapper"; 
import { initUserLeaderboard } from "@/utils/leaderboard"; 
import ProductTourManager from "@/components/tour/ProductTourManager"; 
import ZiLauncher from "@/components/zi/ZiLauncher";
import { ZiEntityContextProvider } from "@/lib/zi/ZiEntityContext";

export default async function DashboardLayout({ children }) {
  const { userId, user, onboardingComplete } = await getAuthContext();

  // Only redirect to onboarding if the user is authenticated but hasn't completed onboarding
  if (userId && !onboardingComplete) {
    redirect(ONBOARDING_ROUTE);
  }

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const accessContext = userId
    ? await getUserAccessContext({ userId, email })
    : { plan: "free", isPro: false, ziFreeUsage: { remaining: 3, used: 0, limit: 3 } };

  if (userId) {
    await initUserLeaderboard(userId, user?.firstName || "Student");
  }

  return (
    <div className="relative min-h-screen bg-[var(--background)] transition-colors duration-200">
      <div className="relative z-10">
        <ZiEntityContextProvider>
          <Navbar plan={accessContext.plan} isPro={accessContext.isPro} />
          <TrackWrapper>
            {children}
          </TrackWrapper>
          <Suspense fallback={null}>
            <ProductTourManager />
          </Suspense>
          <Suspense fallback={null}>
            <ZiLauncher plan={accessContext.plan} ziFreeUsage={accessContext.ziFreeUsage} />
          </Suspense>
        </ZiEntityContextProvider>
      </div>
    </div>
  );
}
