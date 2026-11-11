import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getAuthContext, ONBOARDING_ROUTE } from "@/lib/auth";
import { FREE_ZI_PROMPT_LIMIT, getUserNavigationAccess, getZiFreePromptsUsage } from "@/lib/accessControl";
import TrackWrapper from "@/components/TrackWrapper";
import { initializeXp, integrityEnabled } from "@/lib/integrity.server.mjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ProductTourManager from "@/components/tour/ProductTourManager"; 
import ZiLauncher from "@/components/zi/ZiLauncher";
import { ZiEntityContextProvider } from "@/lib/zi/ZiEntityContext";
import { getClassroomFixtureOwner } from "@/lib/zi/classroom/availability.server";

export default async function DashboardLayout({ children }) {
  const { userId, user, onboardingComplete } = await getAuthContext();

  // Only redirect to onboarding if the user is authenticated but hasn't completed onboarding
  if (userId && !onboardingComplete) {
    redirect(ONBOARDING_ROUTE);
  }

  if (userId && integrityEnabled()) {
    const name = user?.firstName || "Student";
    after(async () => {
      try {
        await initializeXp(supabaseAdmin, userId, name);
      } catch (error) {
        console.error("[DASHBOARD_XP_INITIALIZATION_ERROR]", error);
      }
    });
  }

  const [accessContext, ziFreeUsage] = await Promise.all([
    getUserNavigationAccess(userId),
    userId ? getZiFreePromptsUsage(userId) : { remaining: FREE_ZI_PROMPT_LIMIT },
  ]);

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
            <ZiLauncher plan={accessContext.plan} ziFreeUsage={ziFreeUsage}
              classroomFixtureOwner={getClassroomFixtureOwner(userId)} />
          </Suspense>
        </ZiEntityContextProvider>
      </div>
    </div>
  );
}
