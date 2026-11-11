import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import ZiLauncher from "@/components/zi/ZiLauncher";
import { ZiEntityContextProvider } from "@/lib/zi/ZiEntityContext";
import { getAuthContext, ONBOARDING_ROUTE } from "@/lib/auth";
import { FREE_ZI_PROMPT_LIMIT, getUserNavigationAccess, getZiFreePromptsUsage } from "@/lib/accessControl";
import { redirect } from "next/navigation";

export default async function FormulaCardsLayout({ children }) {
  const { userId, onboardingComplete } = await getAuthContext();

  if (userId && !onboardingComplete) {
    redirect(ONBOARDING_ROUTE);
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
          {children}
          <Suspense fallback={null}>
            <ZiLauncher plan={accessContext.plan} ziFreeUsage={ziFreeUsage} />
          </Suspense>
        </ZiEntityContextProvider>
      </div>
    </div>
  );
}
