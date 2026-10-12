import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import ZiLauncher from "@/components/zi/ZiLauncher";
import { ZiEntityContextProvider } from "@/lib/zi/ZiEntityContext";
import { getAuthContext, ONBOARDING_ROUTE } from "@/lib/auth";
import { getUserAccessContext } from "@/lib/accessControl";
import { redirect } from "next/navigation";

export default async function FormulaCardsLayout({ children }) {
  const { userId, user, onboardingComplete } = await getAuthContext();

  if (userId && !onboardingComplete) {
    redirect(ONBOARDING_ROUTE);
  }

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const accessContext = userId
    ? await getUserAccessContext({ userId, email })
    : { plan: "free", isPro: false, ziFreeUsage: { remaining: 3, used: 0, limit: 3 } };

  return (
    <div className="relative min-h-screen bg-[var(--background)] transition-colors duration-200">
      <div className="relative z-10">
        <ZiEntityContextProvider>
          <Navbar plan={accessContext.plan} isPro={accessContext.isPro} />
          {children}
          <Suspense fallback={null}>
            <ZiLauncher plan={accessContext.plan} ziFreeUsage={accessContext.ziFreeUsage} />
          </Suspense>
        </ZiEntityContextProvider>
      </div>
    </div>
  );
}
