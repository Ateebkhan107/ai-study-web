import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import InstituteHome from "@/components/institute/InstituteHome";
import { getAuthContext, ONBOARDING_ROUTE } from "@/lib/auth";

export default async function InstitutePage() {
  const { userId, onboardingComplete } = await getAuthContext();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!onboardingComplete) {
    redirect(ONBOARDING_ROUTE);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] dark:bg-[var(--background)]">
      <Navbar />
      <InstituteHome />
    </div>
  );
}
