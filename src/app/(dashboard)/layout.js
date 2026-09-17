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

  if (!userId) {
    redirect("/sign-in");
  }

  if (!onboardingComplete) {
    redirect(ONBOARDING_ROUTE);
  }

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const accessContext = await getUserAccessContext({ userId, email });
  await initUserLeaderboard(userId, user?.firstName || "Student");

  return (
    <div className="relative min-h-screen bg-[var(--background)] transition-colors duration-200">
      <div className="relative z-10">
        <ZiEntityContextProvider>
          {/* Passed control prop to conditionally unmount the text line */}
          <Navbar plan={accessContext.plan} />
          <TrackWrapper>
            {children}
          </TrackWrapper>
          <Suspense fallback={null}>
            <ProductTourManager />
          </Suspense>
          <Suspense fallback={null}>
            <ZiLauncher plan={accessContext.plan} />
          </Suspense>
        </ZiEntityContextProvider>
      </div>
    </div>
  );
}
